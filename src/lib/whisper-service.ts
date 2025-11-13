import OpenAI from 'openai';
import fs from 'fs/promises';
import type { Transcript, TranscriptTurn } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Enhanced speaker detection using multiple heuristic signals
 */
interface DetectionContext {
  text: string;
  pause: number;
  lastEndTime: number;
  currentSpeaker: 'agent' | 'customer';
  isCallStart: boolean;
}

function detectSpeaker(context: DetectionContext): 'agent' | 'customer' {
  const { text, pause, lastEndTime, currentSpeaker, isCallStart } = context;

  // Calculate word count
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;

  // Check for question marks
  const hasQuestionMark = text.includes('?');

  // Check for greeting patterns (strongly suggests agent)
  const greetingPatterns = /^(hello|hi|hey|good morning|good afternoon|good evening|hiya)/i;
  const hasGreeting = greetingPatterns.test(text);

  // Company/agent introduction patterns
  const introPatterns = /(calling from|speaking from|this is|my name is|I'm calling|here from)\s+(pikl|pickle)/i;
  const hasIntro = introPatterns.test(text);

  // Check for short affirmative/negative responses (strongly suggests customer)
  const affirmationPatterns = /^(yes|yeah|yep|okay|ok|no|nope|sure|right|alright|uh-huh|mm-hmm|mhm|gotcha|understood|perfect|great|cool|fine|correct|exactly|absolutely|definitely|certainly)\b/i;
  const isAffirmation = affirmationPatterns.test(text);

  // Check if it's a very short response (likely customer)
  const isVeryShort = wordCount <= 3;

  // Check for typical customer responses
  const customerResponsePatterns = /^(my |I |I'm |I've |I'd |can I |could I |would I |do I |should I )/i;
  const isCustomerResponse = customerResponsePatterns.test(text);

  // Check for agent question patterns
  const agentQuestionPatterns = /(can you|could you|would you|are you|do you|have you|let me know|just to confirm|just checking|just clarify)/i;
  const hasAgentQuestion = agentQuestionPatterns.test(text);

  // Check for procedural agent language
  const proceduralPatterns = /(click|select|choose|enter|fill|type|scroll|navigate|go to|on the website|on the page)/i;
  const hasProcedural = proceduralPatterns.test(text);

  // Score-based approach: positive = agent, negative = customer
  let agentScore = 0;

  // Greeting/intro at call start is almost always agent
  if (isCallStart && (hasGreeting || hasIntro)) {
    agentScore += 5;
  }

  // Company introduction is always agent
  if (hasIntro) {
    agentScore += 5;
  }

  // Short affirmations are very likely customer
  if (isAffirmation) {
    agentScore -= 4;
  }

  // Very short responses are likely customer
  if (isVeryShort && !isCallStart) {
    agentScore -= 2;
  }

  // Customer response patterns
  if (isCustomerResponse) {
    agentScore -= 3;
  }

  // Agents typically speak more
  if (wordCount > 15) {
    agentScore += 1;
  }

  // Questions are more often from agent
  if (hasQuestionMark) {
    agentScore += 1;
  }

  // Agent question patterns
  if (hasAgentQuestion) {
    agentScore += 2;
  }

  // Procedural language is typically agent
  if (hasProcedural) {
    agentScore += 2;
  }

  // Significant pause suggests speaker change
  if (pause > 2 && lastEndTime > 0) {
    agentScore = currentSpeaker === 'agent' ? -3 : 3;
  }

  // Medium pause with strong signals
  if (pause > 1 && pause <= 2 && lastEndTime > 0) {
    // Don't change speaker unless we have strong signals
    if (Math.abs(agentScore) < 2) {
      return currentSpeaker; // Keep current speaker
    }
  }

  // Determine final speaker
  if (agentScore > 0) {
    return 'agent';
  } else if (agentScore < 0) {
    return 'customer';
  } else {
    // Neutral score - maintain current speaker
    return currentSpeaker;
  }
}

export interface WhisperResponse {
  text: string;
  segments?: Array<{
    id: number;
    seek: number;
    start: number;
    end: number;
    text: string;
    tokens: number[];
    temperature: number;
    avg_logprob: number;
    compression_ratio: number;
    no_speech_prob: number;
  }>;
  language?: string;
  duration?: number;
}

/**
 * Transcribe audio file using OpenAI Whisper API
 * @param filePath - Path to the audio file
 * @returns Transcript object with speaker diarization
 */
export async function transcribeAudio(filePath: string, callId: string): Promise<Transcript> {
  const startTime = Date.now();

  try {
    // Read the audio file
    const fileBuffer = await fs.readFile(filePath);
    const file = new File([fileBuffer], filePath.split('/').pop() || 'audio.wav', {
      type: 'audio/wav',
    });

    // Call OpenAI Whisper API with verbose_json to get timestamps
    // Force English language to prevent misdetection (e.g., Welsh instead of English)
    const response = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
      language: 'en', // Force English transcription
    });

    const processingTime = Date.now() - startTime;

    // Parse response and create transcript turns
    const turns: TranscriptTurn[] = [];

    if (response.segments && Array.isArray(response.segments)) {
      // Enhanced speaker diarization using multiple heuristic signals
      let currentSpeaker: 'agent' | 'customer' = 'agent';
      let lastEndTime = 0;
      let isCallStart = true;

      response.segments.forEach((segment: any) => {
        const text = segment.text.trim();
        const pause = segment.start - lastEndTime;

        // Detect speaker using multiple signals
        const detectedSpeaker = detectSpeaker({
          text,
          pause,
          lastEndTime,
          currentSpeaker,
          isCallStart,
        });

        currentSpeaker = detectedSpeaker;
        isCallStart = false;

        turns.push({
          speaker: currentSpeaker,
          text,
          timestamp: segment.start,
          confidence: 1 - (segment.no_speech_prob || 0),
        });

        lastEndTime = segment.end;
      });
    } else {
      // Fallback: single turn with full text
      turns.push({
        speaker: 'agent',
        text: response.text,
        timestamp: 0,
        confidence: 1,
      });
    }

    const transcript: Transcript = {
      callId,
      turns,
      durationSeconds: response.duration || 0,
      language: response.language,
      processingTime,
    };

    return transcript;
  } catch (error) {
    console.error('Whisper transcription error:', error);
    throw new Error(`Failed to transcribe audio: ${(error as Error).message}`);
  }
}

/**
 * Estimate transcription cost
 * @param durationSeconds - Audio duration in seconds
 * @returns Cost in USD
 */
export function estimateTranscriptionCost(durationSeconds: number): number {
  const hours = durationSeconds / 3600;
  const costPerHour = 0.36; // $0.36 per hour
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
  lines.push('CALL TRANSCRIPT');
  lines.push('='.repeat(80));
  lines.push('');
  lines.push(`Call ID: ${transcript.callId}`);
  lines.push(`Duration: ${Math.floor(transcript.durationSeconds / 60)}m ${Math.floor(transcript.durationSeconds % 60)}s`);
  lines.push(`Language: ${transcript.language || 'Unknown'}`);
  lines.push(`Processing Time: ${Math.floor(transcript.processingTime! / 1000)}s`);
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
