/**
 * Mann-Whitney U Statistical Test Results Table
 *
 * Displays statistical significance testing between dataset pairs
 * Shows p-values, Bonferroni-corrected p-values, and effect sizes
 * Used for viva presentations to demonstrate statistical rigor
 */

import { h } from "preact";
import { StatisticalTest } from "@/types/benchmarking";

interface MannWhitneyResultsProps {
  /** Results keyed by metric name: { precision, recall, f1_score, ... } */
  results: Record<string, StatisticalTest>;
  /** Datasets being compared */
  dataset1: string;
  dataset2: string;
  title?: string;
  /** Alpha level for significance (default 0.05) */
  alpha?: number;
}

export function MannWhitneyResultsTable({
  results,
  dataset1,
  dataset2,
  title,
  alpha = 0.05,
}: MannWhitneyResultsProps) {
  if (!results || Object.keys(results).length === 0) {
    return (
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
          {title || "Statistical Test Results"}
        </h3>
        <div class="text-zinc-500 dark:text-zinc-400">
          No test results available
        </div>
      </div>
    );
  }

  const metrics = Object.entries(results);
  const significantCount = metrics.filter((_, item) => {
    const result = item[1];
    const pValue = result.p_value_bonferroni ?? result.p_value;
    return pValue < alpha;
  }).length;

  return (
    <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-6 transition-colors">
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-zinc-900 dark:text-white">
          {title || `Mann-Whitney U Test: ${dataset1} vs ${dataset2}`}
        </h3>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Non-parametric statistical significance testing (α = {alpha})
        </p>
      </div>

      {/* Summary Stats */}
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded p-3">
          <p class="text-xs text-blue-700 dark:text-blue-300 font-semibold">
            Total Metrics
          </p>
          <p class="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {metrics.length}
          </p>
        </div>
        <div class="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded p-3">
          <p class="text-xs text-green-700 dark:text-green-300 font-semibold">
            Significant
          </p>
          <p class="text-2xl font-bold text-green-900 dark:text-green-100">
            {significantCount}
          </p>
        </div>
        <div class="bg-zinc-50 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded p-3">
          <p class="text-xs text-zinc-700 dark:text-zinc-300 font-semibold">
            Not Significant
          </p>
          <p class="text-2xl font-bold text-zinc-900 dark:text-white">
            {metrics.length - significantCount}
          </p>
        </div>
      </div>

      {/* Results Table */}
      <div class="overflow-x-auto mb-6">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b-2 border-zinc-200 dark:border-zinc-700">
              <th class="text-left py-3 px-4 font-semibold text-zinc-700 dark:text-zinc-300">
                Metric
              </th>
              <th class="text-right py-3 px-4 font-semibold text-zinc-700 dark:text-zinc-300">
                U Statistic
              </th>
              <th class="text-right py-3 px-4 font-semibold text-zinc-700 dark:text-zinc-300">
                P-Value
              </th>
              <th class="text-right py-3 px-4 font-semibold text-zinc-700 dark:text-zinc-300">
                P (Bonferroni)
              </th>
              <th class="text-right py-3 px-4 font-semibold text-zinc-700 dark:text-zinc-300">
                Cohen's d
              </th>
              <th class="text-center py-3 px-4 font-semibold text-zinc-700 dark:text-zinc-300">
                Significant
              </th>
            </tr>
          </thead>
          <tbody>
            {metrics.map(([metricName, result]) => {
              const pValue = result.p_value;
              const pBonferroni = result.p_value_bonferroni ?? pValue;
              const isSignificant = pBonferroni < alpha;
              const uStat = result.test_statistic ?? "—";
              const effectSize = result.effect_size;

              return (
                <tr
                  key={metricName}
                  class={`border-b border-zinc-100 dark:border-zinc-700 ${
                    isSignificant
                      ? "bg-green-50 dark:bg-green-900/10"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                  }`}
                >
                  <td class="py-3 px-4 font-medium text-zinc-900 dark:text-white capitalize">
                    {metricName.replace(/_/g, " ")}
                  </td>
                  <td class="text-right py-3 px-4 text-zinc-700 dark:text-zinc-300 font-mono">
                    {typeof uStat === "number" ? uStat.toFixed(2) : uStat}
                  </td>
                  <td class="text-right py-3 px-4 text-zinc-700 dark:text-zinc-300 font-mono">
                    {pValue.toExponential(2)}
                  </td>
                  <td class="text-right py-3 px-4 text-zinc-700 dark:text-zinc-300 font-mono">
                    {pBonferroni.toExponential(2)}
                  </td>
                  <td class="text-right py-3 px-4 text-zinc-700 dark:text-zinc-300 font-mono">
                    {effectSize.toFixed(3)}
                  </td>
                  <td class="text-center py-3 px-4">
                    {isSignificant ? (
                      <span class="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        ✓ Yes
                      </span>
                    ) : (
                      <span class="inline-block bg-zinc-300 dark:bg-zinc-600 text-zinc-900 dark:text-white text-xs font-bold px-3 py-1 rounded-full">
                        ✗ No
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Interpretation Guide */}
      <div class="space-y-3">
        <div class="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded p-4">
          <p class="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">
            📊 How to Read These Results:
          </p>
          <ul class="text-xs text-amber-800 dark:text-amber-200 space-y-1">
            <li>
              • <strong>U Statistic:</strong> Test statistic from Mann-Whitney U
              test (non-parametric alternative to t-test)
            </li>
            <li>
              • <strong>P-Value:</strong> Unadjusted probability of observing
              this difference by chance
            </li>
            <li>
              • <strong>P (Bonferroni):</strong> Adjusted p-value accounting for
              multiple comparisons
            </li>
            <li>
              • <strong>Cohen's d:</strong> Effect size (0.2=small, 0.5=medium,
              0.8=large)
            </li>
            <li>
              • <strong>Significant:</strong> Result is statistically
              significant at α={alpha} level
            </li>
          </ul>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded p-4">
          <p class="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 Viva Talking Points:
          </p>
          <ul class="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <li>
              • Mann-Whitney U is ideal for non-normal distributions (fraud data
              is often skewed)
            </li>
            <li>
              • Bonferroni correction prevents false positives when testing
              multiple metrics
            </li>
            <li>
              • Statistical significance + effect size shows both practical and
              statistical importance
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
