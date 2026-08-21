import { useState } from 'react';
import { motion } from 'framer-motion';
import { sfx } from '../../audio';

export default function PartnerSelect({ players, playerId, mine, picked, total = 4, onPick }) {
  const me = players.find((p) => p.id === playerId);
  const others = players.filter((p) => p.id !== playerId);

  // selection is local until confirmed, so a misclick is harmless
  const [selected, setSelected] = useState(mine ?? null);
  const [editing, setEditing] = useState(!mine);

  const confirm = () => {
    if (!selected) return;
    sfx.lock();
    onPick(selected);
    setEditing(false);
  };
  const change = () => { sfx.click(); setEditing(true); };

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
        <p className="text-[#8b93b8] mt-1 text-sm">
          {editing ? 'Who do you want to partner with?' : 'Partner locked in'}
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {others.map((p) => {
          const isSel = selected === p.id;
          return (
            <motion.button
              key={p.id}
              whileTap={editing ? { scale: 0.97 } : undefined}
              disabled={!editing}
              onClick={() => { sfx.click(); setSelected(p.id); }}
              className={`glass rounded-2xl px-5 py-4 flex items-center justify-between border transition ${
                isSel ? 'border-[#22e0ff]' : 'border-white/10'
              } ${!editing && !isSel ? 'opacity-45' : ''} ${editing ? '' : 'cursor-default'}`}
              style={isSel ? { boxShadow: '0 0 22px -6px rgba(34,224,255,.7)' } : undefined}
            >
              <span className="font-semibold text-white">{p.name}</span>
              <span className={`text-sm ${isSel ? 'text-[#22e0ff]' : 'text-[#8b93b8]'}`}>
                {isSel ? (editing ? 'Selected' : 'Your partner') : 'Tap to choose'}
              </span>
            </motion.button>
          );
        })}
      </div>

      {editing ? (
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={!selected}
          onClick={confirm}
          className="btn-primary rounded-2xl px-6 py-3.5 w-full tracking-[1px] disabled:opacity-40"
        >
          {mine ? 'Update partner' : 'Confirm partner'}
        </motion.button>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="text-center text-sm text-[#8b93b8]">
            Waiting for everyone to choose… ({picked}/{total})
          </div>
          <button onClick={change} className="btn-ghost rounded-2xl px-6 py-2.5 text-sm font-semibold">
            Change partner
          </button>
        </div>
      )}
    </div>
  );
}

