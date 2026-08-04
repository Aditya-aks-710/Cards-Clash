import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { reducer, initialState, loadState, saveState, fmt } from './game';
import { sfx } from './audio';
import Background from './components/Background';
import ThreeBackground from './components/ThreeBackground';
import Overlay from './components/Overlay';
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
  // read any saved game once, up front
  const savedRef = useRef();
  if (savedRef.current === undefined) savedRef.current = loadState();

  const [state, dispatch] = useReducer(reducer, initialState, (init) => savedRef.current ?? init);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [restartConfirm, setRestartConfirm] = useState(false);
  // show the welcome-back gate only when a game was left mid-play
  const [resuming, setResuming] = useState(
    () => !!savedRef.current && savedRef.current.screen !== 'setup'
  );
  const toastTimer = useRef(0);

  // auto-save so a game survives a page refresh
  useEffect(() => { saveState(state); }, [state]);

  const resumeGame = () => { sfx.click(); setResuming(false); };
  const newGame = () => {
    sfx.lock();
    dispatch({ type: 'PLAY_AGAIN' });
    setResuming(false);
    setMenuOpen(false);
    setRestartConfirm(false);
  };
  const openMenu = () => { sfx.click(); setRestartConfirm(false); setMenuOpen(true); };
  const closeMenu = () => { sfx.click(); setMenuOpen(false); setRestartConfirm(false); };

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
      <ThreeBackground />
      <MuteButton />
      {state.screen !== 'setup' && !resuming && <MenuButton onClick={openMenu} />}

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
        onConfirm={() => { sfx.lock(); setModal(false); dispatch({ type: 'GO_SCORING' }); }}
        onCancel={() => { sfx.restart(); setModal(false); showToast('Okay \u2014 re-bid your numbers.', 'info'); }}
      />

      {/* Welcome-back gate: resume the saved game or start fresh */}
      <Overlay open={resuming}>
        <div className="text-xl tracking-[0.35em] mb-1">
          <span className="text-[#cfe0ff]">&#9824;</span>
          <span className="text-[#ff5d8f]">&#9829;</span>
          <span className="text-[#cfe0ff]">&#9827;</span>
          <span className="text-[#ff5d8f]">&#9830;</span>
        </div>
        <h3 className="font-display text-2xl text-white">Welcome back</h3>
        <p className="text-[#8b93b8] mt-2 text-sm">{describeProgress(savedRef.current)}</p>
        {scoreLine(savedRef.current) && (
          <div className="font-display text-sm mt-2 text-white/90">{scoreLine(savedRef.current)}</div>
        )}
        <div className="mt-6 flex flex-col gap-3">
          <button onClick={resumeGame} className="btn-primary rounded-2xl px-6 py-3.5 w-full tracking-[1px]">Resume game</button>
          <button onClick={newGame} className="btn-ghost rounded-2xl px-6 py-3.5 w-full font-semibold">Start new game</button>
        </div>
      </Overlay>

      {/* In-game menu (opened from the top-left Menu button) */}
      <Overlay open={menuOpen} onBackdrop={closeMenu}>
        {!restartConfirm ? (
          <>
            <div className="font-display text-[11px] tracking-[3px] uppercase text-[#ffd166]">Menu</div>
            <h3 className="font-display text-2xl text-white mt-2">Paused</h3>
            <p className="text-[#8b93b8] mt-2 text-sm">{describeProgress(state)}</p>
            {scoreLine(state) && (
              <div className="font-display text-sm mt-2 text-white/90">{scoreLine(state)}</div>
            )}
            <div className="mt-6 flex flex-col gap-3">
              <button onClick={closeMenu} className="btn-primary rounded-2xl px-6 py-3.5 w-full tracking-[1px]">Resume</button>
              <button onClick={() => { sfx.click(); setRestartConfirm(true); }} className="btn-ghost rounded-2xl px-6 py-3.5 w-full font-semibold text-[#ff9db0]">Restart game</button>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-display text-2xl text-white">Restart game?</h3>
            <p className="text-[#8b93b8] mt-2 text-sm">This ends the current game and returns to setup. Progress will be lost.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => { sfx.click(); setRestartConfirm(false); }} className="btn-ghost rounded-2xl px-5 py-3 w-full font-semibold">Cancel</button>
              <button onClick={newGame} className="btn-primary rounded-2xl px-5 py-3 w-full">Yes, restart</button>
            </div>
          </>
        )}
      </Overlay>
    </>
  );
}

function describeProgress(s) {
  if (!s) return '';
  if (s.screen === 'final') return 'Your last game is finished.';
  return `Round ${s.round} of ${s.numRounds} in progress.`;
}

function scoreLine(s) {
  if (!s || !s.teams || (s.cumulative[0] === 0 && s.cumulative[1] === 0)) return null;
  return `${s.teams[0].name} ${fmt(s.cumulative[0])}   \u2022   ${s.teams[1].name} ${fmt(s.cumulative[1])}`;
}

function MenuButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed top-4 left-4 z-50 w-11 h-11 grid place-items-center rounded-full glass text-white/80 hover:text-white active:scale-90 transition"
      aria-label="Open menu"
      title="Menu"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="4" y1="7" x2="20" y2="7" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="17" x2="20" y2="17" />
      </svg>
    </button>
  );
}

function MuteButton() {
  const [muted, setMuted] = useState(sfx.isMuted());
  return (
    <button
      onClick={() => { const m = sfx.toggle(); setMuted(m); if (!m) sfx.click(); }}
      className="fixed top-4 right-4 z-50 w-11 h-11 grid place-items-center rounded-full glass text-white/80 hover:text-white active:scale-90 transition"
      aria-label={muted ? 'Unmute sound' : 'Mute sound'}
      title={muted ? 'Unmute' : 'Mute'}
    >
      {muted ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H2v6h4l5 4V5Z" />
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H2v6h4l5 4V5Z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </svg>
      )}
    </button>
  );
}
