import { useState } from 'react';
import { motion } from 'framer-motion';
import TiltCard from '../components/TiltCard';

const CHIPS = [3, 5, 7, 10];

export default function SetupScreen({ state, dispatch }) {
  const [team, setTeam] = useState([state.teams[0].name, state.teams[1].name]);
  const [players, setPlayers] = useState([
    state.teams[0].players[0].name,
    state.teams[0].players[1].name,
    state.teams[1].players[0].name,
    state.teams[1].players[1].name,
  ]);

  const setPlayer = (idx, v) => setPlayers((prev) => prev.map((p, i) => (i === idx ? v : p)));
  const start = () => dispatch({ type: 'START', names: { team, players } });

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <header className="text-center">
        <div className="text-2xl sm:text-3xl tracking-[0.4em] mb-1" style={{ filter: 'drop-shadow(0 0 12px rgba(124,92,255,.6))' }}>
          <span className="text-[#cfe0ff]">&#9824;</span>
          <span className="text-[#ff5d8f]">&#9829;</span>
          <span className="text-[#cfe0ff]">&#9827;</span>
          <span className="text-[#ff5d8f]">&#9830;</span>
        </div>
        <h1
          className="font-display font-black tracking-[3px] leading-none"
          style={{
            fontSize: 'clamp(40px,12vw,72px)',
            backgroundImage: 'linear-gradient(90deg,#22e0ff,#7c5cff 45%,#ff3d9a)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            filter: 'drop-shadow(0 0 26px rgba(124,92,255,.45))',
          }}
        >
          CARD CLASH
        </h1>
        <p className="text-[#8b93b8] mt-2.5 text-sm sm:text-base px-2">
          2 v 2 bidding showdown &mdash; commit your tricks, chase the lead.
        </p>
      </header>

      <div className="glass rounded-3xl p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-5">
        <TeamInputs
          color="a" label="Team 1"
          teamName={team[0]} onTeam={(v) => setTeam([v, team[1]])}
          p1={players[0]} p2={players[1]} onP1={(v) => setPlayer(0, v)} onP2={(v) => setPlayer(1, v)}
          ph={{ team: 'Team A', p1: 'Player 1', p2: 'Player 2' }}
        />
        <div className="font-display font-black text-lg sm:text-xl text-[#8b93b8] text-center py-1">VS</div>
        <TeamInputs
          color="b" label="Team 2"
          teamName={team[1]} onTeam={(v) => setTeam([team[0], v])}
          p1={players[2]} p2={players[3]} onP1={(v) => setPlayer(2, v)} onP2={(v) => setPlayer(3, v)}
          ph={{ team: 'Team B', p1: 'Player 3', p2: 'Player 4' }}
        />
      </div>

      <div className="glass rounded-3xl p-5 sm:p-6 text-center">
        <div className="text-[#8b93b8] text-sm tracking-wide mb-3.5">Number of rounds</div>
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => dispatch({ type: 'SET_ROUNDS', value: state.numRounds - 1 })}
            className="w-14 h-14 rounded-full bg-white/5 border border-white/10 text-2xl font-bold text-[#ff5d73] active:scale-90 transition"
            aria-label="Fewer rounds"
          >&minus;</button>
          <div className="font-display font-black text-5xl min-w-[90px] text-white" style={{ textShadow: '0 0 24px rgba(124,92,255,.7)' }}>
            {state.numRounds}
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_ROUNDS', value: state.numRounds + 1 })}
            className="w-14 h-14 rounded-full bg-white/5 border border-white/10 text-2xl font-bold text-[#38f9a7] active:scale-90 transition"
            aria-label="More rounds"
          >+</button>
        </div>
        <div className="flex gap-2.5 justify-center mt-4 flex-wrap">
          {CHIPS.map((n) => (
            <button
              key={n}
              onClick={() => dispatch({ type: 'SET_ROUNDS', value: n })}
              className={`px-4 py-2 rounded-full font-semibold border transition ${
                state.numRounds === n
                  ? 'text-white border-[#7c5cff] bg-[#7c5cff]/25 shadow-[0_0_18px_-4px_rgba(124,92,255,.7)]'
                  : 'text-[#8b93b8] border-white/10 bg-white/5 hover:text-white'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ y: -3 }}
        onClick={start}
        className="btn-primary self-center w-full sm:w-auto sm:min-w-[280px] rounded-2xl px-9 py-4 text-base sm:text-[17px] tracking-[2px]"
      >
        START GAME
      </motion.button>
    </div>
  );
}

function TeamInputs({ color, label, teamName, onTeam, p1, p2, onP1, onP2, ph }) {
  const inp =
    'w-full px-3.5 py-3 rounded-xl bg-white/5 border border-white/10 text-white ' +
    'placeholder:text-white/40 outline-none focus:border-[color:var(--tc)] focus:bg-white/10 transition';
  return (
    <TiltCard max={6} className={`team-${color} team-surface rounded-2xl p-4 flex flex-col gap-3`}>
      <div className="font-display text-xs tracking-[3px] uppercase neon">{label}</div>
      <input value={teamName} onChange={(e) => onTeam(e.target.value)} maxLength={18} placeholder={ph.team} className={`${inp} font-semibold text-base`} />
      <input value={p1} onChange={(e) => onP1(e.target.value)} maxLength={16} placeholder={ph.p1} className={inp} />
      <input value={p2} onChange={(e) => onP2(e.target.value)} maxLength={16} placeholder={ph.p2} className={inp} />
    </TiltCard>
  );
}
