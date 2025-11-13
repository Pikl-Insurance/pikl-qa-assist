import Anthropic from '@anthropic-ai/sdk';
import type { Transcript, Analysis, QAScores, CallType, ComplianceIssue } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Claude Sonnet 4.5 model
const MODEL = 'claude-sonnet-4-5-20250929';

interface ClaudeAnalysisResponse {
  callType: CallType;
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
  outcomeMetrics: {
    quotesCompleted: number;
    salesCompleted: number;
    renewalsCompleted: number;
  };
  complianceIssues: ComplianceIssue[];
}

/**
 * Analyze a transcript using Claude Sonnet 4.5
 * Evaluates 8 core QA dimensions + 6 UK compliance dimensions and provides coaching recommendations
 * with full UK regulatory compliance checks (FCA, ICOBS, GDPR, IDD, DISP)
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
      callType: parsedAnalysis.callType,
      overallScore: parsedAnalysis.overallScore,
      scores: parsedAnalysis.scores,
      keyMoments: validatedKeyMoments,
      coachingRecommendations: parsedAnalysis.coachingRecommendations,
      summary: parsedAnalysis.summary,
      callOutcome: parsedAnalysis.callOutcome,
      outcomeMetrics: parsedAnalysis.outcomeMetrics,
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
 * Create comprehensive analysis prompt for Claude with UK compliance requirements
 */
function createAnalysisPrompt(formattedTranscript: string): string {
  return `You are an expert Quality Assurance analyst for UK insurance call centers operating as brokers and MGAs.

REGULATORY CONTEXT (UK Insurance):
This analysis is for a UK-based insurance broker and MGA (Managing General Agent) operating under:
- Financial Conduct Authority (FCA) regulation
- Insurance Conduct of Business Sourcebook (ICOBS)
- Insurance Distribution Directive (IDD) UK implementation
- UK General Data Protection Regulation (GDPR) and Data Protection Act 2018
- Senior Managers and Certification Regime (SM&CR)

The agent MUST comply with:
1. FCA Principle 6: Treating Customers Fairly (TCF)
2. ICOBS mandatory disclosures and conduct rules
3. GDPR data protection requirements
4. DISP complaints handling procedures
5. IDD sales process requirements (for advised sales)

${formattedTranscript}

**SCORING PHILOSOPHY:**

FOR GENERAL QA DIMENSIONS (#1-8: Rapport, Needs Discovery, Product Knowledge, Objection Handling, Closing, Compliance, Professionalism, Follow-Up):
- **8/10 is the EXPECTED STANDARD** for a competent agent doing their job properly
- **Only score below 8** if there is SPECIFIC, CLEAR evidence of a gap or deficiency
- **Be generous** - if the agent is performing their role adequately, they deserve 8/10
- **9/10** = Agent exceeds expectations in meaningful ways (e.g., exceptional empathy, creative problem-solving, builds outstanding rapport)
- **10/10** = Exemplary, best-in-class performance that should be used as a training example
- **7/10** = Noticeable gap that needs coaching (e.g., missed opportunity, awkward phrasing, incomplete explanation)
- **6/10 or below** = Significant performance issue requiring immediate attention

**IMPORTANT**: For scores 7-9, ALWAYS include specific "Path to Excellence" guidance showing:
- What the agent did well
- Exactly what would elevate them to the next score level
- A concrete example script or action

FOR UK COMPLIANCE DIMENSIONS (#9-14):
- **10/10 = FULL COMPLIANCE** - all regulatory requirements met
- **9/10** = Fully compliant with very minor process improvements possible
- **8/10** = Compliant with minor gaps that don't breach regulations
- **7/10 or below** = Compliance gap or regulatory breach requiring immediate remediation
- **Be strict but fair** - compliance is non-negotiable, but interpret regulations practically
- Only flag actual breaches, not overly pedantic interpretations

Please analyze this call across the following dimensions, scoring each from 0-10:

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

**UK COMPLIANCE DIMENSIONS** (Critical for regulatory adherence):

9. **Call Opening Compliance** (callOpeningCompliance): 0-10
   - 10: Perfect - All required elements present for this call type
   - 9: Fully compliant with minor procedural enhancement possible
   - 8: Compliant with one minor omission that doesn't breach regulations
   - 7 or below: Compliance gap requiring remediation

   Required Elements (ALL CALLS):
   ✅ Firm identification (company name, regulatory status)
   ✅ Call recording disclosure ("this call is being recorded")

   **GDPR Privacy Notice - CALL TYPE SPECIFIC**:

   FOR NEW BUSINESS SALES CALLS:
   ✅ FULL GDPR notice required
   - Must state: data collection purpose, customer rights (access/rectification/erasure), retention period
   - Example: "We collect your personal data for insurance purposes. You have the right to access, correct, or delete your data. For our full privacy policy, visit our website or ask us to send it."

   FOR RENEWAL CALLS:
   ✅ ABBREVIATED notice acceptable
   - Must acknowledge data already held: "This is a renewal, we already have your details on file"
   - Or brief reference: "Your data is held in accordance with our privacy policy"
   - Full notice NOT required (customer relationship already established)

   FOR EXISTING CUSTOMER SERVICE CALLS:
   ✅ Brief acknowledgment acceptable
   - "Your data is held in accordance with our privacy policy"
   - Or simply proceed if customer initiated the call

   **Scoring guidance**: Do NOT penalize renewals or service calls for not providing full GDPR notice. This is practical compliance.

   Evidence to find:
   - "Pikl Insurance" or company name mentioned
   - "Authorized and regulated by the FCA" or regulatory status
   - "This call is being recorded" or similar phrase
   - "For quality assurance and regulatory purposes" or similar
   - GDPR notice appropriate for call type (see above)

10. **Data Protection Compliance** (dataProtectionCompliance): 0-10
    - 10: Perfect - Identity verified BEFORE accessing any policy data
    - 7-9: Good - Verification done but minor procedural gaps
    - 4-6: Adequate - Verification attempted but incomplete
    - 0-3: CRITICAL - No verification OR accessed data without consent

    Required Elements:
    ✅ DPA verification conducted (name + date of birth minimum)
    ✅ Verification completed BEFORE accessing policy details
    ✅ Lawful basis for processing communicated
    ✅ Sensitive data handled securely

    **CRITICAL BREACH**: If agent accesses policy data before DPA verification, score = 0

11. **Mandatory Disclosures** (mandatoryDisclosures): 0-10
    - 10: Perfect - All required disclosures made clearly
    - 7-9: Good - Most disclosures made, minor gaps
    - 4-6: Adequate - Some disclosures made
    - 0-3: Poor - Critical disclosures missing

    Required Disclosures:
    ✅ Service type (advised vs non-advised)
    ✅ Remuneration (commission vs fee) if relevant
    ✅ Complaints procedure and Financial Ombudsman Service (FOS) rights
    ✅ Cooling-off rights (14-day cancellation for new business)
    ✅ Price breakdown (premium + IPT + fees)

12. **Treating Customers Fairly (TCF)** (tcfCompliance): 0-10
    - 10: Excellent - Customer treated fairly throughout, no pressure
    - 7-9: Good - Fair treatment, minor areas for improvement
    - 4-6: Adequate - Mostly fair but some concerns
    - 0-3: Poor - Pressure selling, unfair tactics, misleading information

    **CRITICAL BREACH**: If pressure selling detected, score ≤ 3

13. **Sales Process Compliance** (salesProcessCompliance): 0-10 or null (if not a sales call)
    - 10: Perfect - All sales process requirements met
    - 7-9: Good - Most requirements met, minor gaps
    - 4-6: Adequate - Basic process followed, gaps exist
    - 0-3: Poor - Critical process failures
    - null: Not applicable (not a sales call)

    Required for Sales Calls:
    ✅ Needs assessment conducted
    ✅ Product suitability explained
    ✅ Product information provided or confirmed sent
    ✅ Price clearly explained with breakdown
    ✅ Cooling-off rights explained (14 days)

14. **Complaints Handling** (complaintsHandling): 0-10 or null (if no complaint)
    - 10: Perfect - Complaint handled per DISP requirements
    - 7-9: Good - Most requirements met, minor gaps
    - 4-6: Adequate - Basic handling, improvements needed
    - 0-3: Poor - Complaint ignored, discouraged, or mishandled
    - null: Not applicable (no complaint in call)

    Required for Complaints:
    ✅ Complaint recognized and acknowledged
    ✅ Logged immediately with reference number provided
    ✅ 8-week timeline mentioned
    ✅ FOS rights mentioned

    **CRITICAL BREACH**: If complaint discouraged or dismissed, score ≤ 3

**CALL TYPE IDENTIFICATION:**
First, identify the primary call type:
1. NEW BUSINESS SALES - Customer purchasing new insurance
2. RENEWALS - Customer renewing existing policy
3. MID-TERM ADJUSTMENT (MTA) - Changes to existing policy
4. CLAIMS INQUIRY / FNOL - Customer calling about a claim
5. COMPLAINTS - Customer making a formal complaint
6. GENERAL INQUIRY - Information requests, policy servicing

Additionally, identify:
- **Call Type**: Identify and return as callType field (one of: "new_business_sales", "renewals", "mid_term_adjustment", "claims_inquiry", "complaints", "general_inquiry")
- **Key Moments**: 10-15 specific moments spread across ALL dimensions INCLUDING the UK compliance dimensions. Each moment must:
  - Include the exact dimension category (rapport, needsDiscovery, productKnowledge, objectionHandling, closing, compliance, professionalism, followUp, callOpeningCompliance, dataProtectionCompliance, mandatoryDisclosures, tcfCompliance, salesProcessCompliance, complaintsHandling)
  - Have a precise timestamp in seconds matching the transcript
  - **CRITICAL**: Include an EXACT, VERBATIM quote copied directly from the transcript - DO NOT paraphrase, summarize, or infer dialogue
  - The quote must be a direct copy-paste from the transcript text, not a summary or interpretation
  - If you cannot find an exact quote, skip that moment rather than inventing dialogue
  - Be marked as positive, negative, or neutral
  - Provide context for why this moment matters for that dimension
  - **COMPLIANCE MOMENTS REQUIRED**: At LEAST 2 moments must be compliance-related (from the 6 UK compliance sub-dimensions)
  - Flag critical compliance breaches as NEGATIVE moments
  - Highlight excellent compliance practices as POSITIVE moments
- **Call Outcome**: Brief description of how the call ended (e.g., "Sale closed", "Follow-up scheduled", "Customer declined")
- **Outcome Metrics**: Quantifiable outcomes from the call:
  - quotesCompleted: Number of insurance quotes provided (0, 1, 2, etc.)
  - salesCompleted: Number of policies sold (0 or 1)
  - renewalsCompleted: Number of policy renewals completed (0 or 1)
- **Coaching Recommendations**: 3-5 specific, actionable coaching points for the agent (prioritize compliance issues first)

  **IMPORTANT - "Path to Excellence" for scores 7-9**:
  For ANY dimension scored 7, 8, or 9, you MUST include coaching that explains:
  - What the agent did well in this area
  - Exactly what would elevate them to the next score level (e.g., from 7→8, 8→9, 9→10)
  - A concrete example script or action they can take

  Example coaching for 8/10 Rapport:
  "Great job building rapport by using the customer's name and showing empathy. To reach 9/10, try incorporating more personalized conversation based on the customer's specific situation. For example: 'I can hear that having reliable cover for your business is really important to you, especially with your expansion plans. Let me make sure we get this exactly right for you.'"
- **Compliance Issues**: Any compliance violations or concerns. For each issue provide:
  - severity: "critical" | "high" | "medium" | "low"
  - category: Which compliance sub-dimension (e.g., "dataProtectionCompliance", "mandatoryDisclosures")
  - issue: Clear description of the violation
  - regulatoryReference: Which regulation was breached (e.g., "ICOBS 4.2.1R", "GDPR Article 13", "FCA PRIN 6")
  - timestamp: When the issue occurred in seconds (null if not timestamp-specific)
  - remediation: **ENHANCED FORMAT** - Provide detailed remediation in this structure:
    * **What the law requires**: Quote or paraphrase the exact legal requirement
    * **What to say**: Provide a compliant script example the agent should use
    * **Why it matters**: Brief explanation of the customer protection this provides

    Example remediation format:
    "GDPR Article 13 requires a privacy notice at first contact. Agent must state: 'We collect and process your personal data for insurance purposes. You have the right to access, correct, or delete your data. For our full privacy policy, visit [website] or ask us to send it by post.' This ensures customers understand their data rights before sharing sensitive information."

  **Severity Definitions**:
  - CRITICAL: Regulatory breach with high risk (e.g., no DPA verification before accessing data, pressure selling, misleading information, complaint discouraged)
  - HIGH: Significant compliance gap (e.g., missing mandatory disclosures, no cooling-off rights explained, inadequate needs assessment)
  - MEDIUM: Procedural gap (e.g., incomplete needs discovery, unclear pricing breakdown)
  - LOW: Best practice opportunity (e.g., could explain product features more clearly)

  Return empty array [] if NO compliance issues found.
- **Summary**: 2-3 sentence overall summary of the call

Respond in the following JSON format (and ONLY JSON, no markdown formatting):

{
  "callType": "new_business_sales",
  "overallScore": 7.5,
  "scores": {
    "rapport": 8,
    "needsDiscovery": 7,
    "productKnowledge": 9,
    "objectionHandling": 6,
    "closing": 7,
    "compliance": 9,
    "professionalism": 8,
    "followUp": 7,
    "callOpeningCompliance": 8,
    "dataProtectionCompliance": 9,
    "mandatoryDisclosures": 6,
    "tcfCompliance": 8,
    "salesProcessCompliance": 7,
    "complaintsHandling": null
  },
  "keyMoments": [
    {
      "timestamp": 5,
      "type": "positive",
      "category": "callOpeningCompliance",
      "description": "Agent clearly stated call recording disclosure and GDPR notice",
      "quote": "Good morning, this is Sarah from Pikl Insurance. This call is being recorded for quality assurance. We process your personal data to provide insurance services."
    },
    {
      "timestamp": 45,
      "type": "positive",
      "category": "rapport",
      "description": "Agent showed empathy for customer's situation",
      "quote": "I completely understand how frustrating that must be for you"
    }
  ],
  "coachingRecommendations": [
    "CRITICAL: Explain cooling-off rights (14 days) when selling new policies - required by ICOBS 7.1.4R",
    "Provide clear price breakdown including premium, IPT, and fees separately",
    "Practice more probing questions during needs discovery phase"
  ],
  "summary": "Agent demonstrated good product knowledge and rapport but missed mandatory disclosures for cooling-off rights and price breakdown.",
  "callOutcome": "Sale completed - customer purchased buildings and contents policy",
  "outcomeMetrics": {
    "quotesCompleted": 1,
    "salesCompleted": 1,
    "renewalsCompleted": 0
  },
  "complianceIssues": [
    {
      "severity": "high",
      "category": "mandatoryDisclosures",
      "issue": "Agent did not explain 14-day cooling-off period for new policy",
      "regulatoryReference": "ICOBS 7.1.4R",
      "timestamp": null,
      "remediation": "ICOBS 7.1.4R requires insurers to inform customers of their cancellation rights. Agent must state: 'You have 14 days from your policy start date to cancel for a full refund if you change your mind. This is called your cooling-off period.' This ensures customers know they can cancel without penalty if they're not satisfied."
    }
  ]
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
      callType: parsed.callType || 'general_inquiry',
      overallScore: parsed.overallScore || 0,
      scores: {
        // Core QA dimensions
        rapport: parsed.scores?.rapport || 0,
        needsDiscovery: parsed.scores?.needsDiscovery || 0,
        productKnowledge: parsed.scores?.productKnowledge || 0,
        objectionHandling: parsed.scores?.objectionHandling || 0,
        closing: parsed.scores?.closing || 0,
        compliance: parsed.scores?.compliance || 0,
        professionalism: parsed.scores?.professionalism || 0,
        followUp: parsed.scores?.followUp || 0,
        // UK Compliance sub-dimensions
        callOpeningCompliance: parsed.scores?.callOpeningCompliance || 0,
        dataProtectionCompliance: parsed.scores?.dataProtectionCompliance || 0,
        mandatoryDisclosures: parsed.scores?.mandatoryDisclosures || 0,
        tcfCompliance: parsed.scores?.tcfCompliance || 0,
        salesProcessCompliance: parsed.scores?.salesProcessCompliance ?? null,
        complaintsHandling: parsed.scores?.complaintsHandling ?? null,
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
      complianceIssues: Array.isArray(parsed.complianceIssues) ? parsed.complianceIssues : [],
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
 * Corrects timestamps to match actual quote location and filters out hallucinated quotes
 */
function validateQuotes(keyMoments: any[], transcript: Transcript): any[] {
  return keyMoments
    .map((moment) => {
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

      let bestMatch: { turn: any; matchedWords: number } | null = null;

      for (const turn of relevantTurns) {
        const turnWords = turn.text.toLowerCase().split(/\s+/);
        let matchedWords = 0;

        for (const word of quoteWords) {
          if (turnWords.some((tw) => tw.includes(word) || word.includes(tw))) {
            matchedWords++;
          }
        }

        if (matchedWords >= minMatchWords) {
          // Track the best match (highest word overlap)
          if (!bestMatch || matchedWords > bestMatch.matchedWords) {
            bestMatch = { turn, matchedWords };
          }
        }
      }

      if (bestMatch) {
        // Quote verified - update timestamp to actual location
        const correctedTimestamp = bestMatch.turn.timestamp;
        if (correctedTimestamp !== timestamp) {
          console.log(
            `[ANALYSIS VALIDATION] Corrected timestamp for quote from ${Math.floor(timestamp / 60)}:${String(Math.floor(timestamp % 60)).padStart(2, '0')} to ${Math.floor(correctedTimestamp / 60)}:${String(Math.floor(correctedTimestamp % 60)).padStart(2, '0')} - "${quote.substring(0, 50)}..."`
          );
        }
        return { ...moment, timestamp: correctedTimestamp };
      }

      // Quote could not be verified - log and filter out
      console.warn(
        `[ANALYSIS VALIDATION] Filtered out potentially hallucinated quote at ${Math.floor(timestamp / 60)}:${String(Math.floor(timestamp % 60)).padStart(2, '0')} - "${quote.substring(0, 50)}..."`
      );
      return null;
    })
    .filter((moment) => moment !== null); // Remove nulls (unverified quotes)
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
