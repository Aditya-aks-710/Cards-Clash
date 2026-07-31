import TiltCard from '../components/TiltCard';
import { Head, PrimaryBtn } from '../components/ui';
import { fmt } from '../game';
import { sfx } from '../audio';

export default function SummaryScreen({ state, dispatch }) {
  const h = state.history[state.history.length - 1];
  const isLast = state.round >= state.numRounds;

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <Head pill={`Round ${h.round} of ${state.numRounds} complete`} title="Round Results" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {state.teams.map((tm, i) => {
          const made = h.points[i] > 0;
          return (
            <TiltCard key={i} max={7} className={`team-${tm.color} team-surface rounded-3xl p-5 sm:p-6`}>
              <div className="flex items-center justify-between mb-4">
                <span className="font-display text-xl neon">{tm.name}</span>
                <span
                  className={`text-[11px] tracking-wide uppercase px-3 py-1.5 rounded-full font-bold ${
                    made
                      ? 'text-[#06251a] bg-[#38f9a7] shadow-[0_0_16px_-3px_rgba(56,249,167,.7)]'
                      : 'text-[#2a0710] bg-[#ff5d73] shadow-[0_0_16px_-3px_rgba(255,93,115,.7)]'
                  }`}
                >
                  {made ? 'Made it' : 'Missed'}
                </span>
              </div>

              <div className="flex gap-3 justify-between">
                <NumBox label="Bid" value={h.bids[i]} />
                <NumBox label="Tricks" value={h.actual[i]} />
                <NumBox label="Round" value={fmt(h.points[i])} big tone={h.points[i] < 0 ? 'neg' : 'pos'} />
              </div>

              <div className="flex flex-col gap-2 mt-4">
                {h.contributions[i].map((c, k) => (
                  <div key={k} className="flex justify-between px-3.5 py-2.5 rounded-xl bg-white/5 text-sm">
                    <span className="truncate">{c.name}</span>
                    <b className="font-display neon ml-2">{c.score}</b>
                  </div>
                ))}
              </div>

              <div className="text-center text-[#8b93b8] text-sm mt-4">
                Total so far:
                <b className="font-display text-xl text-white ml-1.5">{fmt(state.cumulative[i])}</b>
              </div>
            </TiltCard>
          );
        })}
      </div>

      <PrimaryBtn onClick={() => { sfx.click(); dispatch({ type: 'NEXT_ROUND' }); }}>
        {isLast ? 'See Final Result' : `Start Round ${state.round + 1}`}
      </PrimaryBtn>
    </div>
  );
}

function NumBox({ label, value, big, tone }) {
  const color = tone === 'pos' ? 'text-[#38f9a7]' : tone === 'neg' ? 'text-[#ff5d73]' : 'text-white';
  return (
    <div className="flex-1 text-center py-3 px-1.5 rounded-2xl bg-black/20 border border-white/10">
      <span className="block text-[#8b93b8] text-[11px] uppercase tracking-wide mb-1">{label}</span>
      <b className={`font-display ${big ? 'text-3xl' : 'text-2xl'} ${color}`}>{value}</b>
    </div>
  );
}
