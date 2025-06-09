import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Piano, Music } from 'lucide-react';
import { DNASequence, MusicSettings, Note, PianoKey } from '../types';
import { getThemeById } from '../data/themes';

interface PianoRollVisualizerProps {
  dnaSequence: DNASequence | null;
  isPlaying: boolean;
  currentNote: number;
  musicSettings: MusicSettings;
}

const PianoRollVisualizer: React.FC<PianoRollVisualizerProps> = ({
  dnaSequence,
  isPlaying,
  currentNote,
  musicSettings
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [scrollPosition, setScrollPosition] = useState(0);

  const theme = getThemeById(musicSettings.theme.id);
  
  // Piano key configuration
  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const blackKeys = ['C#', 'D#', 'F#', 'G#', 'A#'];
  const keyWidth = 40;
  const blackKeyWidth = 25;
  const keyHeight = 120;
  const blackKeyHeight = 80;

  const generatePianoKeys = (): PianoKey[] => {
    const keys: PianoKey[] = [];
    let x = 0;

    // Generate 3 octaves for better visualization
    for (let octave = 3; octave <= 5; octave++) {
      whiteKeys.forEach((note, index) => {
        const fullNote = `${note}${octave}`;
        const isActive = isPlaying && dnaSequence && currentNote >= 0 && 
          theme.baseMapping[dnaSequence.sequence[currentNote] as keyof typeof theme.baseMapping]?.note === note;
        
        keys.push({
          note: fullNote,
          isBlack: false,
          isActive,
          color: isActive ? theme.baseMapping[dnaSequence?.sequence[currentNote] as keyof typeof theme.baseMapping]?.color || '#ffffff' : '#ffffff',
          x,
          width: keyWidth
        });

        // Add black key after C, D, F, G, A
        if ([0, 1, 3, 4, 5].includes(index)) {
          const blackNote = blackKeys[index > 2 ? index - 1 : index];
          const blackFullNote = `${blackNote}${octave}`;
          const isBlackActive = isPlaying && dnaSequence && currentNote >= 0 && 
            theme.baseMapping[dnaSequence.sequence[currentNote] as keyof typeof theme.baseMapping]?.note === blackNote;

          keys.push({
            note: blackFullNote,
            isBlack: true,
            isActive: isBlackActive,
            color: isBlackActive ? theme.baseMapping[dnaSequence?.sequence[currentNote] as keyof typeof theme.baseMapping]?.color || '#000000' : '#000000',
            x: x + keyWidth - blackKeyWidth / 2,
            width: blackKeyWidth
          });
        }

        x += keyWidth;
      });
    }

    return keys;
  };

  const generateNoteSequence = (): Note[] => {
    if (!dnaSequence) return [];
    
    return dnaSequence.sequence.slice(0, 100).split('').map((base, index) => {
      const mapping = theme.baseMapping[base as keyof typeof theme.baseMapping];
      if (!mapping) return null;

      return {
        base,
        note: `${mapping.note}${musicSettings.octave}`,
        frequency: 440, // Will be calculated properly in audio context
        time: index * musicSettings.noteLength,
        duration: musicSettings.noteLength,
        color: mapping.color,
        velocity: 80
      };
    }).filter(Boolean) as Note[];
  };

  const drawPianoRoll = (ctx: CanvasRenderingContext2D, keys: PianoKey[], notes: Note[]) => {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
    gradient.addColorStop(1, 'rgba(30, 41, 59, 0.95)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw piano keys
    const pianoY = canvas.height - keyHeight - 20;
    
    // White keys first
    keys.filter(key => !key.isBlack).forEach(key => {
      ctx.fillStyle = key.isActive ? key.color : '#f8fafc';
      ctx.fillRect(key.x, pianoY, key.width - 1, keyHeight);
      
      // Key border
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(key.x, pianoY, key.width - 1, keyHeight);

      // Active key glow
      if (key.isActive) {
        ctx.save();
        ctx.shadowColor = key.color;
        ctx.shadowBlur = 20;
        ctx.fillStyle = key.color + '40';
        ctx.fillRect(key.x - 5, pianoY - 5, key.width + 9, keyHeight + 10);
        ctx.restore();
      }

      // Key label
      ctx.fillStyle = key.isActive ? '#ffffff' : '#64748b';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(key.note.slice(0, -1), key.x + key.width / 2, pianoY + keyHeight - 10);
    });

    // Black keys on top
    keys.filter(key => key.isBlack).forEach(key => {
      ctx.fillStyle = key.isActive ? key.color : '#1e293b';
      ctx.fillRect(key.x, pianoY, key.width, blackKeyHeight);
      
      // Active black key glow
      if (key.isActive) {
        ctx.save();
        ctx.shadowColor = key.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = key.color + '60';
        ctx.fillRect(key.x - 3, pianoY - 3, key.width + 6, blackKeyHeight + 6);
        ctx.restore();
      }

      // Key label
      ctx.fillStyle = key.isActive ? '#ffffff' : '#94a3b8';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(key.note.slice(0, -2), key.x + key.width / 2, pianoY + blackKeyHeight - 8);
    });

    // Draw note sequence as metaballs
    const rollHeight = pianoY - 40;
    const noteHeight = 20;
    const timeScale = 100; // pixels per second

    notes.forEach((note, index) => {
      const x = (note.time * timeScale) - scrollPosition;
      const noteKey = keys.find(k => k.note === note.note);
      
      if (noteKey && x > -50 && x < canvas.width + 50) {
        const y = pianoY - ((keys.indexOf(noteKey) % 12) * (rollHeight / 12)) - noteHeight;
        const width = note.duration * timeScale;
        const isCurrentNote = index === currentNote;

        // Metaball note
        ctx.save();
        
        if (isCurrentNote && isPlaying) {
          // Pulsing effect for current note
          const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.2;
          ctx.scale(pulse, pulse);
          ctx.translate((x + width/2) * (1 - pulse) / pulse, (y + noteHeight/2) * (1 - pulse) / pulse);
        }

        // Note gradient
        const noteGradient = ctx.createRadialGradient(
          x + width/2, y + noteHeight/2, 0,
          x + width/2, y + noteHeight/2, Math.max(width, noteHeight)
        );
        noteGradient.addColorStop(0, note.color);
        noteGradient.addColorStop(0.7, note.color + '80');
        noteGradient.addColorStop(1, note.color + '20');

        ctx.fillStyle = noteGradient;
        ctx.beginPath();
        ctx.roundRect(x, y, width, noteHeight, 10);
        ctx.fill();

        // Glow effect for current note
        if (isCurrentNote && isPlaying) {
          ctx.shadowColor = note.color;
          ctx.shadowBlur = 30;
          ctx.fillStyle = note.color + '40';
          ctx.beginPath();
          ctx.roundRect(x - 5, y - 5, width + 10, noteHeight + 10, 15);
          ctx.fill();
        }

        ctx.restore();

        // Note label
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(note.base, x + width/2, y + noteHeight/2 + 3);
      }
    });

    // Current time indicator
    if (isPlaying && currentNote >= 0) {
      const currentTime = notes[currentNote]?.time || 0;
      const indicatorX = (currentTime * timeScale) - scrollPosition;
      
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(indicatorX, 0);
      ctx.lineTo(indicatorX, rollHeight);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      const y = pianoY - (i * (rollHeight / 12));
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const keys = generatePianoKeys();
    const notes = generateNoteSequence();

    const animate = () => {
      // Auto-scroll during playback
      if (isPlaying && currentNote >= 0 && notes[currentNote]) {
        const targetScroll = notes[currentNote].time * 100 - canvas.offsetWidth / 2;
        setScrollPosition(prev => prev + (targetScroll - prev) * 0.1);
      }

      drawPianoRoll(ctx, keys, notes);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dnaSequence, isPlaying, currentNote, musicSettings, scrollPosition]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
          <Piano className="w-6 h-6 text-cyan-400" />
          <span>DNA Piano Roll</span>
        </h2>
        
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Music className="w-4 h-4" />
          <span>Theme: {theme.name}</span>
        </div>
      </div>

      {dnaSequence ? (
        <div className="space-y-4">
          <div className="relative bg-gray-900/50 rounded-xl overflow-hidden" style={{ height: '400px' }}>
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              style={{ width: '100%', height: '100%' }}
            />
            
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/30">
                <div className="text-center">
                  <Piano className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">Press play to see the piano roll in action</p>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(theme.baseMapping).map(([base, mapping]) => (
              <div key={base} className="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: mapping.color }}
                />
                <span className="text-white font-mono">{base}</span>
                <span className="text-gray-400">→</span>
                <span className="text-gray-300">{mapping.note}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Piano className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Upload a DNA sequence to see the piano roll</p>
          <p className="text-gray-500 text-sm mt-2">Watch notes flow across the piano as your DNA sequence plays</p>
        </div>
      )}
    </motion.div>
  );
};

export default PianoRollVisualizer;