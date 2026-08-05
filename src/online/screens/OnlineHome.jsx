import { useState } from 'react';
import { motion } from 'framer-motion';
import { sfx } from '../../audio';

export default function OnlineHome({ onCreate, onJoin, onExit, error, busy }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const inp =
    'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white ' +
    'placeholder:text-white/40 outline-none focus:border-[#22e0ff] focus:bg-white/10 transition';

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
          PLAY ONLINE
        </h2>
        <p className="text-[#8b93b8] mt-2 text-sm">Create a private room and invite 3 friends with the code.</p>
      </header>

      <div className="glass rounded-3xl p-5 sm:p-6 flex flex-col gap-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={16}
          placeholder="Your name"
          className={inp}
        />

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={busy}
          onClick={() => { sfx.lock(); onCreate(name); }}
          className="btn-primary rounded-2xl px-6 py-3.5 w-full tracking-[1px] disabled:opacity-60"
        >
          Create room
        </motion.button>

        <div className="flex items-center gap-3 text-[#8b93b8] text-[11px]">
          <span className="h-px flex-1 bg-white/10" />
          <span className="tracking-[2px] uppercase">or join with a code</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <div className="flex gap-2.5">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            placeholder="CODE"
            className={`${inp} font-display text-center tracking-[4px] uppercase`}
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={busy}
            onClick={() => { sfx.click(); onJoin(name, code); }}
            className="btn-ghost rounded-xl px-5 font-semibold shrink-0 disabled:opacity-60"
          >
            Join
          </motion.button>
        </div>

        {error && <p className="text-[#ff5d73] text-sm text-center">{error}</p>}
      </div>

      <button
        onClick={onExit}
        className="btn-ghost rounded-2xl px-6 py-3 w-full font-semibold text-[#8b93b8]"
      >
        &larr; Back to offline
      </button>
    </div>
  );
}
