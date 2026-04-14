/**
 * EvaluationDashboard — 6-tab comprehensive evaluation hub.
 *
 * Tabs:
 *  1. Overview        — risk summary, live stream state, qualitative grade
 *  2. Quantitative    — confusion matrices, ROC curves, metric comparison, significance heatmap
 *  3. MARAG           — agent correlation heatmap, confidence bars, uncertainty
 *  4. Qualitative     — QualitativeAssessment component
 *  5. Pipeline        — LivePhasePipeline, phase timing waterfall, error log
 *  6. Compliance      — SAR/GDPR/DORA cards, audit trail, export button
 *
 * All data read exclusively from signals — no props required.
 */

import { useState } from "preact/hooks";
import {
  BarChart3,
  ShieldCheck,
  Users,
  GitBranch,
  Scale,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Activity,
} from "lucide-react";
import {
  benchmarkResults,
  evaluationStreamState,
  latestEnhancedReport,
  liveCaseProgress,
  maragConsensus,
  perDatasetEvaluations,
  qualitativeEvaluation,
} from "@/signals";
import { exportEvaluationReport } from "@/signals/actions";
import {
  AgentCorrelationHeatmap,
  StatisticalSignificanceHeatmap,
} from "./heatmap";
import { RocCurve, buildRocSeriesFromBenchmark } from "./roc-curve";
import {
  ConfusionMatrix,
  estimateConfusionMatrix,
} from "./confusion-matrix";
import {
  StatisticalDistribution,
  buildComparisonSeriesFromBenchmark,
} from "./statistical-distribution";
import { QualitativeAssessment } from "./qualitative-assessment";
import { LivePhasePipeline } from "./phase-pipeline";
import type { CaseProgress } from "./phase-pipeline";

// ── Empty fallback for LivePhasePipeline ──────────────────────────────────────

const EMPTY_PROGRESS: CaseProgress = {
  caseId:          "—",
  overallProgress: 0,
  currentPhase:    "phase-0",
  phases:          [],
};

// ── Tab definitions ────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview",     label: "Overview",      icon: Activity  },
  { id: "quantitative", label: "Quantitative",  icon: BarChart3 },
  { id: "marag",        label: "MARAG",         icon: Users     },
  { id: "qualitative",  label: "Qualitative",   icon: ShieldCheck },
  { id: "pipeline",     label: "Pipeline",      icon: GitBranch },
  { id: "compliance",   label: "Compliance",    icon: Scale     },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ── Helpers ────────────────────────────────────────────────────────────────────

function StreamBadge() {
  const { isStreaming, lastParsedAt } = evaluationStreamState.value;
  if (!lastParsedAt && !isStreaming) {
    return (
      <span class="flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-700 text-zinc-500 text-xs rounded-full">
        <span class="w-1.5 h-1.5 rounded-full bg-zinc-400 inline-block" />
        Awaiting analysis
      </span>
    );
  }
  if (isStreaming) {
    return (
      <span class="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
        <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
        Streaming…
      </span>
    );
  }
  const secs = lastParsedAt
    ? Math.round((Date.now() - lastParsedAt.getTime()) / 1000)
    : null;
  return (
    <span class="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
      <span class="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
      Live{secs !== null ? ` · ${secs}s ago` : ""}
    </span>
  );
}

function MetricPill({
  label,
  value,
  color,
}: { label: string; value: string; color: string }) {
  return (
    <div class={`border ${color} rounded-lg p-3 text-center`}>
      <div class="text-lg font-bold text-zinc-900 dark:text-white">{value}</div>
      <div class="text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
    </div>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────────

function OverviewTab() {
  const report = latestEnhancedReport.value;
  const qual   = qualitativeEvaluation.value;
  const br     = benchmarkResults.value;

  if (!report) {
    return (
      <div class="text-center py-12">
        <Zap size={40} class="mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
        <p class="text-zinc-500 dark:text-zinc-400 text-sm">
          No analysis results yet. Start a fraud detection analysis to populate this dashboard.
        </p>
      </div>
    );
  }

  const riskColor =
    report.risk_category === "CRITICAL" || report.risk_category === "HIGH"
      ? "border-red-300 dark:border-red-700"
      : report.risk_category === "MEDIUM-HIGH"
        ? "border-amber-300 dark:border-amber-700"
        : "border-emerald-300 dark:border-emerald-700";

  const bestDataset = br?.bestPerformingDataset;
  const bestMetrics = bestDataset ? br?.performanceMetrics[bestDataset] : null;

  return (
    <div class="space-y-4">
      {/* Risk hero */}
      <div class={`border ${riskColor} rounded-lg p-4 bg-white dark:bg-zinc-800`}>
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">Case ID</p>
            <p class="font-mono text-sm text-zinc-900 dark:text-white font-semibold">
              {report.case_id}
            </p>
          </div>
          <div class="text-right">
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">Risk Score</p>
            <p class="text-3xl font-bold text-zinc-900 dark:text-white">
              {report.overall_risk_score}
              <span class="text-sm font-normal text-zinc-400">/100</span>
            </p>
          </div>
          <div class="text-right">
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">Category</p>
            <span class={`px-2 py-1 rounded font-bold text-sm ${
              report.risk_category === "CRITICAL" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              : report.risk_category === "HIGH" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
            }`}>
              {report.risk_category}
            </span>
          </div>
        </div>

        {report.fraud_types_detected?.length > 0 && (
          <div class="mt-3 flex flex-wrap gap-1.5">
            {report.fraud_types_detected.map((ft) => (
              <span key={ft} class="px-2 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded">
                {ft}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Qualitative grade */}
      {qual && (
        <div class={`border rounded-lg p-4 ${
          qual.overallGrade === "PASS" ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20"
          : qual.overallGrade === "PARTIAL" ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20"
          : "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
        }`}>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">Qualitative Grade</p>
              <p class="text-xl font-bold text-zinc-900 dark:text-white">{qual.overallGrade}</p>
            </div>
            <p class="text-4xl font-bold text-zinc-900 dark:text-white">
              {qual.overallScore}
              <span class="text-sm font-normal text-zinc-400">/100</span>
            </p>
          </div>
        </div>
      )}

      {/* Best dataset metrics */}
      {bestMetrics && bestDataset && (
        <div>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
            Best Dataset: <span class="font-semibold text-zinc-700 dark:text-zinc-300">{bestDataset}</span>
          </p>
          <div class="grid grid-cols-4 gap-2">
            <MetricPill label="Precision" value={`${(bestMetrics.precision * 100).toFixed(1)}%`} color="border-indigo-200 dark:border-indigo-800" />
            <MetricPill label="Recall"    value={`${(bestMetrics.recall    * 100).toFixed(1)}%`} color="border-emerald-200 dark:border-emerald-800" />
            <MetricPill label="F1 Score"  value={`${(bestMetrics.f1Score   * 100).toFixed(1)}%`} color="border-amber-200 dark:border-amber-800" />
            <MetricPill label="AUC-ROC"   value={`${(bestMetrics.aucRoc    * 100).toFixed(1)}%`} color="border-purple-200 dark:border-purple-800" />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Per-dataset evaluation cards ──────────────────────────────────────────────

function PerDatasetEvaluationCards() {
  const evals = perDatasetEvaluations.value;
  if (!evals || Object.keys(evals).length === 0) return null;

  return (
    <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
      <h3 class="text-sm font-semibold text-zinc-900 dark:text-white mb-1">
        Per-Dataset Qualitative Evaluation
      </h3>
      <p class="text-xs text-zinc-400 dark:text-zinc-500 mb-4">
        Same 15-phase pipeline applied to every dataset — no per-dataset configuration required.
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Object.values(evals).map((ev) => {
          const gradeColor =
            ev.overallGrade === "PASS"
              ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20"
              : ev.overallGrade === "PARTIAL"
                ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20"
                : "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20";
          const badgeColor =
            ev.overallGrade === "PASS"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-800/40 dark:text-emerald-200"
              : ev.overallGrade === "PARTIAL"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-800/40 dark:text-amber-200"
                : "bg-red-100 text-red-700 dark:bg-red-800/40 dark:text-red-200";

          return (
            <div key={ev.datasetName} class={`border rounded-lg p-3 ${gradeColor}`}>
              {/* Dataset header */}
              <div class="flex items-start justify-between mb-2 gap-2">
                <p class="text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  {ev.datasetName}
                </p>
                <span class={`px-1.5 py-0.5 text-xs font-bold rounded-full shrink-0 ${badgeColor}`}>
                  {ev.overallGrade}
                </span>
              </div>

              {/* Score bar */}
              <div class="mb-2">
                <div class="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  <span>Overall Score</span>
                  <span class="font-semibold">{ev.overallScore}/100</span>
                </div>
                <div class="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5">
                  <div
                    class="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${ev.overallScore}%`,
                      backgroundColor:
                        ev.overallGrade === "PASS" ? "#10B981"
                        : ev.overallGrade === "PARTIAL" ? "#F59E0B"
                        : "#EF4444",
                    }}
                  />
                </div>
              </div>

              {/* Dimension mini-grid */}
              <div class="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
                {ev.dimensions.map((d) => (
                  <div key={d.id} class="flex items-center gap-1">
                    <span
                      class={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        d.grade === "PASS" ? "bg-emerald-500"
                        : d.grade === "PARTIAL" ? "bg-amber-500"
                        : "bg-red-500"
                      }`}
                    />
                    <span class="text-xs text-zinc-600 dark:text-zinc-300 truncate">
                      {d.label}
                    </span>
                    <span class="text-xs text-zinc-400 ml-auto shrink-0">{d.score}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Quantitative tab ──────────────────────────────────────────────────────────

function QuantitativeTab() {
  const report = latestEnhancedReport.value;
  const br     = benchmarkResults.value;

  if (!br || !report?.benchmarking_results) {
    return (
      <p class="text-sm text-zinc-500 dark:text-zinc-400 text-center py-8">
        No benchmark data available yet.
      </p>
    );
  }

  const rawMetrics = report.benchmarking_results.dataset_comparison.performance_metrics;
  const { series, metrics } = buildComparisonSeriesFromBenchmark(rawMetrics);
  const rocSeries           = buildRocSeriesFromBenchmark(rawMetrics);

  return (
    <div class="space-y-6">
      {/* Metric comparison */}
      <StatisticalDistribution
        mode="comparison"
        title="Performance Metrics Across Datasets"
        description="Precision, Recall, F1 Score, and AUC-ROC for each dataset"
        series={series}
        metrics={metrics}
      />

      {/* ROC curves */}
      <RocCurve
        title="ROC Curves — Multi-Dataset Comparison"
        series={rocSeries}
      />

      {/* Confusion matrices */}
      {Object.entries(rawMetrics).map(([ds, m]) => {
        const cm =
          m.confusion_matrix ??
          estimateConfusionMatrix(
            100000,
            0.002,
            m.precision,
            m.recall,
          );
        return (
          <ConfusionMatrix
            key={ds}
            title={`Confusion Matrix — ${ds}`}
            data={cm}
          />
        );
      })}

      {/* Statistical significance heatmap */}
      {report.benchmarking_results.statistical_significance?.accuracy_differences && (
        <StatisticalSignificanceHeatmap
          accuracyDifferences={
            report.benchmarking_results.statistical_significance.accuracy_differences
          }
        />
      )}

      {/* Per-dataset qualitative evaluation cards */}
      <PerDatasetEvaluationCards />
    </div>
  );
}

// ── MARAG tab ─────────────────────────────────────────────────────────────────

function MaragTab() {
  const consensus = maragConsensus.value;

  if (!consensus) {
    return (
      <p class="text-sm text-zinc-500 dark:text-zinc-400 text-center py-8">
        No MARAG data available yet.
      </p>
    );
  }

  const agentScores   = consensus.agentScores as Record<string, number>;
  const correlations  = Object.fromEntries(
    (consensus.correlations ?? []).map((c) => [
      c.agents.join("-"),
      c.strength,
    ]),
  );

  return (
    <div class="space-y-6">
      {/* Correlation heatmap */}
      <AgentCorrelationHeatmap correlations={correlations} />

      {/* Agent confidence bars */}
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          Agent Confidence Scores
        </h3>
        <div class="space-y-3">
          {Object.entries(agentScores).map(([agent, score]) => (
            <div key={agent}>
              <div class="flex justify-between text-sm mb-1">
                <span class="font-medium text-zinc-700 dark:text-zinc-300">{agent}</span>
                <span class="text-zinc-500 dark:text-zinc-400">
                  {(score * 100).toFixed(0)}%
                </span>
              </div>
              <div class="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(score * 100).toFixed(0)}%`,
                    backgroundColor:
                      score >= 0.8 ? "#10B981"
                      : score >= 0.6 ? "#6366F1"
                      : "#F59E0B",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Consensus + uncertainty */}
        <div class="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
          <div>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">Consensus Score</p>
            <p class="text-2xl font-bold text-zinc-900 dark:text-white">
              {(consensus.consensusScore * 100).toFixed(0)}%
            </p>
          </div>
          <div>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">Final Risk Score</p>
            <p class="text-2xl font-bold text-zinc-900 dark:text-white">
              {consensus.finalScore}
            </p>
          </div>
        </div>

        {consensus.uncertaintySources?.length > 0 && (
          <div class="mt-3">
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Uncertainty Sources</p>
            <ul class="space-y-0.5">
              {consensus.uncertaintySources.map((s, i) => (
                <li key={i} class="text-xs text-zinc-600 dark:text-zinc-300 flex gap-1.5">
                  <AlertTriangle size={11} class="text-amber-500 shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Pipeline tab ──────────────────────────────────────────────────────────────

function PipelineTab() {
  const live = liveCaseProgress.value;

  const errorPhases = live
    ? Object.values(live.phases).filter((p) => p.status === "failed")
    : [];

  // Phase timing waterfall
  const timedPhases = live
    ? Object.values(live.phases)
        .filter((p) => p.duration != null && p.duration > 0)
        .sort((a, b) => (b.duration ?? 0) - (a.duration ?? 0))
        .slice(0, 8)
    : [];

  const maxDuration = timedPhases.length > 0
    ? Math.max(...timedPhases.map((p) => p.duration ?? 0))
    : 1;

  return (
    <div class="space-y-4">
      <LivePhasePipeline fallbackCaseProgress={EMPTY_PROGRESS} showDetails compact={false} />

      {timedPhases.length > 0 && (
        <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
            Phase Execution Times
          </h3>
          <div class="space-y-2">
            {timedPhases.map((p) => (
              <div key={p.phaseId}>
                <div class="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-0.5">
                  <span class="font-mono">{p.phaseId}</span>
                  <span>{p.duration}ms</span>
                </div>
                <div class="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5">
                  <div
                    class="h-1.5 rounded-full bg-indigo-500"
                    style={{ width: `${((p.duration ?? 0) / maxDuration) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {errorPhases.length > 0 && (
        <div class="border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-red-700 dark:text-red-300 mb-2 flex items-center gap-1.5">
            <XCircle size={14} />
            Failed Phases ({errorPhases.length})
          </h3>
          <ul class="space-y-1">
            {errorPhases.map((p) => (
              <li key={p.phaseId} class="text-xs text-red-600 dark:text-red-300 font-mono">
                {p.phaseId}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Compliance tab ────────────────────────────────────────────────────────────

function ComplianceTab() {
  const report = latestEnhancedReport.value;

  if (!report) {
    return (
      <p class="text-sm text-zinc-500 dark:text-zinc-400 text-center py-8">
        No report data available yet.
      </p>
    );
  }

  const cs = report.compliance_status ?? {};

  function ComplianceCard({
    label,
    value,
    description,
  }: { label: string; value: boolean | undefined; description: string }) {
    const isPass = value === true;
    const isFail = value === false;
    return (
      <div class={`border rounded-lg p-4 ${
        isPass ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20"
        : isFail ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
        : "border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800"
      }`}>
        <div class="flex items-center gap-2 mb-1">
          {isPass
            ? <CheckCircle size={16} class="text-emerald-600 dark:text-emerald-400" />
            : isFail
              ? <XCircle size={16} class="text-red-600 dark:text-red-400" />
              : <Clock size={16} class="text-zinc-400" />}
          <span class="text-sm font-semibold text-zinc-900 dark:text-white">{label}</span>
        </div>
        <p class="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
        <span class={`mt-2 inline-block px-2 py-0.5 text-xs font-bold rounded ${
          isPass ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200"
          : isFail ? "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200"
          : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
        }`}>
          {isPass ? "COMPLIANT" : isFail ? "NON-COMPLIANT" : "UNDETERMINED"}
        </span>
      </div>
    );
  }

  return (
    <div class="space-y-4">
      {/* Compliance cards */}
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ComplianceCard
          label="SAR Readiness"
          value={cs.sar_ready}
          description="Suspicious Activity Report eligibility per financial crime regulations"
        />
        <ComplianceCard
          label="GDPR"
          value={cs.gdpr_compliant}
          description="General Data Protection Regulation — personal data handling compliance"
        />
        <ComplianceCard
          label="DORA"
          value={cs.dora_compliant}
          description="Digital Operational Resilience Act — ICT risk and incident reporting"
        />
      </div>

      {cs.jurisdiction && (
        <p class="text-xs text-zinc-500 dark:text-zinc-400">
          Jurisdiction: <span class="font-semibold text-zinc-700 dark:text-zinc-300">{cs.jurisdiction}</span>
        </p>
      )}

      {/* Audit trail */}
      {report.audit_trail?.length > 0 && (
        <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
          <div class="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 flex items-center gap-2">
            <FileText size={14} class="text-zinc-500" />
            <span class="text-sm font-semibold text-zinc-900 dark:text-white">
              Audit Trail ({report.audit_trail.length} entries)
            </span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead class="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  {["Timestamp", "Phase", "Action", "Actor"].map((h) => (
                    <th key={h} class="px-3 py-2 text-left text-zinc-500 dark:text-zinc-400 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.audit_trail.slice(0, 15).map((entry, i) => (
                  <tr key={i} class="border-t border-zinc-100 dark:border-zinc-700">
                    <td class="px-3 py-2 font-mono text-zinc-500 dark:text-zinc-400">
                      {entry.timestamp}
                    </td>
                    <td class="px-3 py-2 text-zinc-700 dark:text-zinc-300">{entry.phase}</td>
                    <td class="px-3 py-2 text-zinc-700 dark:text-zinc-300">{entry.action}</td>
                    <td class="px-3 py-2 text-zinc-600 dark:text-zinc-400">{entry.actor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export */}
      <button
        type="button"
        onClick={exportEvaluationReport}
        class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
      >
        <Download size={14} />
        Export Evaluation Report
      </button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface EvaluationDashboardProps {
  compact?: boolean;
}

export function EvaluationDashboard({ compact = false }: EvaluationDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
        <div class="flex items-center gap-2">
          <BarChart3 size={18} class="text-indigo-600" />
          <h2 class="text-base font-semibold text-zinc-900 dark:text-white">
            Evaluation Dashboard
          </h2>
        </div>
        <StreamBadge />
      </div>

      {/* Tab bar */}
      <div class="flex overflow-x-auto border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            class={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === id
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-800"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div class={`p-4 ${compact ? "max-h-96 overflow-y-auto" : ""}`}>
        {activeTab === "overview"     && <OverviewTab />}
        {activeTab === "quantitative" && <QuantitativeTab />}
        {activeTab === "marag"        && <MaragTab />}
        {activeTab === "qualitative"  && (
          <QualitativeAssessment
            report={latestEnhancedReport.value}
            evaluation={qualitativeEvaluation.value}
            compact={compact}
          />
        )}
        {activeTab === "pipeline"     && <PipelineTab />}
        {activeTab === "compliance"   && <ComplianceTab />}
      </div>
    </div>
  );
}
