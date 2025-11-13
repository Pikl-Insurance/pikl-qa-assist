import fs from 'fs';
import type { TranscriptTurn } from '@/types';

/**
 * Enhanced speaker detection (NEW algorithm)
 */
interface DetectionContext {
  text: string;
  pause: number;
  lastEndTime: number;
  currentSpeaker: 'agent' | 'customer';
  isCallStart: boolean;
}

function detectSpeakerEnhanced(context: DetectionContext): 'agent' | 'customer' {
  const { text, pause, lastEndTime, currentSpeaker, isCallStart } = context;

  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
  const hasQuestionMark = text.includes('?');

  const greetingPatterns = /^(hello|hi|hey|good morning|good afternoon|good evening|hiya)/i;
  const hasGreeting = greetingPatterns.test(text);

  const introPatterns = /(calling from|speaking from|this is|my name is|I'm calling|here from)\s+(pikl|pickle)/i;
  const hasIntro = introPatterns.test(text);

  const affirmationPatterns = /^(yes|yeah|yep|okay|ok|no|nope|sure|right|alright|uh-huh|mm-hmm|mhm|gotcha|understood|perfect|great|cool|fine|correct|exactly|absolutely|definitely|certainly)\b/i;
  const isAffirmation = affirmationPatterns.test(text);

  const isVeryShort = wordCount <= 3;

  const customerResponsePatterns = /^(my |I |I'm |I've |I'd |can I |could I |would I |do I |should I )/i;
  const isCustomerResponse = customerResponsePatterns.test(text);

  const agentQuestionPatterns = /(can you|could you|would you|are you|do you|have you|let me know|just to confirm|just checking|just clarify)/i;
  const hasAgentQuestion = agentQuestionPatterns.test(text);

  const proceduralPatterns = /(click|select|choose|enter|fill|type|scroll|navigate|go to|on the website|on the page)/i;
  const hasProcedural = proceduralPatterns.test(text);

  let agentScore = 0;

  if (isCallStart && (hasGreeting || hasIntro)) agentScore += 5;
  if (hasIntro) agentScore += 5;
  if (isAffirmation) agentScore -= 4;
  if (isVeryShort && !isCallStart) agentScore -= 2;
  if (isCustomerResponse) agentScore -= 3;
  if (wordCount > 15) agentScore += 1;
  if (hasQuestionMark) agentScore += 1;
  if (hasAgentQuestion) agentScore += 2;
  if (hasProcedural) agentScore += 2;

  if (pause > 2 && lastEndTime > 0) {
    agentScore = currentSpeaker === 'agent' ? -3 : 3;
  }

  if (pause > 1 && pause <= 2 && lastEndTime > 0) {
    if (Math.abs(agentScore) < 2) {
      return currentSpeaker;
    }
  }

  if (agentScore > 0) return 'agent';
  if (agentScore < 0) return 'customer';
  return currentSpeaker;
}

/**
 * Old speaker detection (ORIGINAL algorithm)
 */
function detectSpeakerOld(
  pause: number,
  lastEndTime: number,
  currentSpeaker: 'agent' | 'customer'
): 'agent' | 'customer' {
  if (pause > 2 && lastEndTime > 0) {
    return currentSpeaker === 'agent' ? 'customer' : 'agent';
  }
  return currentSpeaker;
}

// Load existing transcript
const transcriptPath = './data/transcripts/call_1763045877947_dwf25ag.json';
const transcript = JSON.parse(fs.readFileSync(transcriptPath, 'utf-8'));

console.log('🎯 Diarization Algorithm Comparison');
console.log('===================================');
console.log(`Call ID: ${transcript.callId}`);
console.log('');

// Re-process with both algorithms
const turnsOld: TranscriptTurn[] = [];
const turnsNew: TranscriptTurn[] = [];

let currentSpeakerOld: 'agent' | 'customer' = 'agent';
let currentSpeakerNew: 'agent' | 'customer' = 'agent';
let lastEndTime = 0;
let isCallStart = true;

transcript.turns.forEach((turn: TranscriptTurn, idx: number) => {
  const pause = idx === 0 ? 0 : turn.timestamp - lastEndTime;

  // Old algorithm
  currentSpeakerOld = detectSpeakerOld(pause, lastEndTime, currentSpeakerOld);
  turnsOld.push({ ...turn, speaker: currentSpeakerOld });

  // New algorithm
  currentSpeakerNew = detectSpeakerEnhanced({
    text: turn.text,
    pause,
    lastEndTime,
    currentSpeaker: currentSpeakerNew,
    isCallStart,
  });
  turnsNew.push({ ...turn, speaker: currentSpeakerNew });

  lastEndTime = turn.timestamp + 5; // Approximate turn duration
  isCallStart = false;
});

// Calculate statistics
const oldAgent = turnsOld.filter((t) => t.speaker === 'agent').length;
const oldCustomer = turnsOld.filter((t) => t.speaker === 'customer').length;
const newAgent = turnsNew.filter((t) => t.speaker === 'agent').length;
const newCustomer = turnsNew.filter((t) => t.speaker === 'customer').length;
const total = transcript.turns.length;

console.log('📊 Speaker Distribution:');
console.log('');
console.log('OLD Algorithm (Pause-based only):');
console.log(`  Agent: ${oldAgent} (${Math.round((oldAgent / total) * 100)}%)`);
console.log(`  Customer: ${oldCustomer} (${Math.round((oldCustomer / total) * 100)}%)`);
console.log('');
console.log('NEW Algorithm (Multi-signal heuristics):');
console.log(`  Agent: ${newAgent} (${Math.round((newAgent / total) * 100)}%)`);
console.log(`  Customer: ${newCustomer} (${Math.round((newCustomer / total) * 100)}%)`);
console.log('');

// Find disagreements
let improvements = 0;
let changes = 0;

console.log('🔍 Key Improvements (First 30 changes):');
console.log('========================================');

turnsOld.forEach((oldTurn, idx) => {
  const newTurn = turnsNew[idx];
  if (oldTurn.speaker !== newTurn.speaker) {
    changes++;
    if (changes <= 30) {
      const preview = newTurn.text.substring(0, 60);
      const oldLabel = oldTurn.speaker === 'agent' ? '🎧 AGENT' : '👤 CUSTOMER';
      const newLabel = newTurn.speaker === 'agent' ? '🎧 AGENT' : '👤 CUSTOMER';

      console.log(`\n${changes}. Turn ${idx + 1}:`);
      console.log(`   Text: "${preview}${newTurn.text.length > 60 ? '...' : ''}"`);
      console.log(`   OLD: ${oldLabel} → NEW: ${newLabel}`);

      // Assess if this is likely an improvement
      const isShortAffirmation = /^(yes|yeah|okay|ok|no|my |I )/i.test(newTurn.text);
      const isLongExplanation = newTurn.text.split(/\s+/).length > 15;

      if (
        (isShortAffirmation && newTurn.speaker === 'customer') ||
        (isLongExplanation && newTurn.speaker === 'agent')
      ) {
        improvements++;
        console.log(`   ✅ Likely improvement`);
      }
    }
  }
});

console.log('');
console.log('📈 Summary:');
console.log(`  Total turns: ${total}`);
console.log(`  Speaker changes: ${changes} (${Math.round((changes / total) * 100)}%)`);
console.log(`  Likely improvements: ${improvements}`);
console.log('');
console.log(
  `🎯 Estimated accuracy gain: +${Math.round((improvements / total) * 100)}% correct labels`
);
