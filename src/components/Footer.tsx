import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 1 }}
      className="relative z-10 border-t border-gray-800/50 backdrop-blur-sm bg-gray-900/20 mt-16"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <motion.div
            className="flex items-center justify-center space-x-2 text-gray-300"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-2xl">🎵</span>
            <span>Designed with</span>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                color: ['#ec4899', '#f97316', '#ec4899']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Heart className="w-5 h-5 fill-current" />
            </motion.div>
            <span>by</span>
            <motion.a
              href="https://jayanth.site"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent hover:from-cyan-300 hover:via-purple-400 hover:to-pink-400 transition-all duration-300 flex items-center space-x-1"
              whileHover={{ scale: 1.1 }}
            >
              <span>Donavalli Jayanth</span>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </motion.a>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-8 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <span>🧬</span>
              <span>BioPulse DNA to Music Converter</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>⚡</span>
              <span>Powered by Web Audio API & Tone.js</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🎼</span>
              <span>Open Source Bioinformatics</span>
            </div>
          </div>

          <motion.div
            className="text-xs text-gray-500 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <p>
              Transform genetic sequences into musical experiences. Each DNA base (A, T, C, G) is mapped to unique musical notes, 
              creating melodies that represent the rhythm of life itself. Built with modern web technologies for seamless 
              bioinformatics visualization and audio synthesis.
            </p>
          </motion.div>

          <div className="pt-4 border-t border-gray-800/30">
            <motion.p
              className="text-xs text-gray-600"
              whileHover={{ color: '#9ca3af' }}
            >
              © 2025 BioPulse. Bridging the gap between genomics and music.
            </motion.p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;