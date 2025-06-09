import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { DNASequence } from '../types';

interface DNAInputProps {
  onSequenceChange: (sequence: DNASequence | null) => void;
  dnaSequence: DNASequence | null;
}

const DNAInput: React.FC<DNAInputProps> = ({ onSequenceChange, dnaSequence }) => {
  const [textInput, setTextInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const validateDNASequence = (sequence: string): DNASequence => {
    const cleanedSequence = sequence.toUpperCase().replace(/[^ATCG]/g, '');
    const validBases = cleanedSequence.length;
    const invalidBases = sequence.toUpperCase().match(/[^ATCG\s\n\r]/g) || [];
    
    return {
      id: Date.now().toString(),
      sequence: cleanedSequence,
      length: cleanedSequence.length,
      validBases,
      invalidBases: [...new Set(invalidBases)]
    };
  };

  const processFASTAFile = (content: string): string => {
    const lines = content.split('\n');
    const sequenceLines = lines.filter(line => !line.startsWith('>') && line.trim());
    return sequenceLines.join('');
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsValidating(true);
      try {
        const content = await file.text();
        const sequence = processFASTAFile(content);
        const validatedSequence = validateDNASequence(sequence);
        validatedSequence.name = file.name;
        onSequenceChange(validatedSequence);
      } catch (error) {
        console.error('Error reading file:', error);
      } finally {
        setIsValidating(false);
      }
    }
  }, [onSequenceChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.fasta', '.fa', '.txt'],
      'application/octet-stream': ['.fasta', '.fa']
    },
    maxFiles: 1
  });

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      setIsValidating(true);
      setTimeout(() => {
        const validatedSequence = validateDNASequence(textInput);
        validatedSequence.name = 'Manual Input';
        onSequenceChange(validatedSequence);
        setIsValidating(false);
      }, 500);
    }
  };

  const clearSequence = () => {
    onSequenceChange(null);
    setTextInput('');
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
          <FileText className="w-6 h-6 text-cyan-400" />
          <span>DNA Input</span>
        </h2>

        {/* File Upload Area */}
        <motion.div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
            ${isDragActive 
              ? 'border-cyan-400 bg-cyan-400/10' 
              : 'border-gray-600 hover:border-cyan-500 hover:bg-cyan-500/5'
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input {...getInputProps()} />
          <motion.div
            animate={{ 
              y: isDragActive ? -5 : 0,
              scale: isDragActive ? 1.1 : 1 
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-cyan-400' : 'text-gray-400'}`} />
            <p className="text-lg text-gray-300 mb-2">
              {isDragActive ? 'Drop your FASTA file here!' : 'Upload FASTA File'}
            </p>
            <p className="text-sm text-gray-500">
              Supports .fasta, .fa, and .txt files
            </p>
          </motion.div>
        </motion.div>

        <div className="flex items-center justify-center my-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
          <span className="px-4 text-gray-400 text-sm">OR</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
        </div>

        {/* Text Input */}
        <div className="space-y-4">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste your DNA sequence here (A, T, C, G only)..."
            className="w-full h-32 bg-gray-800/50 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 resize-none font-mono text-sm"
          />
          <motion.button
            onClick={handleTextSubmit}
            disabled={!textInput.trim() || isValidating}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isValidating ? 'Validating...' : 'Process Sequence'}
          </motion.button>
        </div>
      </motion.div>

      {/* Sequence Display */}
      {dnaSequence && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span>Sequence Processed</span>
            </h3>
            <motion.button
              onClick={clearSequence}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Trash2 className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <span className="text-gray-400">Length:</span>
                <span className="text-white font-mono ml-2">{dnaSequence.length.toLocaleString()}</span>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <span className="text-gray-400">Valid Bases:</span>
                <span className="text-green-400 font-mono ml-2">{dnaSequence.validBases.toLocaleString()}</span>
              </div>
            </div>

            {dnaSequence.invalidBases.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-yellow-400 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Invalid bases removed:</span>
                </div>
                <div className="text-yellow-300 font-mono text-sm">
                  {dnaSequence.invalidBases.join(', ')}
                </div>
              </div>
            )}

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-2">Sequence Preview:</div>
              <div className="font-mono text-sm text-white break-all leading-relaxed max-h-32 overflow-y-auto">
                {dnaSequence.sequence.slice(0, 200)}
                {dnaSequence.sequence.length > 200 && (
                  <span className="text-gray-500">... ({(dnaSequence.sequence.length - 200).toLocaleString()} more bases)</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DNAInput;