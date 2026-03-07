import { useState } from "preact/hooks";
import { signal } from "@preact/signals";
import {
  Activity,
  BarChart3,
  Eye,
  GitBranch,
  Settings,
  AlertTriangle,
  Users,
  Database,
  X,
  FolderOpen,
  Brain,
  ImageIcon,
  TrendingUp,
} from "lucide-react";
import { PhasePipeline } from "./phase-pipeline";
import { RealTimeStatusTracker } from "./real-time-status-tracker";
import { EnhancedCaseManagement } from "./enhanced-case-management";
import { AdvancedErrorRecovery } from "./advanced-error-recovery";
import { MultiAgentProgressVisualization } from "./multi-agent-progress-visualization";
import { FraudDatasetManager } from "./fraud-dataset-manager";
import { MARAGStatusPanel } from "./marag-status-panel";
import { VisualizationGallery } from "./visualisation-gallery";
import { BenchmarkComparison } from "./benchmark-comparison";

// Signal for managing active workflows
export const activeWorkflowView = signal<string | null>(null);
export const workflowSplitMode = signal(false);

interface WorkflowDashboardProps {
  caseId?: string;
  compact?: boolean;
}

export function WorkflowDashboard({
  caseId = "FRAUD-20241204-001",
  compact = false,
}: WorkflowDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("pipeline");
  const [showRealTimePanel, setShowRealTimePanel] = useState(true);

  // Mock case progress for demonstration
  const caseProgress = {
    caseId,
    phases: Array.from({ length: 15 }, (_, i) => ({
      phaseId: `phase-${i + 1}`,
      phaseName: `Phase ${i + 1}: ${["Data Acquisition", "Initial Screening", "Pattern Analysis", "Risk Assessment", "Deep Learning Analysis", "Behavioral Analysis", "Network Analysis", "Rule-Based Validation", "Ensemble Scoring", "Alert Generation", "Human Review", "Investigation", "Decision Making", "Action Execution", "Monitoring & Feedback"][i]}`,
      status: (i < 3 ? "completed" : i === 3 ? "in-progress" : "pending") as
        | "completed"
        | "in-progress"
        | "pending",
      progress: i < 3 ? 100 : i === 3 ? 45 : 0,
    })),
    overallProgress: 30,
    currentPhase: "phase-4",
  } as const;

  const tabs = [
    {
      id: "pipeline",
      label: "Phase Pipeline",
      icon: GitBranch,
      component: (
        <PhasePipeline
          caseProgress={caseProgress}
          showDetails={!compact}
          compact={compact}
        />
      ),
    },
    {
      id: "agents",
      label: "Multi-Agent View",
      icon: Users,
      component: (
        <MultiAgentProgressVisualization
          showCollaborations={!compact}
          showOrchestration={!compact}
          compact={compact}
        />
      ),
    },
    {
      id: "marag",
      label: "MARAG Intelligence",
      icon: Brain,
      component: <MARAGStatusPanel compact={compact} />,
    },
    {
      id: "visualizations",
      label: "Visualizations",
      icon: ImageIcon,
      component: <VisualizationGallery compact={compact} />,
    },
    {
      id: "benchmarks",
      label: "Benchmarking",
      icon: TrendingUp,
      component: <BenchmarkComparison compact={compact} />,
    },
    {
      id: "cases",
      label: "Case Management",
      icon: Database,
      component: (
        <EnhancedCaseManagement showHandoffs={!compact} compact={compact} />
      ),
    },
    {
      id: "errors",
      label: "Error Recovery",
      icon: AlertTriangle,
      component: (
        <AdvancedErrorRecovery showStrategies={!compact} compact={compact} />
      ),
    },
    {
      id: "datasets",
      label: "Dataset Management",
      icon: FolderOpen,
      component: <FraudDatasetManager />,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      component: (
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-8 text-center">
          <BarChart3 size={48} className="mx-auto mb-4 text-zinc-400" />
          <p className="text-zinc-500 dark:text-zinc-400">
            Advanced analytics dashboard would be integrated here
          </p>
        </div>
      ),
    },
  ];

  const activeTabData = tabs.find((t) => t.id === activeTab);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className={`font-bold text-zinc-900 dark:text-white ${compact ? "text-xl" : "text-2xl"}`}
            >
              THEIA 15-Phase Workflow Dashboard
            </h2>
            <p
              className={`text-zinc-600 dark:text-zinc-400 ${compact ? "text-sm" : ""}`}
            >
              Comprehensive fraud detection pipeline monitoring and control
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRealTimePanel(!showRealTimePanel)}
              className={`p-2 rounded-lg transition-colors ${
                showRealTimePanel
                  ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                  : "bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
              }`}
              title="Toggle real-time panel"
            >
              <Activity size={compact ? 16 : 20} />
            </button>

            <button
              onClick={() =>
                (workflowSplitMode.value = !workflowSplitMode.value)
              }
              className={`p-2 rounded-lg transition-colors ${
                workflowSplitMode.value
                  ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300"
                  : "bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
              }`}
              title="Toggle split view"
            >
              <Eye size={compact ? 16 : 20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                } ${compact ? "text-sm px-3 py-1.5" : ""}`}
              >
                <Icon size={compact ? 14 : 16} />
                {!compact && <span>{tab.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div
        className={`flex-1 overflow-hidden ${workflowSplitMode.value ? "flex" : ""}`}
      >
        {/* Main Content */}
        <div
          className={`${workflowSplitMode.value ? "flex-1" : "w-full"} overflow-y-auto p-4`}
        >
          {activeTabData?.component}
        </div>

        {/* Real-Time Side Panel */}
        {showRealTimePanel && workflowSplitMode.value && (
          <div className="w-96 border-l border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-zinc-900 dark:text-white">
                  Real-Time Monitoring
                </h3>
                <button
                  type="button"
                  onClick={() => setShowRealTimePanel(false)}
                  className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  title="Close real-time panel"
                  aria-label="Close real-time panel"
                >
                  <X size={16} />
                </button>
              </div>

              <RealTimeStatusTracker
                caseId={caseId}
                showControls={true}
                compact={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* Real-Time Overlay Panel */}
      {showRealTimePanel && !workflowSplitMode.value && (
        <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-zinc-900 dark:text-white text-sm">
                Live Updates
              </h4>
              <button
                type="button"
                onClick={() => setShowRealTimePanel(false)}
                className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                title="Close real-time panel"
                aria-label="Close real-time panel"
              >
                <X size={14} />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              <RealTimeStatusTracker
                caseId={caseId}
                showControls={false}
                compact={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Integration hook for existing app components
export function useWorkflowIntegration() {
  const [isWorkflowMode, setIsWorkflowMode] = useState(false);

  const toggleWorkflowMode = () => {
    setIsWorkflowMode(!isWorkflowMode);
  };

  const openWorkflowDashboard = (caseId: string) => {
    activeWorkflowView.value = caseId;
    setIsWorkflowMode(true);
  };

  const closeWorkflowDashboard = () => {
    activeWorkflowView.value = null;
    setIsWorkflowMode(false);
  };

  return {
    isWorkflowMode,
    toggleWorkflowMode,
    openWorkflowDashboard,
    closeWorkflowDashboard,
    activeWorkflowView: activeWorkflowView.value,
  };
}

// Enhanced agent workflow component for integration with existing agent-workflow.tsx
export function EnhancedAgentWorkflow() {
  const { isWorkflowMode, toggleWorkflowMode, activeWorkflowView } =
    useWorkflowIntegration();

  if (!isWorkflowMode || !activeWorkflowView) {
    return (
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-6 text-center">
        <Settings size={48} className="mx-auto mb-4 text-zinc-400" />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
          15-Phase Workflow Dashboard
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Monitor and control the comprehensive fraud detection pipeline
        </p>
        <button
          onClick={toggleWorkflowMode}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          Open Workflow Dashboard
        </button>
      </div>
    );
  }

  return <WorkflowDashboard caseId={activeWorkflowView} />;
}
