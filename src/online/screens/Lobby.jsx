import { useState } from 'react';
import { sfx } from '../../audio';

export default function Lobby({ room, playerId, onLeave }) {
  const [copied, setCopied] = useState(false);
  if (!room) return null;

  const need = 4 - room.players.length;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      sfx.click();
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-md mx-auto w-full">
      <header className="text-center">
        <div className="text-[#8b93b8] text-xs tracking-[2px] uppercase">Room code</div>
        <button
          onClick={copy}
          title="Tap to copy"
          className="font-display font-black tracking-[8px] text-[#22e0ff] mt-1 active:scale-95 transition"
          style={{ fontSize: 'clamp(34px,10vw,52px)', textShadow: '0 0 22px rgba(34,224,255,.5)' }}
        >
          {room.code}
        </button>
        <div className="text-[#8b93b8] text-xs mt-1">
          {copied ? 'Copied!' : 'Tap the code to copy • share with friends'}
        </div>
      </header>

      <div className="glass rounded-3xl p-4 sm:p-5 flex flex-col gap-2.5">
        {[0, 1, 2, 3].map((i) => {
          const p = room.players[i];
          return (
            <div
              key={i}
              className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
                p ? 'bg-white/5 border-white/10' : 'border-dashed border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${p ? 'bg-[#38f9a7]' : 'bg-white/15'}`}
                  style={p ? { boxShadow: '0 0 10px #38f9a7' } : undefined}
                />
                <span className={p ? 'text-white font-semibold' : 'text-white/40'}>
                  {p ? p.name : 'Waiting…'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                {p && p.id === playerId && (
                  <span className="px-2 py-0.5 rounded-full bg-[#22e0ff]/20 text-[#22e0ff]">You</span>
                )}
                {p && p.isHost && (
                  <span className="px-2 py-0.5 rounded-full bg-[#ffd166]/20 text-[#ffd166]">Host</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center text-sm text-[#8b93b8]">
        {need > 0
          ? `Waiting for ${need} more player${need > 1 ? 's' : ''}…`
          : 'All 4 players in! Partner selection is coming next.'}
      </div>

      <button
        onClick={onLeave}
        className="btn-ghost rounded-2xl px-6 py-3 w-full font-semibold text-[#ff9db0]"
      >
        Leave room
      </button>
    </div>
  );
}
