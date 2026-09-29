// Web Audio API procedural mechanical lock sound generator
// Zero external audio assets required - pure synthesized relay/servo click

export function playLockSound(type: 'unlock' | 'lock' = 'unlock') {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    if (type === 'unlock') {
      // High-pitch metallic solenoid snap
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(1200, now);
      osc1.frequency.exponentialRampToValueAtTime(150, now + 0.04);

      gain1.gain.setValueAtTime(0.4, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.04);

      // Heavy mechanical latch release sound at t + 45ms
      setTimeout(() => {
        if (ctx.state === 'closed') return;
        const now2 = ctx.currentTime;
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(350, now2);
        osc2.frequency.exponentialRampToValueAtTime(45, now2 + 0.07);

        gain2.gain.setValueAtTime(0.6, now2);
        gain2.gain.exponentialRampToValueAtTime(0.001, now2 + 0.07);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now2);
        osc2.stop(now2 + 0.07);
      }, 45);
    } else {
      // Lock mechanism thump
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch (err) {
    console.warn('Web Audio API play error:', err);
  }
}
