// Hybrid approach - Web Audio API with fallback

class HybridAudioEngine {
  private context: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private htmlAudioPool: Map<string, HTMLAudioElement[]> = new Map();
  private initialized = false;
  private useWebAudio = true;

  async initialize() {
    if (this.initialized) return;

    console.log('🎵 Initializing hybrid audio engine...');

    // Try Web Audio API first
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }

      console.log('✅ AudioContext created:', this.context.state);

      // Load samples via Web Audio API
      const samples = ['kick', 'snare', 'hihat', 'clap', 'tom', 'perc', 'crash', 'rim'];
      
      const loadPromises = samples.map(async (sample) => {
        try {
          const response = await fetch(`/samples/${sample}.wav`);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await this.context!.decodeAudioData(arrayBuffer);
          this.buffers.set(sample, audioBuffer);
          console.log(`✅ Decoded ${sample} (${audioBuffer.duration.toFixed(2)}s)`);
        } catch (err) {
          console.error(`❌ Failed ${sample}:`, err);
          this.useWebAudio = false;
        }
      });

      await Promise.all(loadPromises);

      if (this.buffers.size === samples.length) {
        console.log('✅ Web Audio API ready!');
        this.useWebAudio = true;
      } else {
        throw new Error('Failed to load all samples via Web Audio');
      }

    } catch (error) {
      console.warn('⚠️ Web Audio failed, falling back to HTML5 Audio:', error);
      this.useWebAudio = false;
      
      // Fallback to HTML5 Audio
      const samples = ['kick', 'snare', 'hihat', 'clap', 'tom', 'perc', 'crash', 'rim'];
      
      for (const sample of samples) {
        const pool: HTMLAudioElement[] = [];
        
        for (let i = 0; i < 10; i++) {
          const audio = new Audio();
          audio.src = `/samples/${sample}.wav`;
          audio.preload = 'auto';
          audio.volume = 0.8;
          audio.load();
          
          // Pre-warm first instance
          if (i === 0) {
            audio.volume = 0;
            audio.play().then(() => {
              audio.pause();
              audio.currentTime = 0;
              audio.volume = 0.8;
            }).catch(() => {});
          }
          
          pool.push(audio);
        }
        
        this.htmlAudioPool.set(sample, pool);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ HTML5 Audio ready (fallback)');
    }

    this.initialized = true;
  }

  playSound(sampleName: string) {
    if (!this.initialized) {
      return;
    }

    if (this.useWebAudio && this.context) {
      // Web Audio API path (FAST)
      const buffer = this.buffers.get(sampleName);
      if (!buffer) return;

      try {
        const source = this.context.createBufferSource();
        const gainNode = this.context.createGain();
        
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(this.context.destination);
        gainNode.gain.value = 0.8;
        
        source.start(0);
      } catch (err) {
        console.error('Web Audio playback error:', err);
      }
    } else {
      // HTML5 Audio fallback (SLOWER)
      const pool = this.htmlAudioPool.get(sampleName);
      if (!pool) return;

      const audio = pool.find(a => a.paused && a.readyState >= 3) || 
                    pool.find(a => a.paused) || 
                    pool[0];

      try {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } catch (err) {
        // Silently fail
      }
    }
  }

  isReady() {
    return this.initialized;
  }

  isUsingWebAudio() {
    return this.useWebAudio;
  }
}

export const audioEngine = new HybridAudioEngine();

export const createAudioContext = () => new AudioContext();
export const playSound = (_ctx: AudioContext, _freq: number, _type: string) => {};
