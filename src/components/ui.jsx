import { motion } from 'framer-motion';

/** Shared screen header with a gold "pill", title and note. */
export function Head({ round, numRounds, title, note, pill }) {
  return (
    <div className="text-center">
      <span className="inline-block px-4 py-1.5 rounded-full font-display text-[11px] sm:text-xs tracking-[2px] uppercase text-[#ffd166] border border-[#ffd166]/40 bg-[#ffd166]/10">
        {pill || `Round ${round} of ${numRounds}`}
      </span>
      <h2 className="font-display font-bold mt-3 tracking-wide" style={{ fontSize: 'clamp(26px,7vw,42px)' }}>
        {title}
      </h2>
      {note && <p className="text-[#8b93b8] mt-1.5 text-sm sm:text-base px-2">{note}</p>}
    </div>
  );
}

/** Shared gradient primary button (full-width on mobile). */
export function PrimaryBtn({ children, onClick, className = '' }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -3 }}
      onClick={onClick}
      className={`btn-primary self-center w-full sm:w-auto sm:min-w-[260px] rounded-2xl px-9 py-4 text-base sm:text-[17px] tracking-[2px] ${className}`}
    >
      {children}
    </motion.button>
  );
}
