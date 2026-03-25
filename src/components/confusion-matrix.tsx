/**
 * ConfusionMatrix — SVG confusion matrix component.
 *
 * Renders a 2×2 grid (TP / FP / FN / TN) with:
 *  - Colour-coded cells (TP/TN = green tones, FP = amber, FN = red)
 *  - Absolute counts + percentage of total
 *  - Derived classification metrics (Precision, Recall, F1, Accuracy)
 *  - Optional dataset label
 */

import type { ConfusionMatrixValues } from "@/types/benchmarking";

// ── Types ──────────────────────────────────────────────────────────────────────

interface ConfusionMatrixProps {
  data: ConfusionMatrixValues;
  title?: string;
  /** Label for the positive class, default "Fraud" */
  positiveLabel?: string;
  /** Label for the negative class, default "Legit" */
  negativeLabel?: string;
  /** Show derived metric strip below the matrix */
  showMetrics?: boolean;
}

// ── Derived metrics ────────────────────────────────────────────────────────────

function deriveMetrics(d: ConfusionMatrixValues) {
  const total     = d.tp + d.fp + d.fn + d.tn;
  const precision = d.tp / (d.tp + d.fp  || 1);
  const recall    = d.tp / (d.tp + d.fn  || 1);
  const f1        = (2 * precision * recall) / (precision + recall || 1);
  const accuracy  = (d.tp + d.tn) / (total || 1);
  return { precision, recall, f1, accuracy, total };
}

// ── Cell colours ───────────────────────────────────────────────────────────────
// TP: green, TN: teal-green, FP: amber, FN: red

const CELL_STYLES = {
  tp: { bg: "#D1FAE5", border: "#6EE7B7", label: "TP",  text: "#065F46", name: "True Positive"  },
  fp: { bg: "#FEF3C7", border: "#FCD34D", label: "FP",  text: "#92400E", name: "False Positive" },
  fn: { bg: "#FEE2E2", border: "#FCA5A5", label: "FN",  text: "#991B1B", name: "False Negative" },
  tn: { bg: "#D1FAE5", border: "#6EE7B7", label: "TN",  text: "#065F46", name: "True Negative"  },
} as const;

// ── SVG layout ─────────────────────────────────────────────────────────────────

const CELL_W     = 130;
const CELL_H     = 100;
const HEADER_W   = 60;   // Predicted label column
const HEADER_H   = 44;   // Actual label row
const SVG_W      = HEADER_W + CELL_W * 2 + 2;
const SVG_H      = HEADER_H + CELL_H * 2 + 2;

// ── Component ──────────────────────────────────────────────────────────────────

export function ConfusionMatrix({
  data,
  title,
  positiveLabel = "Fraud",
  negativeLabel = "Legit",
  showMetrics   = true,
}: ConfusionMatrixProps) {
  const { precision, recall, f1, accuracy, total } = deriveMetrics(data);

  function pct(n: number) { return total > 0 ? ((n / total) * 100).toFixed(1) : "0.0"; }

  // Grid: rows = Actual (Fraud, Legit), cols = Predicted (Fraud, Legit)
  const cells: Array<{
    key:   keyof typeof CELL_STYLES;
    value: number;
    row:   number;
    col:   number;
  }> = [
    { key: "tp", value: data.tp, row: 0, col: 0 },
    { key: "fp", value: data.fp, row: 0, col: 1 },
    { key: "fn", value: data.fn, row: 1, col: 0 },
    { key: "tn", value: data.tn, row: 1, col: 1 },
  ];

  return (
    <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 transition-colors">
      {title && (
        <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-3">
          {title}
        </h3>
      )}

      <div class="overflow-x-auto">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ width: "100%", maxWidth: `${SVG_W}px`, height: "auto" }}
          role="img"
          aria-label={title ?? "Confusion Matrix"}
        >
          {/* ── Header: "Predicted →" ── */}
          <text
            x={HEADER_W + CELL_W}
            y={16}
            text-anchor="middle"
            font-size="12"
            font-weight="600"
            class="fill-zinc-700 dark:fill-zinc-300"
          >
            Predicted
          </text>

          {/* Predicted class labels */}
          {[positiveLabel, negativeLabel].map((lbl, i) => (
            <text
              key={i}
              x={HEADER_W + i * CELL_W + CELL_W / 2}
              y={HEADER_H - 6}
              text-anchor="middle"
              font-size="12"
              font-weight="500"
              class="fill-zinc-600 dark:fill-zinc-400"
            >
              {lbl}
            </text>
          ))}

          {/* ── Header: "Actual ↓" ── */}
          <text
            x={22}
            y={HEADER_H + CELL_H}
            text-anchor="middle"
            font-size="12"
            font-weight="600"
            class="fill-zinc-700 dark:fill-zinc-300"
            transform={`rotate(-90, 22, ${HEADER_H + CELL_H})`}
          >
            Actual
          </text>

          {/* Actual class labels */}
          {[positiveLabel, negativeLabel].map((lbl, i) => (
            <text
              key={i}
              x={HEADER_W - 6}
              y={HEADER_H + i * CELL_H + CELL_H / 2 + 4}
              text-anchor="end"
              font-size="12"
              font-weight="500"
              class="fill-zinc-600 dark:fill-zinc-400"
            >
              {lbl}
            </text>
          ))}

          {/* ── Cells ── */}
          {cells.map(({ key, value, row, col }) => {
            const style = CELL_STYLES[key];
            const cx    = HEADER_W + col * CELL_W;
            const cy    = HEADER_H + row * CELL_H;

            return (
              <g key={key}>
                {/* Cell background */}
                <rect
                  x={cx + 1}
                  y={cy + 1}
                  width={CELL_W - 2}
                  height={CELL_H - 2}
                  fill={style.bg}
                  rx="4"
                  ry="4"
                />
                {/* Cell border */}
                <rect
                  x={cx + 1}
                  y={cy + 1}
                  width={CELL_W - 2}
                  height={CELL_H - 2}
                  fill="none"
                  stroke={style.border}
                  stroke-width="1.5"
                  rx="4"
                  ry="4"
                />

                {/* Label badge (TP / FP / FN / TN) */}
                <rect
                  x={cx + 6}
                  y={cy + 6}
                  width={28}
                  height={18}
                  fill={style.border}
                  rx="3"
                  ry="3"
                />
                <text
                  x={cx + 20}
                  y={cy + 19}
                  text-anchor="middle"
                  font-size="11"
                  font-weight="700"
                  fill={style.text}
                >
                  {style.label}
                </text>

                {/* Count */}
                <text
                  x={cx + CELL_W / 2}
                  y={cy + CELL_H / 2 + 6}
                  text-anchor="middle"
                  font-size="26"
                  font-weight="700"
                  fill={style.text}
                >
                  {value.toLocaleString()}
                </text>

                {/* Percentage */}
                <text
                  x={cx + CELL_W / 2}
                  y={cy + CELL_H - 10}
                  text-anchor="middle"
                  font-size="11"
                  fill={style.text}
                  fill-opacity="0.75"
                >
                  {pct(value)}%
                </text>
              </g>
            );
          })}

          {/* Outer border */}
          <rect
            x={HEADER_W}
            y={HEADER_H}
            width={CELL_W * 2}
            height={CELL_H * 2}
            fill="none"
            stroke="#D4D4D8"
            stroke-width="1"
            rx="4"
            ry="4"
          />
        </svg>
      </div>

      {/* ── Derived metrics strip ── */}
      {showMetrics && (
        <div class="mt-4 grid grid-cols-4 gap-2">
          {[
            { label: "Precision", value: precision, color: "text-indigo-600 dark:text-indigo-400" },
            { label: "Recall",    value: recall,    color: "text-emerald-600 dark:text-emerald-400" },
            { label: "F1 Score",  value: f1,        color: "text-amber-600 dark:text-amber-400" },
            { label: "Accuracy",  value: accuracy,  color: "text-blue-600 dark:text-blue-400" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              class="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded p-2 text-center"
            >
              <div class={`text-xl font-bold ${color}`}>
                {(value * 100).toFixed(1)}%
              </div>
              <div class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Total samples */}
      <p class="text-xs text-zinc-400 dark:text-zinc-500 mt-2 text-right">
        n = {total.toLocaleString()} samples
      </p>
    </div>
  );
}

// ── Convenience builder ────────────────────────────────────────────────────────

/**
 * Build a ConfusionMatrixValues from overall counts when backend provides
 * precision, recall, and total positives/negatives instead of raw cells.
 *
 * Requires:  total transactions, fraud_rate (0-1), precision, recall.
 */
export function estimateConfusionMatrix(
  total: number,
  fraudRate: number,
  precision: number,
  recall: number,
): ConfusionMatrixValues {
  const actualPositives = Math.round(total * fraudRate);
  const actualNegatives = total - actualPositives;

  const tp = Math.round(actualPositives * recall);
  const fn = actualPositives - tp;
  const fp = Math.round(tp / (precision || 1) - tp);
  const tn = actualNegatives - fp;

  return { tp, fp, fn, tn: Math.max(0, tn) };
}
