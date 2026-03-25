/**
 * Type definitions for Multi-Dataset Benchmarking
 * Theia Fraud Intelligence
 */

export interface ConfusionMatrixValues {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

export interface RocPoint {
  fpr: number; // false positive rate (x-axis)
  tpr: number; // true positive rate (y-axis)
}

export interface DatasetMetrics {
  precision: number;
  recall: number;
  f1_score: number;
  auc_roc: number;
  confusion_matrix?: ConfusionMatrixValues;
  roc_curve?: RocPoint[];
}

export interface StatisticalTest {
  p_value: number;
  significant: boolean;
  effect_size: number;
}

export interface DatasetComparison {
  datasets_analyzed: string[];
  performance_metrics: Record<string, DatasetMetrics>;
  processing_time_comparison: Record<string, string>;
  data_quality_scores: Record<string, number>;
}

export interface BenchmarkingResults {
  dataset_comparison: DatasetComparison;
  statistical_significance: {
    accuracy_differences: Record<string, StatisticalTest>;
  };
  best_performing_dataset: string;
  recommendations: string[];
}

export interface BenchmarkVisualization {
  chart_type: string;
  download_url: string;
  filename: string;
  explanation: {
    title: string;
    key_insights: string[];
    risk_indicators: string[];
    recommendations: string[];
    technical_details: string;
  };
}
