import { useCallback, useReducer, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { reducer, initialState } from './game';
import Background from './components/Background';
import Toast from './components/Toast';
import Modal from './components/Modal';
import SetupScreen from './screens/SetupScreen';
import BiddingScreen from './screens/BiddingScreen';
import ScoringScreen from './screens/ScoringScreen';
import SummaryScreen from './screens/SummaryScreen';
import FinalScreen from './screens/FinalScreen';

const variants = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.98 },
};

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(false);
  const toastTimer = useRef(0);

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ id: Date.now(), msg, type });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  }, []);

  const screens = {
    setup: <SetupScreen state={state} dispatch={dispatch} />,
    bidding: <BiddingScreen state={state} dispatch={dispatch} onToast={showToast} onSixSix={() => setModal(true)} />,
    scoring: <ScoringScreen state={state} dispatch={dispatch} />,
    summary: <SummaryScreen state={state} dispatch={dispatch} />,
    final: <FinalScreen state={state} dispatch={dispatch} />,
  };

  return (
    <>
      <Background />

      <main className="relative z-0 mx-auto w-full max-w-4xl px-4 sm:px-6 py-6 sm:py-10 min-h-[100dvh] flex items-center">
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.screen}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {screens[state.screen]}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <Toast toast={toast} />

      <Modal
        open={modal}
        title="Both teams bid 6"
        body={"Both teams committed to 6. Do you want to continue this round with 6\u20136?"}
        confirmText="Yes, continue"
        cancelText="No, re-bid"
        onConfirm={() => { setModal(false); dispatch({ type: 'GO_SCORING' }); }}
        onCancel={() => { setModal(false); showToast('Okay \u2014 re-bid your numbers.', 'info'); }}
      />
    </>
  );
}
