import { audioSamples } from './audioSamples';

class WebAudioEngine {
  private context: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    console.log('🎵 Initializing Web Audio API...');

    // Create AudioContext
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Resume if suspended (mobile requirement)
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    // Decode all samples
    const decodePromises = Object.entries(audioSamples).map(async ([name, base64]) => {
      try {
        // Convert base64 to ArrayBuffer
        const binaryString = atob(base64.split(',')[1]);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Decode audio data
        const audioBuffer = await this.context!.decodeAudioData(bytes.buffer);
        this.buffers.set(name, audioBuffer);
        console.log(`✅ Loaded ${name}`);
      } catch (err) {
        console.error(`❌ Failed to decode ${name}:`, err);
      }
    });

    await Promise.all(decodePromises);

    this.initialized = true;
    console.log('✅ Audio engine ready - ZERO latency!');
  }

  playSound(sampleName: string) {
    if (!this.context || !this.initialized) {
      console.warn('⚠️ Audio not initialized');
      return;
    }

    const buffer = this.buffers.get(sampleName);
    if (!buffer) {
      console.warn(`⚠️ Sample not found: ${sampleName}`);
      return;
    }

    // Create source node (instant playback)
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);
    source.start(0);
  }

  isReady() {
    return this.initialized;
  }
}

export const audioEngine = new WebAudioEngine();

// Legacy exports
export const createAudioContext = () => new AudioContext();
export const playSound = (_ctx: AudioContext, _freq: number, _type: string) => {
  // Deprecated
};
