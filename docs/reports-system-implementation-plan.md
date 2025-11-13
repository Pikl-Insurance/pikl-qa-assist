# Reports System Implementation Plan

## Overview

This document outlines the plan to replicate Pikl Insurance's existing QA reporting system within the Pikl QA Assistant app, replacing manual Excel-based workflows with automated, AI-powered reports.

## Current Pikl QA Workflow (Manual)

The QA team currently maintains two primary reports:

### 1. Individual Agent Scorecard Report
- **Purpose**: Track individual agent performance over 12 months
- **Data**: Monthly scores across all QA dimensions (Rapport, Needs Discovery, Product Knowledge, etc.)
- **Format**: Excel spreadsheet with one tab per agent
- **Columns**: Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec
- **Rows**: Each QA dimension + Overall Score + Compliance Pass/Fail
- **Usage**: Performance reviews, identifying improvement trends, coaching focus areas

### 2. QA Log (Master Register)
- **Purpose**: Comprehensive log of all QA activities
- **Fields**:
  - QA Number (unique identifier)
  - Month
  - Agent Name
  - Auditor Name (Max or Ryan)
  - Date of Call
  - Reference (call ID)
  - Source (inbound/outbound)
  - Call Type (new business, renewals, etc.)
  - Product (home, motor, commercial, etc.)
  - Insurer
  - Summary (brief description)
  - Score (overall numeric score)
  - Mandatory Compliance (Pass/Fail)
  - Internal Score (based on general QA dimensions)
  - Main Feedback Area
  - Action Required (Yes/No)
  - Action Taken (description)
  - Date Closed
- **Usage**: Compliance audits, trend analysis, team performance tracking, regulatory reporting

### 3. Compliance Scoring Mechanism

**Internal Score Key** (used for general QA dimensions):

| Score | Criteria |
|-------|----------|
| 1 | 2 or more compliance fails |
| 2 | 1 compliance fail, score under 85% |
| 3 | 1 compliance fail, score over 85% OR no compliance fails, score under 85% |
| 4 | No compliance fails, score over 85% | ⭐ TARGET
| 5 | No compliance fails, score over 95% |

**Mandatory Compliance**: Pass/Fail based on critical regulatory requirements

## Proposed Reports Architecture

### Phase 1: Core Reports (Immediate)

#### 1.1 Individual Agent Scorecard
**Route**: `/reports/agent-scorecard`

**Features**:
- Agent selector dropdown
- Date range picker (default: last 12 months)
- Monthly breakdown table showing:
  - All 14 dimensions (8 general QA + 6 UK compliance)
  - Overall Score
  - Compliance Pass/Fail
  - Internal Score (1-5 scale)
  - Number of calls analyzed that month
- Trend visualization:
  - Line chart showing overall score over time
  - Sparklines for each dimension
  - Compliance pass rate percentage
- Export options: PDF, CSV, Excel

**Data Aggregation**:
```typescript
interface MonthlyAgentStats {
  month: string; // "2024-11"
  agentId: string;
  agentName: string;
  callsAnalyzed: number;

  // Average scores
  overallScore: number;
  rapport: number;
  needsDiscovery: number;
  productKnowledge: number;
  objectionHandling: number;
  closing: number;
  compliance: number;
  professionalism: number;
  followUp: number;
  callOpeningCompliance: number;
  dataProtectionCompliance: number;
  mandatoryDisclosures: number;
  tcfCompliance: number;
  salesProcessCompliance: number;
  complaintsHandling: number | null;

  // Compliance metrics
  compliancePassCount: number;
  complianceFailCount: number;
  compliancePassRate: number; // percentage
  criticalIssuesCount: number;

  // Internal score (1-5)
  internalScore: number;
}
```

#### 1.2 QA Log (Master Register)
**Route**: `/reports/qa-log`

**Features**:
- Filterable table with all QA activities
- Filters:
  - Date range
  - Agent(s)
  - Auditor (currently "AI", future: human auditor name)
  - Call Type
  - Compliance Pass/Fail
  - Internal Score (1-5)
  - Action Required (Yes/No)
  - Status (Open/Closed)
- Sortable columns
- Inline editing for:
  - Main Feedback Area (manual override)
  - Action Required
  - Action Taken
  - Date Closed
- Bulk export: PDF, CSV, Excel
- Print-friendly view

**Data Structure**:
```typescript
interface QALogEntry {
  qaNumber: string; // auto-generated unique ID
  month: string; // "2024-11"
  agentName: string;
  agentId: string;
  auditorName: string; // "AI" or human name
  dateOfCall: string; // ISO date
  reference: string; // call.id
  source: 'inbound' | 'outbound';
  callType: CallType;
  product: string; // "home", "motor", "commercial", etc.
  insurer: string; // "Pikl" or underwriter name
  summary: string; // analysis.summary
  score: number; // analysis.overallScore
  mandatoryCompliance: 'pass' | 'fail';
  internalScore: 1 | 2 | 3 | 4 | 5;
  mainFeedbackArea: string; // manual field or top coaching item
  actionRequired: boolean;
  actionTaken: string | null;
  dateClosed: string | null;

  // Links
  callUrl: string; // link to full analysis
}
```

#### 1.3 Export Report (Individual Call)
**Location**: Call detail page (`/calls/[id]`)

**Features**:
- Export button with dropdown: "Export as PDF" | "Export as CSV"
- PDF includes:
  - Call metadata (agent, date, duration, call type)
  - Overall score with visual gauge
  - All 14 dimension scores with color-coding
  - Compliance issues summary (severity color-coded)
  - Coaching recommendations
  - Top 5 key moments (positive and negative)
  - Regulatory references
  - QA Manager signature section (for sign-off)
  - Timestamp and unique QA number
- CSV includes:
  - All scores in columns
  - Compliance issues as rows
  - Machine-readable format for bulk analysis

**Implementation**:
- Use `react-to-pdf` or `jsPDF` for PDF generation
- Include Pikl branding/logo
- Watermark with generation date and QA number

### Phase 2: Analytics Dashboard (Next Priority)

#### 2.1 Team Performance Overview
**Route**: `/analytics/team`

**Features**:
- Date range selector
- Team-wide metrics:
  - Average overall score (trend over time)
  - Compliance pass rate
  - Total calls analyzed
  - Average scores by dimension (radar chart)
- Agent leaderboard:
  - Highest performers
  - Most improved
  - Needs attention (low scores or compliance fails)
- Call type breakdown:
  - Performance by call type
  - Compliance rates by call type
- Top compliance issues:
  - Which regulations are most frequently breached
  - Trends over time

#### 2.2 Agent Performance Drilldown
**Route**: `/analytics/agent/[id]`

**Features**:
- 12-month trend analysis:
  - Overall score trend line
  - Dimension-specific trends
  - Compliance pass rate trend
- Performance distribution:
  - Histogram of scores
  - Percentage breakdown (excellent/good/needs improvement)
- Strengths vs Weaknesses:
  - Top 3 strongest dimensions
  - Top 3 areas for improvement
- Coaching effectiveness:
  - Track improvement after coaching interventions
  - Before/after analysis
- Call type proficiency:
  - Best performing call types
  - Areas needing training

#### 2.3 Compliance Analytics
**Route**: `/analytics/compliance`

**Features**:
- Regulatory compliance overview:
  - Pass/fail rates by regulation (GDPR, ICOBS, TCF, etc.)
  - Trend over time
  - Severity distribution (critical, high, medium, low)
- Issue heatmap:
  - Which compliance rules trigger most often
  - By agent, by call type, by time period
- Risk assessment:
  - Agents with high critical issue counts
  - Call types with lowest compliance rates
  - Regulatory exposure score
- Remediation tracking:
  - Open compliance issues
  - Average time to resolve
  - Recurrence rates

### Phase 3: Advanced Features (Future)

#### 3.1 Automated Insights
- AI-generated insights: "Agent X has improved 15% in Needs Discovery over last 3 months"
- Anomaly detection: "Unusual spike in compliance fails for renewals this week"
- Predictive analytics: "Agent Y at risk of compliance fail based on trend"

#### 3.2 Coaching Workflow Integration
- Assign coaching actions directly from reports
- Track coaching completion
- Link coaching to performance improvement

#### 3.3 Custom Report Builder
- Drag-and-drop interface
- Select metrics, filters, date ranges
- Save custom reports
- Schedule automated email delivery

## Technical Implementation

### Database Schema Updates

We'll need to extend our current data model:

```typescript
// New table: qa_log_entries
interface QALogEntry {
  id: string; // primary key
  qaNumber: string; // unique, auto-generated (e.g., "QA-2024-11-001")
  callId: string; // foreign key to calls table

  // Metadata
  month: string;
  agentName: string;
  agentId: string;
  auditorName: string;
  dateOfCall: Date;

  // Call details
  source: 'inbound' | 'outbound';
  callType: CallType;
  product: string;
  insurer: string;

  // Scores
  overallScore: number;
  internalScore: 1 | 2 | 3 | 4 | 5;
  mandatoryCompliance: 'pass' | 'fail';

  // Manual fields
  mainFeedbackArea: string;
  actionRequired: boolean;
  actionTaken: string | null;
  dateClosed: Date | null;

  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string; // user who made manual edits
}

// Computed aggregations (cached for performance)
interface MonthlyAgentStats {
  id: string;
  agentId: string;
  agentName: string;
  month: string; // "2024-11"

  // Aggregated scores (averages)
  callsAnalyzed: number;
  overallScore: number;
  dimensionScores: { [key: string]: number };

  // Compliance
  compliancePassCount: number;
  complianceFailCount: number;
  compliancePassRate: number;
  criticalIssuesCount: number;

  // Internal score breakdown
  internalScore1Count: number; // 2+ compliance fails
  internalScore2Count: number; // 1 fail, <85%
  internalScore3Count: number; // 1 fail >85% or no fails <85%
  internalScore4Count: number; // no fails, >85%
  internalScore5Count: number; // no fails, >95%

  // Cached at
  cachedAt: Date;
}
```

### API Endpoints

```typescript
// QA Log
GET /api/reports/qa-log
  ?startDate=2024-01-01
  &endDate=2024-12-31
  &agentId=233
  &callType=renewals
  &complianceStatus=fail

POST /api/reports/qa-log/[qaNumber]
  // Update manual fields (mainFeedbackArea, actionRequired, etc.)

// Agent Scorecard
GET /api/reports/agent-scorecard/[agentId]
  ?startDate=2024-01-01
  &endDate=2024-12-31

// Export
GET /api/reports/export/call/[callId]
  ?format=pdf|csv

GET /api/reports/export/qa-log
  ?format=pdf|csv|excel
  &filters={...}

// Analytics
GET /api/analytics/team
  ?startDate=2024-01-01
  &endDate=2024-12-31

GET /api/analytics/agent/[agentId]
  ?period=12months

GET /api/analytics/compliance
  ?dimension=dataProtectionCompliance
```

### Internal Score Calculation Logic

```typescript
function calculateInternalScore(analysis: CallAnalysis): 1 | 2 | 3 | 4 | 5 {
  const complianceFails = analysis.complianceIssues.filter(
    issue => issue.severity === 'critical' || issue.severity === 'high'
  ).length;

  const overallPercentage = (analysis.overallScore / 10) * 100;

  if (complianceFails >= 2) return 1;
  if (complianceFails === 1 && overallPercentage < 85) return 2;
  if (complianceFails === 1 && overallPercentage >= 85) return 3;
  if (complianceFails === 0 && overallPercentage < 85) return 3;
  if (complianceFails === 0 && overallPercentage >= 85 && overallPercentage < 95) return 4;
  if (complianceFails === 0 && overallPercentage >= 95) return 5;

  return 3; // default
}
```

### Mandatory Compliance Pass/Fail Logic

```typescript
function calculateMandatoryCompliance(analysis: CallAnalysis): 'pass' | 'fail' {
  const criticalOrHighIssues = analysis.complianceIssues.filter(
    issue => issue.severity === 'critical' || issue.severity === 'high'
  );

  return criticalOrHighIssues.length === 0 ? 'pass' : 'fail';
}
```

## UI/UX Design Principles

### Navigation Structure

```
Dashboard
├── Upload
├── Calls (existing list view)
├── Reports (NEW)
│   ├── QA Log
│   ├── Agent Scorecards
│   └── Export Manager
├── Analytics (NEW)
│   ├── Team Performance
│   ├── Agent Performance
│   └── Compliance Analytics
└── Admin
    └── Compliance Rules
```

### Reports vs Analytics Decision

**Reports Section**:
- Formal, printable documents
- Regulatory compliance focus
- Audit trail and record-keeping
- Export-focused (PDF, CSV, Excel)
- Manual intervention (editing fields, sign-off)

**Analytics Section**:
- Interactive dashboards
- Trend analysis and insights
- Performance improvement focus
- Visual charts and graphs
- Real-time data exploration

**Recommendation**: Keep them separate. Reports for compliance/audit, Analytics for coaching/performance.

## Migration from Current Process

### Step 1: Parallel Running (1 month)
- QA team continues Excel process
- Pikl QA Assistant generates same reports automatically
- Compare outputs, validate accuracy
- Gather feedback on UI/UX

### Step 2: Soft Launch (1 month)
- Use Pikl QA Assistant as primary source
- Keep Excel as backup
- Train QA team on new workflows

### Step 3: Full Migration
- Deprecate Excel-based process
- Pikl QA Assistant is source of truth
- Export historical Excel data into system

## Implementation Timeline

### Week 1-2: Foundation
- [ ] Extend database schema
- [ ] Create QA Log API endpoints
- [ ] Implement internal score calculation
- [ ] Build data aggregation functions

### Week 3-4: QA Log UI
- [ ] Build QA Log table component with filters
- [ ] Implement inline editing
- [ ] Add export functionality (CSV)
- [ ] Create print-friendly view

### Week 5-6: Agent Scorecard
- [ ] Build monthly aggregation logic
- [ ] Create scorecard UI with 12-month view
- [ ] Add trend visualization (line charts)
- [ ] Implement PDF export with branding

### Week 7-8: Individual Call Export
- [ ] Add "Export Report" button to call detail page
- [ ] Implement PDF generation with styling
- [ ] Add CSV export option
- [ ] Include QA number generation

### Week 9-10: Analytics Dashboard (Phase 2 Start)
- [ ] Build team performance overview
- [ ] Create agent drilldown page
- [ ] Implement compliance analytics
- [ ] Add interactive charts

### Week 11-12: Polish & Testing
- [ ] User acceptance testing with Max and Ryan
- [ ] Performance optimization
- [ ] Documentation and training materials
- [ ] Bug fixes and refinements

## Success Metrics

- **Time Savings**: QA team spends 80% less time on manual data entry and report generation
- **Accuracy**: 100% consistency in score calculations (no human error)
- **Compliance**: All regulatory reporting requirements met
- **Adoption**: QA team prefers Pikl QA Assistant over Excel within 1 month
- **Insights**: QA managers can identify trends 10x faster

## Open Questions

1. **Product/Insurer Fields**: Do these need to be captured from filename or manually entered?
2. **Auditor Assignment**: Will human QA managers review AI scores? If so, need user accounts.
3. **Historical Data**: Import existing Excel data or start fresh?
4. **Custom Fields**: Are there other fields the QA team tracks that we should include?
5. **Approval Workflow**: Does Max/Ryan need to "sign off" on AI scores before they're final?

---

**Next Steps**: Review this plan, answer open questions, then prioritize which reports to build first based on QA team's most urgent needs.
