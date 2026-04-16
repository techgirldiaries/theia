/**
 * DatasetFPComparison — Comparative false positive analysis across datasets
 *
 * Displays:
 *  - FP rate by transaction type per dataset
 *  - Agent-specific FP patterns
 *  - Threshold optimization recommendations
 *  - Business impact of FP reduction
 *
 * Used in Evaluation Dashboard → Quantitative tab
 */

import { AlertTriangle, TrendingDown, BarChart3, Target } from "lucide-react";

export interface DatasetFPMetrics {
  dataset: string;
  totalTransactions: number;
  falsePositives: number;
  falseNegatives: number;
  fpRate: number; // FP / (FP + TN)
  fpByType: Record<string, number>; // e.g. { "Card Present": 45, "ATM": 12 }
  agentContributions: Record<string, { fp: number; flagged: number }>; // Agent FP breakdown
  businessImpact: {
    falseFlagsPerDay: number;
    estimatedManualReviewHours: number;
    customerImpactScore: number; // 0-100
  };
}

interface DatasetFPComparisonProps {
  datasets: DatasetFPMetrics[];
  title?: string;
  description?: string;
}

export function DatasetFPComparison({
  datasets,
  title = "False Positive Analysis Across Datasets",
  description,
}: DatasetFPComparisonProps) {
  if (datasets.length === 0) {
    return (
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
        <p class="text-sm text-zinc-500 dark:text-zinc-400">
          No dataset false positive data available
        </p>
      </div>
    );
  }

  // Calculate aggregated metrics
  const avgFPRate =
    datasets.reduce((sum, d) => sum + d.fpRate, 0) / datasets.length;
  const worstFPDataset = datasets.reduce((prev, curr) =>
    curr.fpRate > prev.fpRate ? curr : prev,
  );
  const bestFPDataset = datasets.reduce((prev, curr) =>
    curr.fpRate < prev.fpRate ? curr : prev,
  );

  // Estimate overall business impact
  const totalFalseFlags = datasets.reduce(
    (sum, d) => sum + d.businessImpact.falseFlagsPerDay,
    0,
  );
  const totalReviewHours = datasets.reduce(
    (sum, d) => sum + d.businessImpact.estimatedManualReviewHours,
    0,
  );
  const avgCustomerImpact =
    datasets.reduce((sum, d) => sum + d.businessImpact.customerImpactScore, 0) /
    datasets.length;

  return (
    <div class="space-y-4">
      {/* Overview Cards */}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <MetricCard
          icon={AlertTriangle}
          label="Average FP Rate"
          value={`${(avgFPRate * 100).toFixed(2)}%`}
          color="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300"
        />
        <MetricCard
          icon={BarChart3}
          label="Total Daily False Flags"
          value={totalFalseFlags.toFixed(0)}
          color="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300"
        />
        <MetricCard
          icon={TrendingDown}
          label="Manual Review Hours/Day"
          value={totalReviewHours.toFixed(1)}
          color="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300"
        />
        <MetricCard
          icon={Target}
          label="Customer Impact Score"
          value={`${avgCustomerImpact.toFixed(0)}/100`}
          color={`${
            avgCustomerImpact > 70
              ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300"
              : avgCustomerImpact > 40
                ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300"
                : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300"
          }`}
        />
      </div>

      {/* Dataset Comparison Table */}
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                <th class="px-4 py-2 text-left text-zinc-600 dark:text-zinc-300 font-medium">
                  Dataset
                </th>
                <th class="px-4 py-2 text-center text-zinc-600 dark:text-zinc-300 font-medium">
                  Total Tx
                </th>
                <th class="px-4 py-2 text-center text-zinc-600 dark:text-zinc-300 font-medium">
                  FP Count
                </th>
                <th class="px-4 py-2 text-center text-zinc-600 dark:text-zinc-300 font-medium">
                  FP Rate
                </th>
                <th class="px-4 py-2 text-center text-zinc-600 dark:text-zinc-300 font-medium">
                  FN Count
                </th>
                <th class="px-4 py-2 text-center text-zinc-600 dark:text-zinc-300 font-medium">
                  Daily Impact
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200 dark:divide-zinc-700">
              {datasets.map((dataset) => (
                <tr
                  key={dataset.dataset}
                  class="hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                >
                  <td class="px-4 py-3">
                    <p class="font-medium text-zinc-900 dark:text-white">
                      {dataset.dataset}
                    </p>
                  </td>
                  <td class="px-4 py-3 text-center text-zinc-600 dark:text-zinc-400">
                    {dataset.totalTransactions.toLocaleString()}
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span class="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded font-medium">
                      {dataset.falsePositives}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <FPRateBar rate={dataset.fpRate} />
                  </td>
                  <td class="px-4 py-3 text-center text-zinc-600 dark:text-zinc-400">
                    {dataset.falseNegatives}
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span class="text-sm font-medium text-amber-600 dark:text-amber-400">
                      {dataset.businessImpact.falseFlagsPerDay.toFixed(0)} flags
                      /{" "}
                      {dataset.businessImpact.estimatedManualReviewHours.toFixed(
                        1,
                      )}{" "}
                      hrs
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Analysis per Dataset */}
      {datasets.map((dataset) => (
        <DatasetFPDetailCard key={dataset.dataset} dataset={dataset} />
      ))}

      {/* Optimization Recommendations */}
      <OptimizationRecommendations datasets={datasets} />

      {/* Business Case Analysis */}
      <BusinessCaseAnalysis datasets={datasets} />
    </div>
  );
}

// ── Metric Card ────────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div class={`border rounded-lg p-3 ${color}`}>
      <div class="flex items-center gap-2 mb-1">
        <Icon size={16} />
        <p class="text-xs font-medium opacity-75">{label}</p>
      </div>
      <p class="text-xl font-bold">{value}</p>
    </div>
  );
}

// ── FP Rate Bar ────────────────────────────────────────────────────────────────

function FPRateBar({ rate }: { rate: number }) {
  const ratePercent = rate * 100;
  const color =
    rate > 0.1 ? "bg-red-500" : rate > 0.05 ? "bg-amber-500" : "bg-green-500";

  return (
    <div class="flex items-center gap-2">
      <div class="w-24 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
        <div
          class={`h-full ${color} transition-all`}
          style={{ width: `${Math.min(100, ratePercent * 10)}%` }}
        />
      </div>
      <span class="text-xs font-bold text-zinc-900 dark:text-white w-12">
        {ratePercent.toFixed(2)}%
      </span>
    </div>
  );
}

// ── Dataset Detail Card ────────────────────────────────────────────────────────

function DatasetFPDetailCard({ dataset }: { dataset: DatasetFPMetrics }) {
  return (
    <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
      <h4 class="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
        {dataset.dataset} — Detailed FP Analysis
      </h4>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* FP by Transaction Type */}
        <div>
          <p class="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
            False Positives by Transaction Type
          </p>
          <div class="space-y-1.5">
            {Object.entries(dataset.fpByType).map(([type, count]) => (
              <div key={type} class="flex items-center justify-between text-xs">
                <span class="text-zinc-700 dark:text-zinc-300">{type}</span>
                <div class="flex items-center gap-2">
                  <div class="w-16 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded overflow-hidden">
                    <div
                      class="h-full bg-red-500"
                      style={{
                        width: `${(count / Math.max(...Object.values(dataset.fpByType))) * 100}%`,
                      }}
                    />
                  </div>
                  <span class="w-8 text-right font-medium text-zinc-900 dark:text-white">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Contributions to FP */}
        <div>
          <p class="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
            Agent False Positive Contributions
          </p>
          <div class="space-y-1.5">
            {Object.entries(dataset.agentContributions).map(
              ([agent, metrics]) => {
                const fpPercent = (metrics.fp / metrics.flagged) * 100;
                return (
                  <div
                    key={agent}
                    class="flex items-center justify-between text-xs"
                  >
                    <span class="text-zinc-700 dark:text-zinc-300">
                      {agent}
                    </span>
                    <div class="flex items-center gap-2">
                      <div class="w-16 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded overflow-hidden">
                        <div
                          class={`h-full ${fpPercent > 20 ? "bg-red-500" : fpPercent > 10 ? "bg-amber-500" : "bg-green-500"}`}
                          style={{ width: `${Math.min(100, fpPercent)}%` }}
                        />
                      </div>
                      <span class="w-12 text-right font-medium text-zinc-900 dark:text-white">
                        {fpPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>

      {/* Business Impact */}
      <div class="mt-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded border border-zinc-200 dark:border-zinc-700">
        <p class="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Business Impact
        </p>
        <div class="grid grid-cols-3 gap-2 text-xs">
          <div>
            <p class="text-zinc-500 dark:text-zinc-400">Daily False Flags</p>
            <p class="font-bold text-zinc-900 dark:text-white">
              {dataset.businessImpact.falseFlagsPerDay.toFixed(0)}
            </p>
          </div>
          <div>
            <p class="text-zinc-500 dark:text-zinc-400">Review Hours/Day</p>
            <p class="font-bold text-zinc-900 dark:text-white">
              {dataset.businessImpact.estimatedManualReviewHours.toFixed(1)}
            </p>
          </div>
          <div>
            <p class="text-zinc-500 dark:text-zinc-400">Customer Impact</p>
            <p
              class={`font-bold ${
                dataset.businessImpact.customerImpactScore > 70
                  ? "text-red-600 dark:text-red-400"
                  : dataset.businessImpact.customerImpactScore > 40
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-green-600 dark:text-green-400"
              }`}
            >
              {dataset.businessImpact.customerImpactScore.toFixed(0)}/100
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Optimization Recommendations ────────────────────────────────────────────────

function OptimizationRecommendations({
  datasets,
}: {
  datasets: DatasetFPMetrics[];
}) {
  const recommendations: string[] = [];

  const worstFPDataset = datasets.reduce((prev, curr) =>
    curr.fpRate > prev.fpRate ? curr : prev,
  );

  if (worstFPDataset.fpRate > 0.1) {
    recommendations.push(
      `${worstFPDataset.dataset} has high FP rate (${(worstFPDataset.fpRate * 100).toFixed(2)}%) — consider threshold adjustment or additional agent validation`,
    );
  }

  const highImpactAgents = datasets
    .flatMap((d) =>
      Object.entries(d.agentContributions).map(([agent, metrics]) => ({
        agent,
        dataset: d.dataset,
        fpRate: metrics.fp / metrics.flagged,
      })),
    )
    .filter((a) => a.fpRate > 0.25);

  if (highImpactAgents.length > 0) {
    const topAgent = highImpactAgents[0];
    recommendations.push(
      `Agent ${topAgent.agent} in ${topAgent.dataset} has high FP rate (${(topAgent.fpRate * 100).toFixed(1)}%) — review detection rules`,
    );
  }

  const typesWithHighFP = datasets
    .flatMap((d) =>
      Object.entries(d.fpByType).map(([type, count]) => ({
        type,
        count,
        dataset: d.dataset,
      })),
    )
    .filter((t) => t.count > 50);

  if (typesWithHighFP.length > 0) {
    const topType = typesWithHighFP.reduce((prev, curr) =>
      curr.count > prev.count ? curr : prev,
    );
    recommendations.push(
      `Transaction type "${topType.type}" in ${topType.dataset} has high FP volume (${topType.count}) — implement targeted filtering`,
    );
  }

  return (
    <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
      <h4 class="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
        Optimization Recommendations
      </h4>
      {recommendations.length > 0 ? (
        <ul class="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
          {recommendations.map((rec, idx) => (
            <li key={idx} class="flex items-start gap-2">
              <span class="text-amber-500 mt-1">→</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p class="text-sm text-green-600 dark:text-green-400">
          FP rates are within acceptable ranges across all datasets.
        </p>
      )}
    </div>
  );
}

// ── Business Case Analysis ─────────────────────────────────────────────────────

function BusinessCaseAnalysis({ datasets }: { datasets: DatasetFPMetrics[] }) {
  const totalDailyFlags = datasets.reduce(
    (sum, d) => sum + d.businessImpact.falseFlagsPerDay,
    0,
  );
  const totalReviewHours = datasets.reduce(
    (sum, d) => sum + d.businessImpact.estimatedManualReviewHours,
    0,
  );
  const costPerHour = 35; // Assumed analyst cost
  const dailyCost = totalReviewHours * costPerHour;
  const yearlyImpact = dailyCost * 365;

  // Estimate 20% FP reduction benefit
  const optimizedDailyFlags = totalDailyFlags * 0.8;
  const optimizedReviewHours = totalReviewHours * 0.8;
  const optimizedDailyCost = optimizedReviewHours * costPerHour;
  const annualSavings = (dailyCost - optimizedDailyCost) * 365;

  return (
    <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
      <h4 class="text-sm font-semibold text-green-900 dark:text-green-300 mb-3">
        Business Case: FP Reduction ROI
      </h4>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p class="text-xs text-green-700 dark:text-green-400 font-medium mb-2">
            Current State
          </p>
          <div class="space-y-1">
            <div class="flex justify-between">
              <span class="text-green-800 dark:text-green-300">
                Daily false flags:
              </span>
              <span class="font-bold text-green-900 dark:text-green-200">
                {totalDailyFlags.toFixed(0)}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-green-800 dark:text-green-300">
                Review hours/day:
              </span>
              <span class="font-bold text-green-900 dark:text-green-200">
                {totalReviewHours.toFixed(1)}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-green-800 dark:text-green-300">
                Annual cost:
              </span>
              <span class="font-bold text-green-900 dark:text-green-200">
                ${yearlyImpact.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div>
          <p class="text-xs text-green-700 dark:text-green-400 font-medium mb-2">
            With 20% FP Reduction
          </p>
          <div class="space-y-1">
            <div class="flex justify-between">
              <span class="text-green-800 dark:text-green-300">
                Daily false flags:
              </span>
              <span class="font-bold text-green-900 dark:text-green-200">
                {optimizedDailyFlags.toFixed(0)}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-green-800 dark:text-green-300">
                Review hours/day:
              </span>
              <span class="font-bold text-green-900 dark:text-green-200">
                {optimizedReviewHours.toFixed(1)}
              </span>
            </div>
            <div class="flex justify-between border-t border-green-300 dark:border-green-600 pt-1">
              <span class="text-green-700 dark:text-green-300 font-semibold">
                Annual savings:
              </span>
              <span class="font-bold text-green-900 dark:text-green-200 text-lg">
                ${annualSavings.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
