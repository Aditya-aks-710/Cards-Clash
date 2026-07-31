import { AnimatePresence, motion } from 'framer-motion';

export default function Toast({ toast }) {
  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50 w-max max-w-[90vw] px-2 pointer-events-none">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className={`glass rounded-2xl px-6 py-3.5 text-center text-[14.5px] font-semibold ${
              toast.type === 'warn' ? 'text-[#ffd166]' : 'text-white'
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
