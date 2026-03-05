import { useState } from "preact/hooks";
import { signal } from "@preact/signals";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  Database,
  Zap,
  Shield,
  Eye,
} from "lucide-react";

export interface DatasetBenchmark {
  datasetName: string;
  metrics: {
    precision: number;
    recall: number;
    f1Score: number;
    aucRoc: number;
  };
  processingTime: string;
  qualityScore: number;
  status: "best" | "good" | "poor";
}

export interface StatisticalComparison {
  comparison: string;
  pValue: number;
  significant: boolean;
  effectSize: number;
}

export interface BenchmarkResults {
  datasetsAnalyzed: string[];
  performanceMetrics: Record<string, DatasetBenchmark["metrics"]>;
  processingTimes: Record<string, string>;
  qualityScores: Record<string, number>;
  statisticalSignificance: StatisticalComparison[];
  bestPerformingDataset: string;
  recommendations: string[];
}

export const benchmarkResults = signal<BenchmarkResults | null>(null);
export const showBenchmarkPanel = signal(false);

interface BenchmarkComparisonProps {
  results?: BenchmarkResults;
  compact?: boolean;
}

export function BenchmarkComparison({
  results: propsResults,
  compact = false,
}: BenchmarkComparisonProps) {
  const [selectedMetric, setSelectedMetric] = useState<
    "precision" | "recall" | "f1Score" | "aucRoc"
  >("f1Score");

  const results = propsResults || benchmarkResults.value;

  if (!results) {
    return (
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-8 text-center">
        <BarChart3 size={48} className="mx-auto mb-4 text-zinc-400" />
        <p className="text-zinc-500 dark:text-zinc-400 mb-2">
          No benchmarking results available
        </p>
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          Upload multiple datasets to compare performance
        </p>
      </div>
    );
  }

  const getDatasetBenchmarks = (): DatasetBenchmark[] => {
    return results.datasetsAnalyzed.map((dataset) => ({
      datasetName: dataset,
      metrics: results.performanceMetrics[dataset],
      processingTime: results.processingTimes[dataset],
      qualityScore: results.qualityScores[dataset],
      status:
        dataset === results.bestPerformingDataset
          ? "best"
          : results.qualityScores[dataset] >= 85
            ? "good"
            : "poor",
    }));
  };

  const benchmarks = getDatasetBenchmarks();

  const formatMetricName = (metric: string) => {
    const names: Record<string, string> = {
      precision: "Precision",
      recall: "Recall",
      f1Score: "F1-Score",
      aucRoc: "AUC-ROC",
    };
    return names[metric] || metric;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "best":
        return "text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700";
      case "good":
        return "text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300 dark:border-blue-700";
      default:
        return "text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300 dark:border-amber-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "best":
        return <TrendingUp size={16} className="text-green-600" />;
      case "good":
        return <Activity size={16} className="text-blue-600" />;
      default:
        return <TrendingDown size={16} className="text-amber-600" />;
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 size={20} className="text-indigo-600" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Multi-Dataset Performance Benchmarking
          </h3>
        </div>
        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-full">
          {results.datasetsAnalyzed.length} datasets
        </span>
      </div>

      {/* Metric Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["precision", "recall", "f1Score", "aucRoc"] as const).map(
          (metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedMetric === metric
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600"
              }`}
            >
              {formatMetricName(metric)}
            </button>
          ),
        )}
      </div>

      {/* Dataset Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {benchmarks.map((benchmark) => (
          <div
            key={benchmark.datasetName}
            className={`border rounded-lg p-4 ${getStatusColor(benchmark.status)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Database
                  size={18}
                  className="text-zinc-700 dark:text-zinc-300"
                />
                <h4 className="font-semibold text-sm text-zinc-900 dark:text-white">
                  {benchmark.datasetName}
                </h4>
              </div>
              {getStatusIcon(benchmark.status)}
            </div>

            {benchmark.status === "best" && (
              <div className="mb-3 px-2 py-1 bg-green-200 dark:bg-green-800/50 rounded text-xs font-semibold text-green-800 dark:text-green-200 flex items-center gap-1">
                <CheckCircle size={12} />
                Best Performing
              </div>
            )}

            {/* Selected Metric Display */}
            <div className="mb-4">
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {formatMetricName(selectedMetric)}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                  {(benchmark.metrics[selectedMetric] * 100).toFixed(1)}
                </span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  %
                </span>
              </div>
            </div>

            {/* All Metrics Summary */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  Precision
                </span>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {(benchmark.metrics.precision * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  Recall
                </span>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {(benchmark.metrics.recall * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Processing Time & Quality */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-zinc-300 dark:border-zinc-600">
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-zinc-500" />
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {benchmark.processingTime}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Shield size={12} className="text-zinc-500" />
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  Q: {benchmark.qualityScore}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Statistical Significance */}
      {results.statisticalSignificance.length > 0 && !compact && (
        <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-sm text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
            <Zap size={16} className="text-indigo-600" />
            Statistical Significance Analysis
          </h4>
          <div className="space-y-2">
            {results.statisticalSignificance.map((stat, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {stat.significant ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <AlertTriangle size={16} className="text-amber-600" />
                  )}
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    {stat.comparison}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-xs font-mono ${stat.significant ? "text-green-600" : "text-amber-600"}`}
                  >
                    p={stat.pValue.toFixed(3)}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    ES: {stat.effectSize.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {results.recommendations.length > 0 && !compact && (
        <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4">
          <h4 className="font-semibold text-sm text-indigo-900 dark:text-indigo-100 mb-3 flex items-center gap-2">
            <Eye size={16} className="text-indigo-600" />
            Expert Recommendations
          </h4>
          <ul className="space-y-2">
            {results.recommendations.map((rec, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-indigo-800 dark:text-indigo-200"
              >
                <span className="text-indigo-600 mt-1">➤</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
