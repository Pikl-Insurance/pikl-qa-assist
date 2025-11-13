# Diarization Issues Analysis

## Problem Summary

Call `call_1763045877947_dwf25ag` shows poor speaker diarization - almost all turns are labeled as "agent" when clearly there are customer responses throughout.

## Current Diarization Logic

Located in `src/lib/whisper-service.ts` (lines 58-79):

```typescript
// Simple speaker diarization heuristic:
// - Alternating speakers based on pauses
// - First speaker is assumed to be agent
let currentSpeaker: 'agent' | 'customer' = 'agent';
let lastEndTime = 0;

response.segments.forEach((segment: any) => {
  // If there's a significant pause (>2 seconds), assume speaker change
  const pause = segment.start - lastEndTime;
  if (pause > 2 && lastEndTime > 0) {
    currentSpeaker = currentSpeaker === 'agent' ? 'customer' : 'agent';
  }

  turns.push({
    speaker: currentSpeaker,
    text: segment.text.trim(),
    timestamp: segment.start,
    confidence: 1 - (segment.no_speech_prob || 0),
  });

  lastEndTime = segment.end;
});
```

## Identified Gaps

### 1. **Naive Pause-Based Detection**
- **Current**: Only switches speaker if pause > 2 seconds
- **Problem**: In natural conversation, speakers don't always pause 2+ seconds
- **Example from call**: Agent asks question, customer immediately responds "Yes" - no 2-second pause
- **Result**: Customer response labeled as agent

### 2. **No Voice Characteristic Analysis**
- Whisper API doesn't provide speaker embeddings or voice characteristics
- We're not analyzing pitch, tone, or voice signature
- Can't distinguish speakers by vocal features

### 3. **No Utterance Length Heuristics**
- Short utterances like "Yes", "Okay", "My second" are likely customer responses
- We don't use text length as a signal

### 4. **No Context-Aware Detection**
- Phrases like "Hiya, it's just Callum calling from Pickle" are clearly agent
- Questions vs answers pattern not considered
- We don't analyze conversational flow

### 5. **Fixed First Speaker Assumption**
- Always assumes first speaker is agent
- Works for outbound calls, may fail for inbound

## Impact on QA Analysis

Poor diarization cascades into QA scoring issues:

1. **Rapport Scoring**: Can't accurately measure agent's tone if customer speech is mixed in
2. **Needs Discovery**: Can't identify customer's actual statements vs agent's questions
3. **Objection Handling**: Can't detect when customer raises objections
4. **Compliance**: May miss customer confirmations or lack thereof
5. **Key Moments**: Many "quotes" in analysis are misattributed

## Possible Solutions

### Option 1: Improve Heuristic Algorithm (Quick Win)
**Effort**: Low | **Accuracy Gain**: +10-20%

Enhanced logic using multiple signals:
```typescript
function detectSpeaker(segment, context) {
  const signals = {
    pauseBefore: segment.start - context.lastEndTime,
    textLength: segment.text.length,
    hasQuestionMark: segment.text.includes('?'),
    startsWithGreeting: /^(hello|hi|hey|good morning)/i.test(segment.text),
    isShortResponse: segment.text.split(' ').length < 5,
    containsAffirmation: /^(yes|yeah|okay|ok|no|sure|right)\b/i.test(segment.text),
  };

  // Score-based approach
  let agentScore = 0;

  if (signals.pauseBefore > 2) agentScore -= 2; // Likely speaker change
  if (signals.textLength > 100) agentScore += 1; // Agents talk more
  if (signals.hasQuestionMark) agentScore += 1; // Agents ask questions
  if (signals.startsWithGreeting && context.isCallStart) agentScore += 3;
  if (signals.isShortResponse) agentScore -= 2; // Likely customer
  if (signals.containsAffirmation) agentScore -= 3; // Very likely customer

  return agentScore > 0 ? 'agent' : 'customer';
}
```

**Pros**:
- Quick to implement
- No additional API costs
- Immediate improvement

**Cons**:
- Still heuristic-based
- Won't be 100% accurate
- May need tuning per call type

### Option 2: Use Pyannote Audio (Recommended)
**Effort**: Medium | **Accuracy Gain**: +40-60%

Pyannote is a neural speaker diarization toolkit specifically designed for this.

**Implementation**:
1. Install Python microservice: `pyannote/speaker-diarization`
2. Process audio through Pyannote before Whisper
3. Get speaker segments with labels (SPEAKER_00, SPEAKER_01)
4. Map Whisper transcription to Pyannote segments
5. Assign SPEAKER_00 = agent, SPEAKER_01 = customer

**Pros**:
- Industry-standard solution
- Neural network-based (voice embeddings)
- 90%+ accuracy in 2-speaker scenarios
- Works with any language

**Cons**:
- Requires additional Python service
- Adds ~10-15s processing time
- Needs GPU for optimal performance
- Additional infrastructure complexity

**Cost**: Free (open source)

### Option 3: Use AssemblyAI Speaker Diarization
**Effort**: Low | **Accuracy Gain**: +50-70%

AssemblyAI provides built-in speaker diarization in their transcription API.

**Implementation**:
1. Switch from OpenAI Whisper to AssemblyAI
2. Enable `speaker_labels: true` in API request
3. Parse speaker labels from response
4. Map speakers to agent/customer

**Pros**:
- Single API call (transcription + diarization)
- No infrastructure changes
- High accuracy
- Easy to implement

**Cons**:
- Additional cost: ~$0.65/hour (vs Whisper $0.36/hour)
- Vendor lock-in
- Requires new API key

**Cost**: $0.65/hour audio (~80% more expensive than Whisper)

### Option 4: Use Deepgram Speaker Diarization
**Effort**: Low | **Accuracy Gain**: +50-70%

Similar to AssemblyAI, Deepgram offers built-in diarization.

**Implementation**:
1. Switch to Deepgram API
2. Enable `diarize: true` parameter
3. Parse speaker labels from response

**Pros**:
- Fast processing (real-time capable)
- High accuracy
- Competitive pricing
- Built-in diarization

**Cons**:
- Additional cost: ~$0.43/hour (still more than Whisper)
- Vendor lock-in
- Requires new API key

**Cost**: $0.43/hour audio (~20% more expensive than Whisper)

### Option 5: Hybrid Approach (Best Balance)
**Effort**: Medium | **Accuracy Gain**: +30-50%

Combine improved heuristics with AI-based refinement:

1. **Phase 1**: Enhanced heuristics (Option 1)
2. **Phase 2**: Pass transcript to Claude with prompt:
   ```
   Review this transcript and correct speaker labels.
   Look for:
   - Short affirmative/negative responses (likely customer)
   - Questions vs answers pattern
   - Introduction phrases ("calling from Pickle" = agent)
   - Conversational flow

   Return corrected transcript with speaker labels.
   ```

**Pros**:
- Leverages existing Claude integration
- No new infrastructure
- Can improve over time with better prompts
- Relatively low cost (small Claude API call)

**Cons**:
- Adds processing time (~5-10s)
- Additional API cost (~$0.01-0.02 per call)
- Still not perfect

**Cost**: ~$0.01-0.02 per call for Claude correction

## Recommendation: Hybrid Approach

**Immediate (This Week)**:
- Implement enhanced heuristics (Option 1)
- Test on 10-20 existing calls
- Measure improvement

**Short Term (Next 2 Weeks)**:
- Add Claude-based correction (Option 5 Phase 2)
- Create "Re-Diarize" button in UI for poor transcripts
- Allow manual speaker corrections in UI

**Long Term (1-2 Months)**:
- Evaluate Pyannote Audio (Option 2) for production
- Run A/B test: current vs Pyannote
- If >90% accuracy, deploy Pyannote microservice

## Implementation Priority

1. **High Priority**: Enhanced heuristics (quick win, no cost)
2. **Medium Priority**: Claude-based correction (good balance)
3. **Low Priority**: Pyannote/AssemblyAI (evaluate if heuristics insufficient)

## Testing Plan

1. **Baseline**: Measure current accuracy on 20 calls
2. **Implement**: Enhanced heuristics
3. **Test**: Run on same 20 calls
4. **Measure**: Calculate accuracy improvement
5. **Iterate**: Tune thresholds based on results

## Metrics to Track

- **Speaker Switch Accuracy**: % of correct speaker transitions
- **Label Accuracy**: % of segments correctly labeled
- **False Positive Rate**: Customer speech labeled as agent
- **False Negative Rate**: Agent speech labeled as customer

## Next Steps

1. Review this analysis with team
2. Choose solution approach
3. Implement Phase 1 (enhanced heuristics)
4. Test on problematic calls
5. Iterate based on results

---

**Created**: 2025-11-13
**Call Example**: call_1763045877947_dwf25ag
