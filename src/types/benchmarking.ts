/**
 * Type definitions for Multi-Dataset Benchmarking
 * Theia Fraud Intelligence
 */

/**
 * Ground truth label mapping for flexible dataset schemas
 * Supports various field naming conventions across different data sources
 */
export interface GroundTruthMapping {
  /** Field name in dataset that contains ground truth label */
  fieldName: string;
  /** Positive class value (fraud indicator, e.g. 1, true, "fraud") */
  positiveValue: string | number | boolean;
  /** Negative class value (legitimate indicator, e.g. 0, false, "legit") */
  negativeValue: string | number | boolean;
  /** Optional: description of the label field */
  description?: string;
}

export interface ConfusionMatrixValues {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
  /** Total predictions for this confusion matrix */
  total?: number;
  /** Fold number if from cross-validation */
  foldNumber?: number;
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
  auc_pr?: number; // Area under Precision-Recall curve
  fpr?: number; // False positive rate
  fnr?: number; // False negative rate
  specificity?: number; // True negative rate
  confusion_matrix?: ConfusionMatrixValues;
  roc_curve?: RocPoint[];
  precision_recall_curve?: RocPoint[]; // For AUC-PR visualization
  kfold_results?: {
    fold_metrics: DatasetMetrics[];
    mean_precision: number;
    mean_recall: number;
    mean_f1_score: number;
    mean_auc_roc: number;
    std_precision: number;
    std_recall: number;
    std_f1_score: number;
    std_auc_roc: number;
  };
}

export interface StatisticalTest {
  p_value: number;
  p_value_bonferroni?: number; // Bonferroni-corrected p-value
  significant: boolean;
  effect_size: number;
  test_type?: "welch_t" | "mann_whitney_u" | "chi_square"; // Type of statistical test used
  test_statistic?: number; // t-statistic, u-statistic, chi2, etc.
}

export interface DatasetComparison {
  datasets_analyzed: string[];
  performance_metrics: Record<string, DatasetMetrics>;
  processing_time_comparison: Record<string, string>;
  data_quality_scores: Record<string, number>;
  ground_truth_mappings?: Record<string, GroundTruthMapping>; // Ground truth label config per dataset
  class_balance_analysis?: Record<
    string,
    {
      classDistribution: Record<string, number>;
      imbalanceRatio: number;
      dominantClass: string;
      minorityClass: string;
      isHighlyImbalanced: boolean;
    }
  >;
  cross_validation_used?: boolean;
  kfold_value?: number; // Number of folds used
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
