/**
 * Evaluation Results Dashboard
 *
 * Comprehensive visualization of quantitative analysis evaluation
 * Combines k-fold metrics, class imbalance analysis, and statistical tests
 * Designed for poster presentations and viva demonstrations
 *
 * DEMO: Uses synthetic data based on real fraud datasets:
 * - CreditCard: ~285k transactions, ~0.17% fraud (highly imbalanced)
 * - MOMTSIM: Mobile money simulator with mixed imbalance
 * - PaySim: Synthetic payment fraud with various distributions
 */

import { h } from "preact";
import { DatasetComparison, DatasetMetrics } from "@/types/benchmarking";
import { KFoldMetricsChart } from "./kfold-metrics-chart";
import { DatasetImbalanceComparison } from "./dataset-imbalance-comparison";
import { MannWhitneyResultsTable } from "./mann-whitney-results-table";

interface EvaluationResultsDashboardProps {
  /** Full benchmark comparison results */
  results: DatasetComparison;
  title?: string;
  /** Whether to show detailed breakdown sections */
  showDetails?: boolean;
}

/**
 * Generate synthetic k-fold results based on dataset characteristics
 * DEMO only - in production, would come from evaluateWithCrossValidation()
 */
function generateSyntheticKFoldResults(
  dataset: string,
): DatasetMetrics["kfold_results"] {
  // Base metrics vary by dataset imbalance and complexity
  const baseMetrics = {
    creditcard: {
      precision: 0.92,
      recall: 0.82,
      f1: 0.87,
      auc: 0.94,
      std: 0.035,
    },
    momtsim: {
      precision: 0.88,
      recall: 0.85,
      f1: 0.865,
      auc: 0.91,
      std: 0.042,
    },
    paysim: {
      precision: 0.85,
      recall: 0.78,
      f1: 0.815,
      auc: 0.88,
      std: 0.055,
    },
  } as const;

  const base =
    baseMetrics[dataset as keyof typeof baseMetrics] || baseMetrics.paysim;

  // Generate 5 fold results
  const fold_metrics: DatasetMetrics[] = [];
  for (let i = 0; i < 5; i++) {
    const noise = (Math.random() - 0.5) * (base.std * 2);
    fold_metrics.push({
      precision: Math.min(0.99, Math.max(0.5, base.precision + noise)),
      recall: Math.min(0.99, Math.max(0.5, base.recall + noise * 1.2)),
      f1_score: Math.min(0.99, Math.max(0.5, base.f1 + noise * 1.1)),
      auc_roc: Math.min(0.99, Math.max(0.5, base.auc + noise * 0.8)),
    });
  }

  return {
    fold_metrics,
    mean_precision: base.precision,
    mean_recall: base.recall,
    mean_f1_score: base.f1,
    mean_auc_roc: base.auc,
    std_precision: base.std,
    std_recall: base.std,
    std_f1_score: base.std,
    std_auc_roc: base.std * 0.7,
  };
}

/**
 * Generate synthetic Mann-Whitney U test results
 * DEMO only - in production, would come from compareMetricsAcrossDatasets()
 */
function generateSyntheticMannWhitneyResults() {
  return {
    precision: {
      p_value: 0.0342,
      p_value_bonferroni: 0.102,
      significant: false,
      effect_size: 0.485,
      test_statistic: 148.5,
      test_type: "mann_whitney_u" as const,
    },
    recall: {
      p_value: 0.0018,
      p_value_bonferroni: 0.0054,
      significant: true,
      effect_size: 0.722,
      test_statistic: 95.2,
      test_type: "mann_whitney_u" as const,
    },
    f1_score: {
      p_value: 0.0089,
      p_value_bonferroni: 0.0267,
      significant: true,
      effect_size: 0.641,
      test_statistic: 112.8,
      test_type: "mann_whitney_u" as const,
    },
    auc_roc: {
      p_value: 0.0156,
      p_value_bonferroni: 0.0468,
      significant: false,
      effect_size: 0.573,
      test_statistic: 128.3,
      test_type: "mann_whitney_u" as const,
    },
  };
}

/**
 * Generate synthetic class balance analysis
 */
function generateSyntheticClassBalance() {
  return {
    creditcard: {
      classDistribution: { legitimate: 284315, fraudulent: 492 },
      imbalanceRatio: 577.9,
      dominantClass: "legitimate",
      minorityClass: "fraudulent",
      isHighlyImbalanced: true,
    },
    momtsim: {
      classDistribution: { normal: 7245981, fraud: 290320 },
      imbalanceRatio: 24.9,
      dominantClass: "normal",
      minorityClass: "fraud",
      isHighlyImbalanced: true,
    },
    paysim: {
      classDistribution: { normal: 6360671, fraud: 8213 },
      imbalanceRatio: 774.6,
      dominantClass: "normal",
      minorityClass: "fraud",
      isHighlyImbalanced: true,
    },
  };
}

export function EvaluationResultsDashboard({
  results,
  title = "Quantitative Analysis Evaluation Results",
  showDetails = true,
}: EvaluationResultsDashboardProps) {
  const datasets = results.datasets_analyzed || [
    "creditcard",
    "momtsim",
    "paysim",
  ];

  // Generate synthetic k-fold results for each dataset (DEMO)
  const syntheticKFoldResults: Record<string, any> = {};
  datasets.forEach((ds) => {
    syntheticKFoldResults[ds] = generateSyntheticKFoldResults(ds);
  });

  // Generate synthetic Mann-Whitney results (DEMO)
  const syntheticMannWhitney = generateSyntheticMannWhitneyResults();

  // Generate synthetic class balance (DEMO)
  const syntheticClassBalance = generateSyntheticClassBalance();

  return (
    <div class="w-full space-y-6 p-6 bg-linear-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800">
      {/* Header */}
      <div class="border-b-2 border-indigo-500 pb-4">
        <h1 class="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
          {title}
        </h1>
        <p class="text-zinc-600 dark:text-zinc-400 text-sm">
          Comprehensive evaluation of fraud detection models across multiple
          datasets with statistical rigor
        </p>
      </div>

      {/* Executive Summary */}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4">
          <p class="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase">
            Datasets Analyzed
          </p>
          <p class="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mt-1">
            {datasets.length}
          </p>
          <p class="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
            {datasets.join(", ")}
          </p>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <p class="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase">
            Cross-Validation
          </p>
          <p class="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
            5-Fold
          </p>
          <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Stratified for imbalance
          </p>
        </div>

        <div class="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
          <p class="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase">
            Statistical Test
          </p>
          <p class="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
            Mann-Whitney U
          </p>
          <p class="text-xs text-purple-600 dark:text-purple-400 mt-1">
            Non-parametric test
          </p>
        </div>

        <div class="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <p class="text-xs font-semibold text-green-700 dark:text-green-300 uppercase">
            Corrections
          </p>
          <p class="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
            Bonferroni
          </p>
          <p class="text-xs text-green-600 dark:text-green-400 mt-1">
            Multi-comparison correction
          </p>
        </div>
      </div>

      {/* K-Fold Results for Each Dataset */}
      {showDetails && (
        <div class="space-y-4">
          <h2 class="text-2xl font-bold text-zinc-900 dark:text-white">
            Cross-Validation Results (5-Fold Stratified)
          </h2>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {datasets.map((dataset) => (
              <KFoldMetricsChart
                key={dataset}
                kfoldResults={syntheticKFoldResults[dataset]}
                datasetName={dataset}
                title={`${dataset.charAt(0).toUpperCase() + dataset.slice(1)} Dataset`}
                height={280}
              />
            ))}
          </div>
        </div>
      )}

      {/* Class Imbalance Analysis */}
      {showDetails && (
        <div class="space-y-4">
          <h2 class="text-2xl font-bold text-zinc-900 dark:text-white">
            Class Imbalance Analysis
          </h2>
          <DatasetImbalanceComparison
            classBalanceAnalysis={syntheticClassBalance}
            title="Why Stratified K-Fold Matters"
          />
        </div>
      )}

      {/* Statistical Comparison */}
      {showDetails && (
        <div class="space-y-4">
          <h2 class="text-2xl font-bold text-zinc-900 dark:text-white">
            Statistical Significance Testing
          </h2>
          <div class="grid grid-cols-1 gap-6">
            <MannWhitneyResultsTable
              results={syntheticMannWhitney}
              dataset1="creditcard"
              dataset2="momtsim"
              title="Dataset Comparison: CreditCard vs MOMTSIM"
              alpha={0.05}
            />
          </div>
        </div>
      )}

      {/* Poster Summary Panel */}
      <div class="bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg p-6 text-white">
        <h3 class="text-xl font-bold mb-3">📊 For Your Poster Presentation</h3>
        <ul class="space-y-2 text-sm">
          <li class="flex items-start gap-2">
            <span class="font-bold">1.</span>
            <span>
              Show cross-validation results (k-fold charts) to demonstrate model
              stability
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="font-bold">2.</span>
            <span>
              Highlight class imbalance panel to explain stratified sampling
              strategy
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="font-bold">3.</span>
            <span>
              Use Mann-Whitney U results table to show statistical rigor
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="font-bold">4.</span>
            <span>
              Emphasize error bars (± std) showing robustness across folds
            </span>
          </li>
        </ul>
      </div>

      {/* Viva Talking Points Panel */}
      <div class="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-6 text-white">
        <h3 class="text-xl font-bold mb-3">🎓 For Your Viva Examination</h3>
        <ul class="space-y-2 text-sm">
          <li class="flex items-start gap-2">
            <span class="font-bold">Q:</span>
            <span>Why stratified k-fold for fraud detection?</span>
          </li>
          <li class="text-xs ml-6 text-white/90">
            A: Fraud is highly imbalanced (0.17-1% positive class). Stratified
            k-fold maintains class distribution in each fold, preventing folds
            with only negative class.
          </li>
          <li class="flex items-start gap-2 pt-2">
            <span class="font-bold">Q:</span>
            <span>Why Mann-Whitney U test instead of t-test?</span>
          </li>
          <li class="text-xs ml-6 text-white/90">
            A: Fraud metrics are often non-normally distributed due to
            imbalance. Mann-Whitney U is non-parametric and doesn't assume
            normality.
          </li>
          <li class="flex items-start gap-2 pt-2">
            <span class="font-bold">Q:</span>
            <span>What does Bonferroni correction mean?</span>
          </li>
          <li class="text-xs ml-6 text-white/90">
            A: I tested 4 metrics (precision, recall, F1, AUC). Bonferroni
            correction divides alpha by 4, preventing false positives from
            multiple comparisons.
          </li>
        </ul>
      </div>

      {/* Data Sources Notice */}
      <div class="bg-zinc-100 dark:bg-zinc-700 rounded-lg p-4 text-xs text-zinc-600 dark:text-zinc-400">
        <p class="font-semibold mb-1">📌 Note: DEMO DATA</p>
        <p>
          This dashboard uses synthetic data based on real fraud datasets
          (CreditCard, MOMTSIM, PaySim) to demonstrate visualization patterns.
          In production, data comes from: ground-truth-evaluator.ts →
          evaluateWithCrossValidation() → compareMetricsAcrossDatasets()
        </p>
      </div>
    </div>
  );
}
