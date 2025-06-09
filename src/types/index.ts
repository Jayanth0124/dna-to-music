export interface DNASequence {
  id: string;
  sequence: string;
  name?: string;
  length: number;
  validBases: number;
  invalidBases: string[];
}

export interface MusicSettings {
  tempo: number;
  noteLength: number;
  instrument: 'piano' | 'synth' | 'guitar' | 'flute';
  octave: number;
  theme: DNATheme;
}

export interface DNATheme {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseMapping: {
    A: { note: string; color: string; instrument?: string };
    T: { note: string; color: string; instrument?: string };
    C: { note: string; color: string; instrument?: string };
    G: { note: string; color: string; instrument?: string };
  };
  scale: string[];
  background: string;
}

export interface Note {
  base: string;
  note: string;
  frequency: number;
  time: number;
  duration: number;
  color: string;
  velocity: number;
}

export interface PianoKey {
  note: string;
  isBlack: boolean;
  isActive: boolean;
  color: string;
  x: number;
  width: number;
}

export interface VisualizerData {
  notes: Note[];
  currentTime: number;
  isPlaying: boolean;
  waveform?: Float32Array;
}

export interface SavedSequence {
  id: string;
  name: string;
  sequence: string;
  theme: string;
  settings: MusicSettings;
  createdAt: Date;
  thumbnail?: string;
}