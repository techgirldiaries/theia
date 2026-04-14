/**
 * RocCurve — SVG multi-series ROC curve component.
 *
 * Renders one curve per dataset/model with:
 *  - Shaded AUC fill
 *  - Random-classifier diagonal reference line
 *  - Legend with AUC values
 *  - Axis labels (FPR / TPR)
 *
 * When actual roc_curve point arrays are not available, call
 * approximateRocFromAuc() to generate a smooth parametric curve.
 */

import type { RocPoint } from "@/types/benchmarking";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface RocSeries {
  label: string;
  /** Tailwind stroke colour class OR a hex/rgb string */
  color: string;
  auc: number;
  points: RocPoint[];
}

interface RocCurveProps {
  series: RocSeries[];
  title?: string;
  height?: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Generate an approximate ROC curve from a single AUC value using a
 * parametric beta-family curve.  Useful when only summary stats are available.
 */
export function approximateRocFromAuc(auc: number, steps = 60): RocPoint[] {
  // Use a power-law model: TPR = FPR^((1-auc)/auc) won't cover auc=0.5 well.
  // Better: use the "concave" parametric: tpr = 1 - (1-fpr)^k where k = f(auc)
  // For auc=0.5 → k=1 (diagonal).  For auc=0.9 → k≈0.15
  const k = Math.max(0.01, -Math.log(2 * auc - 1 + 1e-9) / Math.log(2));
  const points: RocPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const fpr = i / steps;
    const tpr = 1 - (1 - fpr) ** k;
    points.push({ fpr, tpr });
  }
  return points;
}

// ── Layout constants ───────────────────────────────────────────────────────────

const PAD_LEFT   = 52;
const PAD_BOTTOM = 44;
const PAD_TOP    = 16;
const PAD_RIGHT  = 24;

// ── Component ──────────────────────────────────────────────────────────────────

export function RocCurve({ series, title, height = 320 }: RocCurveProps) {
  const svgW = 520;
  const svgH = height;

  const plotW = svgW - PAD_LEFT - PAD_RIGHT;
  const plotH = svgH - PAD_TOP  - PAD_BOTTOM;

  function toX(fpr: number) { return PAD_LEFT  + fpr  * plotW; }
  function toY(tpr: number) { return PAD_TOP   + (1 - tpr) * plotH; }

  /** Build an SVG path string from RocPoint[] */
  function buildPath(points: RocPoint[]): string {
    return points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.fpr).toFixed(1)} ${toY(p.tpr).toFixed(1)}`)
      .join(" ");
  }

  /** Build a closed area path (for fill) */
  function buildArea(points: RocPoint[]): string {
    const line = buildPath(points);
    // Close to bottom-right → bottom-left
    return `${line} L ${toX(1).toFixed(1)} ${toY(0).toFixed(1)} L ${toX(0).toFixed(1)} ${toY(0).toFixed(1)} Z`;
  }

  // Colour palette for series without explicit hex colours
  const FALLBACK_COLORS = ["#6366F1", "#10B981", "#F97316", "#EF4444", "#A855F7"];

  function resolveColor(color: string, idx: number): string {
    // If it looks like a tailwind class (no # or rgb), fall back
    if (!color.startsWith("#") && !color.startsWith("rgb")) {
      return FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
    }
    return color;
  }

  // Grid lines
  const gridLines = [0, 0.25, 0.5, 0.75, 1.0];

  if (series.length === 0) {
    return (
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
        <p class="text-sm text-zinc-500 dark:text-zinc-400">No ROC data available</p>
      </div>
    );
  }

  return (
    <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 transition-colors">
      {title && (
        <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-3">
          {title}
        </h3>
      )}

      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ width: "100%", height: "auto" }}
        role="img"
        aria-label={title ?? "ROC Curve"}
      >
        {/* ── Grid lines (horizontal) ── */}
        {gridLines.map((v) => (
          <line
            key={`h-${v}`}
            x1={PAD_LEFT}
            y1={toY(v)}
            x2={PAD_LEFT + plotW}
            y2={toY(v)}
            stroke="#E4E4E7"
            stroke-width="1"
            stroke-dasharray={v === 0 || v === 1 ? "none" : "4,3"}
          />
        ))}

        {/* ── Grid lines (vertical) ── */}
        {gridLines.map((v) => (
          <line
            key={`v-${v}`}
            x1={toX(v)}
            y1={PAD_TOP}
            x2={toX(v)}
            y2={PAD_TOP + plotH}
            stroke="#E4E4E7"
            stroke-width="1"
            stroke-dasharray={v === 0 || v === 1 ? "none" : "4,3"}
          />
        ))}

        {/* ── Random-classifier diagonal ── */}
        <line
          x1={toX(0)} y1={toY(0)}
          x2={toX(1)} y2={toY(1)}
          stroke="#A1A1AA"
          stroke-width="1.5"
          stroke-dasharray="6,4"
        />
        <text
          x={toX(0.72)}
          y={toY(0.65)}
          font-size="10"
          fill="#A1A1AA"
          transform={`rotate(-45, ${toX(0.72)}, ${toY(0.65)})`}
        >
          Random
        </text>

        {/* ── ROC series ── */}
        {series.map((s, idx) => {
          const color = resolveColor(s.color, idx);
          const pts   = s.points.length > 1
            ? s.points
            : approximateRocFromAuc(s.auc);

          return (
            <g key={idx}>
              {/* Shaded area */}
              <path
                d={buildArea(pts)}
                fill={color}
                fill-opacity="0.08"
              />
              {/* Curve line */}
              <path
                d={buildPath(pts)}
                fill="none"
                stroke={color}
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </g>
          );
        })}

        {/* ── Y-axis labels ── */}
        {gridLines.map((v) => (
          <text
            key={v}
            x={PAD_LEFT - 8}
            y={toY(v) + 4}
            text-anchor="end"
            font-size="11"
            class="fill-zinc-500 dark:fill-zinc-400"
          >
            {v.toFixed(2)}
          </text>
        ))}

        {/* ── X-axis labels ── */}
        {gridLines.map((v) => (
          <text
            key={v}
            x={toX(v)}
            y={PAD_TOP + plotH + 18}
            text-anchor="middle"
            font-size="11"
            class="fill-zinc-500 dark:fill-zinc-400"
          >
            {v.toFixed(2)}
          </text>
        ))}

        {/* ── Axis titles ── */}
        {/* X: False Positive Rate */}
        <text
          x={PAD_LEFT + plotW / 2}
          y={svgH - 2}
          text-anchor="middle"
          font-size="12"
          font-weight="500"
          class="fill-zinc-600 dark:fill-zinc-300"
        >
          False Positive Rate
        </text>

        {/* Y: True Positive Rate (rotated) */}
        <text
          x={0}
          y={0}
          font-size="12"
          font-weight="500"
          class="fill-zinc-600 dark:fill-zinc-300"
          transform={`translate(14, ${PAD_TOP + plotH / 2}) rotate(-90)`}
          text-anchor="middle"
        >
          True Positive Rate
        </text>

        {/* ── Axes borders ── */}
        <line
          x1={PAD_LEFT} y1={PAD_TOP}
          x2={PAD_LEFT} y2={PAD_TOP + plotH}
          stroke="#71717A"
          stroke-width="1.5"
        />
        <line
          x1={PAD_LEFT} y1={PAD_TOP + plotH}
          x2={PAD_LEFT + plotW} y2={PAD_TOP + plotH}
          stroke="#71717A"
          stroke-width="1.5"
        />
      </svg>

      {/* ── Legend ── */}
      <div class="mt-3 flex flex-wrap gap-3">
        {series.map((s, idx) => {
          const color = resolveColor(s.color, idx);
          return (
            <div key={idx} class="flex items-center gap-1.5">
              <span
                class="inline-block w-8 h-0.5 rounded"
                style={{ backgroundColor: color, height: "3px" }}
              />
              <span class="text-xs text-zinc-700 dark:text-zinc-300">
                {s.label}
                <span class="font-semibold ml-1 text-zinc-900 dark:text-white">
                  (AUC = {s.auc.toFixed(3)})
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Convenience builder ────────────────────────────────────────────────────────

/**
 * Build RocSeries[] from BenchmarkingResults.dataset_comparison.
 * Falls back to approximateRocFromAuc when no roc_curve points are present.
 */
export function buildRocSeriesFromBenchmark(
  performanceMetrics: Record<
    string,
    { auc_roc: number; roc_curve?: RocPoint[] }
  >,
): RocSeries[] {
  const COLORS = ["#6366F1", "#10B981", "#F97316", "#EF4444", "#A855F7"];
  return Object.entries(performanceMetrics).map(([name, metrics], idx) => ({
    label:  name,
    color:  COLORS[idx % COLORS.length],
    auc:    metrics.auc_roc,
    points: metrics.roc_curve?.length
      ? metrics.roc_curve
      : approximateRocFromAuc(metrics.auc_roc),
  }));
}
