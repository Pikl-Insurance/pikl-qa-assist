import Anthropic from '@anthropic-ai/sdk';
import type { Transcript, Analysis, QAScores } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Claude Sonnet 4.5 model
const MODEL = 'claude-sonnet-4-5-20250929';

interface ClaudeAnalysisResponse {
  overallScore: number;
  scores: QAScores;
  keyMoments: Array<{
    timestamp: number;
    type: 'positive' | 'negative' | 'neutral';
    category: string;
    description: string;
    quote: string;
  }>;
  coachingRecommendations: string[];
  summary: string;
  callOutcome: string;
  complianceIssues?: string[];
}

/**
 * Analyze a transcript using Claude 3.5 Sonnet
 * Evaluates 8 QA dimensions and provides coaching recommendations
 */
export async function analyzeTranscript(transcript: Transcript): Promise<Analysis> {
  const startTime = Date.now();

  try {
    // Format transcript for Claude
    const formattedTranscript = formatTranscriptForAnalysis(transcript);

    // Create the analysis prompt
    const prompt = createAnalysisPrompt(formattedTranscript);

    // Call Claude API
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      temperature: 0.3, // Lower temperature for more consistent scoring
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Parse Claude's response
    const analysisText = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsedAnalysis = parseClaudeResponse(analysisText);

    const processingTime = Date.now() - startTime;

    // Construct final analysis object
    // Validate quotes against transcript before returning
    const validatedKeyMoments = validateQuotes(parsedAnalysis.keyMoments, transcript);

    const analysis: Analysis = {
      callId: transcript.callId,
      overallScore: parsedAnalysis.overallScore,
      scores: parsedAnalysis.scores,
      keyMoments: validatedKeyMoments,
      coachingRecommendations: parsedAnalysis.coachingRecommendations,
      summary: parsedAnalysis.summary,
      callOutcome: parsedAnalysis.callOutcome,
      complianceIssues: parsedAnalysis.complianceIssues,
      processingTime,
    };

    return analysis;
  } catch (error) {
    console.error('Claude analysis error:', error);
    throw new Error(`Failed to analyze transcript: ${(error as Error).message}`);
  }
}

/**
 * Format transcript into a readable format for Claude
 */
function formatTranscriptForAnalysis(transcript: Transcript): string {
  const lines: string[] = [];

  lines.push(`Call Duration: ${Math.floor(transcript.durationSeconds / 60)}m ${Math.floor(transcript.durationSeconds % 60)}s`);
  lines.push(`Language: ${transcript.language || 'Unknown'}`);
  lines.push('');
  lines.push('TRANSCRIPT:');
  lines.push('---');
  lines.push('');

  transcript.turns.forEach((turn) => {
    const timestamp = formatTimestamp(turn.timestamp);
    const speaker = turn.speaker === 'agent' ? 'AGENT' : 'CUSTOMER';
    lines.push(`[${timestamp}] ${speaker}: ${turn.text}`);
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

/**
 * Create comprehensive analysis prompt for Claude
 */
function createAnalysisPrompt(formattedTranscript: string): string {
  return `You are an expert Quality Assurance analyst for customer service and sales calls. Analyze the following call transcript and provide a comprehensive QA evaluation.

${formattedTranscript}

Please analyze this call across the following 8 dimensions, scoring each from 0-10:

1. **Rapport Building** (rapport): How well did the agent establish connection and trust with the customer?
   - 8-10: Excellent rapport, warm and personable, builds strong connection
   - 5-7: Adequate rapport, professional but somewhat distant
   - 0-4: Poor rapport, cold or impersonal interaction

2. **Needs Discovery** (needsDiscovery): How effectively did the agent identify customer needs and pain points?
   - 8-10: Thorough discovery, asked probing questions, uncovered key needs
   - 5-7: Basic discovery, identified some needs but missed opportunities
   - 0-4: Poor discovery, failed to understand customer needs

3. **Product Knowledge** (productKnowledge): How well did the agent demonstrate understanding of products/services?
   - 8-10: Expert knowledge, confident explanations, handled complex questions
   - 5-7: Adequate knowledge, answered most questions correctly
   - 0-4: Poor knowledge, gave incorrect or incomplete information

4. **Objection Handling** (objectionHandling): How effectively did the agent address concerns and objections?
   - 8-10: Excellent handling, addressed concerns thoroughly, turned objections into opportunities
   - 5-7: Adequate handling, addressed concerns but lacked confidence
   - 0-4: Poor handling, avoided or dismissed objections

5. **Closing Techniques** (closing): How well did the agent move toward a resolution or next step?
   - 8-10: Strong close, clear next steps, gained commitment
   - 5-7: Adequate close, some next steps but lacked clarity
   - 0-4: Weak or no close, left customer uncertain

6. **Compliance** (compliance): Did the agent follow required scripts, disclosures, and legal requirements?
   - 8-10: Full compliance, all required elements covered
   - 5-7: Mostly compliant, minor omissions
   - 0-4: Non-compliant, missed critical requirements

7. **Professionalism** (professionalism): How professional was the agent's communication and demeanor?
   - 8-10: Highly professional, polished communication, appropriate tone
   - 5-7: Adequately professional, occasional lapses
   - 0-4: Unprofessional behavior or communication

8. **Follow-Up** (followUp): How well did the agent set expectations for next steps and follow-up?
   - 8-10: Clear follow-up plan, documented action items, set expectations
   - 5-7: Basic follow-up, some next steps mentioned
   - 0-4: No follow-up plan or unclear next steps

Additionally, identify:
- **Key Moments**: 8-12 specific moments spread across ALL 8 dimensions above. Each moment must:
  - Include the exact dimension category (rapport, needsDiscovery, productKnowledge, objectionHandling, closing, compliance, professionalism, followUp)
  - Have a precise timestamp in seconds matching the transcript
  - **CRITICAL**: Include an EXACT, VERBATIM quote copied directly from the transcript - DO NOT paraphrase, summarize, or infer dialogue
  - The quote must be a direct copy-paste from the transcript text, not a summary or interpretation
  - If you cannot find an exact quote, skip that moment rather than inventing dialogue
  - Be marked as positive, negative, or neutral
  - Provide context for why this moment matters for that dimension
  - TRY TO INCLUDE AT LEAST ONE MOMENT FOR EACH OF THE 8 DIMENSIONS
- **Call Outcome**: Brief description of how the call ended (e.g., "Sale closed", "Follow-up scheduled", "Customer declined")
- **Outcome Metrics**: Quantifiable outcomes from the call:
  - quotesCompleted: Number of insurance quotes provided (0, 1, 2, etc.)
  - salesCompleted: Number of policies sold (0 or 1)
  - renewalsCompleted: Number of policy renewals completed (0 or 1)
- **Coaching Recommendations**: 3-5 specific, actionable coaching points for the agent
- **Compliance Issues**: Any compliance violations or concerns with severity level (minor/moderate/critical), description, and timestamp (empty array if none)
- **Summary**: 2-3 sentence overall summary of the call

Respond in the following JSON format (and ONLY JSON, no markdown formatting):

{
  "overallScore": 7.5,
  "scores": {
    "rapport": 8,
    "needsDiscovery": 7,
    "productKnowledge": 9,
    "objectionHandling": 6,
    "closing": 7,
    "compliance": 9,
    "professionalism": 8,
    "followUp": 7
  },
  "keyMoments": [
    {
      "timestamp": 45,
      "type": "positive",
      "category": "rapport",
      "description": "Agent showed empathy for customer's situation",
      "quote": "I completely understand how frustrating that must be for you"
    }
  ],
  "coachingRecommendations": [
    "Practice more probing questions during needs discovery phase",
    "Work on confidence when handling price objections"
  ],
  "summary": "Agent successfully closed the sale with strong product knowledge. Could improve objection handling and needs discovery.",
  "callOutcome": "Sale closed - customer purchased premium package",
  "outcomeMetrics": {
    "quotesCompleted": 1,
    "salesCompleted": 1,
    "renewalsCompleted": 0
  },
  "complianceIssues": []
}`;
}

/**
 * Parse Claude's JSON response into typed analysis object
 */
function parseClaudeResponse(responseText: string): ClaudeAnalysisResponse {
  try {
    // Remove markdown code blocks if present
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    // Extract JSON from response - find first { and last }
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('No JSON object found in response');
    }

    jsonText = jsonText.substring(firstBrace, lastBrace + 1);

    const parsed = JSON.parse(jsonText);

    // Validate and set defaults
    const analysis: ClaudeAnalysisResponse = {
      overallScore: parsed.overallScore || 0,
      scores: {
        rapport: parsed.scores?.rapport || 0,
        needsDiscovery: parsed.scores?.needsDiscovery || 0,
        productKnowledge: parsed.scores?.productKnowledge || 0,
        objectionHandling: parsed.scores?.objectionHandling || 0,
        closing: parsed.scores?.closing || 0,
        compliance: parsed.scores?.compliance || 0,
        professionalism: parsed.scores?.professionalism || 0,
        followUp: parsed.scores?.followUp || 0,
      },
      keyMoments: parsed.keyMoments || [],
      coachingRecommendations: parsed.coachingRecommendations || [],
      summary: parsed.summary || 'No summary provided',
      callOutcome: parsed.callOutcome || 'Unknown outcome',
      outcomeMetrics: parsed.outcomeMetrics || {
        quotesCompleted: 0,
        salesCompleted: 0,
        renewalsCompleted: 0,
      },
      complianceIssues: parsed.complianceIssues || [],
    };

    return analysis;
  } catch (error) {
    console.error('Failed to parse Claude response:', error);
    console.error('Raw response:', responseText);
    throw new Error('Failed to parse analysis response from Claude');
  }
}

/**
 * Validate that quotes in key moments actually exist in the transcript
 * Filters out hallucinated quotes to ensure data reliability
 */
function validateQuotes(keyMoments: any[], transcript: Transcript): any[] {
  return keyMoments.filter((moment) => {
    const { timestamp, quote } = moment;

    // Find turns within +/- 30 seconds of the timestamp
    const relevantTurns = transcript.turns.filter(
      (turn) => Math.abs(turn.timestamp - timestamp) <= 30
    );

    // Check if quote exists in any of the relevant turns (fuzzy match)
    // Extract significant words (length > 3) for matching
    const quoteWords = quote
      .toLowerCase()
      .split(/\s+/)
      .filter((w: string) => w.length > 3);
    const minMatchWords = Math.max(3, Math.floor(quoteWords.length * 0.6)); // At least 60% of words should match

    for (const turn of relevantTurns) {
      const turnWords = turn.text.toLowerCase().split(/\s+/);
      let matchedWords = 0;

      for (const word of quoteWords) {
        if (turnWords.some((tw) => tw.includes(word) || word.includes(tw))) {
          matchedWords++;
        }
      }

      if (matchedWords >= minMatchWords) {
        return true; // Quote verified
      }
    }

    // Quote could not be verified - log and filter out
    console.warn(
      `[ANALYSIS VALIDATION] Filtered out potentially hallucinated quote at ${Math.floor(timestamp / 60)}:${Math.floor(timestamp % 60)} - "${quote.substring(0, 50)}..."`
    );
    return false;
  });
}

/**
 * Estimate analysis cost for a transcript
 * @param transcript - Transcript to analyze
 * @returns Estimated cost in USD
 */
export function estimateAnalysisCost(transcript: Transcript): number {
  // Rough estimate: ~1.5 tokens per word
  const transcriptWords = transcript.turns.reduce(
    (sum, turn) => sum + turn.text.split(' ').length,
    0
  );
  const promptWords = 800; // Approximate system prompt + instructions
  const totalWords = transcriptWords + promptWords;
  const inputTokens = Math.ceil(totalWords * 1.5);

  // Estimated output: ~1000 tokens for comprehensive analysis
  const outputTokens = 1000;

  // Claude Sonnet 4.5 pricing: $3/MTok input, $15/MTok output
  const inputCost = (inputTokens / 1_000_000) * 3;
  const outputCost = (outputTokens / 1_000_000) * 15;

  return inputCost + outputCost;
}

/**
 * Format analysis as human-readable text
 */
export function formatAnalysisAsText(analysis: Analysis): string {
  const lines: string[] = [];

  lines.push('='.repeat(80));
  lines.push('QA ANALYSIS REPORT');
  lines.push('='.repeat(80));
  lines.push('');
  lines.push(`Call ID: ${analysis.callId}`);
  lines.push(`Overall Score: ${analysis.overallScore.toFixed(1)}/10`);
  lines.push('');

  lines.push('DIMENSIONAL SCORES:');
  lines.push('-'.repeat(80));
  Object.entries(analysis.scores).forEach(([dimension, score]) => {
    const label = dimension.replace(/([A-Z])/g, ' $1').trim();
    const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
    lines.push(`${capitalizedLabel.padEnd(25)} ${score.toFixed(1)}/10`);
  });
  lines.push('');

  lines.push('SUMMARY:');
  lines.push('-'.repeat(80));
  lines.push(analysis.summary);
  lines.push('');

  lines.push(`CALL OUTCOME: ${analysis.callOutcome}`);
  lines.push('');

  if (analysis.keyMoments.length > 0) {
    lines.push('KEY MOMENTS:');
    lines.push('-'.repeat(80));
    analysis.keyMoments.forEach((moment, idx) => {
      const timestamp = formatTimestamp(moment.timestamp);
      const typeEmoji = moment.type === 'positive' ? '✅' : moment.type === 'negative' ? '❌' : '➖';
      lines.push(`${idx + 1}. [${timestamp}] ${typeEmoji} ${moment.category.toUpperCase()}`);
      lines.push(`   ${moment.description}`);
      lines.push(`   "${moment.quote}"`);
      lines.push('');
    });
  }

  if (analysis.coachingRecommendations.length > 0) {
    lines.push('COACHING RECOMMENDATIONS:');
    lines.push('-'.repeat(80));
    analysis.coachingRecommendations.forEach((rec, idx) => {
      lines.push(`${idx + 1}. ${rec}`);
    });
    lines.push('');
  }

  if (analysis.complianceIssues && analysis.complianceIssues.length > 0) {
    lines.push('⚠️  COMPLIANCE ISSUES:');
    lines.push('-'.repeat(80));
    analysis.complianceIssues.forEach((issue, idx) => {
      lines.push(`${idx + 1}. ${issue}`);
    });
    lines.push('');
  }

  lines.push(`Processing Time: ${Math.floor(analysis.processingTime! / 1000)}s`);

  return lines.join('\n');
}
