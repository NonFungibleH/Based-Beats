import { audioSamples } from './audioSamples';

class WebAudioEngine {
  private context: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      // Create AudioContext
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Resume if suspended
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }

      // Decode all samples to AudioBuffers (happens once)
      const decodePromises = Object.entries(audioSamples).map(async ([name, dataUrl]) => {
        try {
          const base64Data = dataUrl.split(',')[1];
          const binaryString = atob(base64Data);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const audioBuffer = await this.context!.decodeAudioData(bytes.buffer);
          this.buffers.set(name, audioBuffer);
        } catch (err) {
          console.error(`Failed to decode ${name}:`, err);
        }
      });

      await Promise.all(decodePromises);

      this.initialized = true;
      
    } catch (error) {
      console.error('Audio engine init failed:', error);
    }
  }

  playSound(sampleName: string) {
    if (!this.context || !this.initialized) {
      return;
    }

    const buffer = this.buffers.get(sampleName);
    if (!buffer) {
      return;
    }

    // Create and play instantly - ZERO latency
    const source = this.context.createBufferSource();
    const gainNode = this.context.createGain();
    
    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(this.context.destination);
    gainNode.gain.value = 0.8;
    
    source.start(0); // INSTANT
  }

  isReady() {
    return this.initialized;
  }
}

export const audioEngine = new WebAudioEngine();

export const createAudioContext = () => new AudioContext();
export const playSound = (_ctx: AudioContext, _freq: number, _type: string) => {};
