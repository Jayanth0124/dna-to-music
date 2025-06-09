import { Handler } from '@netlify/functions';

interface MIDIGenerateRequest {
  sequence: string;
  tempo?: number;
  noteLength?: number;
  octave?: number;
}

interface MIDIGenerateResponse {
  success: boolean;
  midiData?: number[];
  error?: string;
}

// Simple MIDI file generation without external dependencies
class SimpleMIDI {
  private tracks: any[] = [];
  private ticksPerQuarter = 480;

  constructor(private tempo: number = 120) {}

  addTrack() {
    const track: any[] = [];
    this.tracks.push(track);
    return track;
  }

  private writeVariableLength(value: number): number[] {
    const bytes: number[] = [];
    let temp = value & 0x7F;
    
    while ((value >>= 7) > 0) {
      temp <<= 8;
      temp |= ((value & 0x7F) | 0x80);
    }
    
    while (true) {
      bytes.push(temp & 0xFF);
      if (temp & 0x80) {
        temp >>= 8;
      } else {
        break;
      }
    }
    
    return bytes;
  }

  private noteToMIDI(note: string, octave: number): number {
    const noteMap: { [key: string]: number } = {
      'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
    };
    
    return (octave + 1) * 12 + noteMap[note];
  }

  addNote(track: any[], note: string, octave: number, startTime: number, duration: number, velocity: number = 64) {
    const midiNote = this.noteToMIDI(note, octave);
    const tickStart = Math.round(startTime * this.ticksPerQuarter);
    const tickDuration = Math.round(duration * this.ticksPerQuarter);

    // Note on event
    track.push({
      time: tickStart,
      type: 'noteOn',
      note: midiNote,
      velocity: velocity
    });

    // Note off event
    track.push({
      time: tickStart + tickDuration,
      type: 'noteOff',
      note: midiNote,
      velocity: 0
    });
  }

  toBytes(): number[] {
    const header = [
      0x4D, 0x54, 0x68, 0x64, // "MThd"
      0x00, 0x00, 0x00, 0x06, // Header length
      0x00, 0x01, // Format type 1
      0x00, 0x01, // Number of tracks
      0x01, 0xE0  // Ticks per quarter note (480)
    ];

    if (this.tracks.length === 0) return header;

    const track = this.tracks[0];
    
    // Sort events by time
    track.sort((a: any, b: any) => a.time - b.time);

    const trackData: number[] = [];
    let lastTime = 0;

    // Add tempo meta event
    trackData.push(...this.writeVariableLength(0)); // Delta time 0
    trackData.push(0xFF, 0x51, 0x03); // Tempo meta event
    const microsecondsPerQuarter = Math.round(60000000 / this.tempo);
    trackData.push(
      (microsecondsPerQuarter >> 16) & 0xFF,
      (microsecondsPerQuarter >> 8) & 0xFF,
      microsecondsPerQuarter & 0xFF
    );

    // Add note events
    for (const event of track) {
      const deltaTime = event.time - lastTime;
      trackData.push(...this.writeVariableLength(deltaTime));
      
      if (event.type === 'noteOn') {
        trackData.push(0x90, event.note, event.velocity);
      } else if (event.type === 'noteOff') {
        trackData.push(0x80, event.note, event.velocity);
      }
      
      lastTime = event.time;
    }

    // End of track
    trackData.push(0x00, 0xFF, 0x2F, 0x00);

    // Track header
    const trackHeader = [
      0x4D, 0x54, 0x72, 0x6B, // "MTrk"
      (trackData.length >> 24) & 0xFF,
      (trackData.length >> 16) & 0xFF,
      (trackData.length >> 8) & 0xFF,
      trackData.length & 0xFF
    ];

    return [...header, ...trackHeader, ...trackData];
  }
}

export const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    const { 
      sequence, 
      tempo = 120, 
      noteLength = 0.25, 
      octave = 4 
    }: MIDIGenerateRequest = JSON.parse(event.body || '{}');

    if (!sequence) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'No sequence provided' })
      };
    }

    // DNA base to note mapping
    const baseToNote: { [key: string]: string } = {
      'A': 'C',
      'T': 'D',
      'C': 'E',
      'G': 'F'
    };

    // Create MIDI file
    const midi = new SimpleMIDI(tempo);
    const track = midi.addTrack();

    // Convert sequence to notes (limit to first 100 bases for performance)
    const limitedSequence = sequence.slice(0, 100);
    
    for (let i = 0; i < limitedSequence.length; i++) {
      const base = limitedSequence[i];
      const note = baseToNote[base];
      
      if (note) {
        midi.addNote(track, note, octave, i * noteLength, noteLength);
      }
    }

    const midiData = midi.toBytes();

    const response: MIDIGenerateResponse = {
      success: true,
      midiData: Array.from(midiData)
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('MIDI generation error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Failed to generate MIDI file' 
      })
    };
  }
};