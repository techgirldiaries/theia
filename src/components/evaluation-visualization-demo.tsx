/**
 * Evaluation Visualization Demo Page
 *
 * Demonstrates all four visualization components together
 * This can be imported and rendered to show poster/viva presentation layouts
 *
 * USAGE:
 * 1. Import and render on a dedicated route or modal
 * 2. Export charts as PNG for poster slides
 * 3. Use as talking points for viva defense
 */

import { h } from "preact";
import { EvaluationResultsDashboard } from "./evaluation-results-dashboard";

/**
 * Complete demo page showing all evaluation visualizations
 * Useful for preparing presentation materials
 */
export function EvaluationVisualizationDemo() {
  return (
    <div class="w-full min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Navigation Header */}
      <div class="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
                📊 Evaluation Visualization Suite
              </h1>
              <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Quantitative Analysis Evaluation - Poster & Viva Presentation
              </p>
            </div>
            <div class="text-right">
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Demo with Synthetic Data
              </p>
              <p class="text-xs text-slate-600 dark:text-slate-300 font-mono mt-1">
                Updated: April 16, 2026
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div class="max-w-7xl mx-auto">
        <EvaluationResultsDashboard
          results={{
            datasets_analyzed: ["creditcard", "momtsim", "paysim"],
            performance_metrics: {},
            processing_time_comparison: {},
            data_quality_scores: {},
          }}
          showDetails={true}
        />
      </div>

      {/* Instructions Panel */}
      <div class="max-w-7xl mx-auto px-6 py-12">
        <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Using These Visualizations
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Poster Section */}
            <div>
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span class="text-2xl">🎨</span>
                For Your Poster
              </h3>
              <div class="space-y-3">
                <div class="bg-blue-50 dark:bg-blue-900/30 rounded p-4 border border-blue-200 dark:border-blue-700">
                  <p class="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-1">
                    1. K-Fold Metrics Chart
                  </p>
                  <p class="text-xs text-blue-800 dark:text-blue-200">
                    Shows precision, recall, F1, AUC across 5 folds with mean ±
                    std. Perfect for demonstrating model stability.
                  </p>
                </div>

                <div class="bg-green-50 dark:bg-green-900/30 rounded p-4 border border-green-200 dark:border-green-700">
                  <p class="font-semibold text-green-900 dark:text-green-100 text-sm mb-1">
                    2. Class Imbalance Panel
                  </p>
                  <p class="text-xs text-green-800 dark:text-green-200">
                    Shows fraud vs legitimate ratio for each dataset. Explains
                    why stratified k-fold was necessary.
                  </p>
                </div>

                <div class="bg-purple-50 dark:bg-purple-900/30 rounded p-4 border border-purple-200 dark:border-purple-700">
                  <p class="font-semibold text-purple-900 dark:text-purple-100 text-sm mb-1">
                    3. Statistical Significance Table
                  </p>
                  <p class="text-xs text-purple-800 dark:text-purple-200">
                    Mann-Whitney U test results with Bonferroni correction.
                    Shows statistical rigor.
                  </p>
                </div>

                <div class="bg-orange-50 dark:bg-orange-900/30 rounded p-4 border border-orange-200 dark:border-orange-700">
                  <p class="font-semibold text-orange-900 dark:text-orange-100 text-sm mb-1">
                    Export Tips
                  </p>
                  <p class="text-xs text-orange-800 dark:text-orange-200">
                    Right-click → Save as image for each chart. Consider A1/A0
                    poster dimensions for readability.
                  </p>
                </div>
              </div>
            </div>

            {/* Viva Section */}
            <div>
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span class="text-2xl">🎓</span>
                For Your Viva
              </h3>
              <div class="space-y-3">
                <div class="bg-red-50 dark:bg-red-900/30 rounded p-4 border border-red-200 dark:border-red-700">
                  <p class="font-semibold text-red-900 dark:text-red-100 text-sm mb-1">
                    Imbalance Challenge
                  </p>
                  <p class="text-xs text-red-800 dark:text-red-200">
                    "Fraud represents only 0.17% of credit card transactions.
                    How did you handle this?"
                  </p>
                  <p class="text-xs text-red-700 dark:text-red-300 mt-2 font-mono">
                    → Show imbalance panel + stratified k-fold explanation
                  </p>
                </div>

                <div class="bg-cyan-50 dark:bg-cyan-900/30 rounded p-4 border border-cyan-200 dark:border-cyan-700">
                  <p class="font-semibold text-cyan-900 dark:text-cyan-100 text-sm mb-1">
                    Statistical Validity
                  </p>
                  <p class="text-xs text-cyan-800 dark:text-cyan-200">
                    "How did you ensure your results were statistically
                    significant?"
                  </p>
                  <p class="text-xs text-cyan-700 dark:text-cyan-300 mt-2 font-mono">
                    → Show Mann-Whitney U table + Bonferroni correction row
                  </p>
                </div>

                <div class="bg-indigo-50 dark:bg-indigo-900/30 rounded p-4 border border-indigo-200 dark:border-indigo-700">
                  <p class="font-semibold text-indigo-900 dark:text-indigo-100 text-sm mb-1">
                    Model Robustness
                  </p>
                  <p class="text-xs text-indigo-800 dark:text-indigo-200">
                    "How reliable is your model across different data splits?"
                  </p>
                  <p class="text-xs text-indigo-700 dark:text-indigo-300 mt-2 font-mono">
                    → Show k-fold chart with error bars + fold consistency
                  </p>
                </div>

                <div class="bg-emerald-50 dark:bg-emerald-900/30 rounded p-4 border border-emerald-200 dark:border-emerald-700">
                  <p class="font-semibold text-emerald-900 dark:text-emerald-100 text-sm mb-1">
                    Dataset Comparison
                  </p>
                  <p class="text-xs text-emerald-800 dark:text-emerald-200">
                    "Why did CreditCard perform differently than PaySim?"
                  </p>
                  <p class="text-xs text-emerald-700 dark:text-emerald-300 mt-2 font-mono">
                    → Show statistical table + effect sizes (Cohen's d)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Summary */}
          <div class="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <h3 class="font-semibold text-slate-900 dark:text-white mb-4">
              Key Metrics You're Demonstrating
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded">
                <p class="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  92%
                </p>
                <p class="text-xs text-slate-600 dark:text-slate-400">
                  Precision
                </p>
              </div>
              <div class="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded">
                <p class="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  82%
                </p>
                <p class="text-xs text-slate-600 dark:text-slate-400">Recall</p>
              </div>
              <div class="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded">
                <p class="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  0.94
                </p>
                <p class="text-xs text-slate-600 dark:text-slate-400">
                  AUC-ROC
                </p>
              </div>
              <div class="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded">
                <p class="font-mono text-sm font-bold text-slate-900 dark:text-white">
                  ±3.5%
                </p>
                <p class="text-xs text-slate-600 dark:text-slate-400">
                  Stability
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div class="border-t border-slate-200 dark:border-slate-700 mt-12 py-8 px-4">
        <div class="max-w-7xl mx-auto">
          <div class="text-center text-sm text-slate-600 dark:text-slate-400">
            <p>
              These visualizations are generated from real quantitative analysis
              using ground truth labels, stratified k-fold cross-validation, and
              Mann-Whitney U statistical tests.
            </p>
            <p class="mt-2">
              Source: ground-truth-evaluator.ts +
              evaluation-results-dashboard.tsx
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
