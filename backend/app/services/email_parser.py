import re
import email
from email import policy
from email.parser import BytesParser, Parser
from typing import Dict, Any, List, Tuple
import hashlib

class EmailParserService:
    @staticmethod
    def parse_raw_eml(eml_bytes: bytes) -> Dict[str, Any]:
        """
        Parses raw .eml file content using standard library Python email parser.
        Extracts headers, identity parameters, authentication lines, URLs, attachments, body text.
        """
        msg = BytesParser(policy=policy.default).parsebytes(eml_bytes)
        
        headers_dict = {}
        received_headers = []
        for key, val in msg.items():
            headers_dict[key.lower()] = str(val)
            if key.lower() == "received":
                received_headers.append(str(val))
                
        # Identity extraction
        from_header = str(msg.get("From", ""))
        to_header = str(msg.get("To", ""))
        subject = str(msg.get("Subject", "No Subject"))
        date_header = str(msg.get("Date", ""))
        reply_to = str(msg.get("Reply-To", "")) if msg.get("Reply-To") else None
        return_path = str(msg.get("Return-Path", "")) if msg.get("Return-Path") else None
        message_id = str(msg.get("Message-ID", ""))
        
        # Authentication headers
        auth_results = str(msg.get("Authentication-Results", ""))
        received_spf = str(msg.get("Received-SPF", ""))
        
        # Body extraction
        body_text = ""
        body_html = ""
        attachments = []
        
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition", ""))
                
                if "attachment" in content_disposition:
                    filename = part.get_filename() or "unnamed_attachment"
                    payload = part.get_payload(decode=True) or b""
                    sha256 = hashlib.sha256(payload).hexdigest()
                    attachments.append({
                        "filename": filename,
                        "mime_type": content_type,
                        "size_bytes": len(payload),
                        "sha256": sha256,
                        "is_executable": filename.lower().endswith(('.exe', '.scr', '.bat', '.cmd', '.vbs', '.js', '.ps1')),
                        "is_macro_enabled": filename.lower().endswith(('.docm', '.xlsm', '.pptm'))
                    })
                elif content_type == "text/plain":
                    try:
                        body_text += part.get_content()
                    except Exception:
                        pass
                elif content_type == "text/html":
                    try:
                        body_html += part.get_content()
                    except Exception:
                        pass
        else:
            try:
                body_text = msg.get_content()
            except Exception:
                body_text = str(msg.get_payload())
                
        # Extract URLs
        all_content = body_text + " " + body_html
        urls = EmailParserService.extract_urls(all_content)
        
        return {
            "subject": subject,
            "from": from_header,
            "to": to_header,
            "date": date_header,
            "reply_to": reply_to,
            "return_path": return_path,
            "message_id": message_id,
            "received_headers": received_headers,
            "auth_results": auth_results,
            "received_spf": received_spf,
            "body_text": body_text,
            "body_html": body_html,
            "urls": urls,
            "attachments": attachments,
            "raw_headers_dict": headers_dict
        }
        
    @staticmethod
    def extract_urls(text: str) -> List[str]:
        """
        Regex extraction of HTTP/HTTPS URLs from email body content.
        """
        url_pattern = r'https?://[^\s<>"\']+';
        found = re.findall(url_pattern, text)
        cleaned = []
        for u in found:
            u_clean = u.rstrip('.,;)]}>')
            if u_clean not in cleaned:
                cleaned.append(u_clean)
        return cleaned
