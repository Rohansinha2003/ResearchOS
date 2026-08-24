// src/components/NeuralNetworkAnimation.tsx
import { useEffect, useRef } from 'react';
import './NeuralNetworkAnimation.css';

function NeuralNetworkAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const nodes = Array.from({ length: 12 }, () => ({
      x: Math.random() * canvas.clientWidth,
      y: Math.random() * canvas.clientHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      // draw connections
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 150) {
            const alpha = 1 - dist / 150;
            ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.2})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // draw nodes
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const update = () => {
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.clientWidth) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.clientHeight) n.vy *= -1;
      });
    };

    let animationId: number;
    const loop = () => {
      update();
      draw();
      animationId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="neural-animation-wrapper">
      <canvas ref={canvasRef} className="neural-canvas" />
    </div>
  );
}

export default NeuralNetworkAnimation;
