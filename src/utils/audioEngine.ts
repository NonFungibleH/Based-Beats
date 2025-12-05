// Ultra-low latency Web Audio API engine

class WebAudioEngine {
  private context: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    console.log('🎵 Initializing Web Audio API...');

    try {
      // Create AudioContext
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Resume if suspended (required for iOS/mobile)
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }

      // Load all samples
      const samples = ['kick', 'snare', 'hihat', 'clap', 'tom', 'perc', 'crash', 'rim'];
      
      const loadPromises = samples.map(async (sample) => {
        try {
          const response = await fetch(`/samples/${sample}.wav`);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await this.context!.decodeAudioData(arrayBuffer);
          this.buffers.set(sample, audioBuffer);
          console.log(`✅ Loaded ${sample}`);
        } catch (err) {
          console.error(`❌ Failed to load ${sample}:`, err);
        }
      });

      await Promise.all(loadPromises);

      this.initialized = true;
      console.log(`✅ Web Audio ready! ${this.buffers.size} samples loaded`);
      
    } catch (error) {
      console.error('❌ Web Audio initialization failed:', error);
      throw error;
    }
  }

  playSound(sampleName: string) {
    if (!this.context || !this.initialized) {
      console.warn('⚠️ Audio not ready');
      return;
    }

    const buffer = this.buffers.get(sampleName);
    if (!buffer) {
      console.warn(`⚠️ Sample not found: ${sampleName}`);
      return;
    }

    try {
      // Create new source (required for each playback)
      const source = this.context.createBufferSource();
      const gainNode = this.context.createGain();
      
      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(this.context.destination);
      
      gainNode.gain.value = 0.8;
      
      // INSTANT playback
      source.start(0);
      
    } catch (err) {
      console.error(`❌ Playback error:`, err);
    }
  }

  isReady() {
    return this.initialized;
  }

  getContext() {
    return this.context;
  }
}

export const audioEngine = new WebAudioEngine();

// Legacy exports
export const createAudioContext = () => new AudioContext();
export const playSound = (_ctx: AudioContext, _freq: number, _type: string) => {
  // Deprecated
};
