import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Folder, Play, Trash2, Download, Share2 } from 'lucide-react';
import { DNASequence, MusicSettings, SavedSequence } from '../types';

interface SequenceGalleryProps {
  dnaSequence: DNASequence | null;
  musicSettings: MusicSettings;
  onLoadSequence: (sequence: SavedSequence) => void;
}

const SequenceGallery: React.FC<SequenceGalleryProps> = ({
  dnaSequence,
  musicSettings,
  onLoadSequence
}) => {
  const [savedSequences, setSavedSequences] = useState<SavedSequence[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [sequenceName, setSequenceName] = useState('');

  useEffect(() => {
    // Load saved sequences from localStorage
    const saved = localStorage.getItem('biopulse-sequences');
    if (saved) {
      try {
        setSavedSequences(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved sequences:', error);
      }
    }
  }, []);

  const saveSequence = () => {
    if (!dnaSequence || !sequenceName.trim()) return;

    const newSequence: SavedSequence = {
      id: Date.now().toString(),
      name: sequenceName.trim(),
      sequence: dnaSequence.sequence,
      theme: musicSettings.theme.id,
      settings: musicSettings,
      createdAt: new Date(),
      thumbnail: generateThumbnail(dnaSequence.sequence)
    };

    const updated = [...savedSequences, newSequence];
    setSavedSequences(updated);
    localStorage.setItem('biopulse-sequences', JSON.stringify(updated));
    
    setShowSaveDialog(false);
    setSequenceName('');
  };

  const deleteSequence = (id: string) => {
    const updated = savedSequences.filter(seq => seq.id !== id);
    setSavedSequences(updated);
    localStorage.setItem('biopulse-sequences', JSON.stringify(updated));
  };

  const generateThumbnail = (sequence: string): string => {
    // Generate a simple visual representation of the sequence
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const colors = { A: '#06b6d4', T: '#8b5cf6', C: '#ec4899', G: '#10b981' };
      const barWidth = canvas.width / Math.min(sequence.length, 50);
      
      sequence.slice(0, 50).split('').forEach((base, index) => {
        ctx.fillStyle = colors[base as keyof typeof colors] || '#666';
        ctx.fillRect(index * barWidth, 0, barWidth - 1, canvas.height);
      });
    }
    
    return canvas.toDataURL();
  };

  const shareSequence = async (sequence: SavedSequence) => {
    const shareData = {
      title: `BioPulse: ${sequence.name}`,
      text: `Check out this DNA sequence converted to music: ${sequence.name}`,
      url: `${window.location.origin}?sequence=${encodeURIComponent(sequence.sequence)}&theme=${sequence.theme}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.url);
      // You could show a toast notification here
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 px-4 sm:px-6 border border-gray-700/50"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
          <Folder className="w-6 h-6 text-yellow-400" />
          <span>Sequence Gallery</span>
        </h2>
        
        <motion.button
          onClick={() => setShowSaveDialog(true)}
          disabled={!dnaSequence}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Save className="w-4 h-4" />
          <span>Save Current</span>
        </motion.button>
      </div>

      {/* Saved Sequences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {savedSequences.map((sequence) => (
            <motion.div
              key={sequence.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="w-full h-20 bg-gray-900/50 rounded-lg mb-3 overflow-hidden">
                {sequence.thumbnail && (
                  <img 
                    src={sequence.thumbnail} 
                    alt={sequence.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Info */}
              <div className="space-y-2">
                <h3 className="text-white font-semibold truncate">{sequence.name}</h3>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>Length: {sequence.sequence.length.toLocaleString()} bases</div>
                  <div>Theme: {sequence.theme}</div>
                  <div>Saved: {new Date(sequence.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700/50">
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => onLoadSequence(sequence)}
                    className="p-2 text-green-400 hover:text-green-300 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Load sequence"
                  >
                    <Play className="w-4 h-4" />
                  </motion.button>
                  
                  <motion.button
                    onClick={() => shareSequence(sequence)}
                    className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Share sequence"
                  >
                    <Share2 className="w-4 h-4" />
                  </motion.button>
                </div>

                <motion.button
                  onClick={() => deleteSequence(sequence.id)}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Delete sequence"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {savedSequences.length === 0 && (
        <div className="text-center py-12">
          <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No saved sequences yet</p>
          <p className="text-gray-500 text-sm mt-2">Save your DNA sequences to build your personal collection</p>
        </div>
      )}

      {/* Save Dialog */}
      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSaveDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Save Sequence</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sequence Name
                  </label>
                  <input
                    type="text"
                    value={sequenceName}
                    onChange={(e) => setSequenceName(e.target.value)}
                    placeholder="Enter a name for this sequence..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    autoFocus
                  />
                </div>

                {dnaSequence && (
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-sm text-gray-400 space-y-1">
                      <div>Length: {dnaSequence.length.toLocaleString()} bases</div>
                      <div>Theme: {musicSettings.theme.name}</div>
                      <div>Tempo: {musicSettings.tempo} BPM</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <motion.button
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-xl transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={saveSequence}
                  disabled={!sequenceName.trim()}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SequenceGallery;