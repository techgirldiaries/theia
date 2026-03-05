import {
  Activity,
  AlertTriangle,
  Check,
  CheckCircle,
  Clock,
  Database,
  GitBranch,
  GitMerge,
  Loader2,
  AlertCircle,
  Shield,
  TrendingUp,
  FileText,
  Search,
  Users,
  Brain,
  Scale,
  Building2,
  Filter,
  Eye,
  FileCheck,
  BarChart3,
  Settings,
} from "lucide-react";

export interface PhaseStatus {
  phaseId: string;
  phaseName: string;
  status: "pending" | "in-progress" | "completed" | "failed" | "skipped";
  progress: number;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  results?: any;
  errorMessage?: string;
  confidence?: number;
  riskScore?: number;
  toolsUsed?: string[];
  qualityGate?: {
    passed: boolean;
    score: number;
    threshold: number;
    metrics?: Record<string, number>;
  };
}

export interface CaseProgress {
  caseId: string;
  overallProgress: number;
  currentPhase: string;
  phases: PhaseStatus[];
  parallelGroups?: {
    groupId: string;
    phases: string[];
    status: "pending" | "in-progress" | "completed";
  }[];
}

interface PhasePipelineProps {
  caseProgress: CaseProgress;
  showDetails?: boolean;
  compact?: boolean;
}

const PHASE_DEFINITIONS = [
  {
    id: "phase-0",
    name: "Data Acquisition",
    description: "Data classification and quality validation",
    icon: Database,
    category: "sequential",
    qualityGate: ">90% data completeness",
  },
  {
    id: "phase-1",
    name: "Data Ingestion & Validation",
    description: "Clean and standardize transaction data",
    icon: Activity,
    category: "sequential",
    qualityGate: ">75% quality score",
  },
  {
    id: "phase-2",
    name: "Transaction Monitoring",
    description: "Initial fraud pattern detection",
    icon: TrendingUp,
    category: "sequential",
    qualityGate: "Risk categorization complete",
  },
  {
    id: "phase-3",
    name: "Pattern & Drift Analysis",
    description: "Advanced statistical analysis",
    icon: BarChart3,
    category: "sequential",
    qualityGate: "Statistical baselines established",
  },
  {
    id: "phase-4",
    name: "Intelligence Retrieval",
    description: "Evidence-based fraud investigation",
    icon: Search,
    category: "parallel",
    parallelGroup: "analysis",
    qualityGate: ">70% confidence threshold",
  },
  {
    id: "phase-5",
    name: "Threat Intelligence",
    description: "Open source intelligence gathering",
    icon: AlertTriangle,
    category: "parallel",
    parallelGroup: "analysis",
    qualityGate: "Threat relevance assessed",
  },
  {
    id: "phase-6",
    name: "Entity Graph Analysis",
    description: "Network analysis and relationship mapping",
    icon: GitBranch,
    category: "parallel",
    parallelGroup: "analysis",
    qualityGate: "Network metrics calculated",
  },
  {
    id: "phase-7",
    name: "Behavioral Analysis",
    description: "User behavior pattern analysis",
    icon: Brain,
    category: "convergent",
    qualityGate: "Behavioral risk scored",
  },
  {
    id: "phase-8",
    name: "KYC & Sanctions Screening",
    description: "Compliance and identity verification",
    icon: Shield,
    category: "convergent",
    qualityGate: "Compliance risk assessed",
  },
  {
    id: "phase-9",
    name: "Merchant Verification",
    description: "Business legitimacy verification",
    icon: Building2,
    category: "convergent",
    qualityGate: "Trust score calculated",
  },
  {
    id: "phase-10",
    name: "Risk Classification",
    description: "Aggregate risk signals",
    icon: Filter,
    category: "decision",
    qualityGate: "Final risk score generated",
  },
  {
    id: "phase-11",
    name: "Evidence Verification",
    description: "Validate findings with sources",
    icon: Eye,
    category: "decision",
    qualityGate: "Evidence verified",
  },
  {
    id: "phase-12",
    name: "Compliance Documentation",
    description: "Generate regulatory reports",
    icon: FileText,
    category: "decision",
    qualityGate: "Human approval required",
  },
  {
    id: "phase-13",
    name: "Performance Monitoring",
    description: "System health and governance",
    icon: Activity,
    category: "decision",
    qualityGate: "Metrics tracked",
  },
  {
    id: "phase-14",
    name: "Case Management",
    description: "Executive oversight and lifecycle",
    icon: Users,
    category: "decision",
    qualityGate: "Case status updated",
  },
  {
    id: "phase-15",
    name: "Final Oversight",
    description: "Quality assurance and validation",
    icon: FileCheck,
    category: "decision",
    qualityGate: "Quality check passed",
  },
];

const getStatusColor = (status: PhaseStatus["status"]) => {
  switch (status) {
    case "completed":
      return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950";
    case "in-progress":
      return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950";
    case "failed":
      return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950";
    case "skipped":
      return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950";
    default:
      return "text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-900";
  }
};

const getStatusIcon = (status: PhaseStatus["status"]) => {
  switch (status) {
    case "completed":
      return CheckCircle;
    case "in-progress":
      return Loader2;
    case "failed":
      return AlertCircle;
    case "skipped":
      return Clock;
    default:
      return Clock;
  }
};

function PhaseCard({
  phase,
  definition,
  showDetails,
  compact,
}: {
  phase: PhaseStatus;
  definition: any;
  showDetails?: boolean;
  compact?: boolean;
}) {
  const StatusIcon = getStatusIcon(phase.status);
  const PhaseIcon = definition.icon;
  const statusColor = getStatusColor(phase.status);

  return (
    <div
      className={`border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 transition-all hover:shadow-md ${compact ? "p-3" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${statusColor}`}>
            <PhaseIcon size={compact ? 16 : 20} />
          </div>
          <div>
            <h4
              className={`font-semibold text-zinc-900 dark:text-white ${compact ? "text-sm" : ""}`}
            >
              {definition.name}
            </h4>
            <p
              className={`text-zinc-600 dark:text-zinc-400 ${compact ? "text-xs" : "text-sm"}`}
            >
              {definition.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {phase.status === "in-progress" && (
            <Loader2 size={16} className="animate-spin text-blue-500" />
          )}
          <StatusIcon
            size={16}
            className={
              phase.status === "in-progress"
                ? "hidden"
                : getStatusColor(phase.status)
            }
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            phase.status === "completed"
              ? "bg-green-500"
              : phase.status === "in-progress"
                ? "bg-blue-500"
                : phase.status === "failed"
                  ? "bg-red-500"
                  : "bg-zinc-300"
          }`}
          style={{ width: `${phase.progress}%` }}
        />
      </div>

      {/* Details */}
      {showDetails && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">Progress:</span>
            <span className="font-medium">{phase.progress}%</span>
          </div>

          {phase.duration && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">
                Duration:
              </span>
              <span className="font-medium">
                {(phase.duration / 1000).toFixed(1)}s
              </span>
            </div>
          )}

          {phase.confidence && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">
                Confidence:
              </span>
              <span className="font-medium">{phase.confidence}%</span>
            </div>
          )}

          {phase.riskScore !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">
                Risk Score:
              </span>
              <span
                className={`font-medium ${phase.riskScore > 70 ? "text-red-600" : phase.riskScore > 40 ? "text-yellow-600" : "text-green-600"}`}
              >
                {phase.riskScore}/100
              </span>
            </div>
          )}

          {phase.qualityGate && (
            <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Quality Gate:
                </span>
                <span
                  className={`font-medium ${phase.qualityGate.passed ? "text-green-600" : "text-red-600"}`}
                >
                  {phase.qualityGate.passed ? "PASSED" : "FAILED"}
                </span>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                Score: {phase.qualityGate.score}/{phase.qualityGate.threshold}
              </div>
            </div>
          )}

          {phase.toolsUsed && phase.toolsUsed.length > 0 && (
            <div className="text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">
                Tools Used:
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {phase.toolsUsed.map((tool) => (
                  <span
                    key={tool}
                    className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded text-xs"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {phase.errorMessage && (
            <div className="p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-sm">
              <div className="text-red-600 dark:text-red-400 font-medium mb-1">
                Error:
              </div>
              <div className="text-red-700 dark:text-red-300">
                {phase.errorMessage}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ParallelGroupIndicator({
  group,
  phases,
}: {
  group: any;
  phases: PhaseStatus[];
}) {
  const groupPhases = phases.filter((p) => group.phases.includes(p.phaseId));
  const completedCount = groupPhases.filter(
    (p) => p.status === "completed",
  ).length;
  const inProgressCount = groupPhases.filter(
    (p) => p.status === "in-progress",
  ).length;

  return (
    <div className="flex items-center justify-center py-4">
      <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
        <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
          <GitBranch size={16} />
          <span className="font-medium text-sm">Parallel Processing</span>
          <div className="text-xs bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">
            {completedCount}/{groupPhases.length} complete
            {inProgressCount > 0 && ` • ${inProgressCount} running`}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConvergenceIndicator() {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
        <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
          <GitMerge size={16} />
          <span className="font-medium text-sm">Convergent Analysis</span>
        </div>
      </div>
    </div>
  );
}

export function PhasePipeline({
  caseProgress,
  showDetails = false,
  compact = false,
}: PhasePipelineProps) {
  const phaseMap = new Map(caseProgress.phases.map((p) => [p.phaseId, p]));

  // Group phases by category for proper layout
  const sequentialPhases = PHASE_DEFINITIONS.filter(
    (d) => d.category === "sequential",
  );
  const parallelPhases = PHASE_DEFINITIONS.filter(
    (d) => d.category === "parallel",
  );
  const convergentPhases = PHASE_DEFINITIONS.filter(
    (d) => d.category === "convergent",
  );
  const decisionPhases = PHASE_DEFINITIONS.filter(
    (d) => d.category === "decision",
  );

  const completedPhases = caseProgress.phases.filter(
    (p) => p.status === "completed",
  ).length;
  const totalPhases = PHASE_DEFINITIONS.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Multi-Agent Detection Pipeline
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Case ID: {caseProgress.caseId} • Current Phase:{" "}
              {caseProgress.currentPhase}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {Math.round(caseProgress.overallProgress)}%
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {completedPhases}/{totalPhases} phases complete
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-3 mt-4">
          <div
            className="h-3 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${caseProgress.overallProgress}%` }}
          />
        </div>
      </div>

      {/* Sequential Phases (0-3) */}
      <div className="space-y-4">
        <h4 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
          <Database size={16} />
          Sequential Processing
        </h4>
        <div
          className={`grid gap-4 ${compact ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2"}`}
        >
          {sequentialPhases.map((def) => {
            const phase = phaseMap.get(def.id);
            return phase ? (
              <PhaseCard
                key={def.id}
                phase={phase}
                definition={def}
                showDetails={showDetails}
                compact={compact}
              />
            ) : null;
          })}
        </div>
      </div>

      {/* Parallel Phases (4-6) */}
      <div className="space-y-4">
        <h4 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
          <GitBranch size={16} />
          Parallel Processing
        </h4>
        <ParallelGroupIndicator
          group={{ phases: ["phase-4", "phase-5", "phase-6"] }}
          phases={caseProgress.phases}
        />
        <div
          className={`grid gap-4 ${compact ? "grid-cols-3" : "grid-cols-1 md:grid-cols-3"}`}
        >
          {parallelPhases.map((def) => {
            const phase = phaseMap.get(def.id);
            return phase ? (
              <PhaseCard
                key={def.id}
                phase={phase}
                definition={def}
                showDetails={showDetails}
                compact={compact}
              />
            ) : null;
          })}
        </div>
      </div>

      {/* Convergent Phases (7-9) */}
      <div className="space-y-4">
        <h4 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
          <GitMerge size={16} />
          Convergent Analysis
        </h4>
        <ConvergenceIndicator />
        <div
          className={`grid gap-4 ${compact ? "grid-cols-3" : "grid-cols-1 md:grid-cols-3"}`}
        >
          {convergentPhases.map((def) => {
            const phase = phaseMap.get(def.id);
            return phase ? (
              <PhaseCard
                key={def.id}
                phase={phase}
                definition={def}
                showDetails={showDetails}
                compact={compact}
              />
            ) : null;
          })}
        </div>
      </div>

      {/* Decision Pipeline (10-15) */}
      <div className="space-y-4">
        <h4 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
          <Settings size={16} />
          Decision Pipeline
        </h4>
        <div
          className={`grid gap-4 ${compact ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}
        >
          {decisionPhases.map((def) => {
            const phase = phaseMap.get(def.id);
            return phase ? (
              <PhaseCard
                key={def.id}
                phase={phase}
                definition={def}
                showDetails={showDetails}
                compact={compact}
              />
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
}
