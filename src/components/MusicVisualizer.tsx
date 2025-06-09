import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Volume2, BarChart3 } from 'lucide-react';
import { DNASequence, MusicSettings } from '../types';

interface MusicVisualizerProps {
  dnaSequence: DNASequence | null;
  isPlaying: boolean;
  currentNote: number;
  musicSettings: MusicSettings;
}

const MusicVisualizer: React.FC<MusicVisualizerProps> = ({
  dnaSequence,
  isPlaying,
  currentNote,
  musicSettings
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<Analyser | null>(null);

  const baseToNote = {
    'A': { note: 'C', color: '#06b6d4', freq: 261.63 },
    'T': { note: 'D', color: '#8b5cf6', freq: 293.66 },
    'C': { note: 'E', color: '#ec4899', freq: 329.63 },
    'G': { note: 'F', color: '#10b981', freq: 349.23 }
  };

  const generateNotes = () => {
    if (!dnaSequence) return [];
    
    return dnaSequence.sequence.slice(0, 100).split('').map((base, index) => {
      const noteData = baseToNote[base as keyof typeof baseToNote];
      return {
        base,
        ...noteData,
        x: (index % 10) * 50 + 25,
        y: Math.floor(index / 10) * 50 + 25,
        isActive: index === currentNote,
        index
      };
    });
  };

  const drawMetaballs = (ctx: CanvasRenderingContext2D, notes: any[], time: number) => {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create gradient background
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    gradient.addColorStop(0, 'rgba(15, 23, 42, 0.8)');
    gradient.addColorStop(1, 'rgba(30, 41, 59, 0.4)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    notes.forEach((note, index) => {
      const baseSize = isPlaying && note.isActive ? 30 : 20;
      const pulseSize = baseSize + Math.sin(time * 0.005 + index * 0.5) * 5;
      const opacity = isPlaying && note.isActive ? 0.9 : 0.6;

      // Main metaball
      ctx.save();
      ctx.globalAlpha = opacity;
      
      const gradient = ctx.createRadialGradient(
        note.x, note.y, 0,
        note.x, note.y, pulseSize
      );
      gradient.addColorStop(0, note.color);
      gradient.addColorStop(0.7, note.color + '40');
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(note.x, note.y, pulseSize, 0, Math.PI * 2);
      ctx.fill();

      // Glow effect for active notes
      if (isPlaying && note.isActive) {
        ctx.globalAlpha = 0.3;
        const glowGradient = ctx.createRadialGradient(
          note.x, note.y, 0,
          note.x, note.y, pulseSize * 2
        );
        glowGradient.addColorStop(0, note.color);
        glowGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(note.x, note.y, pulseSize * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Note label
      ctx.fillStyle = 'white';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(note.base, note.x, note.y + 4);
      ctx.fillText(note.note, note.x, note.y - 8);
    });

    // Connecting lines for active sequence
    if (isPlaying && currentNote >= 0) {
      const activeNote = notes[currentNote];
      const nextNote = notes[currentNote + 1];
      
      if (activeNote && nextNote) {
        ctx.strokeStyle = activeNote.color + '60';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(activeNote.x, activeNote.y);
        ctx.lineTo(nextNote.x, nextNote.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const notes = generateNotes();
    let startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now() - startTime;
      drawMetaballs(ctx, notes, currentTime);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dnaSequence, isPlaying, currentNote]);

  const getSequenceStats = () => {
    if (!dnaSequence) return null;

    const stats = { A: 0, T: 0, C: 0, G: 0 };
    dnaSequence.sequence.split('').forEach(base => {
      if (base in stats) stats[base as keyof typeof stats]++;
    });

    return Object.entries(stats).map(([base, count]) => ({
      base,
      count,
      percentage: (count / dnaSequence.length * 100).toFixed(1),
      color: baseToNote[base as keyof typeof baseToNote].color
    }));
  };

  const stats = getSequenceStats();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
          <Music className="w-6 h-6 text-purple-400" />
          <span>Music Visualizer</span>
        </h2>

        {dnaSequence ? (
          <div className="space-y-6">
            {/* Canvas Visualizer */}
            <div className="relative bg-gray-900/50 rounded-xl overflow-hidden">
              <canvas
                ref={canvasRef}
                width={500}
                height={300}
                className="w-full h-64 object-contain"
              />
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/30">
                  <div className="text-center">
                    <Volume2 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">Press play to see the visualization</p>
                  </div>
                </div>
              )}
            </div>

            {/* Base Statistics */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map(({ base, count, percentage, color }) => (
                  <motion.div
                    key={base}
                    className="bg-gray-800/50 rounded-lg p-4 text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div
                      className="w-8 h-8 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: color }}
                    />
                    <div className="text-white font-mono text-lg font-bold">{base}</div>
                    <div className="text-gray-400 text-sm">{count}</div>
                    <div className="text-gray-500 text-xs">{percentage}%</div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Current Playing Info */}
            {isPlaying && currentNote >= 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Now Playing</p>
                    <p className="text-lg font-bold text-white">
                      Base: {dnaSequence.sequence[currentNote]} → Note: {baseToNote[dnaSequence.sequence[currentNote] as keyof typeof baseToNote]?.note}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-300">Position</p>
                    <p className="text-lg font-bold text-white">{currentNote + 1} / {Math.min(dnaSequence.length, 100)}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Upload a DNA sequence to see the visualization</p>
            <p className="text-gray-500 text-sm mt-2">Each base will be mapped to a musical note and visualized as animated metaballs</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MusicVisualizer;