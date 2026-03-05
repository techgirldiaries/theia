import { useState, useEffect } from "preact/hooks";
import { signal, computed } from "@preact/signals";
import {
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  SkipForward,
  Clock,
  Zap,
  CheckCircle,
  XCircle,
  Info,
  Settings,
  Code,
  ExternalLink,
  ArrowRight,
  RotateCcw,
  Play,
  Pause,
  Activity,
  Wrench,
  MessageCircle,
  FileText,
} from "lucide-react";

export interface PhaseError {
  id: string;
  phaseId: string;
  phaseName: string;
  timestamp: Date;
  errorType:
    | "tool_failure"
    | "data_quality"
    | "timeout"
    | "network"
    | "validation"
    | "critical";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  details?: string;
  stackTrace?: string;
  context: {
    inputData?: any;
    expectedOutput?: string;
    actualResult?: any;
    toolUsed?: string;
    confidence?: number;
  };
  recoveryOptions: RecoveryOption[];
  status: "active" | "recovering" | "resolved" | "ignored";
}

export interface RecoveryOption {
  id: string;
  type: "retry" | "fallback" | "skip" | "manual" | "alternative";
  name: string;
  description: string;
  confidence: number;
  estimatedTime: number; // in seconds
  requirements?: string[];
  isRecommended?: boolean;
  risks?: string[];
  fallbackTool?: string;
}

export interface RecoveryStrategy {
  id: string;
  name: string;
  description: string;
  conditions: {
    errorTypes: PhaseError["errorType"][];
    phases?: string[];
    severity?: PhaseError["severity"][];
  };
  actions: RecoveryOption[];
  isActivated: boolean;
  priority: number;
}

// Signals for error recovery
export const phaseErrors = signal<PhaseError[]>([]);
export const recoveryStrategies = signal<RecoveryStrategy[]>([
  {
    id: "tool-failure-strategy",
    name: "Tool Failure Recovery",
    description: "Automatic fallback for tool failures",
    conditions: {
      errorTypes: ["tool_failure"],
      severity: ["medium", "high"],
    },
    actions: [
      {
        id: "python-fallback",
        type: "fallback",
        name: "Use Python Alternative",
        description:
          "Switch to Python-based analysis when specialized tool fails",
        confidence: 75,
        estimatedTime: 30,
        fallbackTool: "Python Analysis Engine",
        isRecommended: true,
      },
      {
        id: "simplified-analysis",
        type: "alternative",
        name: "Simplified Analysis",
        description:
          "Use basic statistical methods instead of advanced algorithms",
        confidence: 60,
        estimatedTime: 15,
        risks: ["Lower detection accuracy"],
      },
    ],
    isActivated: true,
    priority: 1,
  },
  {
    id: "data-quality-strategy",
    name: "Data Quality Recovery",
    description: "Handle poor data quality issues",
    conditions: {
      errorTypes: ["data_quality", "validation"],
    },
    actions: [
      {
        id: "data-repair",
        type: "retry",
        name: "Automated Data Repair",
        description: "Apply data cleaning and imputation techniques",
        confidence: 80,
        estimatedTime: 45,
        requirements: [">50% data available"],
        isRecommended: true,
      },
      {
        id: "manual-review",
        type: "manual",
        name: "Manual Data Review",
        description: "Escalate to human analyst for data validation",
        confidence: 95,
        estimatedTime: 300,
        requirements: ["Human analyst available"],
      },
    ],
    isActivated: true,
    priority: 2,
  },
]);

const getErrorTypeIcon = (type: PhaseError["errorType"]) => {
  switch (type) {
    case "tool_failure":
      return Wrench;
    case "data_quality":
      return FileText;
    case "timeout":
      return Clock;
    case "network":
      return Activity;
    case "validation":
      return CheckCircle;
    case "critical":
      return AlertTriangle;
    default:
      return AlertCircle;
  }
};

const getErrorTypeColor = (
  type: PhaseError["errorType"],
  severity: PhaseError["severity"],
) => {
  const baseColors = {
    tool_failure: "orange",
    data_quality: "blue",
    timeout: "purple",
    network: "red",
    validation: "yellow",
    critical: "red",
  };

  const color = baseColors[type];
  const intensityMap = {
    low: "300",
    medium: "500",
    high: "600",
    critical: "700",
  };

  const intensity = intensityMap[severity];
  return `text-${color}-${intensity} bg-${color}-50 dark:bg-${color}-950 border-${color}-200 dark:border-${color}-800`;
};

const getRecoveryTypeIcon = (type: RecoveryOption["type"]) => {
  switch (type) {
    case "retry":
      return RefreshCw;
    case "fallback":
      return ArrowRight;
    case "skip":
      return SkipForward;
    case "manual":
      return MessageCircle;
    case "alternative":
      return Zap;
    default:
      return Play;
  }
};

function ErrorCard({
  error,
  onRecover,
  onIgnore,
  onViewDetails,
}: {
  error: PhaseError;
  onRecover: (errorId: string, recoveryOptionId: string) => void;
  onIgnore: (errorId: string) => void;
  onViewDetails: (errorId: string) => void;
}) {
  const [selectedRecovery, setSelectedRecovery] = useState<string>(
    error.recoveryOptions.find((o) => o.isRecommended)?.id ||
      error.recoveryOptions[0]?.id,
  );
  const [showDetails, setShowDetails] = useState(false);

  const ErrorIcon = getErrorTypeIcon(error.errorType);
  const selectedOption = error.recoveryOptions.find(
    (o) => o.id === selectedRecovery,
  );

  const timeSinceError = Math.floor(
    (Date.now() - error.timestamp.getTime()) / (1000 * 60),
  );

  return (
    <div
      className={`border rounded-lg p-4 transition-all ${getErrorTypeColor(error.errorType, error.severity)}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-white dark:bg-zinc-800 shadow-sm">
            <ErrorIcon
              size={20}
              className={`text-${error.severity === "critical" ? "red" : "orange"}-600`}
            />
          </div>
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-white mb-1">
              {error.phaseName} -{" "}
              {error.errorType.replace("_", " ").toUpperCase()}
            </h4>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-1">
              {error.message}
            </p>
            <div className="flex items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
              <span>Phase: {error.phaseId}</span>
              <span>Severity: {error.severity}</span>
              <span>{timeSinceError}m ago</span>
              {error.context.toolUsed && (
                <span>Tool: {error.context.toolUsed}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              error.status === "active"
                ? "bg-red-100 text-red-700"
                : error.status === "recovering"
                  ? "bg-yellow-100 text-yellow-700"
                  : error.status === "resolved"
                    ? "bg-green-100 text-green-700"
                    : "bg-zinc-100 text-zinc-700"
            }`}
          >
            {error.status.toUpperCase()}
          </span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-1.5 rounded hover:bg-white dark:hover:bg-zinc-800 transition-colors"
            title="Toggle details"
          >
            <Info size={14} />
          </button>
        </div>
      </div>

      {/* Recovery Options */}
      {error.status === "active" && (
        <div className="mb-4">
          <h5 className="font-medium text-zinc-900 dark:text-white mb-2 text-sm">
            Recovery Options:
          </h5>
          <div className="space-y-2">
            {error.recoveryOptions.map((option) => {
              const RecoveryIcon = getRecoveryTypeIcon(option.type);
              return (
                <div
                  key={option.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedRecovery === option.id
                      ? "bg-white dark:bg-zinc-800 border-indigo-300 dark:border-indigo-600 shadow-sm"
                      : "bg-white/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800"
                  }`}
                  onClick={() => setSelectedRecovery(option.id)}
                >
                  <div className="flex items-center gap-3">
                    <RecoveryIcon
                      size={16}
                      className={
                        selectedRecovery === option.id
                          ? "text-indigo-600"
                          : "text-zinc-500"
                      }
                    />
                    <div>
                      <div
                        className={`font-medium text-sm ${selectedRecovery === option.id ? "text-indigo-900 dark:text-indigo-100" : "text-zinc-900 dark:text-white"}`}
                      >
                        {option.name}
                        {option.isRecommended && (
                          <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">
                        {option.description}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                        <span>Confidence: {option.confidence}%</span>
                        <span>
                          ETA: {Math.floor(option.estimatedTime / 60)}m{" "}
                          {option.estimatedTime % 60}s
                        </span>
                        {option.fallbackTool && (
                          <span>Tool: {option.fallbackTool}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${selectedRecovery === option.id ? "bg-indigo-600" : "bg-zinc-300"}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {error.status === "active" && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedOption && (
              <button
                onClick={() => onRecover(error.id, selectedRecovery)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <Play size={14} />
                Apply {selectedOption.name}
              </button>
            )}
            <button
              onClick={() => onIgnore(error.id)}
              className="px-3 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              Ignore
            </button>
          </div>
          <button
            onClick={() => onViewDetails(error.id)}
            className="flex items-center gap-1 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            <Code size={14} />
            View Details
          </button>
        </div>
      )}

      {/* Detailed Information */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {error.details && (
              <div>
                <h6 className="font-medium text-zinc-900 dark:text-white mb-2">
                  Error Details:
                </h6>
                <div className="bg-white dark:bg-zinc-800 rounded p-3 text-zinc-700 dark:text-zinc-300">
                  {error.details}
                </div>
              </div>
            )}

            {error.context.inputData && (
              <div>
                <h6 className="font-medium text-zinc-900 dark:text-white mb-2">
                  Input Data:
                </h6>
                <div className="bg-white dark:bg-zinc-800 rounded p-3 text-zinc-700 dark:text-zinc-300 font-mono text-xs">
                  {JSON.stringify(error.context.inputData, null, 2)}
                </div>
              </div>
            )}

            {error.context.expectedOutput && (
              <div>
                <h6 className="font-medium text-zinc-900 dark:text-white mb-2">
                  Expected Output:
                </h6>
                <div className="bg-white dark:bg-zinc-800 rounded p-3 text-zinc-700 dark:text-zinc-300">
                  {error.context.expectedOutput}
                </div>
              </div>
            )}

            {selectedOption?.risks && selectedOption.risks.length > 0 && (
              <div>
                <h6 className="font-medium text-zinc-900 dark:text-white mb-2">
                  Recovery Risks:
                </h6>
                <ul className="space-y-1">
                  {selectedOption.risks.map((risk, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-amber-700 dark:text-amber-300"
                    >
                      <AlertTriangle size={12} />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {error.stackTrace && (
            <div className="mt-4">
              <h6 className="font-medium text-zinc-900 dark:text-white mb-2">
                Stack Trace:
              </h6>
              <div className="bg-zinc-900 dark:bg-zinc-950 rounded p-3 text-zinc-300 dark:text-zinc-400 font-mono text-xs overflow-x-auto">
                <pre>{error.stackTrace}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RecoveryStrategyPanel({
  strategies,
  onToggle,
}: {
  strategies: RecoveryStrategy[];
  onToggle: (strategyId: string) => void;
}) {
  return (
    <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
      <h4 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
        <Settings size={16} />
        Recovery Strategies
      </h4>
      <div className="space-y-3">
        {strategies.map((strategy) => (
          <div
            key={strategy.id}
            className={`p-3 rounded-lg border transition-all ${
              strategy.isActivated
                ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-zinc-900 dark:text-white">
                {strategy.name}
              </h5>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={strategy.isActivated}
                  onChange={() => onToggle(strategy.id)}
                  className="rounded"
                />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {strategy.isActivated ? "Active" : "Inactive"}
                </span>
              </label>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              {strategy.description}
            </p>
            <div className="text-xs text-zinc-500 dark:text-zinc-500">
              Handles: {strategy.conditions.errorTypes.join(", ")} errors
              {strategy.conditions.severity && (
                <span>
                  {" "}
                  • Severity: {strategy.conditions.severity.join(", ")}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AdvancedErrorRecoveryProps {
  showStrategies?: boolean;
  compact?: boolean;
}

export function AdvancedErrorRecovery({
  showStrategies = true,
  compact = false,
}: AdvancedErrorRecoveryProps) {
  const errors = phaseErrors.value;
  const strategies = recoveryStrategies.value;
  const [filter, setFilter] = useState<PhaseError["status"] | "all">("all");

  // Initialize with sample errors for demonstration
  useEffect(() => {
    if (errors.length === 0) {
      const sampleErrors: PhaseError[] = [
        {
          id: "error-001",
          phaseId: "phase-4",
          phaseName: "Intelligence Retrieval",
          timestamp: new Date(Date.now() - 300000),
          errorType: "tool_failure",
          severity: "high",
          message:
            "Advanced Knowledge Search tool failed to connect to external API",
          details:
            "Connection timeout after 30 seconds. External knowledge base unavailable.",
          context: {
            toolUsed: "Advanced Knowledge Search",
            confidence: 0,
            expectedOutput: "Fraud pattern analysis from knowledge base",
          },
          recoveryOptions: [
            {
              id: "fallback-python",
              type: "fallback",
              name: "Use Python Analysis",
              description: "Switch to local pattern analysis using Python",
              confidence: 75,
              estimatedTime: 45,
              isRecommended: true,
              fallbackTool: "Python Pattern Analyzer",
            },
            {
              id: "retry-api",
              type: "retry",
              name: "Retry API Connection",
              description: "Attempt to reconnect to external knowledge base",
              confidence: 60,
              estimatedTime: 30,
              risks: ["May fail again if network issue persists"],
            },
            {
              id: "skip-phase",
              type: "skip",
              name: "Skip Intelligence Retrieval",
              description: "Continue without external knowledge search",
              confidence: 40,
              estimatedTime: 0,
              risks: [
                "Reduced fraud detection accuracy",
                "Missing threat intelligence",
              ],
            },
          ],
          status: "active",
        },
        {
          id: "error-002",
          phaseId: "phase-1",
          phaseName: "Data Ingestion & Validation",
          timestamp: new Date(Date.now() - 600000),
          errorType: "data_quality",
          severity: "medium",
          message:
            "Dataset contains 35% missing values, below quality threshold",
          details:
            "Transaction amount field missing in 847 out of 2,420 records",
          context: {
            inputData: {
              totalRecords: 2420,
              missingValues: 847,
              completeness: 65,
            },
            expectedOutput: "Clean dataset with >75% completeness",
            confidence: 65,
          },
          recoveryOptions: [
            {
              id: "data-imputation",
              type: "retry",
              name: "Data Imputation",
              description:
                "Apply median imputation for missing transaction amounts",
              confidence: 80,
              estimatedTime: 60,
              isRecommended: true,
              requirements: ["At least 50% data available"],
            },
            {
              id: "manual-review",
              type: "manual",
              name: "Manual Data Review",
              description: "Escalate to data analyst for manual validation",
              confidence: 95,
              estimatedTime: 1200,
              requirements: ["Data analyst available"],
            },
          ],
          status: "resolved",
        },
      ];

      phaseErrors.value = sampleErrors;
    }
  }, []);

  const handleRecover = (errorId: string, recoveryOptionId: string) => {
    const updatedErrors = errors.map((error) => {
      if (error.id === errorId) {
        return { ...error, status: "recovering" as const };
      }
      return error;
    });
    phaseErrors.value = updatedErrors;

    // Simulate recovery process
    setTimeout(() => {
      const finalErrors = phaseErrors.value.map((error) => {
        if (error.id === errorId) {
          return { ...error, status: "resolved" as const };
        }
        return error;
      });
      phaseErrors.value = finalErrors;
    }, 3000);
  };

  const handleIgnore = (errorId: string) => {
    const updatedErrors = errors.map((error) => {
      if (error.id === errorId) {
        return { ...error, status: "ignored" as const };
      }
      return error;
    });
    phaseErrors.value = updatedErrors;
  };

  const handleViewDetails = (errorId: string) => {
    console.log("Viewing error details:", errorId);
  };

  const handleToggleStrategy = (strategyId: string) => {
    const updatedStrategies = strategies.map((strategy) => {
      if (strategy.id === strategyId) {
        return { ...strategy, isActivated: !strategy.isActivated };
      }
      return strategy;
    });
    recoveryStrategies.value = updatedStrategies;
  };

  const filteredErrors = errors.filter(
    (error) => filter === "all" || error.status === filter,
  );

  const stats = {
    total: errors.length,
    active: errors.filter((e) => e.status === "active").length,
    recovering: errors.filter((e) => e.status === "recovering").length,
    resolved: errors.filter((e) => e.status === "resolved").length,
    critical: errors.filter((e) => e.severity === "critical").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3
              className={`font-bold text-zinc-900 dark:text-white ${compact ? "text-lg" : "text-xl"}`}
            >
              Advanced Error Recovery
            </h3>
            <p
              className={`text-zinc-600 dark:text-zinc-400 ${compact ? "text-sm" : ""}`}
            >
              Intelligent error handling and recovery strategies
            </p>
          </div>
          <div
            className={`grid gap-4 ${compact ? "grid-cols-2 lg:grid-cols-5" : "grid-cols-2 md:grid-cols-5"} text-center`}
          >
            <div>
              <div
                className={`font-bold text-zinc-600 dark:text-zinc-400 ${compact ? "text-lg" : "text-2xl"}`}
              >
                {stats.total}
              </div>
              <div
                className={`text-zinc-500 dark:text-zinc-500 ${compact ? "text-xs" : "text-sm"}`}
              >
                Total Errors
              </div>
            </div>
            <div>
              <div
                className={`font-bold text-red-600 dark:text-red-400 ${compact ? "text-lg" : "text-2xl"}`}
              >
                {stats.active}
              </div>
              <div
                className={`text-zinc-500 dark:text-zinc-500 ${compact ? "text-xs" : "text-sm"}`}
              >
                Active
              </div>
            </div>
            <div>
              <div
                className={`font-bold text-yellow-600 dark:text-yellow-400 ${compact ? "text-lg" : "text-2xl"}`}
              >
                {stats.recovering}
              </div>
              <div
                className={`text-zinc-500 dark:text-zinc-500 ${compact ? "text-xs" : "text-sm"}`}
              >
                Recovering
              </div>
            </div>
            <div>
              <div
                className={`font-bold text-green-600 dark:text-green-400 ${compact ? "text-lg" : "text-2xl"}`}
              >
                {stats.resolved}
              </div>
              <div
                className={`text-zinc-500 dark:text-zinc-500 ${compact ? "text-xs" : "text-sm"}`}
              >
                Resolved
              </div>
            </div>
            <div>
              <div
                className={`font-bold text-red-700 dark:text-red-300 ${compact ? "text-lg" : "text-2xl"}`}
              >
                {stats.critical}
              </div>
              <div
                className={`text-zinc-500 dark:text-zinc-500 ${compact ? "text-xs" : "text-sm"}`}
              >
                Critical
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4">
          <label
            className={`text-zinc-700 dark:text-zinc-300 ${compact ? "text-sm" : ""}`}
          >
            Status:
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.currentTarget.value as any)}
            className={`border border-zinc-300 dark:border-zinc-600 rounded px-3 py-1 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white ${compact ? "text-sm" : ""}`}
            title="Filter errors by status"
          >
            <option value="all">All Errors</option>
            <option value="active">Active</option>
            <option value="recovering">Recovering</option>
            <option value="resolved">Resolved</option>
            <option value="ignored">Ignored</option>
          </select>
        </div>
      </div>

      {/* Recovery Strategies */}
      {showStrategies && (
        <RecoveryStrategyPanel
          strategies={strategies}
          onToggle={handleToggleStrategy}
        />
      )}

      {/* Error List */}
      <div className="space-y-4">
        {filteredErrors.length === 0 ? (
          <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-8 text-center">
            <CheckCircle
              size={48}
              className="mx-auto mb-4 text-green-500 opacity-50"
            />
            <p className="text-zinc-500 dark:text-zinc-400">
              {filter === "all" ? "No errors detected" : `No ${filter} errors`}
            </p>
          </div>
        ) : (
          filteredErrors.map((error) => (
            <ErrorCard
              key={error.id}
              error={error}
              onRecover={handleRecover}
              onIgnore={handleIgnore}
              onViewDetails={handleViewDetails}
            />
          ))
        )}
      </div>
    </div>
  );
}
