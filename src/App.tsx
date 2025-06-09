import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import DNAInput from './components/DNAInput';
import MusicVisualizer from './components/MusicVisualizer';
import PianoRollVisualizer from './components/PianoRollVisualizer';
import WaveformVisualizer from './components/WaveformVisualizer';
import PlaybackControls from './components/PlaybackControls';
import ThemeSelector from './components/ThemeSelector';
import SequenceGallery from './components/SequenceGallery';
import Footer from './components/Footer';
import UltraRealisticMetaballs from './components/UltraRealisticMetaballs';
import { DNASequence, MusicSettings, SavedSequence } from './types';
import { DNA_THEMES } from './data/themes';

function App() {
  const [dnaSequence, setDnaSequence] = useState<DNASequence | null>(null);
  const [musicSettings, setMusicSettings] = useState<MusicSettings>({
    tempo: 120,
    noteLength: 0.25,
    instrument: 'piano',
    octave: 4,
    theme: DNA_THEMES[0]
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNote, setCurrentNote] = useState<number>(-1);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'piano' | 'waveform'>('visualizer');

  // PWA installation
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Handle URL parameters for sharing
    const urlParams = new URLSearchParams(window.location.search);
    const sharedSequence = urlParams.get('sequence');
    const sharedTheme = urlParams.get('theme');
    
    if (sharedSequence) {
      const sequence: DNASequence = {
        id: Date.now().toString(),
        sequence: sharedSequence,
        name: 'Shared Sequence',
        length: sharedSequence.length,
        validBases: sharedSequence.length,
        invalidBases: []
      };
      setDnaSequence(sequence);
      
      if (sharedTheme) {
        const theme = DNA_THEMES.find(t => t.id === sharedTheme);
        if (theme) {
          setMusicSettings(prev => ({ ...prev, theme }));
        }
      }
    }
  }, []);

  const handleLoadSequence = (savedSequence: SavedSequence) => {
    const sequence: DNASequence = {
      id: Date.now().toString(),
      sequence: savedSequence.sequence,
      name: savedSequence.name,
      length: savedSequence.sequence.length,
      validBases: savedSequence.sequence.length,
      invalidBases: []
    };
    
    setDnaSequence(sequence);
    setMusicSettings(savedSequence.settings);
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      <UltraRealisticMetaballs />
      
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4"
          >
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              BioPulse
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Transform DNA sequences into beautiful melodies with our advanced bioinformatics music engine
            </p>
          </motion.div>

          {/* Theme Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <ThemeSelector
              musicSettings={musicSettings}
              onSettingsChange={setMusicSettings}
            />
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <DNAInput 
                onSequenceChange={setDnaSequence}
                dnaSequence={dnaSequence}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <SequenceGallery
                dnaSequence={dnaSequence}
                musicSettings={musicSettings}
                onLoadSequence={handleLoadSequence}
              />
            </motion.div>
          </div>

          {/* Visualizer Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="flex space-x-4 mb-6">
              {[
                { id: 'visualizer', label: 'Metaballs', icon: '🔮' },
                { id: 'piano', label: 'Piano Roll', icon: '🎹' },
                { id: 'waveform', label: 'Waveform', icon: '📊' }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300
                    ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Visualizer Content */}
            <div className="space-y-8">
              {activeTab === 'visualizer' && (
                <MusicVisualizer 
                  dnaSequence={dnaSequence}
                  isPlaying={isPlaying}
                  currentNote={currentNote}
                  musicSettings={musicSettings}
                />
              )}
              
              {activeTab === 'piano' && (
                <PianoRollVisualizer
                  dnaSequence={dnaSequence}
                  isPlaying={isPlaying}
                  currentNote={currentNote}
                  musicSettings={musicSettings}
                />
              )}
              
              {activeTab === 'waveform' && (
                <WaveformVisualizer
                  dnaSequence={dnaSequence}
                  isPlaying={isPlaying}
                  currentNote={currentNote}
                  musicSettings={musicSettings}
                />
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <PlaybackControls
              dnaSequence={dnaSequence}
              musicSettings={musicSettings}
              onSettingsChange={setMusicSettings}
              isPlaying={isPlaying}
              onPlayingChange={setIsPlaying}
              onNoteChange={setCurrentNote}
            />
          </motion.div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;