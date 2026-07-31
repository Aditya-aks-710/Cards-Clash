import { AnimatePresence, motion } from 'framer-motion';

/** Big +/- number stepper with an animated rolling value. */
export default function Stepper({ value, onDec, onInc }) {
  const btn =
    'w-14 h-14 shrink-0 rounded-2xl bg-white/5 border border-white/10 text-3xl font-bold ' +
    'grid place-items-center transition hover:-translate-y-0.5 active:scale-90 select-none';

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-5">
      <button onClick={onDec} className={btn} aria-label="Lower bid">&minus;</button>
      <div
        className="font-display font-black text-white text-5xl sm:text-6xl min-w-[84px] sm:min-w-[92px] text-center overflow-hidden"
        style={{ textShadow: '0 0 26px var(--tc-glow)' }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: 16, opacity: 0, scale: 0.7 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -16, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <button onClick={onInc} className={btn} aria-label="Raise bid">+</button>
    </div>
  );
}
