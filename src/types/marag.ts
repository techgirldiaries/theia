/**
 * Type definitions for Multi-Agent RAG (MARAG) System
 * Theia Fraud Intelligence
 */

export type MaragAgentId = "TIRA" | "RCRA" | "HPRA" | "ERRA" | "BARA";

export interface MaragAgent {
  id: MaragAgentId;
  name: string;
  acronym: MaragAgentId;
  domain: string;
  status: "idle" | "active" | "completed" | "error";
  confidence: number | null;
  findings: any;
  icon: any;
  color: string;
}

export interface EvidenceTriangulation {
  cross_agent_correlations: Record<string, number>;
  conflict_resolution: {
    conflicts_detected: number;
    conflicts_resolved: number;
    resolution_method: string;
  };
}

export interface CollaborativeRiskAssessment {
  individual_agent_scores: Record<MaragAgentId, number>;
  weighted_final_score: number;
  uncertainty_quantification: {
    confidence_interval: [number, number];
    uncertainty_sources: string[];
  };
}

export interface AgentConsensus {
  participating_agents: MaragAgentId[];
  consensus_score: number;
  agent_confidence_scores: Record<MaragAgentId, number>;
  evidence_triangulation: EvidenceTriangulation;
  collaborative_risk_assessment: CollaborativeRiskAssessment;
}

export interface TiraFindings {
  threat_patterns_identified?: string[];
  ioc_matches?: number;
  threat_actor_attribution?: string;
}

export interface RcraFindings {
  sanctions_hits?: number;
  pep_matches?: number;
  compliance_violations?: string[];
}

export interface HpraFindings {
  pattern_matches?: string[];
  historical_similarity?: number;
  fraud_typology?: string;
}

export interface ErraFindings {
  network_anomalies?: string[];
  centrality_scores?: {
    betweenness?: number;
    degree?: number;
  };
  fraud_ring_probability?: number;
}

export interface BaraFindings {
  behavioral_anomalies?: string[];
  bot_probability?: number;
  account_takeover_indicators?: number;
}

export interface SpecializedFindings {
  TIRA_findings?: TiraFindings;
  RCRA_findings?: RcraFindings;
  HPRA_findings?: HpraFindings;
  ERRA_findings?: ErraFindings;
  BARA_findings?: BaraFindings;
}

export interface MaragResults {
  agent_consensus: AgentConsensus;
  specialized_findings: SpecializedFindings;
}
