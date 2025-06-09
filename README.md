# BioPulse - DNA to Music Converter 🧬🎵

A cutting-edge bioinformatics web application that transforms DNA sequences into beautiful musical compositions using advanced audio synthesis and real-time visualization.

![BioPulse Demo](https://images.pexels.com/photos/3844788/pexels-photo-3844788.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## ✨ Features

### 🧬 DNA Processing
- **FASTA File Upload**: Support for `.fasta`, `.fa`, and `.txt` files
- **Manual Input**: Direct DNA sequence input with real-time validation  
- **Sequence Validation**: Automatic filtering of invalid bases (non-ATCG)
- **Smart Parsing**: Intelligent header detection and sequence extraction

### 🎼 Music Generation
- **Base-to-Note Mapping**: A→C, T→D, C→E, G→F
- **Multiple Instruments**: Piano, Synth, Guitar, Flute
- **Customizable Settings**: Tempo (60-200 BPM), note length, octave selection
- **MIDI Export**: Download generated melodies as MIDI files

### 🎨 Visualization
- **Metaballs Background**: Animated fluid-like visual effects
- **Real-time Visualizer**: Notes pulse and glow in sync with playback
- **Color-coded Bases**: Each DNA base has a unique color and animation
- **Progress Tracking**: Visual progress bar and current note highlighting

### 🚀 Technology Stack
- **Frontend**: Vite + React + TypeScript + TailwindCSS
- **Audio**: Tone.js + Web Audio API
- **Animations**: Framer Motion + Custom Canvas
- **Backend**: Netlify Functions (TypeScript)
- **Deployment**: Netlify with optimized build configuration

## 🎯 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/biopulse.git
   cd biopulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

### Deployment to Netlify

1. **Connect your repository** to Netlify
2. **Build settings** are already configured in `netlify.toml`
3. **Deploy** - all functions and routing will work automatically

## 🧬 DNA-to-Music Algorithm

BioPulse uses a sophisticated mapping system to convert genetic information into musical sequences:

```typescript
const baseToNote = {
  'A': 'C',  // Adenine  → C note (Cyan)
  'T': 'D',  // Thymine  → D note (Purple) 
  'C': 'E',  // Cytosine → E note (Pink)
  'G': 'F'   // Guanine  → F note (Green)
};
```

### Musical Parameters
- **Tempo**: 60-200 BPM (adjustable)
- **Note Length**: 0.1-2.0 seconds
- **Octave Range**: 2-7
- **Instruments**: Piano, Synth, Guitar, Flute

## 🎨 Design Philosophy

BioPulse features a **metaballs design theme** that creates an immersive, scientific aesthetic:

- **Fluid Animations**: Smooth, organic movements that mirror biological processes
- **Neon Color Palette**: Vibrant cyan, purple, pink, and green representing DNA bases
- **Glass Morphism**: Translucent panels with backdrop blur effects
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## 🔧 API Endpoints

### Parse FASTA
```typescript
POST /.netlify/functions/parse-fasta
Content-Type: application/json

{
  "content": ">Sample DNA\nATCGATCGATCG..."
}
```

### Generate MIDI
```typescript
POST /.netlify/functions/sequence-to-midi
Content-Type: application/json

{
  "sequence": "ATCGATCG",
  "tempo": 120,
  "noteLength": 0.25,
  "octave": 4
}
```

## 🎵 Audio Features

### Web Audio Integration
- **Real-time Synthesis**: Zero-latency audio generation
- **Multiple Waveforms**: Sine, sawtooth, triangle oscillators
- **Dynamic Effects**: ADSR envelopes, reverb, filtering
- **Cross-platform**: Works on all modern browsers

### File Export
- **MIDI Generation**: Industry-standard format
- **Custom Metadata**: Includes sequence information
- **Optimized Size**: Efficient file compression

## 🌟 Advanced Features

### Sequence Analysis
- **Base Composition**: Real-time statistics (A/T/C/G percentages)
- **Length Validation**: Handles sequences up to 100 bases for optimal performance
- **Error Handling**: Graceful invalid character removal

### Visual Effects
- **Canvas Rendering**: Smooth 60fps animations
- **Particle Systems**: Dynamic metaball interactions
- **Color Transitions**: Smooth gradients and glows
- **Responsive Canvas**: Adapts to any screen size

## 🔒 Performance & Security

### Optimization
- **Code Splitting**: Lazy-loaded components
- **Asset Compression**: Optimized builds
- **CDN Delivery**: Fast global content distribution
- **Memory Management**: Efficient audio context handling

### Security
- **CORS Headers**: Properly configured cross-origin requests
- **Input Validation**: Server-side sequence sanitization
- **Rate Limiting**: Built-in Netlify function protection

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tone.js**: Powerful web audio framework
- **Framer Motion**: Smooth React animations
- **TailwindCSS**: Utility-first styling
- **Netlify**: Seamless deployment platform

## 👨‍💻 Author

**Donavalli Jayanth**
- Website: [jayanth.site](https://jayanth.site)
- GitHub: [@jayanthd](https://github.com/jayanthd)

---

<div align="center">

**🧬 Bridging the gap between genomics and music 🎵**

Made with ❤️ for the bioinformatics and music communities

[Live Demo](https://biopulse.netlify.app) • [Documentation](https://docs.biopulse.app) • [Report Bug](https://github.com/yourusername/biopulse/issues)

</div>