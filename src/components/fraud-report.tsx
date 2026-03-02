import { AlertTriangle, CheckCircle, FileText, TrendingUp } from "lucide-react";
import { RiskBadge } from "@/components/risk-badge";

interface AgentContribution {
  agent: string;
  score?: number;
  status: string;
  findings: string;
}

interface FraudReportProps {
  datasetId?: string;
  transactionId?: string;
  overallRiskScore: number;
  riskCategory: string;
  modality?: string;
  modalityConfidence?: string;
  agentContributions: AgentContribution[];
  keyAssessments?: {
    modalityAnalysis?: string;
    decisionRationale?: string;
    fraudTypology?: string;
    merchantVerification?: string;
  };
  recommendedActions?: string[];
  timestamp?: Date;
}

export function FraudReport({
  datasetId,
  transactionId,
  overallRiskScore,
  riskCategory,
  modality,
  modalityConfidence,
  agentContributions,
  keyAssessments,
  recommendedActions,
  timestamp,
}: FraudReportProps) {
  return (
    <div class="space-y-4 p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700">
      {/* Header */}
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-xl font-bold text-zinc-900 dark:text-white mb-2">
            THEIA Fraud Detection Report
          </h2>
          <div class="flex items-center gap-x-4 text-sm text-zinc-600 dark:text-zinc-400">
            {datasetId && <span>Dataset ID: {datasetId}</span>}
            {transactionId && <span>Transaction ID: {transactionId}</span>}
            {timestamp && <span>{new Date(timestamp).toLocaleString()}</span>}
          </div>
        </div>
        <RiskBadge score={overallRiskScore} />
      </div>

      {/* Modality Classification */}
      {modality && (
        <div class="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <div class="flex items-center gap-x-2 mb-2">
            <FileText size={20} class="text-indigo-600 dark:text-indigo-400" />
            <h3 class="font-semibold text-zinc-900 dark:text-white">
              Data Modality
            </h3>
          </div>
          <div class="text-sm text-zinc-700 dark:text-zinc-300">
            <span class="font-medium">Classification:</span> {modality}
            {modalityConfidence && (
              <span class="ml-2 text-zinc-500 dark:text-zinc-400">
                (Confidence: {modalityConfidence})
              </span>
            )}
          </div>
        </div>
      )}

      {/* Agent Contributions by Phase */}
      <div class="space-y-3">
        <h3 class="font-semibold text-zinc-900 dark:text-white flex items-center gap-x-2">
          <TrendingUp size={20} />
          Agent Analysis Pipeline
        </h3>
        <div class="space-y-2">
          {agentContributions.map((agent, idx) => (
            <div
              key={idx}
              class="p-3 bg-zinc-50 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700"
            >
              <div class="flex items-start justify-between mb-1">
                <span class="font-medium text-sm text-zinc-900 dark:text-white">
                  {agent.agent}
                </span>
                {agent.score !== undefined && (
                  <span class="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded">
                    Score: {agent.score}/100
                  </span>
                )}
              </div>
              <div class="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                Status: {agent.status}
              </div>
              <div class="text-sm text-zinc-700 dark:text-zinc-300">
                {agent.findings}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Assessments */}
      {keyAssessments && (
        <div class="space-y-3">
          <h3 class="font-semibold text-zinc-900 dark:text-white">
            Key Assessments
          </h3>
          <div class="grid md:grid-cols-2 gap-3">
            {keyAssessments.modalityAnalysis && (
              <div class="p-3 bg-zinc-50 dark:bg-zinc-800 rounded">
                <div class="font-medium text-sm text-zinc-900 dark:text-white mb-1">
                  Modality Analysis
                </div>
                <div class="text-sm text-zinc-700 dark:text-zinc-300">
                  {keyAssessments.modalityAnalysis}
                </div>
              </div>
            )}
            {keyAssessments.fraudTypology && (
              <div class="p-3 bg-zinc-50 dark:bg-zinc-800 rounded">
                <div class="font-medium text-sm text-zinc-900 dark:text-white mb-1">
                  Fraud Typology
                </div>
                <div class="text-sm text-zinc-700 dark:text-zinc-300">
                  {keyAssessments.fraudTypology}
                </div>
              </div>
            )}
            {keyAssessments.decisionRationale && (
              <div class="p-3 bg-zinc-50 dark:bg-zinc-800 rounded col-span-full">
                <div class="font-medium text-sm text-zinc-900 dark:text-white mb-1">
                  Decision Rationale
                </div>
                <div class="text-sm text-zinc-700 dark:text-zinc-300">
                  {keyAssessments.decisionRationale}
                </div>
              </div>
            )}
            {keyAssessments.merchantVerification && (
              <div class="p-3 bg-zinc-50 dark:bg-zinc-800 rounded col-span-full">
                <div class="font-medium text-sm text-zinc-900 dark:text-white mb-1">
                  Merchant Verification
                </div>
                <div class="text-sm text-zinc-700 dark:text-zinc-300">
                  {keyAssessments.merchantVerification}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommended Actions */}
      {recommendedActions && recommendedActions.length > 0 && (
        <div class="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
          <div class="flex items-center gap-x-2 mb-3">
            {overallRiskScore >= 71 ? (
              <AlertTriangle
                size={20}
                class="text-amber-600 dark:text-amber-400"
              />
            ) : (
              <CheckCircle
                size={20}
                class="text-green-600 dark:text-green-400"
              />
            )}
            <h3 class="font-semibold text-zinc-900 dark:text-white">
              Recommended Actions
            </h3>
          </div>
          <ul class="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            {recommendedActions.map((action, idx) => (
              <li key={idx} class="flex items-start gap-x-2">
                <span class="text-zinc-500 dark:text-zinc-400">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
