import React, { useEffect, useRef } from 'react';

interface RisingLinesProps {
  color?: string;
  horizonColor?: string;
  haloColor?: string;
  riseSpeed?: number;
  flowSpeed?: number;
  flowDensity?: number;
  horizonHeight?: number;
  horizonIntensity?: number;
  haloIntensity?: number;
  circleScale?: number;
  className?: string;
}

export const RisingLines: React.FC<RisingLinesProps> = ({
  color = '#00D2BE',
  horizonColor = '#0E7063',
  haloColor = '#0F2040',
  riseSpeed = 0.5,
  flowSpeed = 0.15,
  flowDensity = 28,
  horizonHeight = 0.95,
  horizonIntensity = 0.15,
  haloIntensity = 0.08,
  circleScale = 1.0,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
    }

    interface Line {
      x: number;
      y: number;
      length: number;
      speedY: number;
      thickness: number;
      opacity: number;
    }

    const particles: Particle[] = [];
    const lines: Line[] = [];

    const createParticle = (startY = height * horizonHeight): Particle => {
      return {
        x: Math.random() * width,
        y: startY + (Math.random() - 0.5) * 20,
        size: Math.random() * 1.2 + 0.5,
        speedY: (Math.random() * 0.4 + 0.25) * riseSpeed,
        speedX: (Math.random() - 0.5) * 0.15 * flowSpeed,
        opacity: Math.random() * 0.18 + 0.06,
      };
    };

    const createLine = (startY = height * horizonHeight): Line => {
      return {
        x: Math.random() * width,
        y: startY + Math.random() * 10,
        length: Math.random() * 60 + 25,
        speedY: (Math.random() * 0.6 + 0.35) * riseSpeed,
        thickness: Math.random() * 0.8 + 0.5,
        opacity: Math.random() * 0.18 + 0.06,
      };
    };

    for (let i = 0; i < flowDensity; i++) {
      const initialY = Math.random() * height * horizonHeight;
      particles.push(createParticle(initialY));
    }
    for (let i = 0; i < 20; i++) {
      const initialY = Math.random() * height * horizonHeight;
      lines.push(createLine(initialY));
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    const hexToRgb = (hex: string) => {
      const clean = hex.replace('#', '');
      if (clean.length === 3) {
        const r = parseInt(clean[0] + clean[0], 16);
        const g = parseInt(clean[1] + clean[1], 16);
        const b = parseInt(clean[2] + clean[2], 16);
        return `${r}, ${g}, ${b}`;
      }
      if (clean.length === 6) {
        const r = parseInt(clean.substring(0, 2), 16);
        const g = parseInt(clean.substring(2, 4), 16);
        const b = parseInt(clean.substring(4, 6), 16);
        return `${r}, ${g}, ${b}`;
      }
      return '0, 210, 190';
    };

    const rgbColor = hexToRgb(color);
    const horizonRgb = hexToRgb(horizonColor);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const horizonY = height * horizonHeight;

      // 1. Subtle Horizon line
      if (horizonIntensity > 0) {
        const grad = ctx.createLinearGradient(0, horizonY - 30, 0, horizonY + 30);
        grad.addColorStop(0, `rgba(${horizonRgb}, 0)`);
        grad.addColorStop(0.5, `rgba(${horizonRgb}, ${horizonIntensity * 0.15})`);
        grad.addColorStop(1, `rgba(${horizonRgb}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, horizonY - 30, width, 60);

        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        ctx.lineTo(width, horizonY);
        ctx.strokeStyle = `rgba(${rgbColor}, ${horizonIntensity * 0.3})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // 2. Soft, subtle ascending lines
      lines.forEach((l, idx) => {
        l.y -= l.speedY;
        const progress = Math.max(0, Math.min(1, 1 - l.y / horizonY));
        const currentOpacity = l.opacity * Math.sin(progress * Math.PI);

        if (currentOpacity > 0.01) {
          ctx.beginPath();
          ctx.moveTo(l.x, l.y);
          ctx.lineTo(l.x, l.y + l.length);
          ctx.strokeStyle = `rgba(${rgbColor}, ${currentOpacity})`;
          ctx.lineWidth = l.thickness;
          ctx.stroke();
        }

        if (l.y + l.length < 0) {
          lines[idx] = createLine(horizonY);
        }
      });

      // 3. Soft particle ticks
      particles.forEach((p, idx) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        const progress = Math.max(0, Math.min(1, 1 - p.y / horizonY));
        const currentOpacity = Math.max(0, p.opacity * Math.sin(progress * Math.PI));

        if (currentOpacity > 0.01) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgbColor}, ${currentOpacity})`;
          ctx.fill();
        }

        if (p.y < 0) {
          particles[idx] = createParticle(horizonY);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [color, horizonColor, haloColor, riseSpeed, flowSpeed, flowDensity, horizonHeight, horizonIntensity, haloIntensity, circleScale]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none z-0 ${className}`}
      style={{ opacity: 1.0 }}
    />
  );
};
