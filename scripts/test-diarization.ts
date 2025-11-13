import { transcribeAudio } from '@/lib/whisper-service';
import fs from 'fs/promises';

/**
 * Test script to re-transcribe a specific call and compare diarization
 */
async function testDiarization() {
  const callId = 'call_1763045877947_dwf25ag';
  const audioFilePath = `./data/audio/${callId}.wav`;

  console.log('🎯 Testing Enhanced Diarization');
  console.log('================================');
  console.log(`Call ID: ${callId}`);
  console.log('');

  try {
    // Check if audio file exists
    await fs.access(audioFilePath);

    console.log('⏳ Transcribing with enhanced diarization...');
    const transcript = await transcribeAudio(audioFilePath, callId);

    console.log('✅ Transcription complete!');
    console.log('');
    console.log('📊 Speaker Distribution:');

    // Count speaker turns
    const agentTurns = transcript.turns.filter((t) => t.speaker === 'agent').length;
    const customerTurns = transcript.turns.filter((t) => t.speaker === 'customer').length;
    const totalTurns = transcript.turns.length;

    console.log(`  Agent turns: ${agentTurns} (${Math.round((agentTurns / totalTurns) * 100)}%)`);
    console.log(
      `  Customer turns: ${customerTurns} (${Math.round((customerTurns / totalTurns) * 100)}%)`
    );
    console.log(`  Total turns: ${totalTurns}`);
    console.log('');

    // Show first 20 turns for comparison
    console.log('📝 First 20 turns:');
    console.log('==================');
    transcript.turns.slice(0, 20).forEach((turn, idx) => {
      const speaker = turn.speaker === 'agent' ? '🎧 AGENT' : '👤 CUSTOMER';
      const preview = turn.text.substring(0, 80);
      console.log(`${idx + 1}. ${speaker}: ${preview}${turn.text.length > 80 ? '...' : ''}`);
    });

    // Save updated transcript
    const transcriptPath = `./data/transcripts/${callId}.json`;
    await fs.writeFile(transcriptPath, JSON.stringify(transcript, null, 2));
    console.log('');
    console.log(`💾 Saved updated transcript to: ${transcriptPath}`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testDiarization();
