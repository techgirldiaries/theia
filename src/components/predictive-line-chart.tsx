/**
 * PredictiveLineChart — Time-series line chart with forecasting capabilities
 *
 * Features:
 *  - Linear regression trend line
 *  - Exponential smoothing forecasts
 *  - Confidence intervals (95% CI)
 *  - Anomaly highlights
 *  - Future prediction visualization
 *
 * Used for: Temporal trends, predictions, anomaly detection
 */

import {
  exponentialSmoothing,
  doubleExponentialSmoothing,
  statisticalSummary,
} from "@/utils/statistical-analysis";

interface TimeSeriesData {
  label: string;
  value: number;
}

interface PredictiveLineChartProps {
  data: TimeSeriesData[];
  title?: string;
  height?: number;
  color?: string;
  yAxisLabel?: string;
  description?: string;
  forecastHorizon?: number;
  showTrendLine?: boolean;
  showForecast?: boolean;
  showConfidenceInterval?: boolean;
  anomalyThreshold?: number; // Standard deviations
}

export function PredictiveLineChart({
  data,
  title,
  height = 300,
  color = "stroke-indigo-500",
  yAxisLabel,
  description,
  forecastHorizon = 5,
  showTrendLine = true,
  showForecast = true,
  showConfidenceInterval = true,
  anomalyThreshold = 2,
}: PredictiveLineChartProps) {
  if (data.length === 0) {
    return (
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 transition-colors">
        {title && (
          <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            {title}
          </h3>
        )}
        <div
          class="flex items-center justify-center text-zinc-500 dark:text-zinc-400"
          style={{ height: `${height}px` }}
        >
          No data available
        </div>
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const stats = statisticalSummary(values);

  // Calculate trend line (linear regression)
  const trendLine = showTrendLine ? calculateLinearRegression(values) : null;

  // Calculate forecast
  let forecastData: {
    forecast: number[];
    confidenceIntervals: [number, number][];
  } | null = null;
  if (showForecast && data.length >= 3) {
    forecastData = doubleExponentialSmoothing(
      values,
      0.3,
      0.2,
      forecastHorizon,
    );
  }

  // Identify anomalies
  const anomalyThresholdValue = stats.std * anomalyThreshold;
  const anomalies = values
    .map((v, i) => ({
      index: i,
      value: v,
      isAnomaly: Math.abs(v - stats.mean) > anomalyThresholdValue,
    }))
    .filter((a) => a.isAnomaly);

  return (
    <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 transition-colors space-y-3">
      {title && (
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
      )}

      <svg
        viewBox={`0 0 ${600} ${height}`}
        class="w-full"
        style={{ height: `${height}px` }}
      >
        {/* Grid lines */}
        {[...Array(5)].map((_, i) => {
          const y = 40 + (i * (height - 80)) / 4;
          return (
            <line
              key={i}
              x1={40}
              y1={y}
              x2={580}
              y2={y}
              class="stroke-zinc-200 dark:stroke-zinc-700"
              stroke-width="1"
            />
          );
        })}

        {/* Confidence interval band for forecast */}
        {showConfidenceInterval &&
          forecastData &&
          renderConfidenceBand(
            forecastData.confidenceIntervals,
            data.length,
            stats,
            height,
          )}

        {/* Historical data area fill */}
        {renderAreaFill(data, stats, height, color)}

        {/* Trend line */}
        {trendLine && renderTrendLine(trendLine, data.length, stats, height)}

        {/* Historical line */}
        {renderHistoricalLine(data, stats, height, color)}

        {/* Forecast line */}
        {forecastData &&
          renderForecastLine(data, forecastData.forecast, stats, height)}

        {/* Anomaly markers */}
        {anomalies.length > 0 &&
          anomalies.map((a) =>
            renderAnomalyMarker(a.index, a.value, stats, data.length, height),
          )}

        {/* Data points */}
        {renderDataPoints(data, stats, height, color)}

        {/* Y-axis labels */}
        {[...Array(5)].map((_, i) => {
          const range = Math.max(...values) - Math.min(...values) || 1;
          const value = Math.max(...values) - (i * range) / 4;
          const y = 40 + (i * (height - 80)) / 4;
          return (
            <text
              key={i}
              x={30}
              y={y + 4}
              text-anchor="end"
              class="text-xs fill-zinc-600 dark:fill-zinc-400"
            >
              {value.toFixed(0)}
            </text>
          );
        })}

        {/* X-axis labels */}
        {[...Array(6)].map((_, i) => {
          const index = Math.floor((data.length - 1) * (i / 5));
          const x = 40 + (i * (580 - 40)) / 5;
          return (
            <text
              key={i}
              x={x}
              y={height - 10}
              text-anchor="middle"
              class="text-xs fill-zinc-600 dark:fill-zinc-400"
            >
              {data[index]?.label || ""}
            </text>
          );
        })}

        {/* Axes */}
        <line
          x1={40}
          y1={40}
          x2={40}
          y2={height - 40}
          stroke="#71717A"
          stroke-width="1.5"
        />
        <line
          x1={40}
          y1={height - 40}
          x2={580}
          y2={height - 40}
          stroke="#71717A"
          stroke-width="1.5"
        />
      </svg>

      {/* Legend */}
      <div class="flex items-center justify-center gap-4 text-xs">
        <div class="flex items-center gap-1">
          <div class={`w-3 h-0.5 ${color}`} />
          <span class="text-zinc-600 dark:text-zinc-400">Actual</span>
        </div>
        {showTrendLine && (
          <div class="flex items-center gap-1">
            <div
              class="w-3 h-0.5 stroke-green-500"
              style={{ borderTop: "2px dashed #22C55E" }}
            />
            <span class="text-zinc-600 dark:text-zinc-400">Trend</span>
          </div>
        )}
        {showForecast && forecastData && (
          <div class="flex items-center gap-1">
            <div
              class="w-3 h-0.5 stroke-purple-500"
              style={{ borderTop: "2px dashed #A855F7" }}
            />
            <span class="text-zinc-600 dark:text-zinc-400">Forecast</span>
          </div>
        )}
        {anomalies.length > 0 && (
          <div class="flex items-center gap-1">
            <div class="w-2 h-2 bg-red-500 rounded-full" />
            <span class="text-zinc-600 dark:text-zinc-400">
              Anomaly ({anomalies.length})
            </span>
          </div>
        )}
      </div>

      {/* Statistics panel */}
      <div class="grid grid-cols-3 gap-2 text-xs p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded">
        <StatPill label="Mean" value={stats.mean.toFixed(2)} />
        <StatPill label="Std Dev" value={stats.std.toFixed(2)} />
        <StatPill label="Anomalies" value={anomalies.length} />
      </div>

      {yAxisLabel && (
        <p class="text-xs text-zinc-500 dark:text-zinc-400 text-center">
          {yAxisLabel}
        </p>
      )}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function calculateLinearRegression(values: number[]): {
  slope: number;
  intercept: number;
} {
  const n = values.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((sum, v, i) => sum + v * i, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

function renderAreaFill(
  data: TimeSeriesData[],
  stats: ReturnType<typeof statisticalSummary>,
  height: number,
  color: string,
) {
  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;
  const padding = 40;
  const plotHeight = height - 80;
  const plotWidth = 540;

  const pathPoints = data.map((point, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * plotWidth;
    const y =
      padding + plotHeight - ((point.value - minValue) / range) * plotHeight;
    return `${index === 0 ? "M" : "L"} ${x} ${y}`;
  });

  const linePath = pathPoints.join(" ");
  const areaPath =
    linePath +
    ` L ${padding + plotWidth} ${padding + plotHeight} L ${padding} ${padding + plotHeight} Z`;

  return (
    <path
      d={areaPath}
      class={`${color.replace("stroke", "fill")} opacity-10`}
      fill="currentColor"
    />
  );
}

function renderTrendLine(
  trend: { slope: number; intercept: number },
  dataLength: number,
  stats: ReturnType<typeof statisticalSummary>,
  height: number,
) {
  const maxValue = stats.max;
  const minValue = stats.min;
  const range = maxValue - minValue || 1;
  const padding = 40;
  const plotHeight = height - 80;
  const plotWidth = 540;

  const x1 = padding;
  const y1Value = trend.intercept;
  const y1 = padding + plotHeight - ((y1Value - minValue) / range) * plotHeight;

  const x2 = padding + plotWidth;
  const y2Value = trend.intercept + trend.slope * (dataLength - 1);
  const y2 = padding + plotHeight - ((y2Value - minValue) / range) * plotHeight;

  return (
    <line
      x1={x1}
      y1={Math.max(padding, Math.min(padding + plotHeight, y1))}
      x2={x2}
      y2={Math.max(padding, Math.min(padding + plotHeight, y2))}
      stroke="#22C55E"
      stroke-width="2"
      stroke-dasharray="4,3"
    />
  );
}

function renderHistoricalLine(
  data: TimeSeriesData[],
  stats: ReturnType<typeof statisticalSummary>,
  height: number,
  color: string,
) {
  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;
  const padding = 40;
  const plotHeight = height - 80;
  const plotWidth = 540;

  const pathPoints = data.map((point, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * plotWidth;
    const y =
      padding + plotHeight - ((point.value - minValue) / range) * plotHeight;
    return `${index === 0 ? "M" : "L"} ${x} ${y}`;
  });

  return (
    <path
      d={pathPoints.join(" ")}
      class={color}
      stroke-width="2"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  );
}

function renderForecastLine(
  data: TimeSeriesData[],
  forecast: number[],
  stats: ReturnType<typeof statisticalSummary>,
  height: number,
) {
  const allValues = [...data.map((d) => d.value), ...forecast];
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);
  const range = maxValue - minValue || 1;
  const padding = 40;
  const plotHeight = height - 80;
  const plotWidth = 540;

  const lastX =
    padding +
    ((data.length - 1) / (data.length + forecast.length - 1 || 1)) * plotWidth;
  const lastY =
    padding +
    plotHeight -
    ((data[data.length - 1].value - minValue) / range) * plotHeight;

  const pathPoints = forecast.map((value, i) => {
    const totalIndex = data.length + i;
    const x =
      padding +
      (totalIndex / (data.length + forecast.length - 1 || 1)) * plotWidth;
    const y = padding + plotHeight - ((value - minValue) / range) * plotHeight;
    return `${i === 0 ? `M ${lastX} ${lastY} L` : "L"} ${x} ${y}`;
  });

  return (
    <path
      d={pathPoints.join(" ")}
      stroke="#A855F7"
      stroke-width="2"
      fill="none"
      stroke-dasharray="4,3"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  );
}

function renderConfidenceBand(
  confidenceIntervals: [number, number][],
  dataLength: number,
  stats: ReturnType<typeof statisticalSummary>,
  height: number,
) {
  const allValues = [
    stats.min,
    ...confidenceIntervals.flatMap(([low, high]) => [low, high]),
    stats.max,
  ];
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);
  const range = maxValue - minValue || 1;
  const padding = 40;
  const plotHeight = height - 80;
  const plotWidth = 540;

  const bandPath = confidenceIntervals
    .map((interval, i) => {
      const totalIndex = dataLength + i;
      const x =
        padding +
        (totalIndex / (dataLength + confidenceIntervals.length - 1 || 1)) *
          plotWidth;
      const yLow =
        padding + plotHeight - ((interval[0] - minValue) / range) * plotHeight;
      const yHigh =
        padding + plotHeight - ((interval[1] - minValue) / range) * plotHeight;
      return i === 0
        ? `M ${x} ${yLow} L ${x} ${yHigh}`
        : `L ${x} ${yHigh} L ${x} ${yLow}`;
    })
    .join(" ");

  return <path d={`${bandPath} Z`} fill="#A855F7" fill-opacity="0.1" />;
}

function renderDataPoints(
  data: TimeSeriesData[],
  stats: ReturnType<typeof statisticalSummary>,
  height: number,
  color: string,
) {
  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;
  const padding = 40;
  const plotHeight = height - 80;
  const plotWidth = 540;

  return data.map((point, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * plotWidth;
    const y =
      padding + plotHeight - ((point.value - minValue) / range) * plotHeight;
    return (
      <g key={index}>
        <circle
          cx={x}
          cy={y}
          r="3"
          class={`${color.replace("stroke", "fill")} opacity-75`}
        />
        <circle cx={x} cy={y} r="1.5" class="fill-white dark:fill-zinc-800" />
      </g>
    );
  });
}

function renderAnomalyMarker(
  index: number,
  value: number,
  stats: ReturnType<typeof statisticalSummary>,
  dataLength: number,
  height: number,
) {
  const maxValue = stats.max;
  const minValue = stats.min;
  const range = maxValue - minValue || 1;
  const padding = 40;
  const plotHeight = height - 80;
  const plotWidth = 540;

  const x = padding + (index / (dataLength - 1 || 1)) * plotWidth;
  const y = padding + plotHeight - ((value - minValue) / range) * plotHeight;

  return (
    <g key={`anomaly-${index}`}>
      <circle
        cx={x}
        cy={y}
        r="6"
        fill="none"
        stroke="#EF4444"
        stroke-width="2"
      />
    </g>
  );
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div class="p-1">
      <p class="text-zinc-600 dark:text-zinc-400">{label}</p>
      <p class="font-bold text-zinc-900 dark:text-white">{value}</p>
    </div>
  );
}
