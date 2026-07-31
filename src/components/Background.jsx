export default function Background() {
  const orbs = [
    { cls: 'w-[460px] h-[460px] bg-[#12b6ff] -top-28 -left-20', d: '0s' },
    { cls: 'w-[420px] h-[420px] bg-[#ff2d95] -bottom-32 -right-16', d: '-4s' },
    { cls: 'w-[360px] h-[360px] bg-[#7c5cff] top-[42%] left-[55%]', d: '-9s' },
    { cls: 'w-[300px] h-[300px] bg-[#14e0b0] bottom-[10%] left-[6%]', d: '-13s' },
  ];
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {orbs.map((o, i) => (
        <span
          key={i}
          className={`orb ${o.cls}`}
          style={{ animation: 'floaty 18s cubic-bezier(.22,1,.36,1) infinite', animationDelay: o.d }}
        />
      ))}
    </div>
  );
}
