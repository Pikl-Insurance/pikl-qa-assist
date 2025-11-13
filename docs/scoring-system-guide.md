# QA Scoring System Guide

**For QA Managers and Team Leaders**
**Last Updated:** November 2025

---

## Overview

The Pikl QA Assist system uses Claude AI (Anthropic's Sonnet 4.5) to analyze call recordings and provide objective, consistent quality scores across 14 different dimensions. This guide explains how the scoring works, what each score means, and how to use the results.

---

## How AI Scoring Works

### The Process

1. **Audio Upload** → System receives the call recording
2. **Transcription** → AI converts speech to text with speaker identification
3. **Analysis** → Claude AI reads the entire transcript and evaluates performance
4. **Scoring** → AI assigns scores (0-10) based on specific criteria
5. **Evidence** → AI provides exact quotes and timestamps to justify each score

### Key Principles

- **Objective**: AI applies the same standards to every call
- **Evidence-Based**: Every score is backed by specific examples from the call
- **Consistent**: Unlike human reviewers, AI doesn't have "good days" or "bad days"
- **Transparent**: You can see exactly why each score was given

---

## The 14 Scoring Dimensions

### Core QA Dimensions (8)

These evaluate general sales and customer service quality:

#### 1. **Rapport Building** (0-10)
**What it measures**: How well the agent builds a positive relationship with the customer

**Good performance (8-10)**:
- Warm, friendly greeting
- Uses customer's name naturally
- Active listening with empathy
- Appropriate small talk
- Positive, enthusiastic tone

**Poor performance (0-4)**:
- Rushed or cold greeting
- Doesn't use customer name
- Interrupts frequently
- Robotic or scripted tone

**Example**: "Hi Sarah! Thanks so much for calling Pikl today. How can I help you?" (Good rapport)

---

#### 2. **Needs Discovery** (0-10)
**What it measures**: How thoroughly the agent understands the customer's situation

**Good performance (8-10)**:
- Asks open-ended questions
- Probes for details about property, circumstances, risks
- Clarifies customer priorities (price vs coverage)
- Summarizes understanding back to customer

**Poor performance (0-4)**:
- Assumes needs without asking
- Jumps straight to quote
- Doesn't ask about circumstances

**Example**: "Can you tell me about your property? Is it your main home or a rental? Any unusual features like a hot tub or trampoline?"

---

#### 3. **Product Knowledge** (0-10)
**What it measures**: Agent's understanding of insurance products and ability to explain them

**Good performance (8-10)**:
- Explains coverage clearly in plain English
- Accurately describes policy features
- Answers questions confidently
- Compares options when relevant

**Poor performance (0-4)**:
- Vague or incorrect explanations
- Can't answer customer questions
- Uses jargon without explaining
- Unsure about policy details

**Example**: "Buildings insurance covers the structure itself - walls, roof, foundations. Contents covers everything inside you'd take with you if you moved."

---

#### 4. **Objection Handling** (0-10)
**What it measures**: How effectively the agent addresses customer concerns

**Good performance (8-10)**:
- Acknowledges concern without being defensive
- Provides clear, honest answers
- Offers alternatives or solutions
- Turns objections into value points

**Poor performance (0-4)**:
- Ignores or dismisses concerns
- Gets defensive or argumentative
- Provides unclear answers
- Pressures customer

**Example**: "I understand the premium seems high. Let me explain what's included and we can see if we can adjust the coverage to meet your budget."

---

#### 5. **Closing Techniques** (0-10)
**What it measures**: Agent's ability to guide the customer toward a decision

**Good performance (8-10)**:
- Summarizes benefits and next steps
- Asks for the sale confidently
- Handles final objections smoothly
- Confirms customer commitment

**Poor performance (0-4)**:
- Doesn't ask for the sale
- Pushy or aggressive tactics
- Unclear next steps
- Lets customer leave without commitment

**Example**: "So we've got everything covered - buildings, contents, and the hot tub. Shall we go ahead and set that up for you?"

---

#### 6. **Compliance** (0-10) - Legacy Score
**What it measures**: General regulatory compliance

**Note**: This is the original compliance score. It's now supplemented by 6 detailed UK compliance sub-dimensions (see below). We keep this for backward compatibility, but the sub-dimensions provide much more useful insights.

---

#### 7. **Professionalism** (0-10)
**What it measures**: Agent's overall conduct and demeanor

**Good performance (8-10)**:
- Polite and respectful throughout
- Clear, articulate communication
- Patient with customer questions
- Professional language (no slang)
- Maintains composure

**Poor performance (0-4)**:
- Rude or dismissive
- Mumbles or unclear speech
- Impatient or frustrated tone
- Unprofessional language
- Loses temper

---

#### 8. **Follow-Up** (0-10)
**What it measures**: How well the agent sets up future actions

**Good performance (8-10)**:
- Confirms next steps clearly
- Sets expectations for documents/emails
- Provides contact information
- Books follow-up if needed
- Summarizes what was agreed

**Poor performance (0-4)**:
- No clear next steps
- Doesn't mention documents
- Customer left confused
- No follow-up arranged

**Example**: "I'll email your policy documents in 5 minutes. Check your junk folder just in case. If you need anything, call us on 0800 254 5171."

---

### UK Compliance Dimensions (6)

These evaluate regulatory compliance specific to UK insurance law. **These are critical** as non-compliance can result in FCA fines, customer complaints, and legal issues.

#### 9. **Call Opening Compliance** (0-10)
**What it measures**: Mandatory requirements at the start of every call

**What must be said**:
1. **Firm identification**: "This is Pikl Insurance, authorized and regulated by the FCA"
2. **Call recording disclosure**: "This call is being recorded for quality assurance and regulatory purposes"
3. **GDPR privacy notice**: "We collect your personal data for insurance purposes. You have the right to access, correct, or delete your data"

**Scoring**:
- **10/10**: All three elements clearly stated
- **7-8/10**: Two elements stated, one partial
- **4-6/10**: One element missing
- **0-3/10**: Multiple elements missing

**Why it matters**: Required by GDPR Article 13, FCA PRIN, and call recording laws. Failure = regulatory breach.

---

#### 10. **Data Protection Compliance** (0-10)
**What it measures**: DPA 2018 verification BEFORE accessing customer data

**What must happen**:
1. Agent must verify customer identity BEFORE looking at policy
2. Use security questions: "Can I take your full name and date of birth?"
3. Never access data without verification first

**Scoring**:
- **10/10**: Full DPA verification before accessing any data
- **7-8/10**: Verification done but some data discussed before
- **4-6/10**: Partial verification
- **0-3/10**: No verification or data accessed before verification

**Critical error**: Accessing policy details before DPA verification is a **GDPR breach** (Article 5 - lawfulness).

**Why it matters**: Protects customer data. ICO can fine up to £17.5M or 4% of turnover for breaches.

---

#### 11. **Mandatory Disclosures** (0-10)
**What it measures**: Required information under ICOBS (FCA Insurance Conduct of Business Sourcebook)

**What must be disclosed**:
1. **Service type**: Advised vs non-advised
2. **Remuneration**: "We earn commission from insurers"
3. **Complaints procedure**: How to complain + FOS rights
4. **Cooling-off rights**: "You have 14 days to cancel for a full refund"
5. **Price breakdown**: Premium + IPT + fees separated

**Scoring**:
- **10/10**: All 5 disclosures made clearly
- **7-8/10**: 4 out of 5 disclosures
- **4-6/10**: 3 out of 5 disclosures
- **0-3/10**: 2 or fewer disclosures

**Why it matters**: ICOBS 4.5, 6.1, 7.1 requirements. Missing disclosures = customer not informed, FCA breach.

---

#### 12. **TCF Compliance** (0-10)
**What it measures**: Treating Customers Fairly (FCA Principle 6)

**What's evaluated** (TCF 6 Outcomes):
1. Fair product design and targeting
2. Clear information before, during, after sale
3. Suitable advice (if advised sale)
4. No barriers to switching/cancelling
5. Product performs as expected
6. No unreasonable barriers to complaints

**Scoring**:
- **10/10**: Exemplary fair treatment throughout
- **7-8/10**: Generally fair, minor improvements possible
- **4-6/10**: Some unfair practices detected
- **0-3/10**: Multiple TCF failures (pressure selling, misleading info, etc.)

**Why it matters**: FCA Principle 6 is the foundation of consumer protection. TCF failures lead to customer harm and regulatory action.

---

#### 13. **Sales Process Compliance** (0-10 or N/A)
**What it measures**: IDD (Insurance Distribution Directive) requirements for sales calls

**Only scored if**: This is a new business sales call or renewal

**What's required**:
1. **Needs assessment**: Questions about customer circumstances
2. **Suitability explanation**: Why this product meets their needs
3. **Product information**: Features, benefits, exclusions explained
4. **Demands and needs statement**: Summarize customer requirements
5. **No pressure selling**: Customer not rushed or pressured

**Scoring**:
- **10/10**: Full needs-based sale, customer-centric
- **7-8/10**: Good needs assessment, minor gaps
- **4-6/10**: Incomplete needs assessment
- **0-3/10**: No needs assessment or pressure selling
- **N/A**: Not a sales call (e.g., claims, service call)

**Why it matters**: IDD Article 20 requires suitability for advised sales. Mis-selling can result in FCA fines and customer compensation.

---

#### 14. **Complaints Handling** (0-10 or N/A)
**What it measures**: DISP (Dispute Resolution) compliance

**Only scored if**: Customer raises a complaint during the call

**What's required**:
1. **Immediate acknowledgment**: "I'm logging this as a formal complaint"
2. **Complaint reference number**: Issued immediately
3. **8-week timeline**: "We'll resolve within 8 weeks or explain any delay"
4. **FOS rights**: "If not resolved, you can refer to the Financial Ombudsman Service"
5. **Never discourage**: Don't minimize or dismiss complaints

**Scoring**:
- **10/10**: Full DISP compliance, empathetic handling
- **7-8/10**: Compliant but could be more empathetic
- **4-6/10**: Missing some DISP requirements
- **0-3/10**: Dismisses complaint or doesn't log it
- **N/A**: No complaint raised

**Critical error**: Discouraging complaints or not logging them is a **serious FCA breach** (DISP 1.4).

**Why it matters**: DISP is FCA rules on fair complaint handling. Failures harm customers and breach FCA regulations.

---

## Overall Score Calculation

### How It's Calculated

The **Overall Score** is the **average of all applicable scores**:

```
Overall Score = (Sum of all dimension scores) / (Number of dimensions)
```

**Example**:
- Rapport: 8
- Needs Discovery: 7
- Product Knowledge: 9
- Objection Handling: 8
- Closing: 7
- Compliance: 7
- Professionalism: 9
- Follow-Up: 8
- Call Opening Compliance: 5 ⚠️
- Data Protection Compliance: 9
- Mandatory Disclosures: 6 ⚠️
- TCF Compliance: 8
- Sales Process Compliance: 7
- Complaints Handling: N/A (not applicable)

**Calculation**: (8+7+9+8+7+7+9+8+5+9+6+8+7) / 13 = **7.5/10**

### Compliance Score Calculation

The system also calculates a separate **Compliance Score** shown on the dashboard:

```
Compliance Score = Average of UK Compliance dimensions (9-14 above)
```

This is the **average of**:
- Call Opening Compliance
- Data Protection Compliance
- Mandatory Disclosures
- TCF Compliance
- Sales Process Compliance (if applicable)
- Complaints Handling (if applicable)

**Why separate?**: Makes it easy to see compliance performance at a glance on the dashboard.

---

## Score Interpretation Guide

### Overall Performance Bands

| Score | Rating | Meaning | Action Required |
|-------|--------|---------|-----------------|
| **9.0-10.0** | 🟢 Excellent | Outstanding performance, best practice | Share as coaching example |
| **8.0-8.9** | 🟢 Very Good | Strong performance, minor improvements | Light coaching on specific areas |
| **7.0-7.9** | 🟡 Good | Acceptable performance, some gaps | Coaching session recommended |
| **6.0-6.9** | 🟡 Satisfactory | Needs improvement in multiple areas | Coaching session required |
| **5.0-5.9** | 🟠 Needs Work | Significant gaps, below standard | Formal coaching + follow-up |
| **4.0-4.9** | 🟠 Poor | Multiple failures, customer impact | Immediate coaching + QA review |
| **0.0-3.9** | 🔴 Critical | Serious issues, regulatory risk | Urgent intervention required |

### Compliance-Specific Bands

For UK Compliance dimensions (9-14), use stricter thresholds:

| Score | Rating | Action Required |
|-------|--------|-----------------|
| **9.0-10.0** | 🟢 Fully Compliant | No action needed |
| **8.0-8.9** | 🟢 Largely Compliant | Minor coaching |
| **7.0-7.9** | 🟡 Partially Compliant | Coaching required |
| **6.0-6.9** | 🟠 Non-Compliant (Low Risk) | Immediate coaching + re-training |
| **5.0-5.9** | 🟠 Non-Compliant (Medium Risk) | Escalate to compliance team |
| **0.0-4.9** | 🔴 Non-Compliant (High Risk) | Urgent compliance review + disciplinary |

**Why stricter?**: Compliance failures carry regulatory and legal risk. A 7/10 in rapport is fine; a 7/10 in data protection is a compliance gap.

---

## Compliance Issues

### Severity Levels

Every compliance issue is tagged with a severity level:

#### 🔴 **Critical** (Immediate Action Required)
- **Examples**: No DPA verification, pressure selling, misleading information, complaint dismissed
- **Risk**: Regulatory breach, customer harm, FCA sanctions
- **Action**: Stop agent from taking calls, immediate re-training, escalate to compliance

#### 🟠 **High** (Priority Remediation)
- **Examples**: Missing mandatory disclosures, no cooling-off rights explained, inadequate needs assessment
- **Risk**: Regulatory breach, customer not fully informed
- **Action**: Coaching session within 24 hours, mandatory e-learning, follow-up QA

#### 🟡 **Medium** (Requires Attention)
- **Examples**: Incomplete needs discovery, unclear pricing breakdown, documentation gaps
- **Risk**: Customer confusion, possible mis-selling
- **Action**: Coaching session within 1 week, focus on specific area

#### 🟢 **Low** (Quality Improvement)
- **Examples**: Limited empathy, could explain features better, basic professionalism
- **Risk**: Customer experience impact, no regulatory risk
- **Action**: Coaching in next 1-on-1, add to team training topics

### Compliance Issue Structure

Each compliance issue includes:

1. **Severity**: Critical/High/Medium/Low (see above)
2. **Category**: Which compliance dimension it relates to
3. **Issue**: Clear description of what went wrong
4. **Regulatory Reference**: The specific law/regulation breached (e.g., "GDPR Article 13")
5. **Timestamp**: When it occurred in the call (or null if throughout)
6. **Remediation**: What the agent should have said/done, with example script

**Example Compliance Issue**:

```
🔴 CRITICAL

Category: Data Protection Compliance
Issue: Agent accessed policy details before verifying customer identity
Regulatory Reference: GDPR Article 5 (Lawfulness of Processing)
Timestamp: 0:45

Remediation:
GDPR Article 5 requires lawful processing of personal data. Before accessing
any customer information, agent must verify identity using DPA security questions.

What to say: "Before I access your policy, I need to verify your identity for
data protection. Can I please take your full name and date of birth?"

Why it matters: Ensures only the policy holder can access their sensitive
personal data, preventing data breaches and identity fraud.
```

---

## How to Use the Scores

### For QA Reviews

1. **Start with Overall Score**: Get initial impression
2. **Check Compliance Score**: Identify any regulatory risks
3. **Review Critical/High Issues**: Address urgent compliance gaps first
4. **Look at Dimension Breakdown**: Identify specific improvement areas
5. **Read Evidence**: Review key moments and quotes to validate AI assessment
6. **Create Action Plan**: Use coaching recommendations as starting point

### For Agent Coaching

1. **Share the Overall Score**: "You scored 7.5/10 overall"
2. **Highlight Strengths**: "Your rapport building was excellent at 9/10"
3. **Focus on 1-2 Areas**: "Let's work on Call Opening Compliance (5/10)"
4. **Show Evidence**: Play the timestamp where the issue occurred
5. **Provide Script**: Use the remediation section to show what to say
6. **Set Action**: "On your next call, I want to hear these three disclosures"

### For Team Performance

1. **Dashboard View**: See all calls with scores and compliance flags
2. **Filter by Call Type**: Review specific types (sales, renewals, etc.)
3. **Identify Trends**: Are multiple agents struggling with same dimension?
4. **Team Training**: Use common issues to create targeted training sessions
5. **Best Practice**: Share high-scoring calls as examples

---

## AI Accuracy & Limitations

### What AI Does Well

✅ **Objective scoring**: No bias, same standards every time
✅ **Evidence-based**: Every score backed by specific quotes
✅ **Comprehensive**: Evaluates all 14 dimensions consistently
✅ **Fast**: 60-90 seconds vs 20-30 minutes for manual review
✅ **Regulatory knowledge**: Up-to-date with FCA, GDPR, IDD rules

### What AI Can't Do (Yet)

❌ **Tone/emotion detection**: May miss subtle sarcasm or frustration
❌ **Context outside call**: Doesn't know customer history or special circumstances
❌ **Judgment calls**: Can't decide if agent "should have known" something unusual
❌ **Real-world impact**: Doesn't know if customer actually filed a complaint later

### When to Override AI Scores

You should **manually review and adjust** if:

1. **Special circumstances**: Customer was aggressive, technical issues, etc.
2. **False positives**: AI flagged something that was actually acceptable in context
3. **Missed nuance**: Call had exceptional service AI didn't fully appreciate
4. **System limitations**: Transcription errors caused incorrect scoring

**Important**: Always document why you adjusted a score for audit purposes.

---

## Regulatory References

The system links to official regulations. Here's what they mean:

### UK Regulations

| Reference | Full Name | What It Covers |
|-----------|-----------|----------------|
| **GDPR** | General Data Protection Regulation | Data privacy rights, consent, security |
| **DPA 2018** | Data Protection Act 2018 | UK implementation of GDPR |
| **ICOBS** | Insurance Conduct of Business Sourcebook | FCA rules for insurance sales & servicing |
| **PRIN** | Principles for Businesses | 11 fundamental FCA principles (esp. Principle 6 - TCF) |
| **DISP** | Dispute Resolution | FCA rules on complaint handling |
| **SYSC** | Senior Management Systems & Controls | Governance, risk management, record-keeping |
| **IDD** | Insurance Distribution Directive | EU directive on insurance sales (UK retained) |

### Key FCA Principles

1. **Integrity**: Conduct business with integrity
2. **Skill, care & diligence**: Carry out business with due skill, care and diligence
3. **Management & control**: Take reasonable care to organize and control affairs responsibly
4. **Financial prudence**: Maintain adequate financial resources
5. **Market conduct**: Observe proper standards of market conduct
6. **TCF**: **Treat customers fairly** ← Most important for call QA
7. **Communications**: Pay due regard to information needs, communicate clearly
8. **Conflicts of interest**: Manage conflicts fairly
9. **Customer relationships**: Take reasonable care to ensure suitability
10. **Client assets**: Arrange adequate protection
11. **Relations with regulators**: Deal openly and cooperatively with FCA

**Principle 6 (TCF) is the foundation of all customer interactions.**

---

## FAQs

### Q: Can agents game the AI scoring?

**A**: Very difficult. The AI evaluates based on actual regulatory requirements and evidence from the transcript. An agent can't "trick" it - they have to actually do the right things.

### Q: What if the AI gets it wrong?

**A**: Review the evidence (quotes, timestamps) first. If AI is genuinely wrong, manually adjust the score and document why. This helps improve the system.

### Q: Why are compliance scores so strict?

**A**: Because regulatory failures have serious consequences - FCA fines, customer complaints, legal action. We want to catch issues before they become problems.

### Q: How often should we review AI scores?

**A**: Review 100% of Critical compliance issues immediately. Sample-check 10-20% of all calls to validate AI accuracy. Trust the AI for routine reviews.

### Q: Can we customize the scoring criteria?

**A**: Yes! The AI prompt can be adjusted to emphasize certain dimensions or add company-specific requirements. Speak to your technical team about customization.

### Q: What's the difference between Overall Score and Compliance Score?

**A**:
- **Overall Score**: Average of all 14 dimensions (general performance)
- **Compliance Score**: Average of only the 6 UK compliance dimensions (regulatory focus)

Both are useful - Overall for agent performance reviews, Compliance for regulatory risk management.

---

## Quick Reference: Score Meanings

| Score | What It Means in Plain English |
|-------|--------------------------------|
| **10** | Perfect - couldn't be better |
| **9** | Excellent - only minor nitpicks |
| **8** | Very good - strong performance |
| **7** | Good - some room for improvement |
| **6** | Acceptable - noticeable gaps |
| **5** | Below standard - needs work |
| **4** | Poor - multiple failures |
| **3** | Very poor - serious issues |
| **2** | Critical - major problems |
| **1** | Unacceptable - complete failure |
| **0** | Did not attempt or complete failure |

---

## Support & Questions

If you have questions about the scoring system:

1. **Check the evidence**: Look at the quotes and timestamps AI provided
2. **Review this guide**: See the dimension definitions above
3. **Manual review**: Listen to the call yourself if unclear
4. **Technical support**: Contact your system administrator for technical issues
5. **Regulatory questions**: Escalate to your compliance team for regulatory interpretation

---

**Document Version:** 1.0
**Last Updated:** November 2025
**Next Review:** Quarterly or when FCA regulations change
