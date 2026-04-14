/**
 * StatisticalDistribution — SVG distribution / histogram component.
 *
 * Two display modes:
 *
 *  "histogram"   — Binned frequency histogram for a numeric array.
 *                  Used for: risk score distribution, confidence spread.
 *
 *  "comparison"  — Side-by-side metric bars comparing datasets/agents.
 *                  Used for: Precision/Recall/F1/AUC across 3 datasets.
 *
 * Both modes show:
 *  - Mean line with label
 *  - Optional threshold line (e.g. risk cutoff at 70)
 *  - Dark mode support
 */

// ── Types ──────────────────────────────────────────────────────────────────────

interface HistogramProps {
  mode: "histogram";
  values: number[];
  title?: string;
  description?: string;
  bins?: number;
  color?: string;
  /** Optional reference line (e.g. risk threshold = 70) */
  thresholdValue?: number;
  thresholdLabel?: string;
  xLabel?: string;
  yLabel?: string;
  height?: number;
}

export interface ComparisonSeries {
  label: string;
  values: Record<string, number>; // e.g. { Precision: 0.93, Recall: 0.87, … }
  color: string;
}

interface ComparisonProps {
  mode: "comparison";
  series: ComparisonSeries[];
  metrics: string[];
  title?: string;
  description?: string;
  height?: number;
  /** 0-1 or 0-100? Default 1 */
  maxValue?: number;
}

type StatisticalDistributionProps = HistogramProps | ComparisonProps;

// ── Layout ─────────────────────────────────────────────────────────────────────

const PAD_L = 52;
const PAD_R = 20;
const PAD_T = 20;
const PAD_B = 44;

// ── Histogram helpers ──────────────────────────────────────────────────────────

function buildBins(
  values: number[],
  bins: number,
): { x0: number; x1: number; count: number }[] {
  if (values.length === 0) return [];
  const min   = Math.min(...values);
  const max   = Math.max(...values);
  const range = max - min || 1;
  const step  = range / bins;

  const result = Array.from({ length: bins }, (_, i) => ({
    x0: min + i * step,
    x1: min + (i + 1) * step,
    count: 0,
  }));

  for (const v of values) {
    const idx = Math.min(Math.floor((v - min) / step), bins - 1);
    result[idx].count++;
  }
  return result;
}

function mean(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0) / (arr.length || 1);
}

// ── Component ──────────────────────────────────────────────────────────────────

export function StatisticalDistribution(props: StatisticalDistributionProps) {
  if (props.mode === "histogram") {
    return <Histogram {...props} />;
  }
  return <ComparisonChart {...props} />;
}

// ── Histogram ─────────────────────────────────────────────────────────────────

function Histogram({
  values,
  title,
  description,
  bins         = 20,
  color        = "#6366F1",
  thresholdValue,
  thresholdLabel,
  xLabel,
  yLabel,
  height       = 260,
}: Omit<HistogramProps, "mode">) {
  const svgW  = 520;
  const svgH  = height;
  const plotW = svgW - PAD_L - PAD_R;
  const plotH = svgH - PAD_T - PAD_B;

  const binnedData  = buildBins(values, bins);
  const maxCount    = Math.max(...binnedData.map((b) => b.count), 1);
  const allMin      = binnedData[0]?.x0  ?? 0;
  const allMax      = binnedData[binnedData.length - 1]?.x1 ?? 1;
  const domainRange = allMax - allMin || 1;
  const meanVal     = mean(values);

  function toX(v: number) { return PAD_L + ((v - allMin) / domainRange) * plotW; }
  function toY(c: number) { return PAD_T + plotH - (c / maxCount) * plotH; }

  const barGap = 1;

  // Y-axis ticks
  const yTicks = Array.from({ length: 5 }, (_, i) =>
    Math.round((maxCount * (4 - i)) / 4),
  );

  if (values.length === 0) {
    return (
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
        <p class="text-sm text-zinc-500 dark:text-zinc-400">No data</p>
      </div>
    );
  }

  return (
    <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 transition-colors">
      {title && (
        <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
          {title}
        </h3>
      )}
      {description && (
        <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-2">{description}</p>
      )}

      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ width: "100%", height: "auto" }}
      >
        {/* Grid lines */}
        {yTicks.map((t) => (
          <line
            key={t}
            x1={PAD_L} y1={toY(t)}
            x2={PAD_L + plotW} y2={toY(t)}
            stroke="#E4E4E7"
            stroke-width="1"
          />
        ))}

        {/* Bars */}
        {binnedData.map((bin, i) => {
          const x = toX(bin.x0) + barGap;
          const w = Math.max(1, toX(bin.x1) - toX(bin.x0) - barGap * 2);
          const y = toY(bin.count);
          const h = PAD_T + plotH - y;

          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={w}
              height={Math.max(0, h)}
              fill={color}
              fill-opacity="0.75"
              rx="2"
              ry="2"
            />
          );
        })}

        {/* Mean line */}
        <line
          x1={toX(meanVal)} y1={PAD_T}
          x2={toX(meanVal)} y2={PAD_T + plotH}
          stroke="#18181B"
          stroke-width="1.5"
          stroke-dasharray="6,3"
        />
        <text
          x={toX(meanVal) + 4}
          y={PAD_T + 12}
          font-size="11"
          font-weight="600"
          fill="#18181B"
        >
          μ = {meanVal.toFixed(1)}
        </text>

        {/* Threshold line */}
        {thresholdValue !== undefined && (
          <>
            <line
              x1={toX(thresholdValue)} y1={PAD_T}
              x2={toX(thresholdValue)} y2={PAD_T + plotH}
              stroke="#EF4444"
              stroke-width="1.5"
              stroke-dasharray="4,3"
            />
            <text
              x={toX(thresholdValue) + 4}
              y={PAD_T + 26}
              font-size="11"
              fill="#EF4444"
            >
              {thresholdLabel ?? thresholdValue}
            </text>
          </>
        )}

        {/* Y-axis ticks & labels */}
        {yTicks.map((t) => (
          <text
            key={t}
            x={PAD_L - 6}
            y={toY(t) + 4}
            text-anchor="end"
            font-size="10"
            class="fill-zinc-500 dark:fill-zinc-400"
          >
            {t}
          </text>
        ))}

        {/* X-axis labels (show ~5 ticks) */}
        {Array.from({ length: 6 }, (_, i) => {
          const v = allMin + (domainRange * i) / 5;
          return (
            <text
              key={i}
              x={toX(v)}
              y={PAD_T + plotH + 16}
              text-anchor="middle"
              font-size="10"
              class="fill-zinc-500 dark:fill-zinc-400"
            >
              {v.toFixed(0)}
            </text>
          );
        })}

        {/* Axes */}
        <line
          x1={PAD_L} y1={PAD_T}
          x2={PAD_L} y2={PAD_T + plotH}
          stroke="#71717A" stroke-width="1.5"
        />
        <line
          x1={PAD_L} y1={PAD_T + plotH}
          x2={PAD_L + plotW} y2={PAD_T + plotH}
          stroke="#71717A" stroke-width="1.5"
        />

        {/* Axis labels */}
        {xLabel && (
          <text
            x={PAD_L + plotW / 2}
            y={svgH - 4}
            text-anchor="middle"
            font-size="12"
            font-weight="500"
            class="fill-zinc-600 dark:fill-zinc-300"
          >
            {xLabel}
          </text>
        )}
        {yLabel && (
          <text
            x={0}
            y={0}
            font-size="12"
            font-weight="500"
            class="fill-zinc-600 dark:fill-zinc-300"
            transform={`translate(14, ${PAD_T + plotH / 2}) rotate(-90)`}
            text-anchor="middle"
          >
            {yLabel}
          </text>
        )}
      </svg>

      <p class="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
        n = {values.length.toLocaleString()} · bins = {bins}
      </p>
    </div>
  );
}

// ── Grouped comparison chart ───────────────────────────────────────────────────

function ComparisonChart({
  series,
  metrics,
  title,
  description,
  height   = 280,
  maxValue = 1,
}: Omit<ComparisonProps, "mode">) {
  const svgW  = 520;
  const svgH  = height;
  const plotW = svgW - PAD_L - PAD_R;
  const plotH = svgH - PAD_T - PAD_B;

  const metricCount = metrics.length;
  const groupW      = plotW / metricCount;
  const barW        = Math.min(28, (groupW - 8) / series.length);
  const groupGap    = 4;

  function toY(v: number) {
    return PAD_T + plotH - (v / maxValue) * plotH;
  }

  const yTicks = [0, 0.25, 0.5, 0.75, 1.0].map((t) => t * maxValue);

  return (
    <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 transition-colors">
      {title && (
        <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
          {title}
        </h3>
      )}
      {description && (
        <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-2">{description}</p>
      )}

      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ width: "100%", height: "auto" }}
      >
        {/* Grid */}
        {yTicks.map((t) => (
          <line
            key={t}
            x1={PAD_L} y1={toY(t)}
            x2={PAD_L + plotW} y2={toY(t)}
            stroke="#E4E4E7"
            stroke-width="1"
            stroke-dasharray={t === 0 ? "none" : "4,3"}
          />
        ))}

        {/* Bars */}
        {metrics.map((metric, mi) => {
          const groupX = PAD_L + mi * groupW + groupW / 2;
          const totalW = series.length * barW + (series.length - 1) * groupGap;
          const startX = groupX - totalW / 2;

          return (
            <g key={metric}>
              {series.map((s, si) => {
                const val = s.values[metric] ?? 0;
                const x   = startX + si * (barW + groupGap);
                const y   = toY(val);
                const h   = PAD_T + plotH - y;

                return (
                  <g key={si}>
                    <rect
                      x={x}
                      y={y}
                      width={barW}
                      height={Math.max(0, h)}
                      fill={s.color}
                      fill-opacity="0.82"
                      rx="2"
                      ry="2"
                    />
                    {/* Value label on top */}
                    <text
                      x={x + barW / 2}
                      y={y - 3}
                      text-anchor="middle"
                      font-size="9"
                      font-weight="600"
                      fill={s.color}
                    >
                      {(val * (maxValue === 1 ? 100 : 1)).toFixed(1)}
                      {maxValue === 1 ? "%" : ""}
                    </text>
                  </g>
                );
              })}

              {/* Metric label */}
              <text
                x={groupX}
                y={PAD_T + plotH + 16}
                text-anchor="middle"
                font-size="11"
                font-weight="500"
                class="fill-zinc-600 dark:fill-zinc-400"
              >
                {metric}
              </text>
            </g>
          );
        })}

        {/* Y-axis ticks */}
        {yTicks.map((t) => (
          <text
            key={t}
            x={PAD_L - 6}
            y={toY(t) + 4}
            text-anchor="end"
            font-size="10"
            class="fill-zinc-500 dark:fill-zinc-400"
          >
            {maxValue === 1 ? `${(t * 100).toFixed(0)}%` : t.toFixed(2)}
          </text>
        ))}

        {/* Axes */}
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + plotH} stroke="#71717A" stroke-width="1.5" />
        <line x1={PAD_L} y1={PAD_T + plotH} x2={PAD_L + plotW} y2={PAD_T + plotH} stroke="#71717A" stroke-width="1.5" />
      </svg>

      {/* Legend */}
      <div class="mt-3 flex flex-wrap gap-3">
        {series.map((s) => (
          <div key={s.label} class="flex items-center gap-1.5">
            <span
              class="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: s.color }}
            />
            <span class="text-xs text-zinc-700 dark:text-zinc-300">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Convenience builder ────────────────────────────────────────────────────────

/**
 * Build ComparisonSeries[] from BenchmarkingResults for the 4 core metrics.
 */
export function buildComparisonSeriesFromBenchmark(
  performanceMetrics: Record<
    string,
    { precision: number; recall: number; f1_score: number; auc_roc: number }
  >,
): { series: ComparisonSeries[]; metrics: string[] } {
  const COLORS = ["#6366F1", "#10B981", "#F97316", "#EF4444", "#A855F7"];
  const metrics = ["Precision", "Recall", "F1 Score", "AUC-ROC"];

  const series: ComparisonSeries[] = Object.entries(performanceMetrics).map(
    ([name, m], idx) => ({
      label:  name,
      color:  COLORS[idx % COLORS.length],
      values: {
        Precision:  m.precision,
        Recall:     m.recall,
        "F1 Score": m.f1_score,
        "AUC-ROC":  m.auc_roc,
      },
    }),
  );

  return { series, metrics };
}
