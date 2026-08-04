import { AnimatePresence, motion } from 'framer-motion';

/**
 * Generic centered dialog overlay (frosted backdrop + glass card).
 * Pass `onBackdrop` to allow click-outside dismissal; omit it to force a choice.
 */
export default function Overlay({ open, onBackdrop, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-center p-6 bg-black/60"
          style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onBackdrop}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className="glass rounded-3xl p-7 max-w-sm w-full text-center"
            initial={{ scale: 0.9, y: 14 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 14 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
