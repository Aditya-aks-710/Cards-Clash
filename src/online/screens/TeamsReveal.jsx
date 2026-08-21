import { motion } from 'framer-motion';

export default function TeamsReveal({ data, playerId }) {
  if (!data) return null;
  const { teams, random, messages } = data;
  const myMsg = messages?.[playerId];
  const tone = ['a', 'b'];

  return (
    <div className="flex flex-col gap-5 max-w-md mx-auto w-full">
      <header className="text-center">
        <h2
          className="font-display font-black tracking-[2px]"
          style={{
            fontSize: 'clamp(28px,8vw,44px)',
            backgroundImage: 'linear-gradient(90deg,#22e0ff,#7c5cff 50%,#ff3d9a)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            filter: 'drop-shadow(0 0 22px rgba(124,92,255,.4))',
          }}
        >
          Teams
        </h2>
        <p className={`mt-2 text-sm ${random ? 'text-[#ffd166]' : 'text-[#8b93b8]'}`}>
          {random ? (myMsg || 'No mutual match — teams were randomised.') : 'Mutual picks — partners locked in!'}
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {teams.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            className={`team-${tone[i]} team-surface rounded-3xl p-5`}
          >
            <div className="font-display neon text-sm mb-3">Team {i + 1}</div>
            <div className="flex flex-col gap-2">
              {t.players.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl px-4 py-3 bg-white/5">
                  <span className="text-white font-semibold">{p.name}</span>
                  {p.id === playerId && (
                    <span className="px-2 py-0.5 rounded-full bg-[#22e0ff]/20 text-[#22e0ff] text-[11px]">You</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center text-sm text-[#8b93b8]">Shuffling &amp; dealing coming up next…</div>
    </div>
  );
}
