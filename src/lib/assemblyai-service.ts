import { AssemblyAI } from 'assemblyai';
import fs from 'fs/promises';
import type { Transcript, TranscriptTurn } from '@/types';

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || '',
});

/**
 * Transcribe audio file using AssemblyAI with speaker diarization
 * @param filePath - Path to the audio file
 * @param callId - Unique identifier for the call
 * @returns Transcript object with accurate speaker diarization
 */
export async function transcribeAudio(filePath: string, callId: string): Promise<Transcript> {
  const startTime = Date.now();

  try {
    // Upload the audio file
    console.log('[AssemblyAI] Uploading audio file:', filePath);
    const uploadUrl = await client.files.upload(filePath);

    // Start transcription with speaker diarization enabled
    console.log('[AssemblyAI] Starting transcription with diarization...');
    const transcript = await client.transcripts.transcribe({
      audio: uploadUrl,
      speaker_labels: true, // Enable speaker diarization
      language_code: 'en', // Force English (UK accents supported)
      punctuate: true,
      format_text: true,
    });

    const processingTime = Date.now() - startTime;

    // Check for errors
    if (transcript.status === 'error') {
      throw new Error(`AssemblyAI transcription failed: ${transcript.error}`);
    }

    // Parse utterances into transcript turns
    const turns: TranscriptTurn[] = [];

    if (transcript.utterances && transcript.utterances.length > 0) {
      // AssemblyAI provides utterances with speaker labels
      transcript.utterances.forEach((utterance) => {
        // Map AssemblyAI speaker labels (A, B, C...) to agent/customer
        // Assumption: First speaker (A) is agent, second speaker (B) is customer
        const speaker = utterance.speaker === 'A' ? 'agent' : 'customer';

        turns.push({
          speaker,
          text: utterance.text,
          timestamp: utterance.start / 1000, // Convert ms to seconds
          confidence: utterance.confidence,
        });
      });
    } else {
      // Fallback: use full text if no utterances (shouldn't happen with speaker_labels enabled)
      console.warn('[AssemblyAI] No utterances found, using full text');
      turns.push({
        speaker: 'agent',
        text: transcript.text || '',
        timestamp: 0,
        confidence: transcript.confidence || 0,
      });
    }

    const result: Transcript = {
      callId,
      turns,
      durationSeconds: (transcript.audio_duration || 0) / 1000, // Convert ms to seconds
      language: 'english',
      processingTime,
    };

    console.log('[AssemblyAI] Transcription complete:', {
      turns: turns.length,
      duration: result.durationSeconds,
      processingTime: `${processingTime}ms`,
      speakers: {
        agent: turns.filter((t) => t.speaker === 'agent').length,
        customer: turns.filter((t) => t.speaker === 'customer').length,
      },
    });

    return result;
  } catch (error) {
    console.error('[AssemblyAI] Transcription error:', error);
    throw new Error(`Failed to transcribe audio with AssemblyAI: ${(error as Error).message}`);
  }
}

/**
 * Estimate transcription cost for AssemblyAI
 * @param durationSeconds - Audio duration in seconds
 * @returns Cost in USD
 */
export function estimateTranscriptionCost(durationSeconds: number): number {
  const hours = durationSeconds / 3600;
  const costPerHour = 0.65; // $0.65 per hour (as of 2024)
  return hours * costPerHour;
}

/**
 * Format transcript as plain text for human reading
 * @param transcript - Transcript object
 * @returns Formatted text
 */
export function formatTranscriptAsText(transcript: Transcript): string {
  const lines: string[] = [];

  lines.push('='.repeat(80));
  lines.push('CALL TRANSCRIPT (AssemblyAI)');
  lines.push('='.repeat(80));
  lines.push('');
  lines.push(`Call ID: ${transcript.callId}`);
  lines.push(`Duration: ${Math.floor(transcript.durationSeconds / 60)}m ${Math.floor(transcript.durationSeconds % 60)}s`);
  lines.push(`Language: ${transcript.language || 'Unknown'}`);
  lines.push(`Processing Time: ${Math.floor(transcript.processingTime! / 1000)}s`);
  lines.push('');
  lines.push(`Speaker Distribution:`);
  lines.push(`  Agent: ${transcript.turns.filter((t) => t.speaker === 'agent').length} turns`);
  lines.push(`  Customer: ${transcript.turns.filter((t) => t.speaker === 'customer').length} turns`);
  lines.push('');
  lines.push('='.repeat(80));
  lines.push('');

  transcript.turns.forEach((turn, index) => {
    const timestamp = formatTimestamp(turn.timestamp);
    const speaker = turn.speaker === 'agent' ? 'AGENT' : 'CUSTOMER';
    const confidence = Math.round((turn.confidence || 0) * 100);

    lines.push(`[${timestamp}] ${speaker} (${confidence}% confidence)`);
    lines.push(turn.text);
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * Format timestamp as MM:SS
 */
function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
