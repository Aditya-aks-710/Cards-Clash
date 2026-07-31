// ------------------------------------------------------------------
// Tiny synthesized sound-effects engine (Web Audio API, no assets).
// The AudioContext is created lazily on the first user gesture so it
// complies with browser autoplay policies. Mute state is persisted.
// ------------------------------------------------------------------

const MUTE_KEY = 'cardclash:muted';

let ctx = null;
let muted = readMuted();

function readMuted() {
  try { return localStorage.getItem(MUTE_KEY) === '1'; } catch { return false; }
}

function ac() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function note({ freq, dur = 0.12, type = 'sine', vol = 0.15, slideTo = null }) {
  const c = ac();
  if (!c || muted) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + dur);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(vol, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(now);
  osc.stop(now + dur + 0.02);
}

function chord(freqs, { dur = 0.3, type = 'triangle', vol = 0.09 } = {}) {
  freqs.forEach((f) => note({ freq: f, dur, type, vol }));
}

export const sfx = {
  isMuted() { return muted; },
  setMuted(m) {
    muted = m;
    try { localStorage.setItem(MUTE_KEY, m ? '1' : '0'); } catch { /* ignore */ }
    if (!m) ac();
  },
  toggle() { this.setMuted(!muted); return muted; },

  click() { note({ freq: 480, dur: 0.05, type: 'triangle', vol: 0.07 }); },
  inc() { note({ freq: 660, dur: 0.08, type: 'triangle', vol: 0.1, slideTo: 880 }); },
  dec() { note({ freq: 460, dur: 0.08, type: 'triangle', vol: 0.1, slideTo: 340 }); },
  lock() {
    note({ freq: 520, dur: 0.09, type: 'sawtooth', vol: 0.08, slideTo: 780 });
    setTimeout(() => note({ freq: 780, dur: 0.12, type: 'sawtooth', vol: 0.07 }), 90);
  },
  restart() { note({ freq: 300, dur: 0.18, type: 'square', vol: 0.06, slideTo: 150 }); },
  round() { chord([523, 659, 784], { dur: 0.32, vol: 0.07 }); },
  win() {
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => note({ freq: f, dur: 0.28, type: 'triangle', vol: 0.12 }), i * 120)
    );
    setTimeout(() => chord([784, 1047, 1319], { dur: 0.6, vol: 0.08 }), 520);
  },
};
