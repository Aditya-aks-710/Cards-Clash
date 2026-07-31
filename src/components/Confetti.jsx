import { useEffect, useRef } from 'react';

/** Lightweight dependency-free confetti burst, fired once on mount. */
export default function Confetti() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let frame = 0;
    const MAX = 280;

    const resize = () => {
      canvas.width = window.innerWidth * DPR;
      canvas.height = window.innerHeight * DPR;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#22e0ff', '#ff3d9a', '#ffd166', '#7c5cff', '#38f9a7'];
    const parts = Array.from({ length: 170 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: -Math.random() * canvas.height * 0.4,
      w: (6 + Math.random() * 8) * DPR,
      h: (8 + Math.random() * 10) * DPR,
      c: colors[i % colors.length],
      vy: (2 + Math.random() * 4) * DPR,
      vx: (-2 + Math.random() * 4) * DPR,
      rot: Math.random() * Math.PI,
      vr: -0.2 + Math.random() * 0.4,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      frame++;
      if (frame < MAX) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className="fixed inset-0 z-[45] pointer-events-none" aria-hidden="true" />;
}
