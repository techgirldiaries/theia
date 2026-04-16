/**
 * EmergingFraudDetector: Detects emerging fraud patterns and novel fraud types
 *
 * Monitors:
 *  - Month-over-month fraud type changes (NEW, EMERGING, DECLINING)
 *  - Novel patterns not in historical baseline
 *  - Risk escalation indicators
 *  - Agent disagreement flags (potential new fraud type)
 *
 * Used in Evaluation Dashboard → Quantitative tab
 */

import { useState } from "preact/hooks";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Zap,
  Eye,
  EyeOff,
} from "lucide-react";

export interface FraudTypeMetrics {
  type: string;
  currentCount: number;
  previousCount: number;
  percentChange: number;
  status: "NEW" | "EMERGING" | "STABLE" | "DECLINING";
  confidence: number;
  riskScore: number;
  agentAgreement: number;
  detectionMethods: string[];
}

export interface EmergingFraudSummary {
  novelPatternCount: number;
  agentDisagreementCount: number;
  riskEscalationCount: number;
  topEmergingType: FraudTypeMetrics | null;
  criticalAlerts: string[];
}

interface EmergingFraudDetectorProps {
  fraudTypes: FraudTypeMetrics[];
  title?: string;
  description?: string;
  novelPatternsThreshold?: number;
  riskEscalationThreshold?: number;
}

export function EmergingFraudDetector({
  fraudTypes,
  title = "Emerging Fraud Pattern Detection",
  description,
  novelPatternsThreshold = 0.7,
  riskEscalationThreshold = 0.4,
}: EmergingFraudDetectorProps) {
  const [expandedType, setExpandedType] = useState<string | null>(null);

  // Calculate summary metrics
  const summary = calculateSummary(
    fraudTypes,
    novelPatternsThreshold,
    riskEscalationThreshold,
  );

  // Categorize fraud types
  const newFraudTypes = fraudTypes.filter((f) => f.status === "NEW");
  const emergingFraudTypes = fraudTypes.filter((f) => f.status === "EMERGING");
  const decliningFraudTypes = fraudTypes.filter(
    (f) => f.status === "DECLINING",
  );
  const stableFraudTypes = fraudTypes.filter((f) => f.status === "STABLE");

  // Sort by risk
  const sortedByRisk = [...fraudTypes].sort(
    (a, b) => b.riskScore - a.riskScore,
  );

  return (
    <div class="space-y-4">
      {/* Header */}
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
        <div class="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 class="text-lg font-semibold text-zinc-900 dark:text-white">
              {title}
            </h3>
            {description && (
              <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {description}
              </p>
            )}
          </div>
          {summary.criticalAlerts.length > 0 && (
            <AlertTriangle size={20} class="text-red-500 shrink-0" />
          )}
        </div>

        {/* Summary metrics */}
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          <SummaryCard
            label="Novel Patterns"
            value={summary.novelPatternCount}
            colour="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
          />
          <SummaryCard
            label="Agent Disagreement"
            value={summary.agentDisagreementCount}
            colour="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
          />
          <SummaryCard
            label="Risk Escalation"
            value={summary.riskEscalationCount}
            colour="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
          />
          <SummaryCard
            label="Fraud Types"
            value={fraudTypes.length}
            colour="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
          />
        </div>

        {/* Critical alerts */}
        {summary.criticalAlerts.length > 0 && (
          <div class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
            <p class="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">
              Critical Alerts
            </p>
            <ul class="text-xs text-red-600 dark:text-red-400 space-y-0.5">
              {summary.criticalAlerts.map((alert) => (
                <li key={alert} class="flex items-start gap-2">
                  <span class="text-red-500 mt-0.5">•</span>
                  <span>{alert}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Category tabs */}
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 space-y-3">
        {/* NEW Fraud Types */}
        {newFraudTypes.length > 0 && (
          <CategorySection
            label="🆕 NEW Fraud Types"
            types={newFraudTypes}
            colour="border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/10"
            expandedType={expandedType}
            onToggle={setExpandedType}
          />
        )}

        {/* EMERGING Fraud Types */}
        {emergingFraudTypes.length > 0 && (
          <CategorySection
            label="📈 EMERGING Fraud Types"
            types={emergingFraudTypes}
            colour="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10"
            expandedType={expandedType}
            onToggle={setExpandedType}
          />
        )}

        {/* DECLINING Fraud Types */}
        {decliningFraudTypes.length > 0 && (
          <CategorySection
            label="📉 DECLINING Fraud Types"
            types={decliningFraudTypes}
            colour="border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10"
            expandedType={expandedType}
            onToggle={setExpandedType}
          />
        )}

        {/* STABLE Fraud Types */}
        {stableFraudTypes.length > 0 && (
          <CategorySection
            label="✓ STABLE Fraud Types"
            types={stableFraudTypes}
            colour="border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10"
            expandedType={expandedType}
            onToggle={setExpandedType}
            collapsed={true}
          />
        )}
      </div>

      {/* Risk escalation analysis */}
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
          Risk Escalation Analysis
        </h4>
        <div class="space-y-2">
          {sortedByRisk.slice(0, 5).map((fraud, idx) => (
            <RiskBar key={fraud.type} fraud={fraud} rank={idx + 1} />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
          Recommended Actions
        </h4>
        <ul class="text-sm space-y-2 text-zinc-700 dark:text-zinc-300">
          {newFraudTypes.length > 0 && (
            <li class="flex items-start gap-2">
              <Zap size={16} class="text-purple-600 mt-0.5 shrink-0" />
              <span>
                Investigate <strong>{newFraudTypes.length}</strong> new fraud
                type(s) for immediate pattern analysis and rule development
              </span>
            </li>
          )}
          {emergingFraudTypes.length > 0 && (
            <li class="flex items-start gap-2">
              <TrendingUp size={16} class="text-amber-600 mt-0.5 shrink-0" />
              <span>
                Monitor <strong>{emergingFraudTypes.length}</strong> emerging
                trend(s) closely for rapid escalation
              </span>
            </li>
          )}
          {summary.agentDisagreementCount > 0 && (
            <li class="flex items-start gap-2">
              <Eye size={16} class="text-blue-600 mt-0.5 shrink-0" />
              <span>
                Review <strong>{summary.agentDisagreementCount}</strong> cases
                with low agent consensus - may indicate novel patterns
              </span>
            </li>
          )}
          {decliningFraudTypes.length > 0 && (
            <li class="flex items-start gap-2">
              <TrendingDown size={16} class="text-green-600 mt-0.5 shrink-0" />
              <span>
                Verify effectiveness of controls for{" "}
                <strong>{decliningFraudTypes.length}</strong> declining type(s)
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

// ── Summary Card ───────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  colour,
}: {
  label: string;
  value: number;
  colour: string;
}) {
  return (
    <div class={`border rounded p-2 text-center ${colour}`}>
      <p class="text-xs opacity-75">{label}</p>
      <p class="text-xl font-bold">{value}</p>
    </div>
  );
}

// ── Category Section ───────────────────────────────────────────────────────────

function CategorySection({
  label,
  types,
  colour,
  expandedType,
  onToggle,
  collapsed = false,
}: {
  label: string;
  types: FraudTypeMetrics[];
  colour: string;
  expandedType: string | null;
  onToggle: (type: string | null) => void;
  collapsed?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(!collapsed);

  return (
    <div class={`border rounded p-3 ${colour} transition-all`}>
      <button
        class="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span class="text-sm font-semibold text-zinc-900 dark:text-white">
          {label} ({types.length})
        </span>
        <span class="text-lg">{isOpen ? "▼" : "▶"}</span>
      </button>

      {isOpen && (
        <div class="mt-2 space-y-2">
          {types.map((fraud) => (
            <FraudTypeCard
              key={fraud.type}
              fraud={fraud}
              isExpanded={expandedType === fraud.type}
              onToggle={() =>
                onToggle(expandedType === fraud.type ? null : fraud.type)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Fraud Type Card ───────────────────────────────────────────────────────────

function FraudTypeCard({
  fraud,
  isExpanded,
  onToggle,
}: {
  fraud: FraudTypeMetrics;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded p-2">
      <button
        class="w-full flex items-start justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-700/50 p-1 rounded transition-colors"
        onClick={onToggle}
      >
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-zinc-900 dark:text-white truncate">
            {fraud.type}
          </p>
          <div class="flex items-center gap-1 mt-1 flex-wrap">
            <StatusBadge status={fraud.status} />
            <RiskBadge risk={fraud.riskScore} />
            <ConfidenceBadge confidence={fraud.confidence} />
          </div>
        </div>
        <button
          class="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {isExpanded ? (
            <EyeOff size={14} class="text-zinc-400" />
          ) : (
            <Eye size={14} class="text-zinc-400" />
          )}
        </button>
      </button>

      {isExpanded && (
        <div class="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700 space-y-2 text-xs">
          <DetailRow
            label="Current Count"
            value={fraud.currentCount}
            previous={fraud.previousCount}
          />
          <DetailRow
            label="Month-over-Month Change"
            value={`${fraud.percentChange > 0 ? "+" : ""}${fraud.percentChange.toFixed(1)}%`}
            highlight={Math.abs(fraud.percentChange) > 50}
          />
          <DetailRow
            label="Risk Score"
            value={fraud.riskScore.toFixed(2)}
            highlight={fraud.riskScore > 0.7}
          />
          <DetailRow
            label="Agent Agreement"
            value={`${(fraud.agentAgreement * 100).toFixed(0)}%`}
            highlight={fraud.agentAgreement < 0.7}
          />
          {fraud.detectionMethods.length > 0 && (
            <div>
              <p class="text-zinc-600 dark:text-zinc-400 font-medium mb-1">
                Detection Methods
              </p>
              <div class="flex flex-wrap gap-1">
                {fraud.detectionMethods.map((method) => (
                  <span
                    key={method}
                    class="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded text-xs"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: FraudTypeMetrics["status"] }) {
  const colours = {
    NEW: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
    EMERGING:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    STABLE:
      "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
    DECLINING:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  };

  return (
    <span
      class={`px-2 py-0.5 rounded text-xs font-medium ${colours[status] || colours.STABLE}`}
    >
      {status}
    </span>
  );
}

// ── Risk Badge ─────────────────────────────────────────────────────────────────

function RiskBadge({ risk }: { risk: number }) {
  let colour =
    "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300";
  if (risk > 0.7)
    colour = "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300";
  else if (risk > 0.4)
    colour =
      "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300";

  return (
    <span class={`px-2 py-0.5 rounded text-xs font-medium ${colour}`}>
      Risk {(risk * 100).toFixed(0)}%
    </span>
  );
}

// ── Confidence Badge ───────────────────────────────────────────────────────────

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const colour =
    confidence > 0.8
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
      : confidence > 0.5
        ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300"
        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300";

  return (
    <span class={`px-2 py-0.5 rounded text-xs font-medium ${colour}`}>
      Conf {(confidence * 100).toFixed(0)}%
    </span>
  );
}

// ── Detail Row ─────────────────────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  previous,
  highlight,
}: {
  label: string;
  value: string | number;
  previous?: number;
  highlight?: boolean;
}) {
  return (
    <div class="flex justify-between">
      <span class="text-zinc-600 dark:text-zinc-400">{label}</span>
      <div class="flex items-center gap-1">
        {previous !== undefined && (
          <span class="text-zinc-400">({previous} prev)</span>
        )}
        <span
          class={`font-medium ${highlight ? "text-red-600 dark:text-red-400 font-bold" : "text-zinc-900 dark:text-white"}`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

// ── Risk Bar ───────────────────────────────────────────────────────────────────

function RiskBar({ fraud, rank }: { fraud: FraudTypeMetrics; rank: number }) {
  const riskPercent = fraud.riskScore * 100;

  return (
    <div class="flex items-center gap-2">
      <span class="text-xs font-bold text-zinc-500 w-5">{rank}</span>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-1 mb-1">
          <p class="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">
            {fraud.type}
          </p>
          <p class="text-xs font-bold text-zinc-900 dark:text-white whitespace-nowrap">
            {riskPercent.toFixed(0)}%
          </p>
        </div>
        <div class="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
          <div
            class={`h-full rounded-full transition-all ${
              fraud.riskScore > 0.7
                ? "bg-red-500"
                : fraud.riskScore > 0.4
                  ? "bg-amber-500"
                  : "bg-green-500"
            }`}
            style={{ width: `${riskPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Helper function ───────────────────────────────────────────────────────────

function calculateSummary(
  fraudTypes: FraudTypeMetrics[],
  novelThreshold: number,
  riskThreshold: number,
): EmergingFraudSummary {
  const novelPatternCount = fraudTypes.filter(
    (f) => f.confidence > novelThreshold || f.status === "NEW",
  ).length;

  const agentDisagreementCount = fraudTypes.filter(
    (f) => f.agentAgreement < 0.7,
  ).length;

  const riskEscalationCount = fraudTypes.filter(
    (f) => f.percentChange > 50 && f.riskScore > riskThreshold,
  ).length;

  const topEmergingType =
    [...fraudTypes]
      .sort((a, b) => b.riskScore - a.riskScore)
      .find((f) => f.status === "EMERGING" || f.status === "NEW") || null;

  const criticalAlerts: string[] = [];
  if (novelPatternCount > 0) {
    criticalAlerts.push(
      `${novelPatternCount} novel fraud pattern(s) detected requiring immediate investigation`,
    );
  }
  if (riskEscalationCount > 0) {
    criticalAlerts.push(
      `${riskEscalationCount} rapid risk escalation(s) detected`,
    );
  }
  if (agentDisagreementCount > 2) {
    criticalAlerts.push(
      `${agentDisagreementCount} cases with low inter-agent consensus - possible unknown fraud types`,
    );
  }

  return {
    novelPatternCount,
    agentDisagreementCount,
    riskEscalationCount,
    topEmergingType,
    criticalAlerts,
  };
}
