import React, { useEffect, useRef } from 'react';

interface RisingLinesProps {
  color?: string;
  horizonColor?: string;
  haloColor?: string;
  riseSpeed?: number;
  flowSpeed?: number;
  flowDensity?: number;
  horizonHeight?: number; // 0 to 1 (0.8 = 80% from top)
  horizonIntensity?: number; // 0 to 1
  haloIntensity?: number; // 0 to 1
  circleScale?: number;
  className?: string;
}

export const RisingLines: React.FC<RisingLinesProps> = ({
  color = '#06b6d4', // neon cyan
  horizonColor = '#a855f7', // neon purple
  haloColor = '#67e8f9',
  riseSpeed = 1.0,
  flowSpeed = 0.5,
  flowDensity = 60,
  horizonHeight = 0.8,
  horizonIntensity = 0.6,
  haloIntensity = 0.4,
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

    // Particle representation
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      fadeSpeed: number;
      color: string;
    }

    // Line representation
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

    // Helper to generate a particle
    const createParticle = (startY = height * horizonHeight): Particle => {
      const isGlow = Math.random() > 0.6;
      return {
        x: Math.random() * width,
        y: startY + (Math.random() - 0.5) * 40,
        size: Math.random() * (isGlow ? 3 : 1.5) + 0.5,
        speedY: (Math.random() * 0.8 + 0.4) * riseSpeed,
        speedX: (Math.random() - 0.5) * 0.4 * flowSpeed,
        opacity: Math.random() * 0.5 + 0.3,
        fadeSpeed: Math.random() * 0.005 + 0.002,
        color: isGlow ? horizonColor : color,
      };
    };

    // Helper to generate a rising line
    const createLine = (startY = height * horizonHeight): Line => {
      return {
        x: Math.random() * width,
        y: startY + Math.random() * 10,
        length: Math.random() * 80 + 30,
        speedY: (Math.random() * 1.5 + 0.8) * riseSpeed,
        thickness: Math.random() * 1.2 + 0.4,
        opacity: Math.random() * 0.4 + 0.1,
      };
    };

    // Initial fill
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

    // Render loop
    const render = () => {
      // Clear with dark alpha to allow slight trails if desired, or full clear
      ctx.clearRect(0, 0, width, height);

      const horizonY = height * horizonHeight;

      // 1. Draw horizon glow gradient (Security style)
      if (horizonIntensity > 0) {
        const horizonGlow = ctx.createLinearGradient(0, horizonY - 120, 0, horizonY + 60);
        horizonGlow.addColorStop(0, 'rgba(2, 6, 23, 0)');
        horizonGlow.addColorStop(0.6, `${horizonColor}15`);
        horizonGlow.addColorStop(0.8, `${horizonColor}30`);
        horizonGlow.addColorStop(1, 'rgba(2, 6, 23, 0.4)');
        ctx.fillStyle = horizonGlow;
        ctx.fillRect(0, horizonY - 120, width, 180);

        // Thin sharp laser horizon line
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        ctx.lineTo(width, horizonY);
        ctx.strokeStyle = `rgba(168, 85, 247, ${horizonIntensity * 0.4})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 2. Draw vertical laser column / halo in the center
      if (haloIntensity > 0) {
        const centerGlow = ctx.createRadialGradient(
          width / 2, horizonY,
          10,
          width / 2, horizonY,
          Math.min(width, height) * 0.4 * circleScale
        );
        centerGlow.addColorStop(0, `${haloColor}25`);
        centerGlow.addColorStop(0.2, `${horizonColor}15`);
        centerGlow.addColorStop(0.6, `${color}05`);
        centerGlow.addColorStop(1, 'rgba(2, 6, 23, 0)');

        ctx.fillStyle = centerGlow;
        ctx.beginPath();
        ctx.arc(width / 2, horizonY, Math.min(width, height) * 0.4 * circleScale, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Render and update lines
      lines.forEach((l, idx) => {
        l.y -= l.speedY;
        // Fade out as it rises near the top
        const progress = 1 - l.y / horizonY;
        const currentOpacity = l.opacity * Math.sin(progress * Math.PI);

        if (currentOpacity > 0) {
          ctx.beginPath();
          ctx.moveTo(l.x, l.y);
          ctx.lineTo(l.x, l.y + l.length);
          ctx.strokeStyle = `${color}${Math.floor(currentOpacity * 255).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = l.thickness;
          ctx.stroke();
        }

        // Reset line if it goes above the screen
        if (l.y + l.length < 0) {
          lines[idx] = createLine(horizonY);
        }
      });

      // 4. Render and update particles
      particles.forEach((p, idx) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        // Fade out as they rise
        const progress = 1 - p.y / horizonY;
        const currentOpacity = Math.max(0, p.opacity * Math.sin(progress * Math.PI));

        if (currentOpacity > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${Math.floor(currentOpacity * 255).toString(16).padStart(2, '0')}`;
          ctx.fill();

          // Optional subtle glow for larger particles
          if (p.size > 2) {
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `${p.color}${Math.floor(currentOpacity * 40).toString(16).padStart(2, '0')}`;
            ctx.fill();
            ctx.shadowBlur = 0; // reset
          }
        }

        // Reset particle if it goes out of screen
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
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
