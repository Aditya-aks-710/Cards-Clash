import { AnimatePresence, motion } from 'framer-motion';

export default function Modal({ open, title, body, confirmText, cancelText, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 grid place-items-center p-6 bg-black/60"
          style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="glass rounded-3xl p-7 max-w-md w-full text-center"
            initial={{ scale: 0.9, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 12 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl text-[#ffd166]">{title}</h3>
            <p className="text-[#8b93b8] my-4 leading-relaxed">{body}</p>
            <div className="flex gap-3.5 justify-center">
              <button onClick={onCancel} className="btn-ghost rounded-2xl px-6 py-3 font-semibold min-w-[120px]">
                {cancelText}
              </button>
              <button onClick={onConfirm} className="btn-primary rounded-2xl px-6 py-3 text-sm min-w-[140px]">
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
