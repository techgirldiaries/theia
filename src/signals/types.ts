import type { Attachment } from "@relevanceai/sdk";

export type ToastMessage = {
  id: string;
  message: string;
  type: "success" | "error" | "info";
};

export type Message = {
  id: string;
  type: "agent-message" | "user-message";
  text: string;
  createdAt: Date;
  isAgent: () => boolean;
  attachments?: Attachment[];
  status?: "sending" | "sent" | "failed";
  read?: boolean;
  errorMessage?: string;
};

export type DatasetInfo = {
  type: string;
  rows?: number;
  columns?: number;
  description: any;
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
  size?: number;
  /** First few rows captured at upload time so re-use doesn't depend on temp URL */
  preview?: string;
  previewFormat?: string;
};

export type PerformanceMetric = {
  taskId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: string;
  riskScore?: number;
  agentContributions?: number;
};

export type FraudStats = {
  totalAnalyzed: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  avgResponseTime: number;
  successRate: number;
};

export type ChatSession = {
  id: string;
  startTime: Date;
  endTime: Date;
  messages: Message[];
  messageCount: number;
  tags?: string[];
  riskLevel?: "low" | "medium" | "high";
};

export type AuditLogEntry = {
  id: string;
  timestamp: Date;
  action:
    | "view"
    | "export"
    | "delete"
    | "upload"
    | "session_start"
    | "session_end";
  userId: string;
  details: string;
  sessionId?: string;
};

export type QuickTemplate = {
  id: string;
  title: string;
  prompt: string;
  category: "analysis" | "report" | "risk" | "investigation";
};

export type MARAGAgent = {
  id: string;
  name: string;
  acronym: string;
  domain: string;
  status: "idle" | "processing" | "completed" | "error";
  confidence: number;
  findings: string[];
  icon: string;
  color: string;
};

export type MARAGConsensus = {
  consensusScore: number;
  agentScores: Record<string, number>;
  correlations: Array<{ agents: string[]; finding: string; strength: number }>;
  conflicts: Array<{ agents: string[]; issue: string }>;
  finalScore: number;
  uncertaintySources: string[];
};

export type Visualization = {
  id: string;
  chartType: string;
  downloadUrl: string;
  filename: string;
  phase: string;
  explanation: {
    title: string;
    keyInsights: string[];
    riskIndicators: string[];
    recommendations: string[];
    technicalDetails: {
      method: string;
      parameters: string[];
      confidence: number;
    };
  };
};

export type BenchmarkResults = {
  datasetsAnalyzed: string[];
  performanceMetrics: Record<
    string,
    {
      precision: number;
      recall: number;
      f1Score: number;
      aucRoc: number;
    }
  >;
  processingTimes: Record<string, string>;
  qualityScores: Record<string, number>;
  statisticalSignificance: Array<{
    comparison: string;
    pValue: number;
    significant: boolean;
    effectSize: number;
  }>;
  bestPerformingDataset: string;
  recommendations: string[];
};
