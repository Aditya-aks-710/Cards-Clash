import { AnimatePresence, motion } from 'framer-motion';
import TiltCard from '../components/TiltCard';
import { Head, PrimaryBtn } from '../components/ui';
import { computeTeamPoints, fmt, TOTAL_TRICKS } from '../game';

export default function ScoringScreen({ state, dispatch }) {
  const actuals = state.teams.map((t) => t.players.reduce((s, p) => s + p.score, 0));
  const total = actuals[0] + actuals[1];

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <Head
        round={state.round}
        numRounds={state.numRounds}
        title="Tally the Tricks"
        note={`Tricks in play: ${total} / ${TOTAL_TRICKS}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {state.teams.map((tm, i) => {
          const pts = computeTeamPoints(state.bids[i], actuals[i]);
          return (
            <div key={i} className={`team-${tm.color} team-surface rounded-3xl p-4 sm:p-5`}>
              <div className="flex items-baseline justify-between mb-4">
                <span className="font-display text-lg neon">{tm.name}</span>
                <span className="text-[#8b93b8] text-sm">Bid <b className="text-white text-base">{state.bids[i]}</b></span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {tm.players.map((p, j) => (
                  <TiltCard key={j} max={7} className="rounded-2xl p-3 sm:p-4 text-center bg-white/5 border border-white/10">
                    <div className="font-semibold text-sm truncate">{p.name}</div>
                    <ScoreNumber value={p.score} />
                    <div className="flex gap-2.5 justify-center mt-1">
                      <button
                        onClick={() => dispatch({ type: 'SET_SCORE', team: i, player: j, delta: -1 })}
                        className="w-12 h-12 rounded-full bg-white/5 border border-white/10 text-2xl font-bold text-[#ff5d73] active:scale-90 transition"
                        aria-label={`Minus ${p.name}`}
                      >&minus;</button>
                      <button
                        onClick={() => dispatch({ type: 'SET_SCORE', team: i, player: j, delta: 1 })}
                        className="w-12 h-12 rounded-full bg-white/5 border border-white/10 text-2xl font-bold text-[#38f9a7] active:scale-90 transition"
                        aria-label={`Plus ${p.name}`}
                      >+</button>
                    </div>
                  </TiltCard>
                ))}
              </div>

              <div className="flex justify-between mt-4 pt-3.5 border-t border-dashed border-white/15">
                <Stat label="Tricks won" value={actuals[i]} />
                <Stat label="Round points" value={fmt(pts)} tone={pts > 0 ? 'pos' : 'neg'} />
              </div>
            </div>
          );
        })}
      </div>

      <PrimaryBtn onClick={() => dispatch({ type: 'END_ROUND' })}>END ROUND</PrimaryBtn>
    </div>
  );
}

function ScoreNumber({ value }) {
  return (
    <div
      className="font-display font-black text-white leading-none my-2 h-[46px] flex items-center justify-center"
      style={{ fontSize: '46px', textShadow: '0 0 20px var(--tc-glow)' }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function Stat({ label, value, tone }) {
  const color = tone === 'pos' ? 'text-[#38f9a7]' : tone === 'neg' ? 'text-[#ff5d73]' : 'text-white';
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[#8b93b8] text-[11px] uppercase tracking-wide">{label}</span>
      <b className={`font-display text-2xl ${color}`}>{value}</b>
    </div>
  );
}
