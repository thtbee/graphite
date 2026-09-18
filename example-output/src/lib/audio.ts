// Procedural tactile paper & graphite ASMR audio engine — warm, organic, and realistic.
export class GraphiteAudio {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;

  // Scroll paper rustle chain
  scrollNoise: AudioBufferSourceNode | null = null;
  scrollFilter: BiquadFilterNode | null = null;
  scrollGain: GainNode | null = null;

  // Drag & smudge paper friction chain (velvety cotton body)
  dragNoise: AudioBufferSourceNode | null = null;
  dragFilter: BiquadFilterNode | null = null;
  dragGain: GainNode | null = null;

  // Tooth & lead micro-texture chain (tactile paper grain)
  toothNoise: AudioBufferSourceNode | null = null;
  toothFilter: BiquadFilterNode | null = null;
  toothGain: GainNode | null = null;

  // Dark drone for inversion
  droneOsc: OscillatorNode | null = null;
  droneGain: GainNode | null = null;
  droneFilter: BiquadFilterNode | null = null;

  enabled = false;
  private lastScroll = 0;
  private scrollVel = 0;
  private raf = 0;
  private decayTimer: any = null;
  private paperNoiseBuf: AudioBuffer | null = null;
  private toothNoiseBuf: AudioBuffer | null = null;

  // Dual-pole pink filter + Brownian integration for soft, velvety cotton paper noise (no digital hiss)
  private makePaperNoiseBuffer(seconds = 4): AudioBuffer {
    const ctx = this.ctx!;
    const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;
    let brown = 0;
    for (let i = 0; i < d.length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + white * 0.035;
      brown = (brown + 0.025 * white) / 1.025;
      // Soft, warm paper body
      d[i] = (pink * 0.12 + brown * 2.6);
    }
    return buf;
  }

  // Micro-granular tooth resistance buffer (cotton fiber bumps)
  private makeToothNoiseBuffer(seconds = 3): AudioBuffer {
    const ctx = this.ctx!;
    const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      const impulse = Math.random() < 0.035 ? (Math.random() * 2 - 1) * 0.75 : 0;
      last = last * 0.92 + impulse * 0.08;
      d[i] = last + (Math.random() - 0.5) * 0.035;
    }
    return buf;
  }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();

    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);

    this.paperNoiseBuf = this.makePaperNoiseBuffer(4);
    this.toothNoiseBuf = this.makeToothNoiseBuffer(3);

    // 1. Scroll paper rustle chain (warm lowpass cotton whisper)
    this.scrollNoise = this.ctx.createBufferSource();
    this.scrollNoise.buffer = this.paperNoiseBuf;
    this.scrollNoise.loop = true;
    this.scrollFilter = this.ctx.createBiquadFilter();
    this.scrollFilter.type = "lowpass";
    this.scrollFilter.frequency.value = 750;
    this.scrollFilter.Q.value = 0.6;
    this.scrollGain = this.ctx.createGain();
    this.scrollGain.gain.value = 0;
    this.scrollNoise.connect(this.scrollFilter).connect(this.scrollGain).connect(this.master);
    this.scrollNoise.start();

    // 2. Drag & smudge friction chain (intimate paper contact)
    this.dragNoise = this.ctx.createBufferSource();
    this.dragNoise.buffer = this.paperNoiseBuf;
    this.dragNoise.loop = true;
    this.dragNoise.playbackRate.value = 0.85;
    this.dragFilter = this.ctx.createBiquadFilter();
    this.dragFilter.type = "lowpass";
    this.dragFilter.frequency.value = 650;
    this.dragFilter.Q.value = 0.55;
    this.dragGain = this.ctx.createGain();
    this.dragGain.gain.value = 0;
    this.dragNoise.connect(this.dragFilter).connect(this.dragGain).connect(this.master);
    this.dragNoise.start();

    // 3. Tooth micro-texture chain (lead biting into paper grain)
    this.toothNoise = this.ctx.createBufferSource();
    this.toothNoise.buffer = this.toothNoiseBuf;
    this.toothNoise.loop = true;
    this.toothNoise.playbackRate.value = 1.0;
    this.toothFilter = this.ctx.createBiquadFilter();
    this.toothFilter.type = "bandpass";
    this.toothFilter.frequency.value = 850;
    this.toothFilter.Q.value = 0.65;
    this.toothGain = this.ctx.createGain();
    this.toothGain.gain.value = 0;
    this.toothNoise.connect(this.toothFilter).connect(this.toothGain).connect(this.master);
    this.toothNoise.start();

    // 4. Subtle ambient drone for dark inversion
    this.droneOsc = this.ctx.createOscillator();
    this.droneOsc.type = "sine";
    this.droneOsc.frequency.value = 42;
    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = "lowpass";
    this.droneFilter.frequency.value = 95;
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = 0;
    this.droneOsc.connect(this.droneFilter).connect(this.droneGain).connect(this.master);
    this.droneOsc.start();

    this.lastScroll = window.scrollY;
    const tick = () => {
      const y = window.scrollY;
      const v = Math.abs(y - this.lastScroll);
      this.scrollVel = this.scrollVel * 0.86 + v * 0.14;
      this.lastScroll = y;

      if (this.enabled && this.ctx && this.ctx.state === "running") {
        const t = this.ctx.currentTime;
        const targetVol = Math.min(0.24, this.scrollVel * 0.012);
        this.scrollGain!.gain.setTargetAtTime(targetVol, t, 0.06);

        const freq = 480 + Math.min(620, this.scrollVel * 25);
        this.scrollFilter!.frequency.setTargetAtTime(freq, t, 0.08);

        const darkMix = this.getDarkMix();
        this.droneGain!.gain.setTargetAtTime(darkMix * 0.12, t, 0.5);
      }
      this.raf = requestAnimationFrame(tick);
    };
    tick();
  }

  getDarkMix(): number {
    const el = document.getElementById("inversion-sensor");
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.bottom < 0) return 1;
    if (r.top > vh) return 0;
    return 1 - Math.max(0, Math.min(1, r.top / vh));
  }

  setEnabled(on: boolean) {
    this.init();
    if (!this.ctx || !this.master) return;
    this.enabled = on;
    if (on && this.ctx.state === "suspended") this.ctx.resume();
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(on ? 0.8 : 0, t, 0.35);
    if (!on) {
      this.scrollGain?.gain.setTargetAtTime(0, t, 0.15);
      this.dragGain?.gain.setTargetAtTime(0, t, 0.15);
      this.toothGain?.gain.setTargetAtTime(0, t, 0.15);
      this.droneGain?.gain.setTargetAtTime(0, t, 0.3);
    }
  }

  /**
   * Realistic tactile paper drag friction sound.
   * Modulates warmth and tooth texture with movement speed and downward lead pressure.
   */
  drag(velocity: number, isDown = false) {
    if (!this.enabled || !this.ctx || this.ctx.state !== "running") return;
    const t = this.ctx.currentTime;

    const v = Math.max(0, velocity);
    if (v < 0.25 && !isDown) return;

    // Downward pressure gives deeper body & pronounced cotton tooth bite
    const pressureMultiplier = isDown ? 1.75 : 1.0;
    const dragTarget = Math.min(0.36, (0.035 + v * 0.015)) * pressureMultiplier;
    const toothTarget = isDown
      ? Math.min(0.26, 0.05 + v * 0.013)
      : Math.min(0.11, v * 0.007);

    // Warm, velvety frequency tracking
    const baseFreq = isDown ? 520 : 620;
    const dragCutoff = Math.min(1000, baseFreq + v * 16);
    const toothFreq = Math.min(1200, 720 + v * 20);

    this.dragGain!.gain.setTargetAtTime(dragTarget, t, 0.035);
    this.dragFilter!.frequency.setTargetAtTime(dragCutoff, t, 0.045);

    this.toothGain!.gain.setTargetAtTime(toothTarget, t, 0.035);
    this.toothFilter!.frequency.setTargetAtTime(toothFreq, t, 0.045);

    // Natural decay when dragging ceases
    clearTimeout(this.decayTimer);
    this.decayTimer = setTimeout(() => {
      if (!this.ctx) return;
      const decayTime = this.ctx.currentTime;
      this.dragGain?.gain.setTargetAtTime(0, decayTime, 0.09);
      this.toothGain?.gain.setTargetAtTime(0, decayTime, 0.09);
    }, 70);
  }

  smudge(velocity: number, isDown = false) {
    this.drag(velocity, isDown);
  }

  tap(kind: "pencil" | "eraser" | "deep" = "pencil") {
    if (!this.enabled || !this.ctx || this.ctx.state !== "running") return;
    const ctx = this.ctx;
    const t = ctx.currentTime;

    if (kind === "pencil") {
      // Soft acoustic pencil tip touch on cold-press paper
      if (this.paperNoiseBuf) {
        const noise = ctx.createBufferSource();
        noise.buffer = this.paperNoiseBuf;
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(850, t);
        filter.Q.value = 1.0;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.22, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        noise.connect(filter).connect(noiseGain).connect(this.master!);
        noise.start(t);
        noise.stop(t + 0.045);
      }

      // Gentle wooden pencil body impulse
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.035);
      oscGain.gain.setValueAtTime(0.14, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.connect(oscGain).connect(this.master!);
      osc.start(t);
      osc.stop(t + 0.045);
    } else if (kind === "eraser") {
      // Soft kneaded rubber contact
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(110, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.06);
      oscGain.gain.setValueAtTime(0.16, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      osc.connect(oscGain).connect(this.master!);
      osc.start(t);
      osc.stop(t + 0.075);
    } else {
      // Deep resonant tone for inversion
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(46, t);
      oscGain.gain.setValueAtTime(0.35, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      osc.connect(oscGain).connect(this.master!);
      osc.start(t);
      osc.stop(t + 1.3);

      if (this.paperNoiseBuf) {
        const noise = ctx.createBufferSource();
        noise.buffer = this.paperNoiseBuf;
        const f = ctx.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.value = 300;
        const g2 = ctx.createGain();
        g2.gain.setValueAtTime(0.18, t);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
        noise.connect(f).connect(g2).connect(this.master!);
        noise.start(t);
        noise.stop(t + 0.8);
      }
    }
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    clearTimeout(this.decayTimer);
    try { this.ctx?.close(); } catch {}
    this.ctx = null;
  }
}

export const graphiteAudio = new GraphiteAudio();

