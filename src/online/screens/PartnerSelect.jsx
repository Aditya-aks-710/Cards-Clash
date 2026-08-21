import { motion } from 'framer-motion';
import { sfx } from '../../audio';

export default function PartnerSelect({ players, playerId, mine, picked, total = 4, onPick }) {
  const me = players.find((p) => p.id === playerId);
  const others = players.filter((p) => p.id !== playerId);

  return (
    <div className="flex flex-col gap-5 max-w-md mx-auto w-full">
      <header className="text-center">
        <div className="text-[#8b93b8] text-xs tracking-[2px] uppercase">Welcome</div>
        {me && (
          <h2
            className="font-display font-black text-white tracking-[1px] mt-1"
            style={{ fontSize: 'clamp(26px,7vw,40px)', textShadow: '0 0 22px rgba(34,224,255,.4)' }}
          >
            {me.name}
          </h2>
        )}
        <p className="text-[#8b93b8] mt-1 text-sm">Who do you want to partner with?</p>
      </header>

      <div className="flex flex-col gap-3">
        {others.map((p) => {
          const chosen = mine === p.id;
          return (
            <motion.button
              key={p.id}
              whileTap={{ scale: 0.97 }}
              disabled={!!mine}
              onClick={() => { sfx.click(); onPick(p.id); }}
              className={`glass rounded-2xl px-5 py-4 flex items-center justify-between border transition ${
                chosen ? 'border-[#22e0ff]' : 'border-white/10'
              } ${mine && !chosen ? 'opacity-45' : ''}`}
              style={chosen ? { boxShadow: '0 0 22px -6px rgba(34,224,255,.7)' } : undefined}
            >
              <span className="font-semibold text-white">{p.name}</span>
              <span className={`text-sm ${chosen ? 'text-[#22e0ff]' : 'text-[#8b93b8]'}`}>
                {chosen ? 'Your pick' : 'Tap to choose'}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="text-center text-sm text-[#8b93b8] min-h-[20px]">
        {mine ? `Waiting for everyone to choose… (${picked}/${total})` : 'Pick a teammate to continue'}
      </div>
    </div>
  );
}
