export class AudioService {
  private static instance: AudioService;
  private musicVolume = 0.7;
  private sfxVolume = 0.8;
  private muted = false;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();

  private constructor() {}

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  async init(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
  }

  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  playTone(freq: number, type: OscillatorType, duration: number, vol: number = 1): void {
    if (!this.audioContext || this.muted) return;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
    
    gain.gain.setValueAtTime(vol * this.sfxVolume, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + duration);
  }

  playCollect(): void {
    this.playTone(880, 'sine', 0.1, 0.3);
  }

  playGoldenCollect(): void {
    this.playTone(1760, 'sine', 0.2, 0.4);
    setTimeout(() => this.playTone(2200, 'sine', 0.15, 0.3), 50);
  }

  playLevelUp(): void {
    this.playTone(523, 'square', 0.1, 0.2);
    setTimeout(() => this.playTone(659, 'square', 0.1, 0.2), 100);
    setTimeout(() => this.playTone(784, 'square', 0.2, 0.2), 200);
  }

  playDash(): void {
    this.playTone(300, 'sawtooth', 0.15, 0.2);
  }

  playDeath(): void {
    this.playTone(200, 'sawtooth', 0.3, 0.4);
    setTimeout(() => this.playTone(150, 'sawtooth', 0.4, 0.3), 150);
  }

  playCombo(): void {
    this.playTone(1200, 'sine', 0.08, 0.2);
  }

  pauseAll(): void {
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
    }
  }

  resumeAll(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}
