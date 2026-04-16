/**
 * Statistical Analysis Utilities
 *
 * Provides statistical functions for:
 * - Seasonal decomposition (trend, seasonal, residual)
 * - Significance testing (t-test, chi-square, Mann-Whitney U)
 * - Effect size calculation (Cohen's d)
 * - Autocorrelation analysis
 * - Exponential smoothing forecasting
 */

// ── Seasonal Decomposition ─────────────────────────────────────────────────────

/**
 * Simple Moving Average for trend extraction
 */
export function calculateMovingAverage(
  values: number[],
  windowSize: number,
): number[] {
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < windowSize - 1) {
      result.push(values[i]); // pad start
    } else {
      const window = values.slice(i - windowSize + 1, i + 1);
      const avg = window.reduce((a, b) => a + b, 0) / window.length;
      result.push(avg);
    }
  }
  return result;
}

/**
 * Extract seasonal component via classical decomposition
 * Assumes seasonal period (e.g. 12 for monthly data in yearly cycle)
 */
export interface SeasonalDecomposition {
  trend: number[];
  seasonal: number[];
  residual: number[];
}

export function seasonalDecompose(
  values: number[],
  seasonalPeriod: number = 12,
): SeasonalDecomposition {
  // Step 1: Calculate trend via centered moving average
  const trend = calculateMovingAverage(values, seasonalPeriod);

  // Step 2: Calculate detrended (values - trend)
  const detrended = values.map((v, i) => v - trend[i]);

  // Step 3: Calculate seasonal by averaging detrended values at each seasonal position
  const seasonal = new Array(values.length);
  for (let season = 0; season < seasonalPeriod; season++) {
    const seasonalValues: number[] = [];
    for (let i = season; i < values.length; i += seasonalPeriod) {
      seasonalValues.push(detrended[i]);
    }
    const avgSeasonal =
      seasonalValues.reduce((a, b) => a + b, 0) / seasonalValues.length;
    for (let i = season; i < values.length; i += seasonalPeriod) {
      seasonal[i] = avgSeasonal;
    }
  }

  // Step 4: Calculate residual (values - trend - seasonal)
  const residual = values.map((v, i) => v - trend[i] - seasonal[i]);

  return { trend, seasonal, residual };
}

// ── Autocorrelation ────────────────────────────────────────────────────────────

/**
 * Calculate autocorrelation at a given lag
 */
export function autocorrelation(values: number[], lag: number = 1): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const c0 =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;

  if (c0 === 0) return 0;

  const c_lag =
    values
      .slice(0, values.length - lag)
      .reduce((sum, v, i) => sum + (v - mean) * (values[i + lag] - mean), 0) /
    values.length;

  return c_lag / c0;
}

/**
 * Calculate autocorrelation for multiple lags (ACF)
 */
export function acf(values: number[], maxLag: number = 20): number[] {
  return Array.from({ length: maxLag + 1 }, (_, i) =>
    autocorrelation(values, i),
  );
}

// ── Statistical Tests ──────────────────────────────────────────────────────────

/**
 * Welch's t-test for comparing two independent samples with unequal variances
 * Returns { t: t-statistic, pValue: two-tailed p-value, df: degrees of freedom }
 */
export function welchTTest(
  sample1: number[],
  sample2: number[],
): { t: number; pValue: number; df: number } {
  const n1 = sample1.length;
  const n2 = sample2.length;

  const mean1 = sample1.reduce((a, b) => a + b, 0) / n1;
  const mean2 = sample2.reduce((a, b) => a + b, 0) / n2;

  const var1 =
    sample1.reduce((sum, v) => sum + (v - mean1) ** 2, 0) / (n1 - 1 || 1);
  const var2 =
    sample2.reduce((sum, v) => sum + (v - mean2) ** 2, 0) / (n2 - 1 || 1);

  const t =
    (mean1 - mean2) / Math.sqrt(var1 / n1 + var2 / n2 || Number.EPSILON);

  // Welch-Satterthwaite df
  const numerator = (var1 / n1 + var2 / n2) ** 2;
  const denominator = (var1 / n1) ** 2 / (n1 - 1) + (var2 / n2) ** 2 / (n2 - 1);
  const df = numerator / (denominator || 1);

  // Approximate p-value using Student's t-distribution (simplified)
  // For production, use a proper t-distribution lookup table
  const pValue = 2 * (1 - tCDF(Math.abs(t), df));

  return { t, pValue, df };
}

/**
 * Simple CDF approximation for Student's t-distribution
 * This is a simplified version; for production use proper stats library
 */
function tCDF(t: number, df: number): number {
  // Approximate using normal distribution for large df
  if (df > 30) {
    return normalCDF(t);
  }
  // Simplified approximation for smaller df
  return Math.min(1, Math.max(0, 0.5 + (t / Math.sqrt(df + t * t)) * 0.5));
}

/**
 * Standard normal CDF approximation (Error function based)
 */
function normalCDF(x: number): number {
  // Abramowitz and Stegun approximation
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y =
    1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Effect size (Cohen's d) for comparing two samples
 */
export function cohensD(sample1: number[], sample2: number[]): number {
  const mean1 = sample1.reduce((a, b) => a + b, 0) / sample1.length;
  const mean2 = sample2.reduce((a, b) => a + b, 0) / sample2.length;

  const var1 =
    sample1.reduce((sum, v) => sum + (v - mean1) ** 2, 0) /
    (sample1.length - 1 || 1);
  const var2 =
    sample2.reduce((sum, v) => sum + (v - mean2) ** 2, 0) /
    (sample2.length - 1 || 1);

  const pooledStd = Math.sqrt(
    ((sample1.length - 1) * var1 + (sample2.length - 1) * var2) /
      (sample1.length + sample2.length - 2 || 1),
  );

  return (mean1 - mean2) / (pooledStd || 1);
}

/**
 * Chi-square test for categorical data
 * observed: observed frequencies
 * expected: expected frequencies
 */
export function chiSquareTest(
  observed: number[],
  expected: number[],
): { chi2: number; df: number; pValue: number } {
  let chi2 = 0;
  for (let i = 0; i < observed.length; i++) {
    chi2 += (observed[i] - expected[i]) ** 2 / (expected[i] || 1);
  }

  const df = observed.length - 1;
  // Simplified p-value approximation
  const pValue = Math.exp(-chi2 / 2);

  return { chi2, df, pValue };
}

/**
 * Mann-Whitney U test (non-parametric alternative to t-test)
 * Tests whether two independent samples come from the same distribution
 * Better for non-normal distributions, especially with small sample sizes
 * Returns { u: U-statistic, n1, n2, pValue: two-tailed p-value }
 */
export function mannWhitneyU(
  sample1: number[],
  sample2: number[],
): { u: number; n1: number; n2: number; pValue: number } {
  const n1 = sample1.length;
  const n2 = sample2.length;

  // Combine and rank all values
  const combined = [
    ...sample1.map((v, i) => ({ value: v, group: 1, originalIndex: i })),
    ...sample2.map((v, i) => ({ value: v, group: 2, originalIndex: i })),
  ];

  combined.sort((a, b) => a.value - b.value);

  // Handle ties by assigning average rank
  const ranks: number[] = new Array(combined.length);
  let i = 0;
  while (i < combined.length) {
    const value = combined[i].value;
    const startI = i;

    // Find all values equal to current value (ties)
    while (i < combined.length && combined[i].value === value) {
      i++;
    }

    // Assign average rank to tied values
    const avgRank = (startI + i - 1) / 2 + 1;
    for (let j = startI; j < i; j++) {
      ranks[j] = avgRank;
    }
  }

  // Calculate rank sum for group 1
  let r1 = 0;
  for (let j = 0; j < combined.length; j++) {
    if (combined[j].group === 1) {
      r1 += ranks[j];
    }
  }

  // Calculate U statistic
  const u1 = n1 * n2 + (n1 * (n1 + 1)) / 2 - r1;
  const u2 = n1 * n2 - u1;
  const u = Math.min(u1, u2);

  // Calculate mean and std of U under null hypothesis
  const mean = (n1 * n2) / 2;
  const std = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);

  // Continuity correction: small sample adjustment
  const z = Math.abs(u - mean - 0.5) / (std || 1);

  // Approximate p-value using normal distribution (valid for n > 20)
  const pValue = 2 * (1 - normalCDF(z));

  return { u, n1, n2, pValue };
}

// ── Bonferroni Correction ──────────────────────────────────────────────────────

/**
 * Bonferroni correction for multiple comparisons
 * Adjusts alpha threshold to control family-wise error rate
 */
export function bonferroniCorrection(
  alpha: number,
  numComparisons: number,
): number {
  return alpha / numComparisons;
}

/**
 * Bonferroni-adjusted p-value
 */
export function bonferroniAdjustedPValue(
  pValue: number,
  numComparisons: number,
): number {
  return Math.min(1, pValue * numComparisons);
}

// ── Exponential Smoothing & Forecasting ────────────────────────────────────────

/**
 * Simple exponential smoothing for trend forecasting
 * alpha: smoothing factor (0-1)
 * horizon: number of steps to forecast
 */
export function exponentialSmoothing(
  values: number[],
  alpha: number = 0.3,
  horizon: number = 5,
): { forecast: number[]; confidenceIntervals: [number, number][] } {
  if (values.length === 0) return { forecast: [], confidenceIntervals: [] };

  // Calculate smoothed values
  let level = values[0];
  const smoothed: number[] = [level];

  for (let i = 1; i < values.length; i++) {
    level = alpha * values[i] + (1 - alpha) * level;
    smoothed.push(level);
  }

  // Calculate forecast (constant extrapolation)
  const forecast = Array(horizon).fill(level);

  // Calculate confidence intervals based on residual variance
  const residuals = values.map((v, i) => v - smoothed[i]);
  const residualVar =
    residuals.reduce((sum, r) => sum + r ** 2, 0) / (residuals.length || 1);
  const residualStd = Math.sqrt(residualVar);

  // 95% CI: ±1.96 * std
  const confidenceIntervals = forecast.map((f) => [
    f - 1.96 * residualStd,
    f + 1.96 * residualStd,
  ]);

  return { forecast, confidenceIntervals };
}

/**
 * Double exponential smoothing (Holt's method) for trend + level
 */
export function doubleExponentialSmoothing(
  values: number[],
  alpha: number = 0.3,
  beta: number = 0.2,
  horizon: number = 5,
): { forecast: number[]; confidenceIntervals: [number, number][] } {
  if (values.length < 2) return { forecast: [], confidenceIntervals: [] };

  // Initialize
  let level = values[0];
  let trend = values[1] - values[0];

  // Calculate smoothed values
  for (let i = 1; i < values.length; i++) {
    const newLevel = alpha * values[i] + (1 - alpha) * (level + trend);
    trend = beta * (newLevel - level) + (1 - beta) * trend;
    level = newLevel;
  }

  // Forecast with trend
  const forecast = Array.from(
    { length: horizon },
    (_, i) => level + (i + 1) * trend,
  );

  // Calculate residuals and std
  let smoothLevel = values[0];
  let smoothTrend = values[1] - values[0];
  const residuals: number[] = [];

  for (let i = 1; i < values.length; i++) {
    const pred = smoothLevel + smoothTrend;
    residuals.push(values[i] - pred);
    const newLevel = alpha * values[i] + (1 - alpha) * pred;
    smoothTrend = beta * (newLevel - smoothLevel) + (1 - beta) * smoothTrend;
    smoothLevel = newLevel;
  }

  const residualVar =
    residuals.reduce((sum, r) => sum + r ** 2, 0) / (residuals.length || 1);
  const residualStd = Math.sqrt(residualVar);

  const confidenceIntervals = forecast.map((f) => [
    f - 1.96 * residualStd,
    f + 1.96 * residualStd,
  ]);

  return { forecast, confidenceIntervals };
}

// ── Statistical Descriptors ────────────────────────────────────────────────────

export function statisticalSummary(values: number[]): {
  mean: number;
  median: number;
  std: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
  iqr: number;
  skewness: number;
  kurtosis: number;
} {
  const sorted = [...values].sort((a, b) => a - b);
  const n = values.length;

  const mean = values.reduce((a, b) => a + b, 0) / n;
  const median = sorted[Math.floor(n / 2)];

  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (n - 1 || 1);
  const std = Math.sqrt(variance);

  const min = sorted[0];
  const max = sorted[n - 1];
  const q1 = sorted[Math.floor(n * 0.25)];
  const q3 = sorted[Math.floor(n * 0.75)];
  const iqr = q3 - q1;

  // Skewness
  const m3 = values.reduce((sum, v) => sum + (v - mean) ** 3, 0) / n;
  const skewness = m3 / (std ** 3 || 1);

  // Kurtosis (excess kurtosis)
  const m4 = values.reduce((sum, v) => sum + (v - mean) ** 4, 0) / n;
  const kurtosis = m4 / (std ** 4 || 1) - 3;

  return { mean, median, std, min, max, q1, q3, iqr, skewness, kurtosis };
}

// ── K-Fold Cross-Validation ───────────────────────────────────────────────────

export interface KFoldSplit {
  trainIndices: number[];
  testIndices: number[];
  foldNumber: number;
}

/**
 * Stratified K-Fold Cross-Validation
 * Maintains class distribution in each fold (essential for imbalanced datasets)
 * Returns array of splits with train/test indices for each fold
 */
export function stratifiedKFold(
  labels: (number | boolean | string)[],
  k: number = 5,
  randomSeed: number = 42,
): KFoldSplit[] {
  if (k < 2 || k > labels.length) {
    throw new Error(`k must be between 2 and ${labels.length}`);
  }

  const n = labels.length;
  const indices = Array.from({ length: n }, (_, i) => i);

  // Simple deterministic shuffle using seed
  const shuffled = shuffle(indices, randomSeed);

  // Group indices by class label
  const classGroups: Map<string | number | boolean, number[]> = new Map();
  for (const idx of shuffled) {
    const label = String(labels[idx]);
    if (!classGroups.has(label)) {
      classGroups.set(label, []);
    }
    classGroups.get(label)!.push(idx);
  }

  // Distribute each class across folds
  const folds: number[][] = Array.from({ length: k }, () => []);
  for (const classIndices of classGroups.values()) {
    for (let i = 0; i < classIndices.length; i++) {
      const foldIdx = i % k;
      folds[foldIdx].push(classIndices[i]);
    }
  }

  // Create splits
  const splits: KFoldSplit[] = [];
  for (let i = 0; i < k; i++) {
    const testIndices = folds[i];
    const trainIndices = folds
      .filter((_, idx) => idx !== i)
      .flatMap((fold) => fold);

    splits.push({
      trainIndices: trainIndices.sort((a, b) => a - b),
      testIndices: testIndices.sort((a, b) => a - b),
      foldNumber: i + 1,
    });
  }

  return splits;
}

/**
 * Standard K-Fold Cross-Validation (without stratification)
 * Use stratifiedKFold for imbalanced datasets
 */
export function kFold(
  n: number,
  k: number = 5,
  randomSeed: number = 42,
): KFoldSplit[] {
  if (k < 2 || k > n) {
    throw new Error(`k must be between 2 and ${n}`);
  }

  const indices = Array.from({ length: n }, (_, i) => i);
  const shuffled = shuffle(indices, randomSeed);

  const folds: number[][] = Array.from({ length: k }, () => []);
  for (let i = 0; i < shuffled.length; i++) {
    folds[i % k].push(shuffled[i]);
  }

  const splits: KFoldSplit[] = [];
  for (let i = 0; i < k; i++) {
    const testIndices = folds[i];
    const trainIndices = folds
      .filter((_, idx) => idx !== i)
      .flatMap((fold) => fold);

    splits.push({
      trainIndices: trainIndices.sort((a, b) => a - b),
      testIndices: testIndices.sort((a, b) => a - b),
      foldNumber: i + 1,
    });
  }

  return splits;
}

/**
 * Calculate class balance metrics for imbalanced dataset analysis
 */
export function classBalanceMetrics(labels: (number | boolean | string)[]): {
  classDistribution: Record<string, number>;
  imbalanceRatio: number;
  dominantClass: string;
  minorityClass: string;
  isHighlyImbalanced: boolean; // ratio > 10:1
} {
  const distribution: Record<string, number> = {};
  for (const label of labels) {
    const key = String(label);
    distribution[key] = (distribution[key] || 0) + 1;
  }

  const counts = Object.values(distribution).sort((a, b) => b - a);
  const imbalanceRatio = counts[0] / (counts[counts.length - 1] || 1);
  const sortedEntries = Object.entries(distribution).sort(
    (a, b) => b[1] - a[1],
  );

  return {
    classDistribution: distribution,
    imbalanceRatio,
    dominantClass: sortedEntries[0]?.[0] || "",
    minorityClass: sortedEntries[sortedEntries.length - 1]?.[0] || "",
    isHighlyImbalanced: imbalanceRatio > 10,
  };
}

/**
 * Deterministic shuffle using seeded pseudo-random number generator
 */
function shuffle(arr: number[], seed: number): number[] {
  const array = [...arr];
  let random = seed;

  for (let i = array.length - 1; i > 0; i--) {
    // Seeded pseudo-random: linear congruential generator
    random = (random * 1103515245 + 12345) % 2147483648;
    const j = Math.abs(random) % (i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}
