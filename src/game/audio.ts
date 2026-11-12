// Procedural Web Audio API sound and music synthesizer

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentBgm: string | null = null;
  private bgmInterval: number | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.7;
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.35;
      this.bgmGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.5, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // --- Sound Effects ---

  public playJump() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.15);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playDash() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // White noise burst for air whoosh
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(2000, now + 0.08);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.18);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  public playAttack(weapon: string = 'ruler', comboIndex: number = 0) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    if (weapon === 'stylus') {
      // Powerful laser beam / heavy calligraphy slash
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.28);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (weapon === 'marker') {
      // Paint splash / squish
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (weapon === 'compass') {
      // Sharp metallic pierce
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(800 + comboIndex * 150, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.14);
    } else {
      // Plastic set square woosh
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300 + comboIndex * 80, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.13);
    }
  }

  public playEnemyHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  public playPlayerHurt() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    // Classic Windows error / Red pen X scratch
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(200, now);
    osc1.frequency.setValueAtTime(150, now + 0.08);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(260, now);
    osc2.frequency.setValueAtTime(180, now + 0.08);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.26);
    osc2.stop(now + 0.26);
  }

  public playShieldBlock() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    // RTX 5090 Ray Tracing Barrier Deflect
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.35);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playSkill() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.22);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.23);
  }

  public playUltimate() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    // Power build-up sweep
    const sweep = this.ctx.createOscillator();
    const sweepGain = this.ctx.createGain();
    sweep.type = 'sawtooth';
    sweep.frequency.setValueAtTime(150, now);
    sweep.frequency.exponentialRampToValueAtTime(900, now + 0.25);
    sweep.frequency.exponentialRampToValueAtTime(100, now + 0.55);
    sweepGain.gain.setValueAtTime(0.3, now);
    sweepGain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);
    sweep.connect(sweepGain);
    sweepGain.connect(this.sfxGain);
    sweep.start(now);
    sweep.stop(now + 0.56);

    // Deep sub bass impact
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(120, now + 0.15);
    sub.frequency.exponentialRampToValueAtTime(35, now + 0.65);
    subGain.gain.setValueAtTime(0.6, now + 0.15);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);
    sub.connect(subGain);
    subGain.connect(this.sfxGain);
    sub.start(now + 0.15);
    sub.stop(now + 0.66);
  }

  public playLootPickup() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    // USB hardware connect sound: two bright clean chimes
    const now = this.ctx.currentTime;
    const playNote = (freq: number, start: number) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.12);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(start);
      osc.stop(start + 0.13);
    };

    playNote(523.25, now); // C5
    playNote(783.99, now + 0.1); // G5
  }

  public playBossAlarm() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.15);
    osc.frequency.linearRampToValueAtTime(440, now + 0.3);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    // Victory arpeggio (C - E - G - C6)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const now = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const start = now + idx * 0.14;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.4, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + (idx === 3 ? 0.8 : 0.2));
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(start);
      osc.stop(start + (idx === 3 ? 0.85 : 0.22));
    });
  }

  // --- Background Music Procedural Sequencer ---

  public playBGM(stageId: number) {
    if (this.currentBgm === `stage_${stageId}`) return;
    this.stopBGM();
    this.currentBgm = `stage_${stageId}`;
    this.initCtx();

    let step = 0;
    // Simple 8-bar loop intervals
    this.bgmInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx || !this.bgmGain) return;
      const now = this.ctx.currentTime;

      if (stageId === 1) {
        // Stage 1: Chiptune 8-bit playful pencil theme (Key of C Major / Am)
        const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
        const bassFreq = [130.81, 146.83, 164.81, 110.0][Math.floor(step / 4) % 4];
        
        // Bass note
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bassFreq, now);
        bassGain.gain.setValueAtTime(0.18, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        bassOsc.connect(bassGain);
        bassGain.connect(this.bgmGain);
        bassOsc.start(now);
        bassOsc.stop(now + 0.2);

        // Melody note (chiptune square)
        if (step % 2 === 0 || Math.random() > 0.4) {
          const note = scale[(step * 2 + Math.floor(step / 3)) % scale.length];
          const melOsc = this.ctx.createOscillator();
          const melGain = this.ctx.createGain();
          melOsc.type = 'square';
          melOsc.frequency.setValueAtTime(note, now);
          melGain.gain.setValueAtTime(0.08, now);
          melGain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
          melOsc.connect(melGain);
          melGain.connect(this.bgmGain);
          melOsc.start(now);
          melOsc.stop(now + 0.15);
        }
      } else if (stageId === 2) {
        // Stage 2: Synthwave arpeggiator with color vibes (Key of Dm)
        const dMinor = [146.83, 174.61, 220.0, 261.63, 293.66, 349.23, 440.0];
        const note = dMinor[step % dMinor.length];

        const synthOsc = this.ctx.createOscillator();
        const synthGain = this.ctx.createGain();
        synthOsc.type = 'sawtooth';
        synthOsc.frequency.setValueAtTime(note, now);
        synthGain.gain.setValueAtTime(0.12, now);
        synthGain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
        synthOsc.connect(synthGain);
        synthGain.connect(this.bgmGain);
        synthOsc.start(now);
        synthOsc.stop(now + 0.18);
      } else if (stageId === 3) {
        // Stage 3: High-octane Deadline Boss ticking clock & battle rhythm
        // Ticking clock sound every beat
        const tickOsc = this.ctx.createOscillator();
        const tickGain = this.ctx.createGain();
        tickOsc.type = 'triangle';
        tickOsc.frequency.setValueAtTime(step % 2 === 0 ? 1200 : 900, now);
        tickGain.gain.setValueAtTime(0.14, now);
        tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        tickOsc.connect(tickGain);
        tickGain.connect(this.bgmGain);
        tickOsc.start(now);
        tickOsc.stop(now + 0.05);

        // Heavy industrial sub-bass
        if (step % 4 === 0) {
          const bass = this.ctx.createOscillator();
          const bg = this.ctx.createGain();
          bass.type = 'sawtooth';
          bass.frequency.setValueAtTime(65.41, now); // C2
          bg.gain.setValueAtTime(0.25, now);
          bg.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          bass.connect(bg);
          bg.connect(this.bgmGain);
          bass.start(now);
          bass.stop(now + 0.38);
        }
      }

      step++;
    }, 200);
  }

  public stopBGM() {
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.currentBgm = null;
  }
}

export const soundManager = new SoundManager();
