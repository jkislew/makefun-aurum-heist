// AURUM — tiny WebAudio synth. No audio files: a clock tick for each pip,
// a coin ping, a detection sting, a laser klaxon and a getaway jingle are
// all oscillators shaped in code. M mutes.

export class SynthAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensureContext() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  tone(freq, dur, type, gain, when) {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t0 = ctx.currentTime + (when || 0);
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    amp.gain.setValueAtTime(gain || 0.08, t0);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(amp).connect(ctx.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  playClockTick() { this.tone(1180, 0.09, "square", 0.05); this.tone(880, 0.12, "square", 0.04, 0.07); }
  playCoinPing() { this.tone(1560, 0.14, "sine", 0.09); this.tone(2090, 0.2, "sine", 0.07, 0.06); }
  playDetectionSting() { this.tone(220, 0.25, "sawtooth", 0.07); this.tone(233, 0.25, "sawtooth", 0.06, 0.03); }
  playLaserKlaxon() { this.tone(660, 0.12, "square", 0.07); this.tone(495, 0.12, "square", 0.07, 0.13); }
  playPickupChime() { this.tone(990, 0.1, "triangle", 0.08); this.tone(1320, 0.16, "triangle", 0.08, 0.08); }
  playGetawayJingle() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.22, "triangle", 0.09, i * 0.13)); }
  playBustedBuzz() { [196, 185, 165, 147].forEach((f, i) => this.tone(f, 0.3, "sawtooth", 0.08, i * 0.16)); }
}
