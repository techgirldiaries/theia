/**
 * Heatmap — generic SVG heatmap component.
 *
 * Usage examples:
 *   - 5×5 agent correlation matrix (cross_agent_correlations)
 *   - N×N statistical significance matrix (p-values)
 *   - Any 2-D numeric grid
 */

interface HeatmapProps {
  /** Row × column matrix of numeric values */
  data: number[][];
  rowLabels: string[];
  colLabels: string[];
  title?: string;
  description?: string;
  /** Override the lower bound (defaults to min value in data) */
  minValue?: number;
  /** Override the upper bound (defaults to max value in data) */
  maxValue?: number;
  /**
   * blue     — white → blue  (correlations, quality scores)
   * red      — white → red   (risk, p-values inverted)
   * diverging — blue → white → red (difference matrices)
   */
  colorScale?: "blue" | "red" | "diverging";
  showValues?: boolean;
  /** Custom value formatter, e.g. (v) => v.toFixed(2) */
  formatValue?: (v: number) => string;
}

// ── Colour helpers ─────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function blueScale(t: number): string {
  // #EFF6FF (sky-50) → #1E40AF (blue-800)
  const r = lerp(239, 30,  t);
  const g = lerp(246, 64,  t);
  const b = lerp(255, 175, t);
  return `rgb(${r},${g},${b})`;
}

function redScale(t: number): string {
  // #FFF5F5 → #B91C1C (red-700)
  const r = lerp(255, 185, t);
  const g = lerp(245, 28,  t);
  const b = lerp(245, 28,  t);
  return `rgb(${r},${g},${b})`;
}

function divergingScale(t: number): string {
  // t=0 → blue, t=0.5 → white, t=1 → red
  if (t <= 0.5) {
    const u = 1 - t * 2;
    return blueScale(u);
  }
  return redScale((t - 0.5) * 2);
}

function cellColor(
  value: number,
  min: number,
  max: number,
  scale: "blue" | "red" | "diverging",
): string {
  const range = max - min || 1;
  const t = (value - min) / range;
  const clamped = Math.min(1, Math.max(0, t));
  if (scale === "blue")      return blueScale(clamped);
  if (scale === "red")       return redScale(clamped);
  return divergingScale(clamped);
}

/** Pick white or near-black text so it stays readable on any cell colour */
function textColor(
  value: number,
  min: number,
  max: number,
  scale: "blue" | "red" | "diverging",
): string {
  const range = max - min || 1;
  const t = (value - min) / range;
  // Dark background when t > 0.55
  return t > 0.55 ? "#FFFFFF" : "#18181B";
}

// ── Component ──────────────────────────────────────────────────────────────────

export function Heatmap({
  data,
  rowLabels,
  colLabels,
  title,
  description,
  minValue,
  maxValue,
  colorScale = "blue",
  showValues = true,
  formatValue = (v) => v.toFixed(2),
}: HeatmapProps) {
  const rows = data.length;
  const cols = data[0]?.length ?? 0;

  // Derive bounds
  const allValues = data.flat();
  const dataMin = minValue ?? Math.min(...allValues);
  const dataMax = maxValue ?? Math.max(...allValues);

  // Layout
  const labelW   = 64;   // px — left row-label column
  const labelH   = 48;   // px — top col-label row
  const cellSize = 56;   // px — square cell
  const svgW     = labelW + cols * cellSize;
  const svgH     = labelH + rows * cellSize;

  if (rows === 0 || cols === 0) {
    return (
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
        <p class="text-sm text-zinc-500 dark:text-zinc-400">No data available</p>
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
        <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-3">{description}</p>
      )}

      <div class="overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          style={{ width: "100%", height: "auto", minWidth: `${svgW}px` }}
          role="img"
          aria-label={title ?? "Heatmap"}
        >
          {/* ── Column labels ── */}
          {colLabels.map((label, ci) => (
            <text
              key={ci}
              x={labelW + ci * cellSize + cellSize / 2}
              y={labelH - 6}
              text-anchor="middle"
              font-size="11"
              font-weight="500"
              class="fill-zinc-600 dark:fill-zinc-400"
            >
              {label}
            </text>
          ))}

          {/* ── Row labels + cells ── */}
          {data.map((row, ri) => (
            <g key={ri}>
              {/* Row label */}
              <text
                x={labelW - 6}
                y={labelH + ri * cellSize + cellSize / 2 + 4}
                text-anchor="end"
                font-size="11"
                font-weight="500"
                class="fill-zinc-600 dark:fill-zinc-400"
              >
                {rowLabels[ri]}
              </text>

              {/* Cells */}
              {row.map((value, ci) => {
                const x   = labelW + ci * cellSize;
                const y   = labelH + ri * cellSize;
                const bg  = cellColor(value, dataMin, dataMax, colorScale);
                const fg  = textColor(value, dataMin, dataMax, colorScale);

                return (
                  <g key={ci}>
                    <rect
                      x={x}
                      y={y}
                      width={cellSize}
                      height={cellSize}
                      fill={bg}
                      rx="3"
                      ry="3"
                    />
                    {/* Cell border */}
                    <rect
                      x={x + 0.5}
                      y={y + 0.5}
                      width={cellSize - 1}
                      height={cellSize - 1}
                      fill="none"
                      stroke="rgba(0,0,0,0.06)"
                      stroke-width="1"
                      rx="3"
                      ry="3"
                    />
                    {showValues && (
                      <text
                        x={x + cellSize / 2}
                        y={y + cellSize / 2 + 4}
                        text-anchor="middle"
                        font-size="12"
                        font-weight="600"
                        fill={fg}
                      >
                        {formatValue(value)}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      </div>

      {/* Colour-scale legend */}
      <div class="mt-3 flex items-center gap-2">
        <span class="text-xs text-zinc-500 dark:text-zinc-400">
          {formatValue(dataMin)}
        </span>
        <div
          class="flex-1 h-2 rounded"
          style={{
            background:
              colorScale === "diverging"
                ? "linear-gradient(to right, #1E40AF, #ffffff, #B91C1C)"
                : colorScale === "red"
                ? "linear-gradient(to right, #FFF5F5, #B91C1C)"
                : "linear-gradient(to right, #EFF6FF, #1E40AF)",
          }}
        />
        <span class="text-xs text-zinc-500 dark:text-zinc-400">
          {formatValue(dataMax)}
        </span>
      </div>
    </div>
  );
}

// ── Convenience wrappers ───────────────────────────────────────────────────────

/**
 * AgentCorrelationHeatmap
 * Consumes cross_agent_correlations: Record<"TIRA-RCRA" | …, number>
 */
const AGENTS = ["TIRA", "RCRA", "HPRA", "ERRA", "BARA"] as const;

export function AgentCorrelationHeatmap({
  correlations,
  title = "Agent Cross-Correlation Matrix",
}: {
  correlations: Record<string, number>;
  title?: string;
}) {
  // Build 5×5 matrix — diagonal = 1.0 (self-correlation)
  const matrix: number[][] = AGENTS.map((rowAgent) =>
    AGENTS.map((colAgent) => {
      if (rowAgent === colAgent) return 1.0;
      const key1 = `${rowAgent}-${colAgent}`;
      const key2 = `${colAgent}-${rowAgent}`;
      return correlations[key1] ?? correlations[key2] ?? 0;
    }),
  );

  return (
    <Heatmap
      data={matrix}
      rowLabels={[...AGENTS]}
      colLabels={[...AGENTS]}
      title={title}
      description="Pairwise agreement strength between MARAG agents (1.0 = perfect agreement)"
      colorScale="blue"
      minValue={0}
      maxValue={1}
    />
  );
}

/**
 * StatisticalSignificanceHeatmap
 * Consumes accuracy_differences: Record<string, StatisticalTest>
 * Keys are "DatasetA_vs_DatasetB" style.
 */
export function StatisticalSignificanceHeatmap({
  accuracyDifferences,
  title = "Statistical Significance Matrix",
}: {
  accuracyDifferences: Record<string, { p_value: number; significant: boolean; effect_size: number }>;
  title?: string;
}) {
  // Extract dataset names from keys
  const datasetSet = new Set<string>();
  for (const key of Object.keys(accuracyDifferences)) {
    const parts = key.split("_vs_");
    if (parts.length === 2) {
      datasetSet.add(parts[0]);
      datasetSet.add(parts[1]);
    }
  }
  const datasets = Array.from(datasetSet);
  if (datasets.length === 0) return null;

  // Build p-value matrix (0 = not tested / same dataset)
  const matrix: number[][] = datasets.map((row) =>
    datasets.map((col) => {
      if (row === col) return 0;
      const key1 = `${row}_vs_${col}`;
      const key2 = `${col}_vs_${row}`;
      return (
        accuracyDifferences[key1]?.p_value ??
        accuracyDifferences[key2]?.p_value ??
        1
      );
    }),
  );

  return (
    <Heatmap
      data={matrix}
      rowLabels={datasets}
      colLabels={datasets}
      title={title}
      description="P-values from pairwise statistical significance tests. Values < 0.05 indicate significant differences."
      colorScale="red"
      minValue={0}
      maxValue={1}
      formatValue={(v) => (v === 0 ? "—" : v.toFixed(3))}
    />
  );
}
