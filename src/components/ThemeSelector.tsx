import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Check } from 'lucide-react';
import { DNA_THEMES } from '../data/themes';
import { MusicSettings } from '../types';

interface ThemeSelectorProps {
  musicSettings: MusicSettings;
  onSettingsChange: (settings: MusicSettings) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  musicSettings,
  onSettingsChange
}) => {
  const handleThemeChange = (themeId: string) => {
    const selectedTheme = DNA_THEMES.find(theme => theme.id === themeId);
    if (selectedTheme) {
      onSettingsChange({
        ...musicSettings,
        theme: selectedTheme
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
    >
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
        <Palette className="w-6 h-6 text-purple-400" />
        <span>DNA Themes</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DNA_THEMES.map((theme) => (
          <motion.div
            key={theme.id}
            onClick={() => handleThemeChange(theme.id)}
            className={`
              relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-300
              ${musicSettings.theme.id === theme.id
                ? 'border-cyan-400 bg-cyan-400/10'
                : 'border-gray-600 hover:border-gray-500 bg-gray-800/30'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Theme Background Preview */}
            <div 
              className="w-full h-20 rounded-lg mb-4 relative overflow-hidden"
              style={{ background: theme.background }}
            >
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute top-2 left-2 text-2xl">{theme.icon}</div>
              
              {musicSettings.theme.id === theme.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">{theme.name}</h3>
              <p className="text-sm text-gray-400">{theme.description}</p>
              
              {/* Base mapping preview */}
              <div className="flex space-x-1 mt-3">
                {Object.entries(theme.baseMapping).map(([base, mapping]) => (
                  <div
                    key={base}
                    className="flex flex-col items-center space-y-1"
                  >
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white/20"
                      style={{ backgroundColor: mapping.color }}
                    />
                    <span className="text-xs text-gray-400 font-mono">{base}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hover effect */}
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 to-purple-400/0 opacity-0"
              whileHover={{ 
                opacity: 0.1,
                background: 'linear-gradient(45deg, rgba(6, 182, 212, 0.1), rgba(139, 92, 246, 0.1))'
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Current theme info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50"
      >
        <div className="flex items-center space-x-3 mb-3">
          <span className="text-2xl">{musicSettings.theme.icon}</span>
          <div>
            <h4 className="text-lg font-bold text-white">{musicSettings.theme.name}</h4>
            <p className="text-sm text-gray-400">{musicSettings.theme.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {Object.entries(musicSettings.theme.baseMapping).map(([base, mapping]) => (
            <div key={base} className="text-center">
              <div
                className="w-8 h-8 rounded-full mx-auto mb-1 border-2 border-white/20"
                style={{ backgroundColor: mapping.color }}
              />
              <div className="text-xs text-gray-300 font-mono">{base} → {mapping.note}</div>
              {mapping.instrument && (
                <div className="text-xs text-gray-500">{mapping.instrument}</div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ThemeSelector;