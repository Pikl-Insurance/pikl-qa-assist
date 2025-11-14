# Pikl Call Center QA Assistant

AI-powered quality assurance tool for automatically transcribing and scoring call center recordings against compliance checklists.

## Overview

Pikl's contact center currently faces a 50% compliance failure rate with manual QA processes covering only ~5% of calls. This prototype automates the QA process using AI to:

- Transcribe call recordings with speaker identification
- Score calls against 10 QA criteria
- Generate actionable feedback reports for agents
- Identify compliance breaches automatically

## Key Features

- **Manual Call Upload** - Web interface for uploading MP3/WAV recordings
- **Automated Transcription** - Convert audio to text with speaker labels using AssemblyAI
- **AI-Powered Scoring** - Evaluate calls against QA criteria using Claude 3.5 Sonnet
- **Agent Feedback Reports** - Generate detailed reports with:
  - Overall QA score (0-100)
  - Category-by-category breakdown
  - Specific coaching recommendations
  - Compliance flags for critical issues
- **Simple Dashboard** - View analyzed calls with scores and status

## QA Scoring Framework

Each call is evaluated across **7 Core QA Dimensions** and **6 UK Compliance Dimensions** (scored 0-10):

### Core QA Dimensions

1. **Rapport Building** - Connection and trust with customer
2. **Needs Discovery** - Identifying customer needs and pain points
3. **Product Knowledge** - Understanding of products/services
4. **Objection Handling** - Addressing concerns effectively
5. **Closing Techniques** - Moving toward resolution or next step
6. **Professionalism** - Communication quality and demeanor
7. **Follow-Up** - Setting expectations for next steps

### UK Compliance Dimensions

8. **Call Opening Compliance** - Proper firm identification and call recording disclosure
9. **Data Protection Compliance** - GDPR privacy notices and DPA verification
10. **Mandatory Disclosures** - Regulatory status, fees/commissions, and complaints procedure
11. **TCF Compliance** - FCA Principle 6 (Treating Customers Fairly) requirements
12. **Sales Process Compliance** - Suitability assessment, cooling-off rights, and product governance
13. **Complaints Handling** - DISP compliance (acknowledge, resolve, FOS referral rights)

**Overall Score:** Average of all 7 core QA dimensions (0-10 scale)
**Compliance Score:** Average of all 6 UK compliance dimensions (0-10 scale)

### Compliance Frameworks Covered

The system automatically checks for compliance with UK insurance regulatory requirements:

- **FCA Regulations:**
  - ICOBS (Insurance Conduct of Business Sourcebook)
  - DISP (Dispute Resolution: Complaints)
  - SYSC 9 (Call recording and retention - 5 year requirement)
  - FCA Principle 6 (Treating Customers Fairly)
  - Senior Managers & Certification Regime (SM&CR)

- **Data Protection:**
  - GDPR (General Data Protection Regulation)
  - UK Data Protection Act 2018
  - ICO Guidelines for call recording and consent

- **Industry Standards:**
  - Insurance Distribution Directive (IDD) UK implementation
  - Consumer Duty requirements
  - BIBA (British Insurance Brokers' Association) guidelines
  - ABI (Association of British Insurers) codes of practice

### Call Type Detection

The system automatically identifies and scores based on call type:
- **New Business Sales** - New policy sales calls
- **Renewals** - Policy renewal conversations
- **Mid-Term Adjustments (MTA)** - Policy changes during term
- **Claims Inquiry** - Claims-related calls
- **Complaints** - Customer complaint handling
- **General Inquiry** - General customer service calls

## Tech Stack

- **Framework:** Next.js 15 with TypeScript
- **UI:** React 19 with Tailwind CSS and Shadcn/ui
- **Transcription:** AssemblyAI (with superior speaker diarization)
- **Analysis:** Anthropic Claude API (Claude Sonnet 4.5)
- **Database:** SQLite with Prisma ORM
- **Testing:** Vitest with Testing Library
- **Storage:** SQLite database with JSON file fallback

## Project Structure

```
pikl-qa-assist/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/        # Claude analysis endpoint
│   │   │   ├── transcribe/     # Whisper transcription endpoint
│   │   │   └── upload/         # File upload endpoint
│   │   ├── layout.tsx          # App layout
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   ├── lib/
│   │   ├── claude-service.ts   # Claude API integration
│   │   └── whisper-service.ts  # Whisper API integration
│   └── types/                  # TypeScript type definitions
├── docs/                       # Documentation
├── examples/                   # Usage examples
└── public/                     # Static assets
```

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up API keys
cp .env.example .env
# Edit .env and add your API keys:
# - ASSEMBLYAI_API_KEY (for audio transcription)
# - ANTHROPIC_API_KEY (for Claude analysis)

# 3. Run development server
npm run dev

# 4. Run tests
npm test
```

## Prerequisites

- Node.js 18+ and npm
- API keys for:
  - [AssemblyAI](https://www.assemblyai.com/) (Audio transcription with speaker diarization)
  - [Anthropic](https://console.anthropic.com/) (Claude analysis)

## Success Metrics

- Process and score 10+ call recordings
- QA scores align with human evaluators (±15% variance)
- Generate actionable feedback in <2 minutes per call
- Board demo-ready within 2-3 weeks

## Cost Estimate

**Per Call (5-minute average):**
- Whisper transcription: ~$0.03
- Claude Sonnet 4.5 analysis: ~$0.03
- **Total per call: ~$0.06**

**Production Estimates:**
- 100 calls/month: ~$6
- 500 calls/month: ~$30
- 1000 calls/month: ~$60

**Cost Optimization:**
- Use Claude Haiku 4.5 for faster/cheaper analysis: ~$0.01/call
- Use Claude Opus 4.1 for highest accuracy: ~$0.15/call

## Development Phases

### Phase 1: Core Engine (Week 1)
- Set up Python environment and API integrations
- Build transcription and scoring pipeline
- Test with 5 sample calls

### Phase 2: Simple UI (Week 2)
- Build Streamlit interface
- Add file upload and results display
- Implement report export

### Phase 3: Refinement (Week 3)
- Refine prompts based on results
- Add error handling and polish
- Prepare demo materials

## Out of Scope (v1)

- 3CX API integration
- Multi-user authentication
- Real-time call monitoring
- Cloud infrastructure
- Production deployment

## API Usage

### Transcribe Audio

```typescript
import { transcribeAudio } from '@/lib/whisper-service';

const transcript = await transcribeAudio('/path/to/audio.wav', 'call-123');
console.log(`Transcribed ${transcript.turns.length} turns`);
```

### Analyze Transcript

```typescript
import { analyzeTranscript } from '@/lib/claude-service';

const analysis = await analyzeTranscript(transcript);
console.log(`Overall Score: ${analysis.overallScore}/10`);
console.log(`Coaching Points: ${analysis.coachingRecommendations.length}`);
```

### Full Pipeline Example

```bash
# Run the full analysis pipeline
npx tsx examples/analyze-call.ts path/to/audio.wav
```

See [docs/claude-api-integration.md](docs/claude-api-integration.md) for detailed API documentation.

## Documentation

- Full PRD available in [PRD.md](PRD.md)
- Scope decisions in [SCOPE_DECISION.md](SCOPE_DECISION.md)
- Claude API Integration: [docs/claude-api-integration.md](docs/claude-api-integration.md)

## License

ISC

## Status

Prototype v1.0 - In Development
