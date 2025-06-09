import React from 'react';
import { motion } from 'framer-motion';
import { Dna, Music, Zap } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="border-b border-gray-800/50 backdrop-blur-sm bg-gray-900/20"
    >
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-3 mx-auto md:mx-0"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative">
              <Dna className="w-8 h-8 text-cyan-400" />
              <motion.div
                className="absolute inset-0 w-8 h-8 bg-cyan-400/20 rounded-full blur-xl"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            <span className="text-2xl font-bold text-white">BioPulse</span>
          </motion.div>

          <div className="hidden md:flex items-center space-x-6">
            <motion.div 
              className="flex items-center space-x-2 text-gray-300"
              whileHover={{ scale: 1.05, color: '#06b6d4' }}
            >
              <Dna className="w-5 h-5" />
              <span>DNA Analysis</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-2 text-gray-300"
              whileHover={{ scale: 1.05, color: '#8b5cf6' }}
            >
              <Zap className="w-5 h-5" />
              <span>Real-time Conversion</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-2 text-gray-300"
              whileHover={{ scale: 1.05, color: '#ec4899' }}
            >
              <Music className="w-5 h-5" />
              <span>Music Generation</span>
            </motion.div>
          </div>
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;