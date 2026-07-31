import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { PrimaryBtn } from '../components/ui';
import Confetti from '../components/Confetti';
import { fmt } from '../game';
import { sfx } from '../audio';

export default function FinalScreen({ state, dispatch }) {
  const [c0, c1] = state.cumulative;
  const tie = c0 === c1;
  const wi = c0 > c1 ? 0 : 1;

  useEffect(() => {
    if (tie) sfx.round();
    else sfx.win();
    // play once when the final screen mounts
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {!tie && <Confetti />}

      <div className={`text-center py-4 sm:py-5 ${tie ? '' : 'team-' + state.teams[wi].color}`}>
        {!tie && <Trophy />}
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 16 }}
          className="font-display font-black mt-2"
          style={{
            fontSize: 'clamp(32px,9vw,60px)',
            backgroundImage: tie ? 'linear-gradient(90deg,#ffd166,#fff)' : 'linear-gradient(90deg,var(--tc),#fff)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            filter: 'drop-shadow(0 0 24px var(--tc-glow))',
          }}
        >
          {tie ? "It's a Tie!" : `${state.teams[wi].name} Wins!`}
        </motion.h1>
        <div className="font-display text-lg sm:text-xl mt-3 flex gap-3.5 justify-center items-center flex-wrap">
          <span className="text-[#22e0ff]">{state.teams[0].name} {fmt(c0)}</span>
          <span className="text-[#8b93b8]">&bull;</span>
          <span className="text-[#ff3d9a]">{state.teams[1].name} {fmt(c1)}</span>
        </div>
      </div>

      <div className="glass rounded-3xl p-2 sm:p-3 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="py-3 px-3 font-display text-[11px] tracking-wide uppercase text-[#8b93b8]">Round</th>
              <th className="py-3 px-3 font-display text-[11px] tracking-wide uppercase text-[#22e0ff]">{state.teams[0].name}</th>
              <th className="py-3 px-3 font-display text-[11px] tracking-wide uppercase text-[#ff3d9a]">{state.teams[1].name}</th>
            </tr>
          </thead>
          <tbody>
            {state.history.map((h) => (
              <tr key={h.round} className="border-t border-white/10">
                <td className="py-3 px-3 text-center">{h.round}</td>
                <Cell h={h} i={0} tint="text-[#cdeeff]" />
                <Cell h={h} i={1} tint="text-[#ffd6e9]" />
              </tr>
            ))}
            <tr className="border-t-2 border-white/20">
              <td className="py-3 px-3 text-center font-display text-lg text-white">Total</td>
              <td className="py-3 px-3 text-center font-display text-lg text-white">{fmt(c0)}</td>
              <td className="py-3 px-3 text-center font-display text-lg text-white">{fmt(c1)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <PrimaryBtn onClick={() => { sfx.click(); dispatch({ type: 'PLAY_AGAIN' }); }}>NEW GAME</PrimaryBtn>
    </div>
  );
}

function Cell({ h, i, tint }) {
  return (
    <td className={`py-3 px-3 text-center whitespace-nowrap ${tint}`}>
      bid {h.bids[i]} &middot; won {h.actual[i]} &middot;{' '}
      <b className={h.points[i] < 0 ? 'text-[#ff5d73]' : 'text-[#38f9a7]'}>{fmt(h.points[i])}</b>
    </td>
  );
}

function Trophy() {
  return (
    <motion.svg
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
      className="w-20 h-20 mx-auto"
      viewBox="0 0 24 24"
      fill="none"
      style={{ filter: 'drop-shadow(0 0 26px rgba(255,209,102,.7))' }}
    >
      <path d="M6 4h12v3a6 6 0 0 1-12 0V4Z" fill="#ffd166" />
      <path d="M18 5h2.5a1.5 1.5 0 0 1 0 3A3.5 3.5 0 0 1 18 8V5Z" fill="#ffcf4d" />
      <path d="M6 5v3a3.5 3.5 0 0 1-2.5 0A1.5 1.5 0 0 1 6 5Z" fill="#ffcf4d" />
      <path d="M9 12h6l-.5 4h-5L9 12Z" fill="#f4b400" />
      <rect x="8" y="18" width="8" height="2.4" rx="1" fill="#ffd166" />
      <rect x="9.5" y="16" width="5" height="2.4" rx="1" fill="#f4b400" />
    </motion.svg>
  );
}
