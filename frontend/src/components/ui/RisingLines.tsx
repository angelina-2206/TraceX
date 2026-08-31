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
  color = '#FFFFFF', // Monochrome white
  horizonColor = '#6B7280', // Medium charcoal gray
  haloColor = '#4B5563',
  riseSpeed = 0.7,
  flowSpeed = 0.25,
  flowDensity = 55,
  horizonHeight = 0.85,
  horizonIntensity = 0.35,
  haloIntensity = 0.12,
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
        size: Math.random() * 1.2 + 0.6,
        speedY: (Math.random() * 0.5 + 0.3) * riseSpeed,
        speedX: (Math.random() - 0.5) * 0.2 * flowSpeed,
        opacity: Math.random() * 0.40 + 0.15,
      };
    };

    const createLine = (startY = height * horizonHeight): Line => {
      return {
        x: Math.random() * width,
        y: startY + Math.random() * 10,
        length: Math.random() * 70 + 30,
        speedY: (Math.random() * 0.9 + 0.5) * riseSpeed,
        thickness: Math.random() * 1.0 + 0.5,
        opacity: Math.random() * 0.35 + 0.12,
      };
    };

    for (let i = 0; i < flowDensity; i++) {
      const initialY = Math.random() * height * horizonHeight;
      particles.push(createParticle(initialY));
    }
    for (let i = 0; i < 24; i++) {
      const initialY = Math.random() * height * horizonHeight;
      lines.push(createLine(initialY));
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const horizonY = height * horizonHeight;

      // 1. Crisp monochrome horizon line
      if (horizonIntensity > 0) {
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        ctx.lineTo(width, horizonY);
        ctx.strokeStyle = `rgba(209, 213, 219, ${horizonIntensity * 0.5})`;
        ctx.lineWidth = 1.0;
        ctx.stroke();
      }

      // 2. Render visible ascending data lines
      lines.forEach((l, idx) => {
        l.y -= l.speedY;
        const progress = 1 - l.y / horizonY;
        const currentOpacity = l.opacity * Math.sin(progress * Math.PI);

        if (currentOpacity > 0) {
          ctx.beginPath();
          ctx.moveTo(l.x, l.y);
          ctx.lineTo(l.x, l.y + l.length);
          ctx.strokeStyle = `rgba(255, 255, 255, ${currentOpacity})`;
          ctx.lineWidth = l.thickness;
          ctx.stroke();
        }

        if (l.y + l.length < 0) {
          lines[idx] = createLine(horizonY);
        }
      });

      // 3. Render visible data ticks
      particles.forEach((p, idx) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        const progress = 1 - p.y / horizonY;
        const currentOpacity = Math.max(0, p.opacity * Math.sin(progress * Math.PI));

        if (currentOpacity > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(229, 231, 235, ${currentOpacity})`;
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
