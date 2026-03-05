/**
 * Enhanced Fraud Report Type Definitions
 * Theia Fraud Intelligence - Complete Output Structure
 */

import type { MaragResults } from "./marag";
import type { BenchmarkingResults } from "./benchmarking";

// Re-export types for convenience
export type { MaragResults, BenchmarkingResults };
export type { DatasetMetrics, StatisticalTest } from "./benchmarking";
export type {
  MaragAgent,
  AgentConsensus,
  EvidenceTriangulation,
  CollaborativeRiskAssessment,
} from "./marag";

export interface Visualization {
  chart_type: string;
  download_url: string;
  filename: string;
  phase?: string;
  explanation: {
    title: string;
    key_insights: string[];
    risk_indicators: string[];
    recommendations: string[];
    technical_details: string;
  };
}

export interface ProcessingMetadata {
  total_processing_time: string;
  phases_completed: number;
  phases_failed: number;
  data_quality_score: number;
  error_log: any[];
  visualizations_generated: number;
  images_exported: number;
  benchmarking_charts_generated?: number;
  marag_charts_generated?: number;
  marag_agents_deployed?: number;
  agent_consensus_score?: number;
  datasets_compared?: number;
  statistical_tests_performed?: number;
  total_download_size?: string;
}

export interface PhaseResult {
  phase_id: string;
  phase_name: string;
  status: "completed" | "failed" | "skipped";
  duration?: number;
  results?: any;
  error_message?: string;
  confidence?: number;
  risk_score?: number;
  tools_used?: string[];
}

export interface EnhancedFraudReport {
  case_id: string;
  overall_risk_score: number;
  risk_category: "LOW" | "MEDIUM-LOW" | "MEDIUM-HIGH" | "HIGH" | "CRITICAL";
  confidence_level: "High" | "Medium" | "Low";
  fraud_types_detected: string[];

  // MARAG Results
  marag_results?: MaragResults;

  // Benchmarking Results
  benchmarking_results?: BenchmarkingResults;

  // Visualizations
  visualizations?: {
    generated_charts: Visualization[];
    marag_charts: Visualization[];
    benchmarking_charts: Visualization[];
    interactive_dashboards?: any[];
    summary_infographics?: Visualization[];
  };

  // Phase Results
  phase_results: Record<string, PhaseResult>;

  // Key Findings
  key_risk_factors: string[];
  recommendations: string[];

  // Compliance
  compliance_status: {
    sar_ready?: boolean;
    gdpr_compliant?: boolean;
    dora_compliant?: boolean;
    jurisdiction?: string;
  };

  // Audit Trail
  audit_trail: Array<{
    timestamp: string;
    phase: string;
    action: string;
    actor: string;
    evidence_source?: string;
  }>;

  // Processing Metadata
  processing_metadata: ProcessingMetadata;

  // Legacy fields for backward compatibility
  datasetId?: string;
  transactionId?: string;
  modality?: string;
  modalityConfidence?: string;
  timestamp?: Date;
}

/**
 * Helper type for basic fraud reports (backward compatibility)
 */
export interface BasicFraudReport {
  datasetId?: string;
  transactionId?: string;
  overallRiskScore: number;
  riskCategory: string;
  modality?: string;
  modalityConfidence?: string;
  agentContributions: Array<{
    agent: string;
    score?: number;
    status: string;
    findings: string;
  }>;
  keyAssessments?: {
    modalityAnalysis?: string;
    decisionRationale?: string;
    fraudTypology?: string;
    merchantVerification?: string;
  };
  recommendedActions?: string[];
  timestamp?: Date;
}
