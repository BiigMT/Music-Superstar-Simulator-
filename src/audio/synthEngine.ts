import { Genre, MixSettings } from '../types/game';

class SynthEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private loopTimer: number | null = null;
  private currentGenre: Genre = 'Hip-Hop';
  private currentMix: MixSettings = { bass: 75, drums: 75, melody: 70, vocals: 75 };
  private step: number = 0;

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      this.stopBeatPreview();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public playClick() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.045);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playCash() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [880, 1174.66].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      gain.gain.setValueAtTime(0.08, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.17);
    });
  }

  public playRecordMaster() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [261.63, 329.63, 392.0, 523.25];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.055);
      gain.gain.setValueAtTime(0.09, now + idx * 0.055);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.055 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.055);
      osc.stop(now + idx * 0.055 + 0.26);
    });
  }

  public playWeekAdvance() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playFanfare() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const chord = [440, 554.37, 659.25, 880];
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now);
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.045, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + 0.58);
    });
  }

  public playFeudHit() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.25);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  // Interactive Studio Beat Preview
  public updateBeatPreviewParams(genre: Genre, mix: MixSettings) {
    this.currentGenre = genre;
    this.currentMix = mix;
  }

  public isBeatPlaying(): boolean {
    return this.loopTimer !== null;
  }

  public startBeatPreview(genre: Genre, bpm: number, mix: MixSettings) {
    this.stopBeatPreview();
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.currentGenre = genre;
    this.currentMix = mix;
    this.step = 0;

    const sixteenthMs = Math.max(85, Math.round((60 / Math.max(70, bpm) / 4) * 1000));
    this.triggerStep();
    this.loopTimer = window.setInterval(() => {
      if (this.muted) {
        this.stopBeatPreview();
        return;
      }
      this.triggerStep();
    }, sixteenthMs);
  }

  public stopBeatPreview() {
    if (this.loopTimer !== null) {
      window.clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
  }

  private triggerStep() {
    const ctx = this.ctx;
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    const s = this.step % 16;
    this.step++;

    const bassVol = (this.currentMix.bass / 100) * 0.16;
    const drumVol = (this.currentMix.drums / 100) * 0.12;
    const melVol = (this.currentMix.melody / 100) * 0.08;
    const vocalVol = (this.currentMix.vocals / 100) * 0.06;

    const genre = this.currentGenre;

    // Kick & 808 Bass pattern
    const kickSteps =
      genre === 'Pop' || genre === 'Electronic'
        ? [0, 4, 8, 12]
        : genre === 'Rock'
          ? [0, 6, 8, 10]
          : [0, 3, 8, 11];

    if (kickSteps.includes(s)) {
      const kick = ctx.createOscillator();
      const kGain = ctx.createGain();
      kick.type = 'sine';
      kick.frequency.setValueAtTime(genre === 'Hip-Hop' ? 115 : 135, now);
      kick.frequency.exponentialRampToValueAtTime(38, now + 0.14);
      kGain.gain.setValueAtTime(bassVol + drumVol * 0.35, now);
      kGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      kick.connect(kGain);
      kGain.connect(ctx.destination);
      kick.start(now);
      kick.stop(now + 0.19);
    }

    // Snare / Clap
    if (s === 4 || s === 12) {
      const snare = ctx.createOscillator();
      const sGain = ctx.createGain();
      snare.type = 'triangle';
      snare.frequency.setValueAtTime(240, now);
      snare.frequency.exponentialRampToValueAtTime(95, now + 0.07);
      sGain.gain.setValueAtTime(drumVol, now);
      sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      snare.connect(sGain);
      sGain.connect(ctx.destination);
      snare.start(now);
      snare.stop(now + 0.09);
    }

    // Hi-hat tick
    const hatSteps = genre === 'Hip-Hop' ? [0, 2, 4, 6, 7, 8, 10, 12, 14, 15] : [2, 6, 10, 14];
    if (hatSteps.includes(s)) {
      const hat = ctx.createOscillator();
      const hGain = ctx.createGain();
      hat.type = 'square';
      hat.frequency.setValueAtTime(6200, now);
      hGain.gain.setValueAtTime(drumVol * 0.18, now);
      hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
      hat.connect(hGain);
      hGain.connect(ctx.destination);
      hat.start(now);
      hat.stop(now + 0.03);
    }

    // Genre Melody Phrase
    const scales: Record<Genre, number[]> = {
      'Hip-Hop': [196.0, 233.08, 261.63, 293.66, 311.13],
      'Pop': [261.63, 293.66, 329.63, 392.0, 440.0],
      'R&B': [220.0, 261.63, 311.13, 349.23, 392.0],
      'Rock': [146.83, 174.61, 196.0, 220.0, 261.63],
      'Electronic': [293.66, 349.23, 440.0, 523.25, 587.33],
    };
    const melSteps = genre === 'Electronic' ? [0, 2, 4, 6, 8, 10, 12, 14] : [0, 3, 6, 8, 12];
    if (melSteps.includes(s)) {
      const notes = scales[genre];
      const freq = notes[(s + Math.floor(this.step / 16)) % notes.length];
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const mGain = ctx.createGain();
      osc.type = genre === 'Rock' || genre === 'Electronic' ? 'sawtooth' : 'triangle';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(genre === 'R&B' ? 900 : 2100, now);
      osc.frequency.setValueAtTime(freq, now);
      mGain.gain.setValueAtTime(melVol, now);
      mGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(filter);
      filter.connect(mGain);
      mGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    }

    // Subtle vocal formant pad on 0 & 8
    if (s === 0 || s === 8) {
      const vOsc = ctx.createOscillator();
      const vGain = ctx.createGain();
      vOsc.type = 'sine';
      vOsc.frequency.setValueAtTime(s === 0 ? 523.25 : 440, now);
      vGain.gain.setValueAtTime(vocalVol, now);
      vGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      vOsc.connect(vGain);
      vGain.connect(ctx.destination);
      vOsc.start(now);
      vOsc.stop(now + 0.25);
    }
  }
}

export const synth = new SynthEngine();
