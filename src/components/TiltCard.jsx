import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * 3D pointer-tilt wrapper. Wrap any card to give it a subtle,
 * spring-damped perspective tilt that follows the cursor / touch.
 */
export default function TiltCard({ children, className = '', max = 9, disabled = false, ...rest }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18 });
  const sy = useSpring(y, { stiffness: 200, damping: 18 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-max, max]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [max, -max]);

  const handleMove = (e) => {
    if (disabled) return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={{
        rotateX: disabled ? 0 : rotateX,
        rotateY: disabled ? 0 : rotateY,
        transformPerspective: 900,
        transformStyle: 'preserve-3d',
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
