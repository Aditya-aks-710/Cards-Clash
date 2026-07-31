import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ------------------------------------------------------------------
   Animated 3D background: neon-lit playing cards drifting in space,
   with fog for depth and subtle pointer parallax. Sits behind the UI
   (pointer-events: none) and is frosted by the glass panels above it.
   ------------------------------------------------------------------ */

const SUITS = [
  ['\u2660', false], // spade
  ['\u2665', true],  // heart
  ['\u2666', true],  // diamond
  ['\u2663', false], // club
];
const RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7'];
const ACCENTS = ['#22e0ff', '#ff3d9a', '#7c5cff', '#38f9a7', '#ffd166'];

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function makeCardTexture(rank, suit, isRed, accent) {
  const w = 256, h = 358;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');

  // card face
  g.fillStyle = '#f7f9ff';
  roundRect(g, 8, 8, w - 16, h - 16, 26); g.fill();

  // neon accent border
  g.lineWidth = 6; g.strokeStyle = accent; g.globalAlpha = 0.55;
  roundRect(g, 8, 8, w - 16, h - 16, 26); g.stroke(); g.globalAlpha = 1;

  const col = isRed ? '#e23b6d' : '#151826';
  g.fillStyle = col;

  // center pip
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 150px Georgia, "Times New Roman", serif';
  g.fillText(suit, w / 2, h / 2 + 8);

  // top-left rank + suit
  g.textAlign = 'left'; g.textBaseline = 'top';
  g.font = 'bold 46px Georgia, serif'; g.fillText(rank, 22, 20);
  g.font = 'bold 34px Georgia, serif'; g.fillText(suit, 24, 68);

  // bottom-right (rotated)
  g.save();
  g.translate(w - 22, h - 20); g.rotate(Math.PI);
  g.textAlign = 'left'; g.textBaseline = 'top';
  g.font = 'bold 46px Georgia, serif'; g.fillText(rank, 0, 0);
  g.font = 'bold 34px Georgia, serif'; g.fillText(suit, 2, 48);
  g.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeCards(n) {
  const rnd = (a, b) => a + Math.random() * (b - a);
  const cards = [];
  for (let i = 0; i < n; i++) {
    const [suit, isRed] = SUITS[(Math.random() * SUITS.length) | 0];
    const rank = RANKS[(Math.random() * RANKS.length) | 0];
    const accent = ACCENTS[(Math.random() * ACCENTS.length) | 0];
    const w = 1.6;
    cards.push({
      tex: makeCardTexture(rank, suit, isRed, accent),
      w, h: w * 1.4,
      x: rnd(-7.5, 7.5), y: rnd(-4.5, 4.5), z: rnd(-7, -0.5),
      ry: rnd(-0.6, 0.6), rz: rnd(-0.5, 0.5),
      speed: rnd(0.25, 0.7), amp: rnd(0.15, 0.5), phase: rnd(0, Math.PI * 2),
      opacity: rnd(0.82, 1),
    });
  }
  return cards;
}

function Cards({ count, pointer, reduced }) {
  const group = useRef();
  const refs = useRef([]);
  const cards = useMemo(() => makeCards(count), [count]);

  useEffect(() => () => cards.forEach((c) => c.tex.dispose()), [cards]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!reduced) {
      for (let i = 0; i < cards.length; i++) {
        const m = refs.current[i]; const cd = cards[i];
        if (!m) continue;
        m.position.y = cd.y + Math.sin(t * cd.speed + cd.phase) * cd.amp;
        m.rotation.z = cd.rz + Math.sin(t * cd.speed * 0.6 + cd.phase) * 0.12;
        m.rotation.y = cd.ry + Math.cos(t * cd.speed * 0.5 + cd.phase) * 0.22;
      }
    }
    if (group.current) {
      const tx = pointer.current.x * 0.25;
      const ty = -pointer.current.y * 0.18;
      group.current.rotation.y += (tx - group.current.rotation.y) * 0.05;
      group.current.rotation.x += (ty - group.current.rotation.x) * 0.05;
    }
  });

  return (
    <group ref={group}>
      {cards.map((cd, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)} position={[cd.x, cd.y, cd.z]} rotation={[0, cd.ry, cd.rz]}>
          <planeGeometry args={[cd.w, cd.h]} />
          <meshStandardMaterial map={cd.tex} roughness={0.45} metalness={0.12} side={THREE.DoubleSide} transparent opacity={cd.opacity} />
        </mesh>
      ))}
    </group>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduced;
}

class CanvasErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err: false }; }
  static getDerivedStateFromError() { return { err: true }; }
  render() { return this.state.err ? null : this.props.children; }
}

export default function ThreeBackground() {
  const reduced = usePrefersReducedMotion();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const count = reduced ? (isMobile ? 4 : 6) : (isMobile ? 7 : 13);
  const [frameloop, setFrameloop] = useState('always');
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onVis = () => setFrameloop(document.hidden ? 'never' : 'always');
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
      <CanvasErrorBoundary>
        <Canvas
          dpr={[1, isMobile ? 1.25 : 1.75]}
          frameloop={frameloop}
          camera={{ position: [0, 0, 9], fov: 50 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ background: 'transparent' }}
        >
          <fogExp2 attach="fog" args={['#05060d', 0.055]} />
          <ambientLight intensity={0.7} />
          <pointLight position={[6, 4, 6]} intensity={1.4} decay={0} color="#22e0ff" />
          <pointLight position={[-6, -3, 5]} intensity={1.2} decay={0} color="#ff3d9a" />
          <pointLight position={[0, 5, 3]} intensity={0.8} decay={0} color="#7c5cff" />
          <Cards count={count} pointer={pointer} reduced={reduced} />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
