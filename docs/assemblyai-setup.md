# AssemblyAI Integration Setup Guide

**Branch**: `feature/assemblyai-diarization`
**Purpose**: Pilot test of AssemblyAI for superior speaker diarization accuracy

---

## Overview

This integration adds AssemblyAI as an alternative transcription provider with industry-leading speaker diarization accuracy (92-95% for 2-speaker calls).

**Key Benefits**:
- 43% better accuracy on short utterances ("yes", "okay")
- 30% better performance in noisy environments
- Enterprise-grade compliance (GDPR, SOC2)
- Single API call for transcription + diarization

---

## Setup Instructions

### 1. Get AssemblyAI API Key

1. Sign up for free account: https://www.assemblyai.com/app/signup
2. Free trial includes **100 hours** of transcription
3. Navigate to Dashboard → API Keys
4. Copy your API key (starts with `...`)

### 2. Configure Environment

Add to your `.env.local` file:

```bash
ASSEMBLYAI_API_KEY="your-api-key-here"
```

### 3. Restart Development Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## Testing Instructions

### Method 1: API Request (Recommended for Pilot)

Test AssemblyAI on a specific call:

```bash
curl -X POST http://localhost:3000/api/transcribe \
  -H "Content-Type: application/json" \
  -d '{"callId":"call_1763045877947_dwf25ag","provider":"assemblyai"}'
```

Compare with Whisper (current method):

```bash
curl -X POST http://localhost:3000/api/transcribe \
  -H "Content-Type: application/json" \
  -d '{"callId":"call_1763045877947_dwf25ag","provider":"whisper"}'
```

### Method 2: UI Testing (Future)

UI support for provider selection coming in next phase.

---

## API Response Format

```json
{
  "success": true,
  "data": {
    "transcript": {
      "callId": "call_xxx",
      "turns": [
        {
          "speaker": "agent",
          "text": "Hello, how can I help you today?",
          "timestamp": 0.5,
          "confidence": 0.98
        },
        {
          "speaker": "customer",
          "text": "Yes, I'd like to renew my policy.",
          "timestamp": 3.2,
          "confidence": 0.96
        }
      ],
      "durationSeconds": 480,
      "language": "english",
      "processingTime": 12500
    },
    "cost": 0.0867,
    "provider": "assemblyai"
  },
  "message": "Successfully transcribed call with AssemblyAI in 12s. Cost: $0.0867"
}
```

---

## Comparison Metrics to Track

When testing calls, compare:

| Metric | Whisper + Heuristics | AssemblyAI | Target |
|--------|---------------------|------------|--------|
| Speaker distribution | Check balance | Check balance | ~50/50 |
| Short utterance accuracy | Count correct "yes"/"okay" | Count correct | >95% |
| False agent attribution | Count customer→agent errors | Count errors | <5% |
| False customer attribution | Count agent→customer errors | Count errors | <5% |
| Processing time | Record | Record | <30s/call |
| Cost per call (8 min) | $0.048 | $0.087 | Acceptable |

---

## Pilot Test Plan

### Phase 1: Single Call Comparison (Day 1)

**Test Call**: `call_1763045877947_dwf25ag` (known problematic diarization)

1. Transcribe with Whisper + heuristics:
   ```bash
   curl -X POST http://localhost:3000/api/transcribe \
     -H "Content-Type: application/json" \
     -d '{"callId":"call_1763045877947_dwf25ag","provider":"whisper"}'
   ```

2. Transcribe with AssemblyAI:
   ```bash
   curl -X POST http://localhost:3000/api/transcribe \
     -H "Content-Type: application/json" \
     -d '{"callId":"call_1763045877947_dwf25ag","provider":"assemblyai"}'
   ```

3. Manual comparison:
   - Load both transcripts in UI
   - Count speaker attribution errors
   - Focus on short customer responses
   - Calculate Diarization Error Rate (DER)

4. Document findings in `docs/assemblyai-pilot-results.md`

### Phase 2: Batch Testing (Day 2-3)

Test on 10-20 diverse calls:
- 5 new business sales calls
- 5 renewal calls
- 5 mid-term adjustments
- 5 complaints/inquiries

For each:
- Process with both providers
- Manual QA review
- Calculate average DER
- Compare speaker distributions

### Phase 3: QA Manager Review (Day 4-5)

- Present findings to QA manager
- Select 5 best/worst examples
- Get sign-off on accuracy improvement
- Discuss rollout plan

### Phase 4: Decision (Day 6-7)

Based on results:
- **If DER <5%**: Proceed with production rollout
- **If DER 5-10%**: Consider hybrid approach (AssemblyAI + Claude correction)
- **If DER >10%**: Investigate issues, adjust configuration

---

## Cost Comparison

### Whisper (OpenAI) - Current
- **Rate**: $0.36/hour
- **Your volume**: 100 calls × 8 min = 13.3 hours/month
- **Monthly cost**: $4.80

### AssemblyAI - Proposed
- **Rate**: $0.65/hour
- **Your volume**: 100 calls × 8 min = 13.3 hours/month
- **Monthly cost**: $8.65
- **Increase**: +$3.85/month (+80%)

**Cost-benefit**: Additional $46/year to prevent potentially costly agent performance review disputes.

---

## Speaker Label Mapping

AssemblyAI returns speaker labels as "A", "B", "C", etc.

**Current mapping**:
- Speaker A = agent (first speaker)
- Speaker B = customer (second speaker)

**Assumption**: Agent initiates call, customer responds.

**Future enhancement**: Could use voice fingerprinting to ensure consistent mapping across calls for same agent.

---

## Troubleshooting

### Error: "AssemblyAI API key not configured"

**Solution**: Add `ASSEMBLYAI_API_KEY` to `.env.local` and restart server.

### Error: "Failed to transcribe audio with AssemblyAI"

**Check**:
1. API key is valid (check AssemblyAI dashboard)
2. File size <25MB (same as Whisper limit)
3. Audio format is supported (.wav, .mp3, .m4a, etc.)
4. Network connectivity to AssemblyAI API

### Processing takes >60 seconds

**Expected behavior**: AssemblyAI is slower than Whisper
- Whisper: ~10-20s for 8-minute call
- AssemblyAI: ~15-30s for 8-minute call

**Reason**: Additional speaker diarization processing

### Speaker labels seem inverted

**Check**: Is customer speaking first? Update mapping logic if needed for inbound calls.

---

## Next Steps After Pilot

1. **If approved**:
   - Add UI toggle for provider selection
   - Make AssemblyAI default for new calls
   - Optionally re-process critical historical calls

2. **If not approved**:
   - Investigate alternative providers (Deepgram, Pyannote)
   - Try Phase 2 hybrid approach (Whisper + Claude correction)
   - Fine-tune current heuristics further

---

## Support Resources

- **AssemblyAI Documentation**: https://www.assemblyai.com/docs
- **API Reference**: https://www.assemblyai.com/docs/api-reference
- **Speaker Diarization Guide**: https://www.assemblyai.com/docs/audio-intelligence/speaker-diarization
- **Support**: support@assemblyai.com

---

**Created**: 2025-11-13
**Branch**: feature/assemblyai-diarization
**Status**: Ready for pilot testing
