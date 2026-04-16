/**
 * K-Fold Cross-Validation Metrics Visualization
 *
 * Displays performance metrics across k-folds with mean ± std bands
 * Useful for showing model stability and robustness across data splits
 */

import { h } from "preact";
import { DatasetMetrics } from "@/types/benchmarking";

interface KFoldMetricsChartProps {
  /** K-fold results from evaluateWithCrossValidation() */
  kfoldResults: DatasetMetrics["kfold_results"];
  datasetName: string;
  title?: string;
  height?: number;
}

export function KFoldMetricsChart({
  kfoldResults,
  datasetName,
  title,
  height = 300,
}: KFoldMetricsChartProps) {
  if (!kfoldResults || !kfoldResults.fold_metrics) {
    return (
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
          {title || "K-Fold Cross-Validation Results"}
        </h3>
        <div class="text-zinc-500 dark:text-zinc-400">
          No k-fold results available
        </div>
      </div>
    );
  }

  const folds = kfoldResults.fold_metrics;
  const k = folds.length;

  // Chart dimensions
  const padding = 50;
  const chartWidth = 700;
  const chartHeight = height;

  // Metrics to visualize
  const metrics = [
    { key: "precision", label: "Precision", color: "stroke-blue-500" },
    { key: "recall", label: "Recall", color: "stroke-green-500" },
    { key: "f1_score", label: "F1-Score", color: "stroke-purple-500" },
    { key: "auc_roc", label: "AUC-ROC", color: "stroke-orange-500" },
  ] as const;

  // Calculate x-axis positions for folds
  const foldSpacing = (chartWidth - padding * 2) / (k - 1 || 1);

  // Generate SVG paths
  const paths = metrics.map((metric) => {
    const metricKey = metric.key as keyof (typeof folds)[0];
    const foldValues = folds.map((fold) => fold[metricKey] as number);

    // Calculate points
    const points = foldValues.map((value, idx) => {
      const x = padding + idx * foldSpacing;
      const y = chartHeight - padding - value * (chartHeight - padding * 2);
      return { x, y };
    });

    // Generate path string
    const pathStr = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");

    return { metric: metric.label, path: pathStr, color: metric.color };
  });

  // Get mean and std for display
  const means = {
    precision: kfoldResults.mean_precision,
    recall: kfoldResults.mean_recall,
    f1_score: kfoldResults.mean_f1_score,
    auc_roc: kfoldResults.mean_auc_roc,
  };

  const stds = {
    precision: kfoldResults.std_precision,
    recall: kfoldResults.std_recall,
    f1_score: kfoldResults.std_f1_score,
    auc_roc: kfoldResults.std_auc_roc,
  };

  return (
    <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-6 transition-colors">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-zinc-900 dark:text-white">
          {title || `K-Fold CV Results (k=${k})`}
        </h3>
        <p class="text-sm text-zinc-500 dark:text-zinc-400">
          Dataset: <span class="font-medium">{datasetName}</span>
        </p>
      </div>

      {/* SVG Chart */}
      <div class="overflow-x-auto mb-6">
        <svg
          viewBox={`0 0 ${chartWidth + padding} ${chartHeight}`}
          class="w-full"
          style={{ minHeight: `${height}px` }}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((val, i) => (
            <g key={`grid-${i}`}>
              <line
                x1={padding}
                y1={chartHeight - padding - val * (chartHeight - padding * 2)}
                x2={chartWidth}
                y2={chartHeight - padding - val * (chartHeight - padding * 2)}
                stroke="#e5e7eb"
                strokeDasharray="4"
                class="dark:stroke-zinc-700"
              />
              <text
                x={padding - 10}
                y={
                  chartHeight - padding - val * (chartHeight - padding * 2) + 4
                }
                fontSize="12"
                textAnchor="end"
                class="fill-zinc-500 dark:fill-zinc-400"
              >
                {(val * 100).toFixed(0)}%
              </text>
            </g>
          ))}

          {/* X-axis labels (fold numbers) */}
          {folds.map((_, idx) => (
            <text
              key={`fold-${idx}`}
              x={padding + idx * foldSpacing}
              y={chartHeight - padding + 20}
              fontSize="12"
              textAnchor="middle"
              class="fill-zinc-600 dark:fill-zinc-400"
            >
              Fold {idx + 1}
            </text>
          ))}

          {/* Metric lines */}
          {paths.map(({ metric, path, color }) => (
            <g key={metric}>
              <path
                d={path}
                fill="none"
                stroke-width="2.5"
                class={color}
                vector-effect="non-scaling-stroke"
              />
              {/* Points on line */}
              {folds.map((fold, idx) => {
                const metricKey = metrics.find((m) => m.label === metric)
                  ?.key as keyof typeof fold;
                const value = fold[metricKey] as number;
                const x = padding + idx * foldSpacing;
                const y =
                  chartHeight - padding - value * (chartHeight - padding * 2);
                return (
                  <circle
                    key={`point-${metric}-${idx}`}
                    cx={x}
                    cy={y}
                    r="4"
                    class={color}
                    class:fill-white={true}
                    strokeWidth="2"
                  />
                );
              })}
            </g>
          ))}

          {/* Axes */}
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={chartHeight - padding}
            stroke="#9ca3af"
            stroke-width="2"
            class="dark:stroke-zinc-600"
          />
          <line
            x1={padding}
            y1={chartHeight - padding}
            x2={chartWidth}
            y2={chartHeight - padding}
            stroke="#9ca3af"
            stroke-width="2"
            class="dark:stroke-zinc-600"
          />
        </svg>
      </div>

      {/* Statistics Table */}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.key}
            class="bg-zinc-50 dark:bg-zinc-700 rounded p-3 border border-zinc-200 dark:border-zinc-600"
          >
            <p class="text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1">
              {metric.label}
            </p>
            <p class="text-lg font-bold text-zinc-900 dark:text-white">
              {(means[metric.key] * 100).toFixed(1)}%
            </p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              ±{(stds[metric.key] * 100).toFixed(1)}%
            </p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div class="mt-6 flex flex-wrap gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
        {metrics.map((metric) => (
          <div key={metric.key} class="flex items-center gap-2">
            <div
              class={`w-3 h-3 rounded-full ${metric.color.replace("stroke-", "bg-")}`}
            />
            <span class="text-sm text-zinc-600 dark:text-zinc-400">
              {metric.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
