/**
 * Evaluation types for THEIA Fraud Intelligence
 * Covers qualitative assessment, live phase bridging, and stream state.
 */

import type { ConfusionMatrixValues, RocPoint } from "./benchmarking";

// ── Qualitative evaluation ─────────────────────────────────────────────────────

export type QualitativeGrade = "PASS" | "PARTIAL" | "FAIL";

export interface QualitativeDimension {
  id: string;
  label: string;
  grade: QualitativeGrade;
  /** 0–100 */
  score: number;
  /** Human-readable explanation of why this grade was assigned */
  rationale: string;
  /** Report fields that were inspected to derive this score */
  evidenceFields: string[];
  /** Actionable recommendations when grade is PARTIAL or FAIL */
  recommendations: string[];
}

export interface QualitativeEvaluation {
  overallGrade: QualitativeGrade;
  /** Mean of all dimension scores, 0–100 */
  overallScore: number;
  computedAt: Date;
  dimensions: QualitativeDimension[];
}

// ── Live phase progress (bridge: backend PhaseResult → component CaseProgress) ──

export interface LivePhaseStatus {
  phaseId: string;
  status: "pending" | "in-progress" | "completed" | "failed" | "skipped";
  /** 0–100 */
  progress: number;
  /** Milliseconds */
  duration?: number;
  /** 0–100 */
  confidence?: number;
  /** 0–100 */
  riskScore?: number;
  toolsUsed?: string[];
}

export interface LiveCaseProgress {
  caseId: string;
  /** 0–100 */
  overallProgress: number;
  currentPhase: string;
  phases: Record<string, LivePhaseStatus>;
  completedAt: Date | null;
}

// ── Streaming / parse lifecycle ────────────────────────────────────────────────

export interface EvaluationStreamState {
  lastParsedAt: Date | null;
  /** How many reports have been successfully parsed this session */
  successfulParseCount: number;
  lastParseError: string | null;
  isStreaming: boolean;
}

/**
 * QualitativeEvaluation scoped to a single benchmarked dataset.
 * Derived from dataset-specific performance metrics plus shared
 * report-level data (compliance, agent consensus).
 */
export interface PerDatasetEvaluation extends QualitativeEvaluation {
  datasetName: string;
}

// Re-export for convenience so consumers only need one import
export type { ConfusionMatrixValues, RocPoint };
