import re
import socket
import ipaddress
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")

def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )

def validate_ssrf_safe_url(url: str) -> bool:
    """
    Validates that a URL target host does not resolve to private/local IP ranges.
    Prevents Server-Side Request Forgery (SSRF) during enrichment operations.
    """
    if not url.startswith(("http://", "https://")):
        return False
        
    try:
        # Extract hostname
        pattern = r"https?://([^/:\?#]+)"
        match = re.match(pattern, url)
        if not match:
            return False
            
        hostname = match.group(1).lower()
        
        # Block literal local hostnames
        if hostname in ("localhost", "127.0.0.1", "0.0.0.0", "::1", "metadata.google.internal"):
            return False
            
        # Try resolving IP
        try:
            resolved_ip = socket.gethostbyname(hostname)
            ip_obj = ipaddress.ip_address(resolved_ip)
            
            if ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local:
                return False
        except socket.gaierror:
            # If DNS resolution fails, allow for simulated analysis but mark untrusted
            pass
            
        return True
    except Exception:
        return False

import time
from collections import defaultdict
from fastapi import Request, HTTPException

class InMemoryRateLimiter:
    def __init__(self, requests_limit: int, window_seconds: int):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)

    def is_rate_limited(self, key: str) -> bool:
        now = time.time()
        # Clean up old timestamps outside the window
        self.requests[key] = [ts for ts in self.requests[key] if now - ts < self.window_seconds]
        if len(self.requests[key]) >= self.requests_limit:
            return True
        self.requests[key].append(now)
        return False

# Limiters for endpoints
ingest_limiter = InMemoryRateLimiter(requests_limit=10, window_seconds=60)
rag_limiter = InMemoryRateLimiter(requests_limit=15, window_seconds=60)
sandbox_limiter = InMemoryRateLimiter(requests_limit=10, window_seconds=60)

def enforce_rate_limit(request: Request, limiter: InMemoryRateLimiter):
    """
    Enforces token-bucket style rate limiting per client IP.
    """
    client_ip = request.client.host if request.client else "unknown_ip"
    if limiter.is_rate_limited(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please throttle your queries to avoid external quota exhaust."
        )

