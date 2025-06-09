import { DNATheme } from '../types';

export const DNA_THEMES: DNATheme[] = [
  {
    id: 'human-genome',
    name: 'Human Genome',
    description: 'Classical piano with warm cello harmonies',
    icon: '🧬',
    baseMapping: {
      A: { note: 'C', color: '#3b82f6', instrument: 'piano' },
      T: { note: 'E', color: '#8b5cf6', instrument: 'piano' },
      C: { note: 'G', color: '#ec4899', instrument: 'cello' },
      G: { note: 'B', color: '#10b981', instrument: 'cello' }
    },
    scale: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'plant-dna',
    name: 'Plant DNA',
    description: 'Organic synths with marimba percussion',
    icon: '🌱',
    baseMapping: {
      A: { note: 'F', color: '#22c55e', instrument: 'synth' },
      T: { note: 'A', color: '#84cc16', instrument: 'synth' },
      C: { note: 'C', color: '#eab308', instrument: 'marimba' },
      G: { note: 'E', color: '#f97316', instrument: 'marimba' }
    },
    scale: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
  },
  {
    id: 'virus-rna',
    name: 'Virus RNA',
    description: 'Eerie synths with dark ambient tones',
    icon: '🦠',
    baseMapping: {
      A: { note: 'Bb', color: '#dc2626', instrument: 'darkSynth' },
      T: { note: 'Db', color: '#7c2d12', instrument: 'darkSynth' },
      C: { note: 'F', color: '#991b1b', instrument: 'ambient' },
      G: { note: 'Ab', color: '#450a0a', instrument: 'ambient' }
    },
    scale: ['Bb', 'C', 'Db', 'Eb', 'F', 'Gb', 'Ab'],
    background: 'linear-gradient(135deg, #434343 0%, #000000 100%)'
  },
  {
    id: 'marine-life',
    name: 'Marine Life',
    description: 'Flowing pads with crystalline bells',
    icon: '🐠',
    baseMapping: {
      A: { note: 'D', color: '#0ea5e9', instrument: 'pad' },
      T: { note: 'F#', color: '#0284c7', instrument: 'pad' },
      C: { note: 'A', color: '#06b6d4', instrument: 'bell' },
      G: { note: 'C#', color: '#0891b2', instrument: 'bell' }
    },
    scale: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'cosmic-dna',
    name: 'Cosmic DNA',
    description: 'Ethereal pads with space-like reverb',
    icon: '🌌',
    baseMapping: {
      A: { note: 'E', color: '#8b5cf6', instrument: 'spacePad' },
      T: { note: 'G#', color: '#a855f7', instrument: 'spacePad' },
      C: { note: 'B', color: '#c084fc', instrument: 'cosmic' },
      G: { note: 'D#', color: '#ddd6fe', instrument: 'cosmic' }
    },
    scale: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }
];

export const getThemeById = (id: string): DNATheme => {
  return DNA_THEMES.find(theme => theme.id === id) || DNA_THEMES[0];
};