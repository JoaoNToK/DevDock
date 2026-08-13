/**
 * Plays Web Audio API synthesizers for Start & End chime notifications
 * with configurable volume control (0.0 to 1.0)
 */

export function playStartSound(volume: number = 0.8) {
  if (typeof window === 'undefined' || volume <= 0) return;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const safeVolume = Math.max(0, Math.min(1, volume));

    // Gentle ascending two-note chord (C5 -> E5)
    const notes = [
      { freq: 523.25, start: 0.0, duration: 0.15 }, // C5
      { freq: 659.25, start: 0.12, duration: 0.25 }, // E5
    ];

    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.25 * safeVolume, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    });
  } catch (error) {
    console.error('Error playing start sound:', error);
  }
}

export function playEndSound(volume: number = 0.8) {
  if (typeof window === 'undefined' || volume <= 0) return;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const safeVolume = Math.max(0, Math.min(1, volume));

    // Pleasant three-note chime (E5 -> G5 -> C6)
    const notes = [
      { freq: 659.25, start: 0.0, duration: 0.15 },  // E5
      { freq: 783.99, start: 0.12, duration: 0.18 }, // G5
      { freq: 1046.50, start: 0.26, duration: 0.45 }  // C6
    ];

    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.35 * safeVolume, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    });
  } catch (error) {
    console.error('Error playing end sound:', error);
  }
}

// Backward compatibility helper
export function playNotificationSound() {
  playEndSound(0.8);
}
