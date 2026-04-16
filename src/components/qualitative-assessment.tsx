/**
 * QualitativeAssessment — displays a pre-computed QualitativeEvaluation.
 *
 * Layout:
 *  1. Overall grade banner (PASS / PARTIAL / FAIL) with score ring
 *  2. 2-column dimension grid — each card shows score bar, grade, rationale
 *  3. Aggregated recommendations from PARTIAL / FAIL dimensions
 */

import { useState } from "preact/hooks";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  FileText,
  Users,
  Activity,
  Scale,
  GitBranch,
  Search,
  Database,
} from "lucide-react";
import type { EnhancedFraudReport } from "@/types/fraud-report";
import type {
  QualitativeEvaluation,
  QualitativeDimension,
  QualitativeGrade,
} from "@/types/evaluation";

// ── Props ──────────────────────────────────────────────────────────────────────

interface QualitativeAssessmentProps {
  report:     EnhancedFraudReport | null;
  evaluation: QualitativeEvaluation | null;
  compact?:   boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const GRADE_STYLES: Record<QualitativeGrade, {
  bg: string; border: string; text: string; badge: string; icon: typeof CheckCircle;
}> = {
  PASS: {
    bg:     "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-300 dark:border-emerald-700",
    text:   "text-emerald-700 dark:text-emerald-300",
    badge:  "bg-emerald-100 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-200",
    icon:   CheckCircle,
  },
  PARTIAL: {
    bg:     "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-300 dark:border-amber-700",
    text:   "text-amber-700 dark:text-amber-300",
    badge:  "bg-amber-100 dark:bg-amber-800/50 text-amber-700 dark:text-amber-200",
    icon:   AlertTriangle,
  },
  FAIL: {
    bg:     "bg-red-50 dark:bg-red-900/20",
    border: "border-red-300 dark:border-red-700",
    text:   "text-red-700 dark:text-red-300",
    badge:  "bg-red-100 dark:bg-red-800/50 text-red-700 dark:text-red-200",
    icon:   XCircle,
  },
};

const DIM_ICONS: Record<string, typeof CheckCircle> = {
  output_clarity:      FileText,
  actionability:       Activity,
  regulatory_sar:      ShieldCheck,
  regulatory_gdpr:     Scale,
  regulatory_dora:     Scale,
  agent_consensus:     Users,
  pipeline_completion: GitBranch,
  evidence_quality:    Search,
};

// ── Score ring (SVG) ───────────────────────────────────────────────────────────

function ScoreRing({ score, grade }: { score: number; grade: QualitativeGrade }) {
  const r   = 44;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color =
    grade === "PASS" ? "#10B981" : grade === "PARTIAL" ? "#F59E0B" : "#EF4444";

  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      {/* Track */}
      <circle cx="55" cy="55" r={r} fill="none" stroke="#E4E4E7" stroke-width="8" />
      {/* Progress */}
      <circle
        cx="55" cy="55" r={r}
        fill="none"
        stroke={color}
        stroke-width="8"
        stroke-dasharray={`${dash.toFixed(1)} ${(circ - dash).toFixed(1)}`}
        stroke-dashoffset={circ / 4}
        stroke-linecap="round"
      />
      {/* Score text */}
      <text x="55" y="50" text-anchor="middle" font-size="22" font-weight="700" fill={color}>
        {score}
      </text>
      <text x="55" y="68" text-anchor="middle" font-size="11" fill="#71717A">
        / 100
      </text>
    </svg>
  );
}

// ── Dimension card ─────────────────────────────────────────────────────────────

function DimensionCard({ dim }: { dim: QualitativeDimension }) {
  const [expanded, setExpanded] = useState(false);
  const styles   = GRADE_STYLES[dim.grade];
  const Icon     = DIM_ICONS[dim.id] ?? Database;
  const GradeIcon = styles.icon;

  return (
    <div class={`border ${styles.border} ${styles.bg} rounded-lg p-4 transition-colors`}>
      {/* Header */}
      <div class="flex items-start justify-between gap-2 mb-2">
        <div class="flex items-center gap-2">
          <Icon size={16} class={styles.text} />
          <span class={`text-sm font-semibold ${styles.text}`}>{dim.label}</span>
        </div>
        <span class={`flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full ${styles.badge}`}>
          <GradeIcon size={11} />
          {dim.grade}
        </span>
      </div>

      {/* Score bar */}
      <div class="mb-2">
        <div class="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
          <span>Score</span>
          <span class={`font-semibold ${styles.text}`}>{dim.score}/100</span>
        </div>
        <div class="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5">
          <div
            class="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: `${dim.score}%`,
              backgroundColor:
                dim.grade === "PASS" ? "#10B981"
                : dim.grade === "PARTIAL" ? "#F59E0B"
                : "#EF4444",
            }}
          />
        </div>
      </div>

      {/* Rationale (collapsible) */}
      <button
        type="button"
        class="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors w-full text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {expanded ? "Hide details" : "Show details"}
      </button>

      {expanded && (
        <div class="mt-2 space-y-1.5">
          <p class="text-xs text-zinc-600 dark:text-zinc-300">{dim.rationale}</p>
          {dim.evidenceFields.length > 0 && (
            <div class="flex flex-wrap gap-1 mt-1">
              {dim.evidenceFields.map((f) => (
                <span
                  key={f}
                  class="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 text-xs rounded font-mono"
                >
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export function QualitativeAssessment({
  evaluation,
  compact = false,
}: QualitativeAssessmentProps) {
  if (!evaluation) {
    return (
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-8 text-center">
        <ShieldCheck size={40} class="mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
        <p class="text-zinc-500 dark:text-zinc-400 text-sm">
          No qualitative evaluation yet. Run a fraud analysis to generate results.
        </p>
      </div>
    );
  }

  const gradeStyle = GRADE_STYLES[evaluation.overallGrade];
  const GradeIcon  = gradeStyle.icon;

  // Collect recommendations from PARTIAL / FAIL dimensions
  const flaggedRecs = evaluation.dimensions
    .filter((d) => d.grade !== "PASS" && d.recommendations.length > 0)
    .flatMap((d) => d.recommendations.map((r) => ({ label: d.label, rec: r })));

  return (
    <div class="space-y-4">
      {/* ── Overall grade banner ── */}
      <div
        class={`border ${gradeStyle.border} ${gradeStyle.bg} rounded-lg p-5 flex flex-col sm:flex-row items-center gap-4`}
      >
        <ScoreRing score={evaluation.overallScore} grade={evaluation.overallGrade} />

        <div class="flex-1 text-center sm:text-left">
          <div class="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <GradeIcon size={22} class={gradeStyle.text} />
            <span class={`text-2xl font-bold ${gradeStyle.text}`}>
              {evaluation.overallGrade}
            </span>
          </div>
          <p class="text-sm text-zinc-600 dark:text-zinc-300">
            {evaluation.overallGrade === "PASS"
              ? "System outputs meet all qualitative criteria. The report is clear, actionable, and compliant."
              : evaluation.overallGrade === "PARTIAL"
                ? "Some qualitative criteria need attention. Review the flagged dimensions below."
                : "Critical qualitative issues detected. Immediate review of flagged dimensions required."}
          </p>
          <p class="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            Evaluated {evaluation.dimensions.length} dimensions ·{" "}
            {new Date(evaluation.computedAt).toLocaleTimeString()}
          </p>
        </div>

        {/* Dimension summary chips */}
        <div class="flex gap-2 flex-wrap justify-center sm:justify-end">
          {(["PASS", "PARTIAL", "FAIL"] as QualitativeGrade[]).map((g) => {
            const count = evaluation.dimensions.filter((d) => d.grade === g).length;
            if (count === 0) return null;
            const s = GRADE_STYLES[g];
            return (
              <span key={g} class={`px-2 py-1 rounded-full text-xs font-bold ${s.badge}`}>
                {count} {g}
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Dimension grid ── */}
      <div class={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
        {evaluation.dimensions.map((dim) => (
          <DimensionCard key={dim.id} dim={dim} />
        ))}
      </div>

      {/* ── Aggregated recommendations ── */}
      {flaggedRecs.length > 0 && (
        <div class="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1.5">
            <AlertTriangle size={14} />
            Recommended Actions to Improve Score
          </h4>
          <ul class="space-y-1.5">
            {flaggedRecs.map(({ label, rec }, i) => (
              <li key={i} class="flex gap-2 text-xs text-amber-700 dark:text-amber-300">
                <span class="font-semibold shrink-0">[{label}]</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
