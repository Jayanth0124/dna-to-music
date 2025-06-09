import { Handler } from '@netlify/functions';

interface FASTAParseRequest {
  content: string;
}

interface FASTAParseResponse {
  success: boolean;
  sequence?: string;
  name?: string;
  error?: string;
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
    const { content }: FASTAParseRequest = JSON.parse(event.body || '{}');

    if (!content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'No content provided' })
      };
    }

    // Parse FASTA format
    const lines = content.split('\n');
    let sequenceName = '';
    let sequence = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('>')) {
        // Header line
        sequenceName = trimmedLine.substring(1);
      } else if (trimmedLine) {
        // Sequence line
        sequence += trimmedLine.toUpperCase();
      }
    }

    // Clean sequence - keep only valid DNA bases
    const cleanSequence = sequence.replace(/[^ATCG]/g, '');

    if (cleanSequence.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'No valid DNA bases found (A, T, C, G)' 
        })
      };
    }

    const response: FASTAParseResponse = {
      success: true,
      sequence: cleanSequence,
      name: sequenceName || 'Untitled Sequence'
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('FASTA parsing error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Failed to parse FASTA file' 
      })
    };
  }
};