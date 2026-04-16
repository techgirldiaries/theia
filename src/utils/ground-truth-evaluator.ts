/**
 * Ground Truth Label Evaluator
 * Handles flexible dataset schemas and ground truth label extraction for quantitative analysis
 * Supports imbalanced datasets with class balance metrics
 */

import type { GroundTruthMapping } from "@/types/benchmarking";
import {
  classBalanceMetrics,
  stratifiedKFold,
  kFold,
  cohensD,
  mannWhitneyU,
  welchTTest,
  bonferroniAdjustedPValue,
  type KFoldSplit,
} from "./statistical-analysis";

export interface DataRow {
  [key: string]: any;
}

export interface EvaluationResult {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
  precision: number;
  recall: number;
  f1_score: number;
  specificity: number;
  fpr: number; // False positive rate
  fnr: number; // False negative rate
  accuracy: number;
}

export interface CrossValidationResult {
  foldResults: EvaluationResult[];
  meanPrecision: number;
  meanRecall: number;
  meanF1Score: number;
  meanAccuracy: number;
  stdPrecision: number;
  stdRecall: number;
  stdF1Score: number;
  stdAccuracy: number;
}

/**
 * Common ground truth field name variations across datasets
 */
const COMMON_LABEL_FIELDS = [
  "is_fraud",
  "isFraud",
  "fraud",
  "fraud_label",
  "fraudLabel",
  "ground_truth",
  "groundTruth",
  "label",
  "target",
  "class",
  "outcome",
  "result",
  "actual",
  "actual_class",
  "actualClass",
  "y",
  "is_fraud_flag",
  "fraud_flag",
];

/**
 * Auto-detect ground truth column by checking common field names and data patterns
 */
export function autoDetectGroundTruthColumn(
  data: DataRow[],
): { fieldName: string; confidence: number } | null {
  if (!data || data.length === 0) return null;

  const firstRow = data[0];
  const keys = Object.keys(firstRow);

  // Check common label field names
  for (const field of COMMON_LABEL_FIELDS) {
    if (field in firstRow) {
      return { fieldName: field, confidence: 0.95 };
    }
  }

  // Look for boolean or binary numeric fields
  for (const field of keys) {
    const values = new Set();
    for (let i = 0; i < Math.min(100, data.length); i++) {
      const val = data[i][field];
      if (val !== null && val !== undefined) {
        values.add(String(val).toLowerCase());
      }
    }

    // Check if field has exactly 2 unique values (binary classification)
    if (values.size === 2) {
      const valArray = Array.from(values) as string[];
      const isBinary =
        (valArray.includes("true") && valArray.includes("false")) ||
        (valArray.includes("0") && valArray.includes("1")) ||
        (valArray.includes("fraud") && valArray.includes("legit")) ||
        (valArray.includes("yes") && valArray.includes("no"));

      if (isBinary) {
        return { fieldName: field, confidence: 0.7 };
      }
    }
  }

  return null;
}

/**
 * Auto-detect positive/negative class values from column\n */\nexport function autoDetectClassValues(\n  data: DataRow[],\n  fieldName: string,\n): {\n  positiveValue: string | number | boolean;\n  negativeValue: string | number | boolean;\n} | null {\n  if (!data || data.length === 0) return null;\n\n  const values = new Set<string | number | boolean>();\n  for (const row of data) {\n    if (row[fieldName] !== null && row[fieldName] !== undefined) {\n      values.add(row[fieldName]);\n    }\n  }\n\n  if (values.size !== 2) return null;\n\n  const [val1, val2] = Array.from(values);\n  const str1 = String(val1).toLowerCase();\n  const str2 = String(val2).toLowerCase();\n\n  // Determine which is positive (fraud) and negative (legit)\n  const fraudKeywords = [\n    \"fraud\",\n    \"true\",\n    \"1\",\n    \"positive\",\n    \"bad\",\n    \"yes\",\n    \"high_risk\",\n  ];\n  const legitKeywords = [\n    \"legit\",\n    \"legitimate\",\n    \"false\",\n    \"0\",\n    \"negative\",\n    \"good\",\n    \"no\",\n    \"low_risk\",\n  ];\n\n  const val1IsFraud = fraudKeywords.some((kw) => str1.includes(kw));\n  const val1IsLegit = legitKeywords.some((kw) => str1.includes(kw));\n\n  if (val1IsFraud && !val1IsLegit) {\n    return { positiveValue: val1, negativeValue: val2 };\n  }\n  if (val1IsLegit && !val1IsFraud) {\n    return { positiveValue: val2, negativeValue: val1 };\n  }\n\n  // Default: numeric 1 = fraud, 0 = legit\n  if (val1 === 1 || val1 === \"1\") {\n    return { positiveValue: val1, negativeValue: val2 };\n  }\n  if (val2 === 1 || val2 === \"1\") {\n    return { positiveValue: val2, negativeValue: val1 };\n  }\n\n  // If no clear indicator, assume first is positive\n  return { positiveValue: val1, negativeValue: val2 };\n}\n\n/**\n * Extract ground truth labels from dataset with flexible schema support\n */\nexport function extractGroundTruthLabels(\n  data: DataRow[],\n  mapping: GroundTruthMapping,\n): (number | string | boolean)[] {\n  return data.map((row) => {\n    const value = row[mapping.fieldName];\n    if (value === null || value === undefined) {\n      throw new Error(\n        `Missing ground truth value in field \"${mapping.fieldName}\" for row`,\n      );\n    }\n    return value;\n  });\n}\n\n/**\n * Compare predictions against ground truth and calculate confusion matrix\n */\nexport function calculateConfusionMatrix(\n  predictions: (number | string | boolean)[],\n  groundTruth: (number | string | boolean)[],\n  mapping: GroundTruthMapping,\n): { tp: number; fp: number; fn: number; tn: number } {\n  if (predictions.length !== groundTruth.length) {\n    throw new Error(\n      \"Predictions and ground truth must have the same length\",\n    );\n  }\n\n  let tp = 0,\n    fp = 0,\n    fn = 0,\n    tn = 0;\n\n  for (let i = 0; i < predictions.length; i++) {\n    const pred = predictions[i];\n    const truth = groundTruth[i];\n\n    const predIsPositive = pred === mapping.positiveValue;\n    const truthIsPositive = truth === mapping.positiveValue;\n\n    if (predIsPositive && truthIsPositive) tp++;\n    else if (predIsPositive && !truthIsPositive) fp++;\n    else if (!predIsPositive && truthIsPositive) fn++;\n    else tn++;\n  }\n\n  return { tp, fp, fn, tn };\n}\n\n/**\n * Calculate all evaluation metrics from confusion matrix\n */\nexport function calculateMetrics(cm: {\n  tp: number;\n  fp: number;\n  fn: number;\n  tn: number;\n}): EvaluationResult {\n  const total = cm.tp + cm.fp + cm.fn + cm.tn;\n  const precision = cm.tp / (cm.tp + cm.fp || 1);\n  const recall = cm.tp / (cm.tp + cm.fn || 1);\n  const f1_score = (2 * precision * recall) / (precision + recall || 1);\n  const accuracy = (cm.tp + cm.tn) / (total || 1);\n  const specificity = cm.tn / (cm.tn + cm.fp || 1);\n  const fpr = cm.fp / (cm.fp + cm.tn || 1);\n  const fnr = cm.fn / (cm.fn + cm.tp || 1);\n\n  return { ...cm, precision, recall, f1_score, specificity, fpr, fnr, accuracy };\n}\n\n/**\n * Perform stratified k-fold cross-validation evaluation\n * Maintains class distribution across folds (critical for imbalanced data)\n */\nexport function evaluateWithCrossValidation(\n  data: DataRow[],\n  predictions: (number | string | boolean)[],\n  groundTruth: (number | string | boolean)[],\n  mapping: GroundTruthMapping,\n  k: number = 5,\n  stratified: boolean = true,\n): CrossValidationResult {\n  if (data.length < k) {\n    throw new Error(`Dataset size (${data.length}) must be at least k (${k})`);\n  }\n\n  // Get fold splits\n  const splits: KFoldSplit[] = stratified\n    ? stratifiedKFold(groundTruth, k)\n    : kFold(data.length, k);\n\n  const foldResults: EvaluationResult[] = [];\n\n  for (const split of splits) {\n    // Get test set predictions and ground truth\n    const testPreds = split.testIndices.map((i) => predictions[i]);\n    const testTruth = split.testIndices.map((i) => groundTruth[i]);\n\n    // Calculate confusion matrix for this fold\n    const cm = calculateConfusionMatrix(testPreds, testTruth, mapping);\n    const metrics = calculateMetrics(cm);\n    foldResults.push(metrics);\n  }\n\n  // Calculate mean and std across folds\n  const precisions = foldResults.map((r) => r.precision);\n  const recalls = foldResults.map((r) => r.recall);\n  const f1Scores = foldResults.map((r) => r.f1_score);\n  const accuracies = foldResults.map((r) => r.accuracy);\n\n  const meanPrecision = precisions.reduce((a, b) => a + b, 0) / k;\n  const meanRecall = recalls.reduce((a, b) => a + b, 0) / k;\n  const meanF1Score = f1Scores.reduce((a, b) => a + b, 0) / k;\n  const meanAccuracy = accuracies.reduce((a, b) => a + b, 0) / k;\n\n  const stdPrecision = Math.sqrt(\n    precisions.reduce((sum, v) => sum + (v - meanPrecision) ** 2, 0) /\n      (k - 1 || 1),\n  );\n  const stdRecall = Math.sqrt(\n    recalls.reduce((sum, v) => sum + (v - meanRecall) ** 2, 0) / (k - 1 || 1),\n  );\n  const stdF1Score = Math.sqrt(\n    f1Scores.reduce((sum, v) => sum + (v - meanF1Score) ** 2, 0) /\n      (k - 1 || 1),\n  );\n  const stdAccuracy = Math.sqrt(\n    accuracies.reduce((sum, v) => sum + (v - meanAccuracy) ** 2, 0) /\n      (k - 1 || 1),\n  );\n\n  return {\n    foldResults,\n    meanPrecision,\n    meanRecall,\n    meanF1Score,\n    meanAccuracy,\n    stdPrecision,\n    stdRecall,\n    stdF1Score,\n    stdAccuracy,\n  };\n}\n\n/**\n * Compare two metrics across datasets using Mann-Whitney U test\n * Accounts for imbalanced datasets and non-normal distributions\n */\nexport function compareMetricsAcrossDatasets(\n  dataset1Metrics: EvaluationResult[],\n  dataset2Metrics: EvaluationResult[],\n  alpha: number = 0.05,\n): {\n  precisionTest: {\n    u: number;\n    pValue: number;\n    significant: boolean;\n  };\n  recallTest: {\n    u: number;\n    pValue: number;\n    significant: boolean;\n  };\n  f1ScoreTest: {\n    u: number;\n    pValue: number;\n    significant: boolean;\n  };\n  bonferroniCorrectedAlpha: number;\n} {\n  const numTests = 3; // Three comparisons: precision, recall, f1_score\n  const bonferroniAlpha = bonferroniAdjustedPValue(alpha, numTests);\n\n  const precisions1 = dataset1Metrics.map((m) => m.precision);\n  const precisions2 = dataset2Metrics.map((m) => m.precision);\n  const precisionTest = mannWhitneyU(precisions1, precisions2);\n\n  const recalls1 = dataset1Metrics.map((m) => m.recall);\n  const recalls2 = dataset2Metrics.map((m) => m.recall);\n  const recallTest = mannWhitneyU(recalls1, recalls2);\n\n  const f1Scores1 = dataset1Metrics.map((m) => m.f1_score);\n  const f1Scores2 = dataset2Metrics.map((m) => m.f1_score);\n  const f1ScoreTest = mannWhitneyU(f1Scores1, f1Scores2);\n\n  return {\n    precisionTest: {\n      u: precisionTest.u,\n      pValue: precisionTest.pValue,\n      significant: precisionTest.pValue < bonferroniAlpha,\n    },\n    recallTest: {\n      u: recallTest.u,\n      pValue: recallTest.pValue,\n      significant: recallTest.pValue < bonferroniAlpha,\n    },\n    f1ScoreTest: {\n      u: f1ScoreTest.u,\n      pValue: f1ScoreTest.pValue,\n      significant: f1ScoreTest.pValue < bonferroniAlpha,\n    },\n    bonferroniCorrectedAlpha: bonferroniAlpha,\n  };\n}\n\n/**\n * Validate dataset has required fields and ground truth mapping is correct\n */\nexport function validateDataset(\n  data: DataRow[],\n  mapping: GroundTruthMapping,\n): { valid: boolean; errors: string[] } {\n  const errors: string[] = [];\n\n  if (!data || data.length === 0) {\n    errors.push(\"Dataset is empty\");\n    return { valid: false, errors };\n  }\n\n  // Check if field exists\n  if (!(mapping.fieldName in data[0])) {\n    errors.push(\n      `Ground truth field \"${mapping.fieldName}\" not found in dataset`,\n    );\n  }\n\n  // Check if all rows have the label field\n  for (let i = 0; i < data.length; i++) {\n    const value = data[i][mapping.fieldName];\n    if (value === null || value === undefined) {\n      errors.push(`Row ${i}: Ground truth value is missing`);\n    }\n\n    // Check if value matches positive or negative class\n    if (\n      value !== mapping.positiveValue &&\n      value !== mapping.negativeValue\n    ) {\n      errors.push(\n        `Row ${i}: Invalid ground truth value \"${value}\". Expected \"${mapping.positiveValue}\" or \"${mapping.negativeValue}\"`,\n      );\n    }\n  }\n\n  return { valid: errors.length === 0, errors };\n}\n"