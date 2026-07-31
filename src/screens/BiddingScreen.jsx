import { motion, useAnimationControls } from 'framer-motion';
import TiltCard from '../components/TiltCard';
import Stepper from '../components/Stepper';
import { Head, PrimaryBtn } from '../components/ui';
import { MIN_BID, MAX_BID } from '../game';

export default function BiddingScreen({ state, dispatch, onToast, onSixSix }) {
  const controls = useAnimationControls();

  const confirm = () => {
    const [a, b] = state.bids;
    const restart = (a === 5 && b === 5) || (a === 5 && b === 6) || (a === 6 && b === 5);

    if (restart) {
      onToast(`Bids too low (${a}\u2013${b}). Round restarts \u2014 re-bid!`, 'warn');
      controls.start({ x: [0, -9, 9, -6, 6, 0], transition: { duration: 0.45 } });
      return;
    }
    if (a === 6 && b === 6) {
      onSixSix();
      return;
    }
    dispatch({ type: 'GO_SCORING' });
  };

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <Head
        round={state.round}
        numRounds={state.numRounds}
        title="Place Your Bids"
        note={"Each team commits to the tricks they\u2019ll win \u2014 pick 5 to 13."}
      />

      <motion.div animate={controls} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {state.teams.map((tm, i) => (
          <TiltCard key={i} className={`team-${tm.color} team-surface rounded-3xl p-6 text-center relative overflow-hidden`}>
            <span className="absolute -top-10 -left-8 w-40 h-40 rounded-full blur-[60px] opacity-35 pointer-events-none" style={{ background: 'var(--tc)' }} />
            <div className="font-display text-xl sm:text-2xl neon">{tm.name}</div>
            <div className="text-[#8b93b8] text-xs mt-1 mb-4">{tm.players.map((p) => p.name).join(' & ')}</div>
            <Stepper
              value={state.bids[i]}
              onDec={() => dispatch({ type: 'SET_BID', team: i, delta: -1 })}
              onInc={() => dispatch({ type: 'SET_BID', team: i, delta: 1 })}
            />
            <div className="text-[#8b93b8] text-xs tracking-wider mt-3.5">Choose {MIN_BID} &ndash; {MAX_BID}</div>
          </TiltCard>
        ))}
      </motion.div>

      <div className="glass rounded-2xl px-5 py-3.5 text-center text-[13.5px] leading-relaxed text-[#8b93b8]">
        <b className="text-white">Bidding rules:</b> 5&ndash;5, 5&ndash;6 or 6&ndash;5 &rarr; the round restarts. 6&ndash;6 &rarr; you&rsquo;ll be asked whether to continue.
      </div>

      <PrimaryBtn onClick={confirm}>LOCK BIDS</PrimaryBtn>
    </div>
  );
}
