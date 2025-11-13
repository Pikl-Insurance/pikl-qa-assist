# UK Compliance Prompt Enhancement for Claude QA Analysis

**Purpose:** Enhance the existing Claude analysis prompt with UK-specific insurance compliance requirements

**Integration Point:** `/src/lib/claude-service.ts` - `createAnalysisPrompt()` function

---

## Current State Analysis

The current prompt in `claude-service.ts:117-219` provides:
- 8 generic QA dimensions (rapport, needsDiscovery, productKnowledge, objectionHandling, closing, compliance, professionalism, followUp)
- General compliance scoring (0-10) without UK-specific requirements
- No regulatory framework references
- No call-type-specific validation

---

## Enhanced Prompt Structure

### Part 1: Context Enhancement (Add to existing context)

```
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
```

### Part 2: Compliance Dimension Enhancement

**Replace existing compliance dimension (score 0-10) with expanded sub-dimensions:**

```
6. **COMPLIANCE** - Evaluate across multiple regulatory areas:

   A. **Call Opening Compliance** (callOpeningCompliance): 0-10
      - 10: Perfect - All required elements present
      - 7-9: Good - Most elements present, minor omissions
      - 4-6: Adequate - Some elements present, gaps exist
      - 0-3: Poor - Critical omissions or breaches

      Required Elements:
      ✅ Firm identification (company name, regulatory status)
      ✅ Call recording disclosure ("this call is being recorded")
      ✅ GDPR privacy notice (data processing, rights)
      ✅ Purpose of data collection stated

      Evidence to find:
      - "Pikl Insurance" or company name mentioned
      - "This call is being recorded" or similar phrase
      - "For quality assurance" or similar purpose
      - "We process your personal data..." or GDPR notice
      - "You have the right to access/delete your data" or similar

   B. **Data Protection Compliance** (dataProtectionCompliance): 0-10
      - 10: Perfect - Identity verified BEFORE accessing any policy data
      - 7-9: Good - Verification done but minor procedural gaps
      - 4-6: Adequate - Verification attempted but incomplete
      - 0-3: Critical - No verification OR accessed data without consent

      Required Elements:
      ✅ DPA verification conducted (name + date of birth minimum)
      ✅ Verification completed BEFORE accessing policy details
      ✅ Lawful basis for processing communicated
      ✅ Sensitive data handled securely (no full card numbers read aloud)

      Evidence to find:
      - "Can I verify your identity?" or similar
      - "Can you confirm your full name and date of birth?"
      - Asked BEFORE saying things like "Let me pull up your policy"
      - Did NOT access policy/quote details before verification

      **CRITICAL BREACH**: If agent accesses policy data before DPA verification, score = 0

   C. **Mandatory Disclosures** (mandatoryDisclosures): 0-10
      - 10: Perfect - All required disclosures made clearly
      - 7-9: Good - Most disclosures made, minor gaps
      - 4-6: Adequate - Some disclosures made
      - 0-3: Poor - Critical disclosures missing

      Required Disclosures:
      ✅ Service type (advised vs non-advised)
      ✅ Remuneration (commission vs fee) if customer asks or for advised sales
      ✅ Complaints procedure and Financial Ombudsman Service (FOS) rights
      ✅ Cooling-off rights (14-day cancellation for new business)
      ✅ Price breakdown (premium + IPT + fees)

      Evidence to find:
      - "I'm providing you with information to help you decide" (non-advised)
      - "Based on your circumstances, I recommend..." (advised)
      - "If you're unhappy, you can complain by..." + FOS mention
      - "You have 14 days to cancel for a full refund"
      - "The premium is £X, plus £Y Insurance Premium Tax, and £Z admin fee"

   D. **Treating Customers Fairly (TCF)** (tcfCompliance): 0-10
      - 10: Excellent - Customer treated fairly throughout, no pressure
      - 7-9: Good - Fair treatment, minor areas for improvement
      - 4-6: Adequate - Mostly fair but some concerns
      - 0-3: Poor - Pressure selling, unfair tactics, misleading information

      TCF Principles to Evaluate:
      ✅ No pressure selling or aggressive tactics
      ✅ Clear, fair, not misleading information
      ✅ Product suitability considered (for sales calls)
      ✅ Customer given time to make decisions
      ✅ No unreasonable barriers to service
      ✅ Empathy and understanding shown

      Evidence to find:
      - Agent allows customer to ask questions
      - No phrases like "You must decide now" or "This offer ends today"
      - Corrects customer misunderstandings promptly
      - Explains products in plain language
      - Shows empathy ("I understand that must be frustrating")

      **CRITICAL BREACH**: If pressure selling detected, score ≤ 3

   E. **Sales Process Compliance** (salesProcessCompliance): 0-10 (N/A if not a sales call)
      - 10: Perfect - All sales process requirements met
      - 7-9: Good - Most requirements met, minor gaps
      - 4-6: Adequate - Basic process followed, gaps exist
      - 0-3: Poor - Critical process failures

      Required for Sales Calls:
      ✅ Needs assessment conducted (questions about customer circumstances)
      ✅ Product suitability explained
      ✅ Product information provided or confirmed sent
      ✅ Price clearly explained with breakdown
      ✅ Cooling-off rights explained (14 days)
      ✅ Next steps and documentation confirmed

      For ADVISED Sales ONLY (if agent says "I recommend"):
      ✅ Suitability assessment documented
      ✅ Personal recommendation clearly stated with reasoning
      ✅ Alternatives considered (mentioned or implied)

      Evidence to find:
      - "Tell me about your property/situation" (needs assessment)
      - "This product is suitable because..." (suitability)
      - "I'll send you the product information document" (PID/IPID)
      - "You can cancel within 14 days for a full refund"
      - "I recommend this product for you because..." (advised sales)

   F. **Complaints Handling** (complaintsHandling): 0-10 (N/A if no complaint)
      - 10: Perfect - Complaint handled per DISP requirements
      - 7-9: Good - Most requirements met, minor gaps
      - 4-6: Adequate - Basic handling, improvements needed
      - 0-3: Poor - Complaint ignored, discouraged, or mishandled

      Required for Complaints:
      ✅ Complaint recognized and acknowledged
      ✅ Logged immediately with reference number provided
      ✅ Empathy shown (not dismissive)
      ✅ Process and timeline explained (8 weeks max)
      ✅ FOS rights mentioned
      ✅ Contact details for complaints team provided

      Evidence to find:
      - Customer expresses dissatisfaction
      - Agent says "I'm logging this as a complaint"
      - "Your complaint reference number is..."
      - "Our complaints team will contact you within..."
      - "If we can't resolve this in 8 weeks, you can refer to the Financial Ombudsman"

      **CRITICAL BREACH**: If complaint discouraged or dismissed, score ≤ 3
```

### Part 3: Call Type Detection & Specific Requirements

**Add after existing prompt structure:**

```
CALL TYPE IDENTIFICATION:
First, identify the primary call type from the transcript:
1. NEW BUSINESS SALES - Customer purchasing new insurance
2. RENEWALS - Customer renewing existing policy
3. MID-TERM ADJUSTMENT (MTA) - Changes to existing policy
4. CLAIMS INQUIRY / FNOL - Customer calling about a claim
5. COMPLAINTS - Customer making a formal complaint
6. GENERAL INQUIRY - Information requests, policy servicing

Based on the call type, apply additional specific compliance checks:

**IF NEW BUSINESS SALES:**
- Needs assessment must be present
- Product information must be mentioned or sent
- Cooling-off rights MUST be explained
- Price breakdown MUST be provided
- If advised sale (agent says "I recommend"), suitability statement required

**IF RENEWALS:**
- Check if renewal invite mentioned (21+ days before)
- Any changes to cover must be clearly explained
- Auto-renewal process explained if applicable
- Premium increase explanation if relevant

**IF MID-TERM ADJUSTMENT:**
- DPA verification critical before making changes
- Premium adjustment calculation must be clear
- Impact on cover must be explained
- Change confirmation must be provided

**IF CLAIMS INQUIRY:**
- Empathy and support MUST be present (TCF critical)
- Claims process clearly explained
- Evidence requirements mentioned
- Claims reference number provided
- Fair claims handling (no unreasonable rejections)

**IF COMPLAINTS:**
- Complaint MUST be acknowledged immediately
- Reference number MUST be provided
- 8-week timeline MUST be mentioned
- FOS rights MUST be mentioned
- Process MUST be explained

**IF GENERAL INQUIRY:**
- DPA verification before providing policy info
- Accurate information provided
- Follow-up confirmed if promised
```

### Part 4: Enhanced Key Moments Requirements

**Update existing key moments instructions:**

```
Additionally, identify:
- **Key Moments**: 8-15 specific moments spread across ALL dimensions INCLUDING compliance sub-dimensions. Each moment must:
  - Include the exact dimension category (rapport, needsDiscovery, productKnowledge, objectionHandling, closing,
    callOpeningCompliance, dataProtectionCompliance, mandatoryDisclosures, tcfCompliance, salesProcessCompliance,
    complaintsHandling, professionalism, followUp)
  - Have a precise timestamp in seconds matching the transcript
  - **CRITICAL**: Include an EXACT, VERBATIM quote copied directly from the transcript - DO NOT paraphrase
  - The quote must be a direct copy-paste from the transcript text, not a summary or interpretation
  - Be marked as positive, negative, or neutral
  - Provide context for why this moment matters for that dimension

  **COMPLIANCE MOMENTS REQUIRED**:
  - At LEAST 2 moments must be compliance-related (from the 6 compliance sub-dimensions)
  - Flag critical compliance breaches as NEGATIVE moments
  - Highlight excellent compliance practices as POSITIVE moments
```

### Part 5: Enhanced Compliance Issues Section

**Update existing complianceIssues structure:**

```
- **Compliance Issues**: Any compliance violations or concerns. For each issue provide:
  - severity: "critical" | "high" | "medium" | "low"
  - category: Which compliance sub-dimension (e.g., "dataProtectionCompliance", "mandatoryDisclosures")
  - issue: Clear description of the violation
  - regulatoryReference: Which regulation was breached (e.g., "ICOBS 4.2", "GDPR Article 13", "FCA PRIN 6")
  - timestamp: When the issue occurred (in seconds)
  - remediation: Specific action needed to fix (e.g., "Must state call recording disclosure at call opening")

  **Severity Definitions**:
  - CRITICAL: Regulatory breach with high risk (e.g., no DPA verification before accessing data, pressure selling,
    misleading information, complaint discouraged)
  - HIGH: Significant compliance gap (e.g., missing mandatory disclosures, no cooling-off rights explained,
    inadequate needs assessment)
  - MEDIUM: Procedural gap (e.g., incomplete needs discovery, unclear pricing breakdown)
  - LOW: Best practice opportunity (e.g., could explain product features more clearly)

  If NO compliance issues found, return empty array []
```

### Part 6: Enhanced JSON Response Format

**Update existing JSON format to include new compliance fields:**

```json
{
  "overallScore": 7.5,
  "scores": {
    "rapport": 8,
    "needsDiscovery": 7,
    "productKnowledge": 9,
    "objectionHandling": 6,
    "closing": 7,
    "callOpeningCompliance": 8,
    "dataProtectionCompliance": 9,
    "mandatoryDisclosures": 6,
    "tcfCompliance": 8,
    "salesProcessCompliance": 7,
    "complaintsHandling": null,
    "professionalism": 8,
    "followUp": 7
  },
  "callType": "new_business_sales",
  "keyMoments": [
    {
      "timestamp": 5,
      "type": "positive",
      "category": "callOpeningCompliance",
      "description": "Agent clearly stated call recording disclosure and GDPR notice",
      "quote": "Good morning, this is Sarah from Pikl Insurance. This call is being recorded for quality assurance and training purposes. We process your personal data to provide insurance services, and you have the right to access and request deletion of your data."
    },
    {
      "timestamp": 45,
      "type": "negative",
      "category": "dataProtectionCompliance",
      "description": "Agent accessed policy details before conducting DPA verification - CRITICAL BREACH",
      "quote": "Let me pull up your policy details now... Okay, I can see you have a buildings and contents policy with us"
    }
  ],
  "coachingRecommendations": [
    "CRITICAL: Always conduct DPA verification (name + DOB) BEFORE accessing any policy information",
    "Explain cooling-off rights (14 days) when selling new policies",
    "Provide clear price breakdown including premium, IPT, and fees"
  ],
  "summary": "Agent demonstrated good product knowledge and rapport but had critical compliance breaches including accessing policy data without DPA verification and missing mandatory disclosures for cooling-off rights and price breakdown.",
  "callOutcome": "Sale completed - customer purchased buildings and contents policy",
  "outcomeMetrics": {
    "quotesCompleted": 1,
    "salesCompleted": 1,
    "renewalsCompleted": 0
  },
  "complianceIssues": [
    {
      "severity": "critical",
      "category": "dataProtectionCompliance",
      "issue": "Agent accessed policy information without conducting DPA verification first",
      "regulatoryReference": "GDPR Article 32, ICOBS 2.4",
      "timestamp": 45,
      "remediation": "Must verify customer identity (name + date of birth) BEFORE accessing any policy or personal data"
    },
    {
      "severity": "high",
      "category": "mandatoryDisclosures",
      "issue": "Agent did not explain 14-day cooling-off period for new policy",
      "regulatoryReference": "ICOBS 7.1.4R",
      "timestamp": null,
      "remediation": "Must state: 'You have 14 days from the start date to cancel for a full refund if you change your mind'"
    },
    {
      "severity": "high",
      "category": "mandatoryDisclosures",
      "issue": "Agent did not provide clear price breakdown with IPT and fees separated",
      "regulatoryReference": "ICOBS 6.1.5R",
      "timestamp": 180,
      "remediation": "Must break down price as: Premium £X, Insurance Premium Tax £Y, Admin Fee £Z, Total £ABC"
    }
  ]
}
```

---

## Implementation Steps

### Step 1: Update TypeScript Types

Add new types to `/src/types/index.ts`:

```typescript
export interface QAScores {
  // Existing
  rapport: number;
  needsDiscovery: number;
  productKnowledge: number;
  objectionHandling: number;
  closing: number;
  professionalism: number;
  followUp: number;

  // NEW: Compliance sub-dimensions
  callOpeningCompliance: number;
  dataProtectionCompliance: number;
  mandatoryDisclosures: number;
  tcfCompliance: number;
  salesProcessCompliance: number | null; // null if not a sales call
  complaintsHandling: number | null; // null if not a complaint
}

export type CallType =
  | 'new_business_sales'
  | 'renewals'
  | 'mid_term_adjustment'
  | 'claims_inquiry'
  | 'complaints'
  | 'general_inquiry';

export interface ComplianceIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  issue: string;
  regulatoryReference: string;
  timestamp: number | null;
  remediation: string;
}

export interface Analysis {
  callId: string;
  callType?: CallType; // NEW
  overallScore: number;
  scores: QAScores;
  keyMoments: KeyMoment[];
  coachingRecommendations: string[];
  summary: string;
  callOutcome: string;
  outcomeMetrics?: {
    quotesCompleted: number;
    salesCompleted: number;
    renewalsCompleted: number;
  };
  complianceIssues: ComplianceIssue[]; // Enhanced structure
  processingTime?: number;
}
```

### Step 2: Update Claude Service Prompt

In `/src/lib/claude-service.ts`, update the `createAnalysisPrompt()` function:

```typescript
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

[... Continue with enhanced prompt sections from Part 2-6 above ...]`;
}
```

### Step 3: Update Response Parser

In `/src/lib/claude-service.ts`, update `parseClaudeResponse()` to handle new fields:

```typescript
function parseClaudeResponse(responseText: string): ClaudeAnalysisResponse {
  // ... existing parsing logic ...

  const analysis: ClaudeAnalysisResponse = {
    overallScore: parsed.overallScore || 0,
    callType: parsed.callType || 'general_inquiry',
    scores: {
      rapport: parsed.scores?.rapport || 0,
      needsDiscovery: parsed.scores?.needsDiscovery || 0,
      productKnowledge: parsed.scores?.productKnowledge || 0,
      objectionHandling: parsed.scores?.objectionHandling || 0,
      closing: parsed.scores?.closing || 0,
      callOpeningCompliance: parsed.scores?.callOpeningCompliance || 0,
      dataProtectionCompliance: parsed.scores?.dataProtectionCompliance || 0,
      mandatoryDisclosures: parsed.scores?.mandatoryDisclosures || 0,
      tcfCompliance: parsed.scores?.tcfCompliance || 0,
      salesProcessCompliance: parsed.scores?.salesProcessCompliance || null,
      complaintsHandling: parsed.scores?.complaintsHandling || null,
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
}
```

### Step 4: Update UI Components

Update dashboard and analysis display components to show:
- Call type badge
- Compliance sub-dimension scores (separate from generic scores)
- Compliance issues table with severity badges
- Regulatory references for issues
- Remediation actions

### Step 5: Testing

Test with sample calls covering all 6 call types:
1. New business sales call
2. Renewals call
3. Mid-term adjustment call
4. Claims inquiry call
5. Complaints call
6. General inquiry call

Validate that:
- Call types are correctly identified
- Compliance sub-dimensions are scored accurately
- Critical compliance breaches are flagged
- Coaching recommendations address compliance gaps
- Regulatory references are accurate

---

## Expected Improvements

### Before (Current State)
- Generic compliance score (0-10)
- No UK-specific requirements
- No call-type detection
- Generic compliance issues (if any)
- Limited actionable feedback on compliance

### After (Enhanced State)
- 6 compliance sub-dimensions with UK-specific criteria
- Call type detection with tailored requirements
- Specific regulatory references (ICOBS, GDPR, DISP, etc.)
- Severity-based compliance issue flagging (critical/high/medium/low)
- Actionable remediation for each compliance gap
- Better alignment with FCA expectations

### Compliance Coverage Improvement

| Compliance Area | Before | After |
|----------------|--------|-------|
| FCA Principles (TCF) | Generic | Specific TCF dimension with 6 outcomes |
| ICOBS Requirements | Not covered | Mandatory disclosures tracked |
| GDPR / Data Protection | Not covered | Dedicated DPA compliance dimension |
| IDD Sales Process | Generic | Specific sales process requirements |
| DISP Complaints | Not covered | Dedicated complaints handling dimension |
| Call Recording | Not covered | Call opening compliance checks |
| Regulatory References | None | Specific ICOBS/GDPR/DISP/PRIN references |

---

## Cost Impact

**Current:** ~$0.03 per 5-minute call
**Enhanced:** ~$0.04-$0.05 per 5-minute call (+33-67% due to longer prompt and more detailed analysis)

**Justification:** Enhanced compliance detection significantly reduces regulatory risk, which far outweighs marginal cost increase.

---

## Rollout Plan

### Phase 1: Development & Testing (Week 1)
- Implement type updates
- Update prompt in claude-service.ts
- Update response parser
- Test with 10 sample calls across all call types

### Phase 2: Validation (Week 2)
- Compare AI compliance scores with manual compliance reviews
- Validate regulatory references with compliance team
- Refine prompt based on accuracy testing
- Adjust scoring thresholds if needed

### Phase 3: UI Updates (Week 2-3)
- Update dashboard to show compliance sub-dimensions
- Add compliance issues table with severity badges
- Implement filtering by call type
- Add regulatory reference tooltips

### Phase 4: Production Rollout (Week 3)
- Deploy to production
- Monitor compliance detection accuracy
- Gather feedback from QA team
- Iterate on prompt refinements

---

## Success Metrics

- **Compliance Detection Rate**: 95%+ for critical compliance items (call recording disclosure, DPA verification, mandatory disclosures)
- **False Positive Rate**: <10% for compliance issues
- **Call Type Detection Accuracy**: 90%+ correct call type identification
- **Regulatory Reference Accuracy**: 100% valid regulatory references
- **User Satisfaction**: QA team finds compliance feedback actionable and accurate

---

## Maintenance

- **Quarterly Review**: Review prompt against latest FCA guidance and regulatory changes
- **Regulatory Updates**: Update prompt when new regulations take effect (e.g., Consumer Duty updates)
- **Accuracy Monitoring**: Track compliance detection accuracy vs manual reviews monthly
- **Prompt Refinement**: Continuously refine based on edge cases and feedback

---

**Document Version:** 1.0
**Author:** AI-Assisted Compliance Enhancement
**Review Date:** 2025-12-13
**Status:** Ready for Implementation
