export interface Pad {
  name: string;
  sample: string;
  frequency?: number;
  type?: 'sine' | 'square' | 'sawtooth' | 'triangle';
}

export interface DrumKit {
  name: string;
  pads: Pad[];
}

export const drumKits: Record<string, DrumKit> = {
  hiphop: {
    name: 'Hip Hop',
    pads: [
      { name: 'KICK', sample: 'kick' },
      { name: 'SNARE', sample: 'snare' },
      { name: 'HI-HAT', sample: 'hihat' },
      { name: 'CLAP', sample: 'clap' },
      { name: 'TOM 1', sample: 'tom' },
      { name: 'TOM 2', sample: 'tom' },
      { name: 'CRASH', sample: 'crash' },
      { name: 'RIM', sample: 'rim' },
      { name: 'PERC 1', sample: 'perc' },
      { name: 'PERC 2', sample: 'perc' },
      { name: 'KICK 2', sample: 'kick' },
      { name: 'SNARE 2', sample: 'snare' },
      { name: 'CLAP 2', sample: 'clap' },
      { name: 'HAT 2', sample: 'hihat' },
      { name: 'TOM 3', sample: 'tom' },
      { name: 'CRASH 2', sample: 'crash' },
    ],
  },
  trap: {
    name: 'Trap',
    pads: [
      { name: 'KICK', sample: 'kick' },
      { name: 'SNARE', sample: 'snare' },
      { name: 'HI-HAT', sample: 'hihat' },
      { name: 'CLAP', sample: 'clap' },
      { name: 'TOM', sample: 'tom' },
      { name: 'PERC', sample: 'perc' },
      { name: 'CRASH', sample: 'crash' },
      { name: 'RIM', sample: 'rim' },
      { name: 'ROLL', sample: 'snare' },
      { name: 'HAT 2', sample: 'hihat' },
      { name: 'KICK 2', sample: 'kick' },
      { name: 'CLAP 2', sample: 'clap' },
      { name: 'SNAP', sample: 'clap' },
      { name: 'TOM 2', sample: 'tom' },
      { name: '808', sample: 'kick' },
      { name: 'CRASH 2', sample: 'crash' },
    ],
  },
  acoustic: {
    name: 'Acoustic',
    pads: [
      { name: 'KICK', sample: 'kick' },
      { name: 'SNARE', sample: 'snare' },
      { name: 'HI-HAT', sample: 'hihat' },
      { name: 'TOM 1', sample: 'tom' },
      { name: 'TOM 2', sample: 'tom' },
      { name: 'TOM 3', sample: 'tom' },
      { name: 'CRASH', sample: 'crash' },
      { name: 'RIDE', sample: 'crash' },
      { name: 'HAT OPEN', sample: 'hihat' },
      { name: 'RIM', sample: 'rim' },
      { name: 'CLAP', sample: 'clap' },
      { name: 'PERC', sample: 'perc' },
      { name: 'KICK 2', sample: 'kick' },
      { name: 'SNARE 2', sample: 'snare' },
      { name: 'CHINA', sample: 'crash' },
      { name: 'SPLASH', sample: 'crash' },
    ],
  },
};
