/**
 * Dataset Class Imbalance Comparison
 *
 * Visualizes class distribution across multiple datasets
 * Shows why stratified k-fold is necessary for imbalanced data
 * Used for poster & viva presentations
 */

import { h } from "preact";
import { DatasetComparison } from "@/types/benchmarking";

interface DatasetImbalanceProps {
  classBalanceAnalysis: DatasetComparison["class_balance_analysis"];
  title?: string;
}

export function DatasetImbalanceComparison({
  classBalanceAnalysis,
  title,
}: DatasetImbalanceProps) {
  if (!classBalanceAnalysis || Object.keys(classBalanceAnalysis).length === 0) {
    return (
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
          {title || "Class Imbalance Analysis"}
        </h3>
        <div class="text-zinc-500 dark:text-zinc-400">
          No class balance data available
        </div>
      </div>
    );
  }

  const datasets = Object.entries(classBalanceAnalysis);

  return (
    <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-6 transition-colors">
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-zinc-900 dark:text-white">
          {title || "Class Imbalance Analysis Across Datasets"}
        </h3>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Demonstrates the need for stratified k-fold cross-validation
        </p>
      </div>

      <div class="space-y-6">
        {datasets.map(([datasetName, balance]) => {
          const totalSamples = Object.values(balance.classDistribution).reduce(
            (a, b) => a + b,
            0,
          );
          const minorityCount =
            balance.classDistribution[balance.minorityClass] || 0;
          const majorityCount =
            balance.classDistribution[balance.dominantClass] || 0;
          const minorityPct = ((minorityCount / totalSamples) * 100).toFixed(2);
          const majorityPct = ((majorityCount / totalSamples) * 100).toFixed(2);

          const isHighlyImbalanced = balance.isHighlyImbalanced;
          const imbalanceColor = isHighlyImbalanced
            ? "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700"
            : "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700";
          const badgeColor = isHighlyImbalanced ? "bg-red-500" : "bg-green-500";

          return (
            <div
              key={datasetName}
              class={`border rounded-lg p-4 ${imbalanceColor}`}
            >
              <div class="flex items-start justify-between mb-3">
                <h4 class="font-semibold text-zinc-900 dark:text-white">
                  {datasetName}
                </h4>
                <span
                  class={`${badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full`}
                >
                  {isHighlyImbalanced ? "HIGHLY IMBALANCED" : "BALANCED"}
                </span>
              </div>

              {/* Statistics */}
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                <div>
                  <p class="text-zinc-600 dark:text-zinc-400 text-xs">
                    Total Samples
                  </p>
                  <p class="font-semibold text-zinc-900 dark:text-white">
                    {totalSamples.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p class="text-zinc-600 dark:text-zinc-400 text-xs">
                    Imbalance Ratio
                  </p>
                  <p class="font-semibold text-zinc-900 dark:text-white">
                    1:{balance.imbalanceRatio.toFixed(1)}
                  </p>
                </div>
                <div>
                  <p class="text-zinc-600 dark:text-zinc-400 text-xs">
                    Dominant Class
                  </p>
                  <p class="font-semibold text-zinc-900 dark:text-white">
                    {balance.dominantClass} ({majorityPct}%)
                  </p>
                </div>
                <div>
                  <p class="text-zinc-600 dark:text-zinc-400 text-xs">
                    Minority Class
                  </p>
                  <p class="font-semibold text-zinc-900 dark:text-white">
                    {balance.minorityClass} ({minorityPct}%)
                  </p>
                </div>
              </div>

              {/* Stacked bar chart */}
              <div class="mb-3">
                <div class="flex h-10 rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-600">
                  <div
                    class="bg-indigo-500 hover:bg-indigo-600 transition-colors flex items-center justify-center text-white text-xs font-bold"
                    style={{ width: `${parseFloat(majorityPct)}%` }}
                    title={`${balance.dominantClass}: ${majorityPct}%`}
                  >
                    {parseFloat(majorityPct) > 10 && `${majorityPct}%`}
                  </div>
                  <div
                    class="bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center text-white text-xs font-bold"
                    style={{ width: `${parseFloat(minorityPct)}%` }}
                    title={`${balance.minorityClass}: ${minorityPct}%`}
                  >
                    {parseFloat(minorityPct) > 5 && `${minorityPct}%`}
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div class="text-xs text-zinc-700 dark:text-zinc-300 bg-white/50 dark:bg-zinc-900/50 p-2 rounded border border-zinc-200 dark:border-zinc-700">
                {isHighlyImbalanced ? (
                  <p>
                    ⚠️ <strong>Highly imbalanced:</strong> Standard k-fold could
                    create folds without minority class. Stratified k-fold is
                    required.
                  </p>
                ) : (
                  <p>
                    ✓ <strong>Well-balanced:</strong> Both standard and
                    stratified k-fold suitable.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Key insight */}
      <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg">
        <p class="text-sm text-blue-900 dark:text-blue-100">
          <strong>Poster Insight:</strong> Stratified k-fold cross-validation
          distributes minority class proportionally across all folds, ensuring
          reliable performance estimates even with highly imbalanced data.
        </p>
      </div>
    </div>
  );
}
