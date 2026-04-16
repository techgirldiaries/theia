/**
 * SeasonalDecompositionChart — Time-series decomposition visualization
 *
 * Displays:
 *  - Original time series
 *  - Trend component
 *  - Seasonal component
 *  - Residual component
 *  - ACF (autocorrelation function) plot
 *
 * Used for analyzing temporal patterns, seasonal cycles, and emerging anomalies
 */

import {
  seasonalDecompose,
  acf,
  statisticalSummary,
  type SeasonalDecomposition,
} from "@/utils/statistical-analysis";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

interface SeasonalDecompositionChartProps {
  data: { label: string; value: number }[];
  title?: string;
  description?: string;
  seasonalPeriod?: number;
  height?: number;
}

export function SeasonalDecompositionChart({
  data,
  title,
  description,
  seasonalPeriod = 12,
  height = 800,
}: SeasonalDecompositionChartProps) {
  if (data.length < seasonalPeriod * 2) {
    return (
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
        <p class="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
          <AlertCircle size={16} />
          Insufficient data for seasonal decomposition. Need at least{" "}
          {seasonalPeriod * 2} points.
        </p>
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const decomposed = seasonalDecompose(values, seasonalPeriod);
  const acfValues = acf(decomposed.residual, Math.min(20, values.length / 4));

  const summary = statisticalSummary(values);
  const residualSummary = statisticalSummary(decomposed.residual);

  // Detect anomalies in residuals (values > 2 std from mean)
  const residualThreshold = residualSummary.std * 2;
  const anomalyCount = decomposed.residual.filter(
    (r) => Math.abs(r) > residualThreshold,
  ).length;

  return (
    <div class="space-y-4">
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
        {title && (
          <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
            {title}
          </h3>
        )}
        {description && (
          <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
            {description}
          </p>
        )}

        {/* Decomposition visualizations */}
        <div class="space-y-3">
          <TimeSeriesPlot
            label="Original Series"
            values={values}
            color="#3B82F6"
            height={120}
          />
          <TimeSeriesPlot
            label="Trend Component"
            values={decomposed.trend}
            color="#10B981"
            height={120}
          />
          <TimeSeriesPlot
            label="Seasonal Component"
            values={decomposed.seasonal}
            color="#F59E0B"
            height={120}
          />
          <TimeSeriesPlot
            label="Residual Component"
            values={decomposed.residual}
            color="#EF4444"
            height={120}
            threshold={residualThreshold}
            thresholdLabel={`±${residualThreshold.toFixed(2)}`}
          />
        </div>

        {/* Anomaly detection summary */}
        <div class="mt-4 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded border border-zinc-200 dark:border-zinc-700">
          <p class="text-sm font-semibold text-zinc-900 dark:text-white mb-2">
            Anomaly Detection
          </p>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p class="text-zinc-500 dark:text-zinc-400">Anomalies Detected</p>
              <p class="text-lg font-bold text-zinc-900 dark:text-white">
                {anomalyCount}
              </p>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">
                ({((anomalyCount / values.length) * 100).toFixed(1)}%)
              </p>
            </div>
            <div>
              <p class="text-zinc-500 dark:text-zinc-400">Residual Std Dev</p>
              <p class="text-lg font-bold text-zinc-900 dark:text-white">
                {residualSummary.std.toFixed(3)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ACF plot */}
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
          Autocorrelation Function (ACF) - Residuals
        </h4>
        <ACFPlot acfValues={acfValues} height={150} />
        <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
          Strong autocorrelation peaks indicate remaining periodic patterns.
        </p>
      </div>

      {/* Statistical summary */}
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
          Statistical Summary
        </h4>
        <div class="grid grid-cols-3 gap-2 text-sm">
          <StatCard
            label="Mean"
            value={summary.mean.toFixed(2)}
            icon={TrendingUp}
          />
          <StatCard
            label="Std Dev"
            value={summary.std.toFixed(2)}
            icon={TrendingDown}
          />
          <StatCard
            label="Skewness"
            value={summary.skewness.toFixed(2)}
            color={
              Math.abs(summary.skewness) > 1
                ? "text-amber-600"
                : "text-zinc-600"
            }
          />
          <StatCard label="Min" value={summary.min.toFixed(2)} />
          <StatCard label="Max" value={summary.max.toFixed(2)} />
          <StatCard label="IQR" value={summary.iqr.toFixed(2)} />
        </div>
      </div>
    </div>
  );
}

// ── Time Series Plot ───────────────────────────────────────────────────────────

function TimeSeriesPlot({
  label,
  values,
  color,
  height = 120,
  threshold,
  thresholdLabel,
}: {
  label: string;
  values: number[];
  color: string;
  height?: number;
  threshold?: number;
  thresholdLabel?: string;
}) {
  const svgW = 520;
  const svgH = height;
  const padding = 30;
  const plotW = svgW - padding * 2;
  const plotH = svgH - padding;

  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const range = maxVal - minVal || 1;

  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1 || 1)) * plotW;
    const y = padding + plotH - ((v - minVal) / range) * plotH;
    return { x, y, v };
  });

  const pathData = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <div class="border border-zinc-200 dark:border-zinc-700 rounded p-2 bg-zinc-50 dark:bg-zinc-900/50">
      <p class="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
        {label}
      </p>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ width: "100%", height: `${height}px` }}
      >
        {/* Grid */}
        {[0, 0.5, 1].map((t) => (
          <line
            key={t}
            x1={padding}
            y1={padding + plotH * (1 - t)}
            x2={svgW - padding}
            y2={padding + plotH * (1 - t)}
            stroke="#E4E4E7"
            stroke-width="1"
            opacity="0.5"
          />
        ))}

        {/* Threshold line */}
        {threshold !== undefined && (
          <>
            <line
              x1={padding}
              y1={padding + plotH - ((threshold - minVal) / range) * plotH}
              x2={svgW - padding}
              y2={padding + plotH - ((threshold - minVal) / range) * plotH}
              stroke="#EF4444"
              stroke-width="1"
              stroke-dasharray="4,3"
            />
            <line
              x1={padding}
              y1={padding + plotH - ((-threshold - minVal) / range) * plotH}
              x2={svgW - padding}
              y2={padding + plotH - ((-threshold - minVal) / range) * plotH}
              stroke="#EF4444"
              stroke-width="1"
              stroke-dasharray="4,3"
            />
          </>
        )}

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        {/* Axes */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={padding + plotH}
          stroke="#71717A"
          stroke-width="1"
        />
        <line
          x1={padding}
          y1={padding + plotH}
          x2={svgW - padding}
          y2={padding + plotH}
          stroke="#71717A"
          stroke-width="1"
        />
      </svg>
    </div>
  );
}

// ── ACF Plot ───────────────────────────────────────────────────────────────────

function ACFPlot({
  acfValues,
  height = 150,
}: {
  acfValues: number[];
  height?: number;
}) {
  const svgW = 520;
  const svgH = height;
  const padding = 40;
  const plotW = svgW - padding * 2;
  const plotH = svgH - padding;

  const barWidth = Math.max(2, plotW / acfValues.length - 2);
  const barGap = 1;

  // Significance line (95% CI for white noise: ±1.96/√n)
  const significanceLine = 1.96 / Math.sqrt(acfValues.length || 1);

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      style={{ width: "100%", height: `${height}px` }}
    >
      {/* Grid */}
      {[-1, -0.5, 0, 0.5, 1].map((t) => (
        <line
          key={t}
          x1={padding}
          y1={padding + ((1 - t) / 2) * plotH}
          x2={svgW - padding}
          y2={padding + ((1 - t) / 2) * plotH}
          stroke="#E4E4E7"
          stroke-width="1"
          opacity="0.5"
        />
      ))}

      {/* Significance bands */}
      <rect
        x={padding}
        y={padding + ((1 - significanceLine) / 2) * plotH}
        width={plotW}
        height={(significanceLine / 2) * plotH}
        fill="#DBEAFE"
        fill-opacity="0.3"
      />
      <rect
        x={padding}
        y={padding + ((1 + significanceLine) / 2) * plotH}
        width={plotW}
        height={(significanceLine / 2) * plotH}
        fill="#DBEAFE"
        fill-opacity="0.3"
      />

      {/* Bars */}
      {acfValues.map((acf, i) => {
        const x = padding + (i / acfValues.length) * plotW + barGap;
        const isPositive = acf >= 0;
        const y0 = padding + plotH / 2;
        const y = y0 - (acf / 2) * plotH;
        const h = Math.abs(acf / 2) * plotH;

        return (
          <rect
            key={i}
            x={x}
            y={isPositive ? y : y0}
            width={barWidth}
            height={h}
            fill={Math.abs(acf) > significanceLine ? "#3B82F6" : "#D1D5DB"}
            rx="1"
          />
        );
      })}

      {/* Center line */}
      <line
        x1={padding}
        y1={padding + plotH / 2}
        x2={svgW - padding}
        y2={padding + plotH / 2}
        stroke="#71717A"
        stroke-width="1.5"
      />

      {/* Axes labels */}
      <text
        x={padding - 8}
        y={padding + 4}
        text-anchor="end"
        font-size="10"
        class="fill-zinc-500"
      >
        1.0
      </text>
      <text
        x={padding - 8}
        y={padding + plotH / 2 + 4}
        text-anchor="end"
        font-size="10"
        class="fill-zinc-500"
      >
        0.0
      </text>
      <text
        x={padding - 8}
        y={padding + plotH + 4}
        text-anchor="end"
        font-size="10"
        class="fill-zinc-500"
      >
        -1.0
      </text>

      {/* X-axis label */}
      <text
        x={svgW / 2}
        y={svgH - 4}
        text-anchor="middle"
        font-size="11"
        class="fill-zinc-600 dark:fill-zinc-400"
        font-weight="500"
      >
        Lag
      </text>
    </svg>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color = "text-zinc-600",
}: {
  label: string;
  value: string;
  icon?: typeof TrendingUp;
  color?: string;
}) {
  return (
    <div class="p-2 border border-zinc-200 dark:border-zinc-700 rounded bg-zinc-50 dark:bg-zinc-900/50">
      <p class="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <div class="flex items-end gap-1 mt-1">
        {Icon && <Icon size={14} class={color} />}
        <p class={`font-bold text-sm ${color}`}>{value}</p>
      </div>
    </div>
  );
}
