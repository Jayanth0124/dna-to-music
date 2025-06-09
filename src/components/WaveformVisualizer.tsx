import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Volume2 } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import { DNASequence, MusicSettings } from '../types';

interface WaveformVisualizerProps {
  dnaSequence: DNASequence | null;
  isPlaying: boolean;
  currentNote: number;
  musicSettings: MusicSettings;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  dnaSequence,
  isPlaying,
  currentNote,
  musicSettings
}) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const animationRef = useRef<number>();
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  useEffect(() => {
    if (!waveformRef.current) return;

    // Initialize WaveSurfer
    wavesurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#06b6d4',
      progressColor: '#8b5cf6',
      cursorColor: '#ec4899',
      barWidth: 3,
      barRadius: 3,
      responsive: true,
      height: 80,
      normalize: true,
      backend: 'WebAudio',
      mediaControls: false
    });

    // Initialize Web Audio API for real-time analysis
    const initAudio = async () => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyserNode = ctx.createAnalyser();
        analyserNode.fftSize = 256;
        analyserNode.smoothingTimeConstant = 0.8;
        
        setAudioContext(ctx);
        setAnalyser(analyserNode);
      } catch (error) {
        console.error('Failed to initialize audio context:', error);
      }
    };

    initAudio();

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  const drawRealtimeWaveform = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array) => {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
    gradient.addColorStop(1, 'rgba(30, 41, 59, 0.9)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw frequency bars
    const barWidth = width / dataArray.length * 2;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * height * 0.8;
      
      // Create gradient for each bar
      const barGradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
      barGradient.addColorStop(0, '#06b6d4');
      barGradient.addColorStop(0.5, '#8b5cf6');
      barGradient.addColorStop(1, '#ec4899');
      
      ctx.fillStyle = barGradient;
      ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

      // Add glow effect
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
      ctx.shadowBlur = 0;

      x += barWidth;
    }

    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Current note indicator
    if (isPlaying && currentNote >= 0 && dnaSequence) {
      const progress = currentNote / Math.min(dnaSequence.length, 100);
      const indicatorX = progress * width;
      
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(indicatorX, 0);
      ctx.lineTo(indicatorX, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const animate = () => {
      if (isPlaying) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Create fake data for demo when not playing
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = Math.random() * 50 + Math.sin(Date.now() * 0.001 + i * 0.1) * 20;
        }
      }

      drawRealtimeWaveform(ctx, dataArray);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isPlaying, currentNote, dnaSequence]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
    >
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
        <Activity className="w-6 h-6 text-green-400" />
        <span>Waveform Visualizer</span>
      </h2>

      {dnaSequence ? (
        <div className="space-y-6">
          {/* Real-time frequency analyzer */}
          <div className="relative bg-gray-900/50 rounded-xl overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-32"
              style={{ width: '100%', height: '128px' }}
            />
            <div className="absolute top-2 left-2 text-xs text-gray-400">
              Real-time Frequency Analysis
            </div>
          </div>

          {/* WaveSurfer waveform */}
          <div className="relative bg-gray-900/50 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-2">DNA Sequence Waveform</div>
            <div ref={waveformRef} className="w-full" />
          </div>

          {/* Audio stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-cyan-400 font-bold text-lg">
                {musicSettings.tempo}
              </div>
              <div className="text-gray-400 text-sm">BPM</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-purple-400 font-bold text-lg">
                {musicSettings.octave}
              </div>
              <div className="text-gray-400 text-sm">Octave</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-pink-400 font-bold text-lg">
                {(musicSettings.noteLength * 1000).toFixed(0)}ms
              </div>
              <div className="text-gray-400 text-sm">Note Length</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-green-400 font-bold text-lg">
                {Math.min(dnaSequence.length, 100)}
              </div>
              <div className="text-gray-400 text-sm">Notes</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Volume2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Upload a DNA sequence to see the waveform</p>
          <p className="text-gray-500 text-sm mt-2">Real-time audio visualization and frequency analysis</p>
        </div>
      )}
    </motion.div>
  );
};

export default WaveformVisualizer;