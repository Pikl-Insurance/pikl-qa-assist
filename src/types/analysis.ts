/**
 * Analysis Types
 * Represents AI-powered QA analysis results from Claude
 */

export type KeyMomentType = 'positive' | 'negative' | 'neutral';

export type QACategory =
  | 'rapport'
  | 'needsDiscovery'
  | 'productKnowledge'
  | 'objectionHandling'
  | 'closing'
  | 'compliance'
  | 'professionalism'
  | 'followUp';

export interface KeyMoment {
  timestamp: number; // seconds from start
  type: KeyMomentType;
  category: string;
  description: string;
  quote: string; // Actual text from transcript
}

export interface QAScores {
  rapport: number; // 0-10
  needsDiscovery: number; // 0-10
  productKnowledge: number; // 0-10
  objectionHandling: number; // 0-10
  closing: number; // 0-10
  compliance: number; // 0-10
  professionalism: number; // 0-10
  followUp: number; // 0-10
}

export interface ComplianceIssue {
  severity: 'minor' | 'moderate' | 'critical';
  description: string;
  timestamp: number; // seconds from start
}

export interface Analysis {
  callId: string;
  overallScore: number; // 0-10, average of all scores
  scores: QAScores;
  keyMoments: KeyMoment[];
  coachingRecommendations: string[];
  summary: string;
  callOutcome: string;
  outcomeMetrics?: {
    quotesCompleted?: number;
    salesCompleted?: number;
    renewalsCompleted?: number;
  };
  complianceIssues?: (string | ComplianceIssue)[]; // Support both legacy strings and new object format
  processingTime?: number; // ms taken to analyze
}

export interface AnalysisResponse {
  analysis: Analysis;
  rawResponse?: any; // Store raw Claude API response for debugging
}

// Helper type for scoring rubric
export interface ScoringCriteria {
  dimension: QACategory;
  description: string;
  scoreDefinitions: {
    range: string; // e.g., "8-10", "5-7", "0-4"
    description: string;
  }[];
}
