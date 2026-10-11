/**
 * Web Audio API synthesizer for a crisp twin-bell ("ding-ding") chime.
 * Generates two consecutive bell rings with sine/triangle harmonics.
 */
class PomodoroAudioService {
  private ctx: AudioContext | null = null;

  /**
   * Initializes or resumes the AudioContext on user interaction (e.g. clicking START)
   * to satisfy browser autoplay policies.
   */
  public init(): void {
    if (typeof window === 'undefined') return;

    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch((err) => {
          console.warn('AudioContext resume deferred:', err);
        });
      }
    } catch (err) {
      console.warn('Failed to initialize AudioContext:', err);
    }
  }

  /**
   * Plays a twin bell ring ("ding-ding")
   */
  public playTwinBell(): void {
    if (typeof window === 'undefined') return;

    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // First ding
      this.synthesizeBellDing(now);
      // Second ding after ~220ms
      this.synthesizeBellDing(now + 0.22);
    } catch (err) {
      console.warn('Could not play twin bell chime:', err);
    }
  }

  /**
   * Synthesizes a single bell ding with fundamental and harmonic overtone
   */
  private synthesizeBellDing(startTime: number): void {
    if (!this.ctx) return;

    const fundamentalFreq = 880; // A5 chime
    const overtoneFreq = 1760;   // A6 octave harmonic

    // Fundamental oscillator (sine)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(fundamentalFreq, startTime);
    osc1.frequency.exponentialRampToValueAtTime(fundamentalFreq * 0.995, startTime + 0.6);

    // Harmonic oscillator (triangle for subtle warmth)
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(overtoneFreq, startTime);
    osc2.frequency.exponentialRampToValueAtTime(overtoneFreq * 0.995, startTime + 0.4);

    // Gain node for bell envelope: instant strike, exponential decay
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.0001, startTime);
    // 5ms fast attack
    gainNode.gain.exponentialRampToValueAtTime(0.35, startTime + 0.005);
    // Smooth exponential ring out
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.65);

    // Connect audio graph
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc1.start(startTime);
    osc2.start(startTime);

    osc1.stop(startTime + 0.7);
    osc2.stop(startTime + 0.7);
  }
}

export const pomodoroAudio = new PomodoroAudioService();
