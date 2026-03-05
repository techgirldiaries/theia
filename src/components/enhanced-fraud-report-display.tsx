/**
 * Enhanced Fraud Report Display Component
 * Displays comprehensive fraud detection results with MARAG, benchmarking, and visualizations
 */

import { Brain, BarChart3, Image, FileText, Shield, Clock } from "lucide-react";
import { TabNavigator } from "@/components/tab-navigator";
import { RiskBadge } from "@/components/risk-badge";
import { MaragConsensusRadar } from "@/components/marag-consensus-radar";
import {
  VisualizationGallery,
  type Visualization as VizGalleryVisualization,
} from "@/components/visualization-gallery";
import {
  BenchmarkComparison,
  type BenchmarkResults,
} from "@/components/benchmark-comparison";
import type { EnhancedFraudReport } from "@/types/fraud-report";
import type {
  BenchmarkingResults,
  Visualization as ReportVisualization,
} from "@/types/fraud-report";
import {
  hasMaragData,
  hasBenchmarkingData,
  extractMaragResults,
  extractBenchmarkingResults,
} from "@/utils/parse-fraud-report";

/**
 * Adapts BenchmarkingResults from the report to BenchmarkResults expected by BenchmarkComparison
 */
function adaptBenchmarkingResults(
  results: BenchmarkingResults,
): BenchmarkResults {
  const performanceMetrics: Record<string, any> = {};
  const processingTimes: Record<string, string> = {};
  const qualityScores: Record<string, number> = {};

  Object.entries(results.dataset_comparison.performance_metrics).forEach(
    ([dataset, metrics]) => {
      performanceMetrics[dataset] = {
        precision: (metrics as any).precision,
        recall: (metrics as any).recall,
        f1Score: (metrics as any).f1_score,
        aucRoc: (metrics as any).auc_roc,
      };
    },
  );

  Object.entries(results.dataset_comparison.processing_time_comparison).forEach(
    ([dataset, time]) => {
      processingTimes[dataset] = time as string;
    },
  );

  Object.entries(results.dataset_comparison.data_quality_scores).forEach(
    ([dataset, score]) => {
      qualityScores[dataset] = score as number;
    },
  );

  const statisticalSignificance = results.statistical_significance
    ?.accuracy_differences
    ? Object.entries(results.statistical_significance.accuracy_differences).map(
        ([comparison, data]) => ({
          comparison,
          pValue: (data as any).p_value,
          significant: (data as any).significant,
          effectSize: (data as any).effect_size,
        }),
      )
    : [];

  return {
    datasetsAnalyzed: results.dataset_comparison.datasets_analyzed,
    performanceMetrics,
    processingTimes,
    qualityScores,
    statisticalSignificance,
    bestPerformingDataset: results.best_performing_dataset,
    recommendations: results.recommendations,
  };
}

/**
 * Adapts Visualization from the report to the format expected by VisualizationGallery
 */
function adaptVisualization(viz: ReportVisualization): VizGalleryVisualization {
  return {
    chartType: viz.chart_type || "unknown",
    downloadUrl: viz.download_url || "",
    filename: viz.filename || "chart.png",
    phase: viz.phase,
    explanation: {
      title: viz.explanation?.title || "Visualization",
      keyInsights: viz.explanation?.key_insights || [],
      riskIndicators: viz.explanation?.risk_indicators || [],
      recommendations: viz.explanation?.recommendations || [],
      technicalDetails: viz.explanation?.technical_details || "",
    },
  };
}

interface EnhancedFraudReportDisplayProps {
  report: EnhancedFraudReport;
}

export function EnhancedFraudReportDisplay({
  report,
}: EnhancedFraudReportDisplayProps) {
  const hasMarag = hasMaragData(report);
  const hasBenchmark = hasBenchmarkingData(report);
  const maragResults = hasMarag ? extractMaragResults(report) : null;
  const benchmarkingResults = hasBenchmark
    ? extractBenchmarkingResults(report)
    : null;

  // Adapt benchmarking results to expected format
  const adaptedBenchmarkResults = benchmarkingResults
    ? adaptBenchmarkingResults(benchmarkingResults)
    : null;

  // Adapt visualizations to expected format
  const allVisualizations = [
    ...(report.visualizations?.generated_charts || []),
    ...(report.visualizations?.marag_charts || []),
    ...(report.visualizations?.benchmarking_charts || []),
  ].map(adaptVisualization);

  const tabs = [
    {
      id: "summary",
      label: "Summary",
      icon: FileText,
      content: (
        <div class="space-y-4">
          {/* Header */}
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                THEIA Fraud Detection Report
              </h2>
              <p class="text-sm text-zinc-600 dark:text-zinc-400">
                Case ID: {report.case_id}
              </p>
            </div>
            <RiskBadge score={report.overall_risk_score} />
          </div>

          {/* Risk Category */}
          <div class="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  Risk Category
                </p>
                <p class="text-lg font-bold text-zinc-900 dark:text-white">
                  {report.risk_category}
                </p>
              </div>
              <div>
                <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  Confidence Level
                </p>
                <p class="text-lg font-bold text-zinc-900 dark:text-white">
                  {report.confidence_level}
                </p>
              </div>
              <div>
                <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  Phases Completed
                </p>
                <p class="text-lg font-bold text-zinc-900 dark:text-white">
                  {report.processing_metadata.phases_completed}/15
                </p>
              </div>
              <div>
                <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  Processing Time
                </p>
                <p class="text-lg font-bold text-zinc-900 dark:text-white">
                  {report.processing_metadata.total_processing_time}
                </p>
              </div>
            </div>
          </div>

          {/* Fraud Types */}
          {report.fraud_types_detected &&
            report.fraud_types_detected.length > 0 && (
              <div>
                <h3 class="text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                  Detected Fraud Types
                </h3>
                <div class="flex flex-wrap gap-2">
                  {report.fraud_types_detected.map((type) => (
                    <span
                      key={type}
                      class="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-full"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* Key Risk Factors */}
          {report.key_risk_factors && report.key_risk_factors.length > 0 && (
            <div>
              <h3 class="text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                Key Risk Factors
              </h3>
              <ul class="space-y-2">
                {report.key_risk_factors.map((factor, idx) => (
                  <li
                    key={idx}
                    class="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    <span class="text-red-600">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {report.recommendations && report.recommendations.length > 0 && (
            <div class="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Recommended Actions
              </h3>
              <ul class="space-y-2">
                {report.recommendations.map((action, idx) => (
                  <li
                    key={idx}
                    class="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-300"
                  >
                    <span>→</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "marag",
      label: "MARAG Intelligence",
      icon: Brain,
      badge: hasMarag
        ? report.processing_metadata.marag_agents_deployed
        : undefined,
      condition: hasMarag,
      content: maragResults?.agent_consensus ? (
        <div class="space-y-6">
          <MaragConsensusRadar consensus={maragResults.agent_consensus} />

          {/* Individual Agent Scores */}
          <div class="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
            <h3 class="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
              Individual Agent Risk Scores
            </h3>
            <div class="space-y-2">
              {Object.entries(
                maragResults.agent_consensus.collaborative_risk_assessment
                  .individual_agent_scores,
              ).map(([agent, score]) => (
                <div key={agent} class="flex items-center justify-between">
                  <span class="text-sm text-zinc-700 dark:text-zinc-300">
                    {agent}
                  </span>
                  <span class="text-sm font-bold text-zinc-900 dark:text-white">
                    {score}/100
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Correlation Matrix */}
          {maragResults.agent_consensus.evidence_triangulation
            .cross_agent_correlations && (
            <div class="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
                Cross-Agent Evidence Correlations
              </h3>
              <div class="space-y-2">
                {Object.entries(
                  maragResults.agent_consensus.evidence_triangulation
                    .cross_agent_correlations,
                ).map(([pair, correlation]) => (
                  <div key={pair} class="flex items-center justify-between">
                    <span class="text-sm text-zinc-700 dark:text-zinc-300">
                      {pair.replace("_", " ↔ ")}
                    </span>
                    <div class="flex items-center gap-2">
                      <div class="w-24 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                        <div
                          class="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${correlation * 100}%` }}
                        ></div>
                      </div>
                      <span class="text-sm font-bold text-zinc-900 dark:text-white w-12 text-right">
                        {Math.round(correlation * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p class="text-zinc-600 dark:text-zinc-400">No MARAG data available</p>
      ),
    },
    {
      id: "benchmarking",
      label: "Benchmarking",
      icon: BarChart3,
      badge: hasBenchmark
        ? report.processing_metadata.datasets_compared
        : undefined,
      condition: hasBenchmark,
      content: adaptedBenchmarkResults ? (
        <BenchmarkComparison results={adaptedBenchmarkResults} />
      ) : (
        <p class="text-zinc-600 dark:text-zinc-400">
          No benchmarking data available
        </p>
      ),
    },
    {
      id: "visualizations",
      label: "Visualizations",
      icon: Image,
      badge: allVisualizations.length || undefined,
      condition: allVisualizations.length > 0,
      content: <VisualizationGallery visualizations={allVisualizations} />,
    },
    {
      id: "phases",
      label: "Phase Pipeline",
      icon: Clock,
      badge: report.processing_metadata.phases_completed,
      content: (
        <div class="space-y-4">
          <p class="text-sm text-zinc-600 dark:text-zinc-400">
            All {report.processing_metadata.phases_completed} phases completed
            successfully
          </p>

          {/* Phase Results Summary */}
          {report.phase_results &&
            Object.keys(report.phase_results).length > 0 && (
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(report.phase_results).map(
                  ([phaseId, result]) => (
                    <div
                      key={phaseId}
                      class="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4"
                    >
                      <h4 class="text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                        {result.phase_name}
                      </h4>
                      <div class="flex items-center justify-between">
                        <span class="text-xs text-zinc-600 dark:text-zinc-400">
                          Status
                        </span>
                        <span
                          class={`text-xs font-medium ${
                            result.status === "completed"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {result.status}
                        </span>
                      </div>
                      {result.duration && (
                        <div class="flex items-center justify-between mt-1">
                          <span class="text-xs text-zinc-600 dark:text-zinc-400">
                            Duration
                          </span>
                          <span class="text-xs text-zinc-900 dark:text-white">
                            {result.duration}ms
                          </span>
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            )}
        </div>
      ),
    },
    {
      id: "compliance",
      label: "Compliance",
      icon: Shield,
      content: (
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-green-900 dark:text-green-300 mb-2">
                SAR Ready
              </h4>
              <p class="text-2xl font-bold text-green-600">
                {report.compliance_status.sar_ready ? "✓" : "✗"}
              </p>
            </div>
            <div class="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                GDPR Compliant
              </h4>
              <p class="text-2xl font-bold text-blue-600">
                {report.compliance_status.gdpr_compliant ? "✓" : "✗"}
              </p>
            </div>
            <div class="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">
                DORA Compliant
              </h4>
              <p class="text-2xl font-bold text-purple-600">
                {report.compliance_status.dora_compliant ? "✓" : "✗"}
              </p>
            </div>
          </div>

          {/* Audit Trail */}
          {report.audit_trail && report.audit_trail.length > 0 && (
            <div class="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
                Audit Trail
              </h3>
              <div class="space-y-2 max-h-96 overflow-y-auto">
                {report.audit_trail.map((entry, idx) => (
                  <div
                    key={idx}
                    class="text-xs text-zinc-600 dark:text-zinc-400 border-l-2 border-indigo-600 pl-3 py-1"
                  >
                    <p class="font-medium text-zinc-900 dark:text-white">
                      {entry.phase}: {entry.action}
                    </p>
                    <p class="text-zinc-500 dark:text-zinc-400">
                      {entry.timestamp} - {entry.actor}
                    </p>
                    {entry.evidence_source && (
                      <p class="text-zinc-400 dark:text-zinc-500">
                        Source: {entry.evidence_source}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div class="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6">
      <TabNavigator tabs={tabs} defaultTab="summary" />
    </div>
  );
}
