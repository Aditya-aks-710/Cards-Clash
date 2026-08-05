export default function ConnectionBadge({ connected }) {
  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2 glass rounded-full px-3 py-1.5 text-xs text-white/80">
      <span
        className={`w-2 h-2 rounded-full ${connected ? 'bg-[#38f9a7]' : 'bg-[#ffd166]'}`}
        style={{ boxShadow: connected ? '0 0 10px #38f9a7' : '0 0 10px #ffd166' }}
      />
      {connected ? 'Online' : 'Connecting…'}
    </div>
  );
}
