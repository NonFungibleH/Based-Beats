// HTML5 Audio-based engine with reduced latency

class AudioSampleEngine {
  private audioPool: Map<string, HTMLAudioElement[]> = new Map();
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    console.log('🎵 Initializing audio samples...');

    const samples = [
      'kick', 'snare', 'hihat', 'clap', 
      'tom', 'perc', 'crash', 'rim'
    ];

    // Create larger pool for better performance (10 instead of 5)
    for (const sample of samples) {
      const pool: HTMLAudioElement[] = [];
      
      for (let i = 0; i < 10; i++) {
        const audio = new Audio();
        audio.src = `/samples/${sample}.wav`;
        audio.preload = 'auto';
        audio.volume = 0.8;
        
        // CRITICAL: Load the audio immediately
        audio.load();
        
        pool.push(audio);
      }
      
      this.audioPool.set(sample, pool);
    }

    // Wait for samples to preload
    console.log('⏳ Preloading samples...');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Unlock audio on iOS/WebView
    try {
      const unlock = new Audio();
      unlock.src = '/samples/kick.wav';
      unlock.volume = 0.01;
      const playPromise = unlock.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        unlock.pause();
        unlock.currentTime = 0;
      }
      
      console.log('✅ Audio unlocked');
    } catch (e) {
      console.warn('⚠️ Audio unlock attempt:', e);
    }

    this.initialized = true;
    console.log('✅ Audio engine ready');
  }

  playSound(sampleName: string) {
    if (!this.initialized) {
      console.warn('⚠️ Audio not initialized');
      return;
    }

    const pool = this.audioPool.get(sampleName);
    if (!pool) {
      console.warn(`⚠️ Sample not found: ${sampleName}`);
      return;
    }

    // Find first paused audio (pre-loaded and ready)
    const audio = pool.find(a => a.paused) || pool[0];
    
    // Reset and play immediately
    audio.currentTime = 0;
    
    // Use cloneNode for even better performance (new approach)
    const clone = audio.cloneNode() as HTMLAudioElement;
    clone.volume = audio.volume;
    clone.play().catch(err => {
      console.error('❌ Play failed:', err);
    });
  }

  isReady() {
    return this.initialized;
  }
}

export const audioEngine = new AudioSampleEngine();

export const createAudioContext = () => new AudioContext();
export const playSound = (_ctx: AudioContext, _freq: number, _type: string) => {
  // Deprecated
};
