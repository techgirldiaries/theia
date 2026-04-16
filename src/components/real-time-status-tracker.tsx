import { useEffect, useState } from "preact/hooks";
import { signal, computed } from "@preact/signals";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Zap,
  TrendingUp,
  AlertCircle,
  Timer,
  PlayCircle,
} from "lucide-react";
import type { PhaseStatus, CaseProgress } from "./phase-pipeline";

export interface PhaseUpdate {
  phaseId: string;
  status: PhaseStatus["status"];
  progress: number;
  results?: any;
  errorMessage?: string;
  confidence?: number;
  riskScore?: number;
  toolsUsed?: string[];
  qualityGate?: {
    passed: boolean;
    score: number;
    threshold: number;
  };
}

export interface AgentWorkflowStatus {
  caseId: string;
  isActive: boolean;
  estimatedTimeRemaining: number;
  currentPhase: string;
  phasesInProgress: string[];
  lastUpdate: Date;
  throughput: number; // phases per minute
  errors: {
    phaseId: string;
    error: string;
    timestamp: Date;
  }[];
  performance: {
    avgPhaseTime: number;
    fastestPhase: { phaseId: string; duration: number };
    slowestPhase: { phaseId: string; duration: number };
  };
}

// Signals for real-time tracking
export const activeWorkflows = signal<Map<string, AgentWorkflowStatus>>(
  new Map(),
);
export const phaseUpdates = signal<PhaseUpdate[]>([]);
export const isRealTimeEnabled = signal(true);

// WebSocket connection for real-time updates (mock for now)
class PhaseTracker {
  private updateInterval?: number;
  private mockCaseId: string = "";

  startTracking(caseId: string) {
    this.mockCaseId = caseId;

    // Simulate real-time phase updates
    this.updateInterval = window.setInterval(() => {
      if (isRealTimeEnabled.value) {
        this.simulatePhaseUpdate();
      }
    }, 2000) as unknown as number;
  }

  stopTracking() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }
  }

  private simulatePhaseUpdate() {
    const phases = [
      "phase-0",
      "phase-1",
      "phase-2",
      "phase-3",
      "phase-4",
      "phase-5",
      "phase-6",
      "phase-7",
      "phase-8",
      "phase-9",
      "phase-10",
      "phase-11",
      "phase-12",
      "phase-13",
      "phase-14",
      "phase-15",
    ];

    const randomPhase = phases[Math.floor(Math.random() * phases.length)];
    const progressIncrement = Math.floor(Math.random() * 25) + 5;

    const update: PhaseUpdate = {
      phaseId: randomPhase,
      status: "in-progress",
      progress: Math.min(100, Math.floor(Math.random() * 100)),
      confidence: Math.floor(Math.random() * 30) + 70,
      riskScore: Math.floor(Math.random() * 100),
      toolsUsed: ["Intelligence Tool", "Pattern Analyzer", "Risk Calculator"],
    };

    // Randomly complete phases
    if (Math.random() > 0.7) {
      update.status = "completed";
      update.progress = 100;
    }

    phaseUpdates.value = [update, ...phaseUpdates.value.slice(0, 49)];

    // Update workflow status
    const workflows = new Map(activeWorkflows.value);
    const existing = workflows.get(this.mockCaseId) || {
      caseId: this.mockCaseId,
      isActive: true,
      estimatedTimeRemaining: Math.floor(Math.random() * 300) + 60,
      currentPhase: randomPhase,
      phasesInProgress: [randomPhase],
      lastUpdate: new Date(),
      throughput: Math.random() * 2 + 0.5,
      errors: [],
      performance: {
        avgPhaseTime: Math.random() * 30 + 15,
        fastestPhase: { phaseId: "phase-0", duration: 5.2 },
        slowestPhase: { phaseId: "phase-12", duration: 45.8 },
      },
    };

    existing.lastUpdate = new Date();
    existing.currentPhase = randomPhase;
    workflows.set(this.mockCaseId, existing);
    activeWorkflows.value = workflows;
  }
}

const tracker = new PhaseTracker();

interface RealTimeStatusTrackerProps {
  caseId?: string;
  onPhaseUpdate?: (update: PhaseUpdate) => void;
  showControls?: boolean;
  compact?: boolean;
}

export function RealTimeStatusTracker({
  caseId = "FRAUD-20241204-001",
  onPhaseUpdate,
  showControls = true,
  compact = false,
}: RealTimeStatusTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const workflow = activeWorkflows.value.get(caseId);
  const recentUpdates = phaseUpdates.value.slice(0, 10);

  useEffect(() => {
    if (onPhaseUpdate) {
      const latestUpdate = phaseUpdates.value[0];
      if (latestUpdate) {
        onPhaseUpdate(latestUpdate);
      }
    }
  }, [phaseUpdates.value, onPhaseUpdate]);

  const handleStartTracking = () => {
    setIsTracking(true);
    tracker.startTracking(caseId);
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    tracker.stopTracking();
  };

  const handleToggleRealTime = () => {
    isRealTimeEnabled.value = !isRealTimeEnabled.value;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`space-y-4 ${compact ? "text-sm" : ""}`}>
      {/* Header & Controls */}
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3
              className={`font-bold text-zinc-900 dark:text-white ${compact ? "text-base" : "text-lg"}`}
            >
              Real-Time Phase Tracker
            </h3>
            <p
              className={`text-zinc-600 dark:text-zinc-400 ${compact ? "text-xs" : "text-sm"}`}
            >
              Live monitoring of fraud detection pipeline
            </p>
          </div>

          {showControls && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleRealTime}
                className={`p-2 rounded-lg transition-colors ${
                  isRealTimeEnabled.value
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                }`}
                title={
                  isRealTimeEnabled.value
                    ? "Real-time enabled"
                    : "Real-time disabled"
                }
              >
                <Zap size={compact ? 14 : 16} />
              </button>

              {!isTracking ? (
                <button
                  onClick={handleStartTracking}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  <PlayCircle size={compact ? 14 : 16} />
                  {!compact && "Start Tracking"}
                </button>
              ) : (
                <button
                  onClick={handleStopTracking}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <Pause size={compact ? 14 : 16} />
                  {!compact && "Stop Tracking"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Status Indicators */}
        {workflow && (
          <div
            className={`mt-4 grid gap-4 ${compact ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"}`}
          >
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Activity
                  size={compact ? 14 : 16}
                  className="text-indigo-500"
                />
                <span
                  className={`font-medium text-zinc-700 dark:text-zinc-300 ${compact ? "text-xs" : "text-sm"}`}
                >
                  Status
                </span>
              </div>
              <div className="flex items-center gap-2">
                {workflow.isActive ? (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className={compact ? "text-xs" : "text-sm"}>
                      Active
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                    <div className="w-2 h-2 bg-zinc-400 rounded-full"></div>
                    <span className={compact ? "text-xs" : "text-sm"}>
                      Idle
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Timer size={compact ? 14 : 16} className="text-orange-500" />
                <span
                  className={`font-medium text-zinc-700 dark:text-zinc-300 ${compact ? "text-xs" : "text-sm"}`}
                >
                  ETA
                </span>
              </div>
              <div
                className={`font-mono ${compact ? "text-xs" : "text-sm"} text-zinc-900 dark:text-white`}
              >
                {formatDuration(workflow.estimatedTimeRemaining)}
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp
                  size={compact ? 14 : 16}
                  className="text-purple-500"
                />
                <span
                  className={`font-medium text-zinc-700 dark:text-zinc-300 ${compact ? "text-xs" : "text-sm"}`}
                >
                  Throughput
                </span>
              </div>
              <div
                className={`${compact ? "text-xs" : "text-sm"} text-zinc-900 dark:text-white`}
              >
                {workflow.throughput.toFixed(1)} phases/min
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Loader2 size={compact ? 14 : 16} className="text-blue-500" />
                <span
                  className={`font-medium text-zinc-700 dark:text-zinc-300 ${compact ? "text-xs" : "text-sm"}`}
                >
                  Current Phase
                </span>
              </div>
              <div
                className={`${compact ? "text-xs" : "text-sm"} text-zinc-900 dark:text-white truncate`}
              >
                {workflow.currentPhase}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Updates Stream */}
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
        <h4
          className={`font-semibold text-zinc-900 dark:text-white mb-3 ${compact ? "text-sm" : ""}`}
        >
          Live Update Stream
        </h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {recentUpdates.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
              <Clock size={32} className="mx-auto mb-2 opacity-50" />
              <p className={compact ? "text-xs" : "text-sm"}>
                Waiting for phase updates...
              </p>
            </div>
          ) : (
            recentUpdates.map((update, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all animate-slide-down ${
                  update.status === "completed"
                    ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                    : update.status === "failed"
                      ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                      : "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  {update.status === "completed" ? (
                    <CheckCircle
                      size={compact ? 14 : 16}
                      className="text-green-600 dark:text-green-400"
                    />
                  ) : update.status === "failed" ? (
                    <AlertCircle
                      size={compact ? 14 : 16}
                      className="text-red-600 dark:text-red-400"
                    />
                  ) : (
                    <Loader2
                      size={compact ? 14 : 16}
                      className="text-blue-600 dark:text-blue-400 animate-spin"
                    />
                  )}
                  <div>
                    <div
                      className={`font-medium text-zinc-900 dark:text-white ${compact ? "text-xs" : "text-sm"}`}
                    >
                      {update.phaseId}
                    </div>
                    <div
                      className={`text-zinc-600 dark:text-zinc-400 ${compact ? "text-xs" : "text-xs"}`}
                    >
                      {update.progress}% complete
                      {update.confidence &&
                        ` • ${update.confidence}% confidence`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {update.riskScore !== undefined && (
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        update.riskScore > 70
                          ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                          : update.riskScore > 40
                            ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                            : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                      }`}
                    >
                      Risk: {update.riskScore}
                    </span>
                  )}
                  <div
                    className={`text-right ${compact ? "text-xs" : "text-sm"}`}
                  >
                    <div className="text-zinc-500 dark:text-zinc-400">
                      {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      {workflow && (
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
          <h4
            className={`font-semibold text-zinc-900 dark:text-white mb-3 ${compact ? "text-sm" : ""}`}
          >
            Performance Metrics
          </h4>
          <div
            className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"}`}
          >
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded p-3">
              <div
                className={`text-zinc-600 dark:text-zinc-400 mb-1 ${compact ? "text-xs" : "text-sm"}`}
              >
                Average Phase Time
              </div>
              <div
                className={`font-bold text-zinc-900 dark:text-white ${compact ? "text-sm" : "text-lg"}`}
              >
                {workflow.performance.avgPhaseTime.toFixed(1)}s
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900 rounded p-3">
              <div
                className={`text-zinc-600 dark:text-zinc-400 mb-1 ${compact ? "text-xs" : "text-sm"}`}
              >
                Fastest Phase
              </div>
              <div
                className={`font-bold text-green-600 dark:text-green-400 ${compact ? "text-sm" : "text-lg"}`}
              >
                {workflow.performance.fastestPhase.duration}s
              </div>
              <div
                className={`text-zinc-500 dark:text-zinc-400 ${compact ? "text-xs" : "text-xs"}`}
              >
                {workflow.performance.fastestPhase.phaseId}
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900 rounded p-3">
              <div
                className={`text-zinc-600 dark:text-zinc-400 mb-1 ${compact ? "text-xs" : "text-sm"}`}
              >
                Slowest Phase
              </div>
              <div
                className={`font-bold text-red-600 dark:text-red-400 ${compact ? "text-sm" : "text-lg"}`}
              >
                {workflow.performance.slowestPhase.duration}s
              </div>
              <div
                className={`text-zinc-500 dark:text-zinc-400 ${compact ? "text-xs" : "text-xs"}`}
              >
                {workflow.performance.slowestPhase.phaseId}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Utility function to create mock case progress for testing
export function createMockCaseProgress(caseId: string): CaseProgress {
  const phases: PhaseStatus[] = [
    "phase-0",
    "phase-1",
    "phase-2",
    "phase-3",
    "phase-4",
    "phase-5",
    "phase-6",
    "phase-7",
    "phase-8",
    "phase-9",
    "phase-10",
    "phase-11",
    "phase-12",
    "phase-13",
    "phase-14",
    "phase-15",
  ].map((id, index) => {
    const completed = index < 8;
    const inProgress = index === 8;

    return {
      phaseId: id,
      phaseName: `Phase ${index}`,
      status: completed ? "completed" : inProgress ? "in-progress" : "pending",
      progress: completed ? 100 : inProgress ? 65 : 0,
      startTime: completed
        ? new Date(Date.now() - (16 - index) * 60000)
        : undefined,
      endTime: completed
        ? new Date(Date.now() - (15 - index) * 60000)
        : undefined,
      duration: completed ? Math.random() * 30000 + 5000 : undefined,
      confidence: completed ? Math.floor(Math.random() * 20) + 80 : undefined,
      riskScore: Math.floor(Math.random() * 100),
      toolsUsed: completed
        ? ["Intelligence Tool", "Pattern Analyzer"]
        : undefined,
      qualityGate: completed
        ? {
            passed: true,
            score: Math.floor(Math.random() * 20) + 80,
            threshold: 75,
          }
        : undefined,
    };
  });

  return {
    caseId,
    overallProgress: 53,
    currentPhase: "phase-8",
    phases,
  };
}
