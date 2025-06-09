import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, Download, Settings, Volume2 } from 'lucide-react';
import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';
import { DNASequence, MusicSettings } from '../types';
import { getThemeById } from '../data/themes';

interface PlaybackControlsProps {
  dnaSequence: DNASequence | null;
  musicSettings: MusicSettings;
  onSettingsChange: (settings: MusicSettings) => void;
  isPlaying: boolean;
  onPlayingChange: (playing: boolean) => void;
  onNoteChange: (noteIndex: number) => void;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  dnaSequence,
  musicSettings,
  onSettingsChange,
  isPlaying,
  onPlayingChange,
  onNoteChange
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const synthsRef = useRef<{ [key: string]: Tone.Synth }>({});
  const sequenceRef = useRef<Tone.Sequence | null>(null);

  const theme = getThemeById(musicSettings.theme.id);

  const instrumentTypes = {
    'piano': () => new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 1 }
    }),
    'synth': () => new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.5 }
    }),
    'guitar': () => new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.2, release: 1.5 }
    }),
    'flute': () => new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.2, decay: 0.1, sustain: 0.9, release: 0.3 }
    }),
    'cello': () => new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.3, decay: 0.4, sustain: 0.7, release: 2 }
    }),
    'marimba': () => new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.5, sustain: 0.1, release: 1 }
    }),
    'darkSynth': () => new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.1, decay: 0.3, sustain: 0.6, release: 1.5 }
    }),
    'ambient': () => new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 1, decay: 0.5, sustain: 0.8, release: 3 }
    }),
    'pad': () => new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.5, decay: 0.2, sustain: 0.9, release: 2 }
    }),
    'bell': () => new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 1, sustain: 0.1, release: 2 }
    }),
    'spacePad': () => new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 1.5, decay: 0.3, sustain: 0.9, release: 4 }
    }),
    'cosmic': () => new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.8, decay: 0.4, sustain: 0.7, release: 3 }
    })
  };

  useEffect(() => {
    // Initialize theme-based instruments
    Object.values(synthsRef.current).forEach(synth => synth.dispose());
    synthsRef.current = {};

    // Create instruments for each base mapping
    Object.entries(theme.baseMapping).forEach(([base, mapping]) => {
      const instrumentType = mapping.instrument || musicSettings.instrument;
      const createInstrument = instrumentTypes[instrumentType as keyof typeof instrumentTypes] || instrumentTypes.piano;
      synthsRef.current[base] = createInstrument();
      synthsRef.current[base].toDestination();
    });

    return () => {
      Object.values(synthsRef.current).forEach(synth => synth.dispose());
      if (sequenceRef.current) {
        sequenceRef.current.dispose();
      }
    };
  }, [musicSettings.theme, musicSettings.instrument]);

  const generateNoteSequence = () => {
    if (!dnaSequence) return [];
    
    return dnaSequence.sequence.slice(0, 100).split('').map(base => {
      const mapping = theme.baseMapping[base as keyof typeof theme.baseMapping];
      return mapping ? {
        base,
        note: `${mapping.note}${musicSettings.octave}`,
        instrument: mapping.instrument || musicSettings.instrument
      } : null;
    }).filter(Boolean);
  };

  const playSequence = async () => {
    if (!dnaSequence) return;

    await Tone.start();
    
    const notes = generateNoteSequence();
    setDuration(notes.length);
    
    if (sequenceRef.current) {
      sequenceRef.current.dispose();
    }

    let noteIndex = 0;
    sequenceRef.current = new Tone.Sequence((time, noteData) => {
      if (!noteData) return;
      const synth = synthsRef.current[noteData.base];
      if (synth) {
        synth.triggerAttackRelease(noteData.note, musicSettings.noteLength, time);
      }
      
      Tone.Draw.schedule(() => {
        onNoteChange(noteIndex);
        setCurrentPosition(noteIndex + 1);
        noteIndex++;
        
        if (noteIndex >= notes.length) {
          stopSequence();
        }
      }, time);
    }, notes, `${60 / musicSettings.tempo}s`);

    sequenceRef.current.start();
    Tone.Transport.start();
    onPlayingChange(true);
  };

  const stopSequence = () => {
    if (sequenceRef.current) {
      sequenceRef.current.stop();
      sequenceRef.current.dispose();
      sequenceRef.current = null;
    }
    Tone.Transport.stop();
    Tone.Transport.cancel();
    onPlayingChange(false);
    onNoteChange(-1);
    setCurrentPosition(0);
  };

  const pauseSequence = () => {
    if (isPlaying) {
      Tone.Transport.pause();
      onPlayingChange(false);
    } else {
      Tone.Transport.start();
      onPlayingChange(true);
    }
  };

  const downloadMIDI = () => {
    if (!dnaSequence) return;

    const midi = new Midi();
    const track = midi.addTrack();
    
    const notes = generateNoteSequence();
    const noteDuration = musicSettings.noteLength;
    
    notes.forEach((noteData, index) => {
      if (noteData) {
        track.addNote({
          midi: Tone.Frequency(noteData.note).toMidi(),
          time: index * noteDuration,
          duration: noteDuration
        });
      }
    });

    const blob = new Blob([midi.toArray()], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dnaSequence.name || 'dna-sequence'}-${theme.name.toLowerCase().replace(/\s+/g, '-')}.mid`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Volume2 className="w-6 h-6 text-pink-400" />
            <span>Playback Controls</span>
          </h2>
          
          <motion.button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              showSettings ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-purple-400'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Progress Bar */}
        {dnaSequence && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Position: {currentPosition}</span>
              <span>Duration: {Math.min(dnaSequence.length, 100)} notes</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full"
                style={{ width: `${(currentPosition / Math.min(dnaSequence.length, 100)) * 100}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${(currentPosition / Math.min(dnaSequence.length, 100)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <motion.button
            onClick={playSequence}
            disabled={!dnaSequence || isPlaying}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-5 h-5" />
            <span>Play</span>
          </motion.button>

          <motion.button
            onClick={pauseSequence}
            disabled={!isPlaying}
            className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Pause className="w-5 h-5" />
            <span>Pause</span>
          </motion.button>

          <motion.button
            onClick={stopSequence}
            disabled={!isPlaying && currentPosition === 0}
            className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Square className="w-5 h-5" />
            <span>Stop</span>
          </motion.button>

          <motion.button
            onClick={downloadMIDI}
            disabled={!dnaSequence}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-5 h-5" />
            <span>Download MIDI</span>
          </motion.button>
        </div>

        {/* Settings Panel */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: showSettings ? 'auto' : 0,
            opacity: showSettings ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="border-t border-gray-700 pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tempo */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tempo: {musicSettings.tempo} BPM
                </label>
                <input
                  type="range"
                  min="60"
                  max="200"
                  value={musicSettings.tempo}
                  onChange={(e) => onSettingsChange({
                    ...musicSettings,
                    tempo: parseInt(e.target.value)
                  })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Note Length */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Note Length: {musicSettings.noteLength}s
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={musicSettings.noteLength}
                  onChange={(e) => onSettingsChange({
                    ...musicSettings,
                    noteLength: parseFloat(e.target.value)
                  })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Octave */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Octave: {musicSettings.octave}
                </label>
                <input
                  type="range"
                  min="2"
                  max="7"
                  value={musicSettings.octave}
                  onChange={(e) => onSettingsChange({
                    ...musicSettings,
                    octave: parseInt(e.target.value)
                  })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Base Instrument (fallback) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Base Instrument
                </label>
                <select
                  value={musicSettings.instrument}
                  onChange={(e) => onSettingsChange({
                    ...musicSettings,
                    instrument: e.target.value as MusicSettings['instrument']
                  })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                >
                  <option value="piano">Piano</option>
                  <option value="synth">Synth</option>
                  <option value="guitar">Guitar</option>
                  <option value="flute">Flute</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {!dnaSequence && (
          <div className="text-center py-8 text-gray-400">
            <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Upload a DNA sequence to enable playback controls</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PlaybackControls;