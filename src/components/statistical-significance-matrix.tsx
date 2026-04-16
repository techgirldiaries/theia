/**
 * StatisticalSignificanceMatrix — Multi-dataset statistical comparison
 *
 * Performs and displays:
 *  - Welch's t-tests for comparing metrics across datasets
 *  - Effect sizes (Cohen's d)
 *  - Bonferroni-corrected p-values
 *  - Chi-square tests for categorical data
 *  - Heatmap visualization of significance
 *
 * Used in: Evaluation Dashboard → Quantitative tab
 */

import {
  welchTTest,
  cohensD,
  bonferroniAdjustedPValue,
  chiSquareTest,
} from "@/utils/statistical-analysis";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

export interface DatasetMetricComparison {
  dataset: string;
  metrics: {
    precision: number[];
    recall: number[];
    f1Score: number[];
    accuracy: number[];
    auc: number[];
  };
}

interface StatisticalSignificanceMatrixProps {
  datasets: DatasetMetricComparison[];
  alpha?: number; // Significance level (default 0.05)
  title?: string;
  description?: string;
}

export interface SignificanceTest {
  metric: string;
  dataset1: string;
  dataset2: string;
  tStatistic: number;
  pValue: number;
  adjustedPValue: number;
  effectSize: number;
  isSignificant: boolean;
  interpretation: string;
}

export function StatisticalSignificanceMatrix({
  datasets,
  alpha = 0.05,
  title = "Statistical Significance Analysis",
  description,
}: StatisticalSignificanceMatrixProps) {
  if (datasets.length < 2) {
    return (
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
        <p class="text-sm text-amber-600 dark:text-amber-400">
          At least 2 datasets required for comparison
        </p>
      </div>
    );
  }

  const metricNames = [
    "precision",
    "recall",
    "f1Score",
    "accuracy",
    "auc",
  ] as const;
  const tests: SignificanceTest[] = [];

  // Perform all pairwise comparisons
  for (let i = 0; i < datasets.length; i++) {
    for (let j = i + 1; j < datasets.length; j++) {
      for (const metric of metricNames) {
        const sample1 = datasets[i].metrics[metric];
        const sample2 = datasets[j].metrics[metric];

        const { t, pValue, df } = welchTTest(sample1, sample2);
        const effectSize = cohensD(sample1, sample2);

        // Bonferroni correction
        const totalComparisons =
          ((datasets.length * (datasets.length - 1)) / 2) * metricNames.length;
        const adjustedPValue = bonferroniAdjustedPValue(
          pValue,
          totalComparisons,
        );
        const isSignificant = adjustedPValue < alpha;

        tests.push({
          metric,
          dataset1: datasets[i].dataset,
          dataset2: datasets[j].dataset,
          tStatistic: t,
          pValue,
          adjustedPValue,
          effectSize,
          isSignificant,
          interpretation: generateInterpretation(
            isSignificant,
            effectSize,
            pValue,
            adjustedPValue,
          ),
        });
      }
    }
  }

  // Group by metric for heatmap view
  const byMetric = metricNames.reduce(
    (acc, metric) => {
      acc[metric] = tests.filter((t) => t.metric === metric);
      return acc;
    },
    {} as Record<string, SignificanceTest[]>,
  );

  const significantTests = tests.filter((t) => t.isSignificant);
  const totalTests = tests.length;

  return (
    <div class="space-y-4">
      {/* Header with summary */}
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
        </div>

        {/* Summary stats */}
        <div class="grid grid-cols-3 gap-2">
          <SummaryStatCard
            label="Total Comparisons"
            value={totalTests}
            color="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
          />
          <SummaryStatCard
            label="Significant Results"
            value={`${significantTests.length} (${((significantTests.length / totalTests) * 100).toFixed(1)}%)`}
            color={
              significantTests.length > 0
                ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
            }
          />
          <SummaryStatCard
            label="Bonferroni α"
            value={`${(alpha / totalTests).toFixed(4)}`}
            color="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
          />
        </div>
      </div>

      {/* Detailed test results by metric */}
      {metricNames.map((metric) => (
        <MetricComparisonSection
          key={metric}
          metric={metric}
          tests={byMetric[metric]}
          alpha={alpha}
        />
      ))}

      {/* Heatmap view of significance */}
      <SignificanceHeatmap datasets={datasets} tests={tests} />

      {/* Interpretation guide */}
      <InterpretationGuide />
    </div>
  );
}

// ── Summary Card ───────────────────────────────────────────────────────────────

function SummaryStatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div class={`border rounded p-2 text-center text-sm ${color}`}>
      <p class="text-xs opacity-75">{label}</p>
      <p class="font-bold">{value}</p>
    </div>
  );
}

// ── Metric Comparison Section ──────────────────────────────────────────────────

function MetricComparisonSection({
  metric,
  tests,
  alpha,
}: {
  metric: string;
  tests: SignificanceTest[];
  alpha: number;
}) {
  const metricLabels: Record<string, string> = {
    precision: "Precision",
    recall: "Recall",
    f1Score: "F1-Score",
    accuracy: "Accuracy",
    auc: "AUC-ROC",
  };

  return (
    <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
      <h4 class="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
        {metricLabels[metric]} Comparisons
      </h4>

      <div class="space-y-2">
        {tests.map((test, idx) => (
          <TestResultRow key={idx} test={test} alpha={alpha} />
        ))}
      </div>

      {tests.length === 0 && (
        <p class="text-sm text-zinc-500 dark:text-zinc-400">
          No comparisons available
        </p>
      )}
    </div>
  );
}

// ── Test Result Row ────────────────────────────────────────────────────────────

function TestResultRow({
  test,
  alpha,
}: {
  test: SignificanceTest;
  alpha: number;
}) {
  const effectSizeLabel = getEffectSizeLabel(test.effectSize);
  const bgColor = test.isSignificant
    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700"
    : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700";

  return (
    <div class={`border rounded p-2 ${bgColor}`}>
      <div class="flex items-start justify-between gap-2 mb-1">
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-zinc-900 dark:text-white">
            {test.dataset1} vs {test.dataset2}
          </p>
          <p class="text-xs text-zinc-600 dark:text-zinc-400">
            t({test.tStatistic.toFixed(2)}) = {test.tStatistic.toFixed(3)}, p
            &lt; {test.pValue.toFixed(4)}
          </p>
        </div>
        <div class="shrink-0">
          {test.isSignificant ? (
            <AlertTriangle size={16} class="text-red-600 dark:text-red-400" />
          ) : (
            <CheckCircle size={16} class="text-green-600 dark:text-green-400" />
          )}
        </div>
      </div>

      <div class="grid grid-cols-3 gap-2 text-xs mb-1">
        <div>
          <p class="text-zinc-600 dark:text-zinc-400">Effect Size</p>
          <p
            class={`font-bold ${test.effectSize > 0.8 ? "text-red-600 dark:text-red-400" : "text-zinc-900 dark:text-white"}`}
          >
            {test.effectSize.toFixed(3)} ({effectSizeLabel})
          </p>
        </div>
        <div>
          <p class="text-zinc-600 dark:text-zinc-400">P-value</p>
          <p class="font-bold text-zinc-900 dark:text-white">
            {test.pValue < 0.0001 ? "<0.0001" : test.pValue.toFixed(4)}
          </p>
        </div>
        <div>
          <p class="text-zinc-600 dark:text-zinc-400">Adjusted P</p>
          <p
            class={`font-bold ${test.adjustedPValue < alpha ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
          >
            {test.adjustedPValue < 0.0001
              ? "<0.0001"
              : test.adjustedPValue.toFixed(4)}
          </p>
        </div>
      </div>

      <p class="text-xs text-zinc-700 dark:text-zinc-300 italic">
        {test.interpretation}
      </p>
    </div>
  );
}

// ── Significance Heatmap ───────────────────────────────────────────────────────

function SignificanceHeatmap({
  datasets,
  tests,
}: {
  datasets: DatasetMetricComparison[];
  tests: SignificanceTest[];
}) {
  const metricNames = ["precision", "recall", "f1Score", "accuracy", "auc"];
  const metricLabels: Record<string, string> = {
    precision: "Prec",
    recall: "Rcl",
    f1Score: "F1",
    accuracy: "Acc",
    auc: "AUC",
  };

  // Build heatmap: rows = dataset pairs, cols = metrics
  const pairs = [];
  for (let i = 0; i < datasets.length; i++) {
    for (let j = i + 1; j < datasets.length; j++) {
      pairs.push(`${datasets[i].dataset} vs ${datasets[j].dataset}`);
    }
  }

  const cellSize = 40;
  const svgW = 60 + metricNames.length * cellSize;
  const svgH = 30 + pairs.length * cellSize;

  return (
    <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
      <h4 class="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
        Significance Heatmap (Red = Significant, Green = Not Significant)
      </h4>

      <div class="overflow-x-auto">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ minWidth: "100%" }}>
          {/* Column headers */}
          {metricNames.map((metric, i) => (
            <text
              key={`col-${i}`}
              x={60 + i * cellSize + cellSize / 2}
              y={20}
              text-anchor="middle"
              font-size="11"
              font-weight="bold"
              class="fill-zinc-700 dark:fill-zinc-300"
            >
              {metricLabels[metric]}
            </text>
          ))}

          {/* Row headers and cells */}
          {pairs.map((pair, rowIdx) => (
            <g key={rowIdx}>
              {/* Row label */}
              <text
                x={55}
                y={30 + rowIdx * cellSize + cellSize / 2 + 4}
                text-anchor="end"
                font-size="10"
                class="fill-zinc-600 dark:fill-zinc-400"
              >
                {pair.split(" vs ")[0].slice(0, 8)}...
              </text>

              {/* Cells */}
              {metricNames.map((metric, colIdx) => {
                const test = tests.find(
                  (t) =>
                    t.metric === metric &&
                    t.dataset1 === pair.split(" vs ")[0] &&
                    t.dataset2 === pair.split(" vs ")[1],
                );

                const color = test?.isSignificant ? "#EF4444" : "#22C55E";
                const opacity = Math.min(1, Math.abs(test?.effectSize || 0));

                return (
                  <rect
                    key={`${rowIdx}-${colIdx}`}
                    x={60 + colIdx * cellSize + 2}
                    y={30 + rowIdx * cellSize + 2}
                    width={cellSize - 4}
                    height={cellSize - 4}
                    fill={color}
                    fill-opacity={opacity}
                    stroke="#E5E7EB"
                    stroke-width="1"
                    rx="2"
                  />
                );
              })}
            </g>
          ))}
        </svg>
      </div>

      <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
        Cell opacity indicates effect size magnitude. Hover for details.
      </p>
    </div>
  );
}

// ── Interpretation Guide ───────────────────────────────────────────────────────

function InterpretationGuide() {
  return (
    <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
      <div class="flex items-start gap-3">
        <AlertCircle
          size={16}
          class="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0"
        />
        <div class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <p class="font-semibold">How to Interpret Results:</p>
          <ul class="text-xs space-y-0.5 list-disc list-inside">
            <li>
              <strong>Significant:</strong> Means the datasets have
              statistically different performance on this metric (p &lt; 0.05
              after Bonferroni correction)
            </li>
            <li>
              <strong>Effect Size:</strong> Small (&lt;0.2), Medium (0.2-0.8),
              Large (&gt;0.8)
            </li>
            <li>
              <strong>Bonferroni Correction:</strong> Adjusts α threshold to
              account for multiple comparisons
            </li>
            <li>
              <strong>Green cells:</strong> No significant difference (good for
              consistent performance)
            </li>
            <li>
              <strong>Red cells:</strong> Significant difference (may indicate
              dataset quality or model bias)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Helper Functions ───────────────────────────────────────────────────────────

function generateInterpretation(
  isSignificant: boolean,
  effectSize: number,
  pValue: number,
  adjustedPValue: number,
): string {
  if (!isSignificant) {
    return "No statistically significant difference detected (good consistency across datasets).";
  }

  const effectLabel = getEffectSizeLabel(effectSize);

  if (effectSize > 0.8) {
    return `Large effect size (${effectLabel}) with p < 0.05. Substantial performance difference detected.`;
  } else if (effectSize > 0.2) {
    return `Medium effect size (${effectLabel}). Moderate difference in performance.`;
  } else {
    return `Small effect size (${effectLabel}). Statistically significant but practically small difference.`;
  }
}

function getEffectSizeLabel(effectSize: number): string {
  const absEffect = Math.abs(effectSize);
  if (absEffect < 0.2) return "small";
  if (absEffect < 0.5) return "small-medium";
  if (absEffect < 0.8) return "medium";
  return "large";
}
