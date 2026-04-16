import { useState, useEffect } from "preact/hooks";
import { signal, computed } from "@preact/signals";
import {
  Activity,
  Brain,
  Database,
  GitBranch,
  GitMerge,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  Shield,
  Search,
  Eye,
  Scale,
  Building2,
  Filter,
  FileCheck,
  BarChart3,
  Users,
  MessageCircle,
  ArrowRight,
  Settings,
  Cpu,
  Network,
  Timer,
} from "lucide-react";

export interface AgentInstance {
  id: string;
  name: string;
  type: "specialist" | "coordinator" | "validator" | "orchestrator";
  phase: string;
  status: "idle" | "active" | "waiting" | "completed" | "error";
  progress: number;
  startTime?: Date;
  estimatedCompletion?: Date;
  currentTask?: string;
  performance: {
    tasksCompleted: number;
    avgExecutionTime: number;
    successRate: number;
    confidence: number;
  };
  resources: {
    cpuUsage: number;
    memoryUsage: number;
    toolsActive: string[];
  };
  communication: {
    messagesReceived: number;
    messagesSent: number;
    collaborations: string[];
  };
}

export interface AgentCollaboration {
  id: string;
  agents: string[];
  type: "data_handoff" | "validation" | "consensus" | "parallel_processing";
  status: "active" | "completed" | "failed";
  startTime: Date;
  endTime?: Date;
  description: string;
  resultConfidence?: number;
  dataExchanged?: {
    type: string;
    size: number;
    quality: number;
  };
}

export interface PhaseOrchestration {
  id: string;
  phase: string;
  agents: AgentInstance[];
  collaborations: AgentCollaboration[];
  orchestrator: string; // Agent ID
  status: "planning" | "executing" | "convergence" | "completed";
  startTime: Date;
  estimatedDuration: number;
  actualDuration?: number;
  qualityMetrics: {
    consistency: number;
    completeness: number;
    confidence: number;
  };
}

// Signals for multi-agent tracking
export const agentInstances = signal<Map<string, AgentInstance>>(new Map());
export const activeCollaborations = signal<AgentCollaboration[]>([]);
export const phaseOrchestrations = signal<Map<string, PhaseOrchestration>>(
  new Map(),
);

// Agent type configurations
const AGENT_TYPES = {
  specialist: {
    icon: Brain,
    color: "text-purple-600 bg-purple-50 border-purple-200",
    darkColor: "dark:text-purple-400 dark:bg-purple-950 dark:border-purple-800",
  },
  coordinator: {
    icon: GitMerge,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    darkColor: "dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800",
  },
  validator: {
    icon: Shield,
    color: "text-green-600 bg-green-50 border-green-200",
    darkColor: "dark:text-green-400 dark:bg-green-950 dark:border-green-800",
  },
  orchestrator: {
    icon: Settings,
    color: "text-orange-600 bg-orange-50 border-orange-200",
    darkColor: "dark:text-orange-400 dark:bg-orange-950 dark:border-orange-800",
  },
};

const getStatusColor = (status: AgentInstance["status"]) => {
  switch (status) {
    case "active":
      return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950";
    case "waiting":
      return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950";
    case "completed":
      return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950";
    case "error":
      return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950";
    default:
      return "text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900";
  }
};

function AgentCard({
  agent,
  compact = false,
}: {
  agent: AgentInstance;
  compact?: boolean;
}) {
  const agentType = AGENT_TYPES[agent.type];
  const AgentIcon = agentType.icon;
  const [showDetails, setShowDetails] = useState(false);

  const getResourceUsageColor = (usage: number) => {
    if (usage > 80) return "text-red-600 dark:text-red-400";
    if (usage > 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <div
      className={`bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 hover:shadow-md transition-all ${compact ? "p-3" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg border ${agentType.color} ${agentType.darkColor} ${compact ? "p-1.5" : ""}`}
          >
            <AgentIcon size={compact ? 16 : 20} />
          </div>
          <div>
            <h4
              className={`font-semibold text-zinc-900 dark:text-white ${compact ? "text-sm" : ""}`}
            >
              {agent.name}
            </h4>
            <p
              className={`text-zinc-600 dark:text-zinc-400 ${compact ? "text-xs" : "text-sm"}`}
            >
              {agent.type.replace("_", " ").toUpperCase()} • {agent.phase}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}
          >
            {agent.status.toUpperCase()}
          </span>
          {agent.status === "active" && (
            <Loader2 size={14} className="animate-spin text-green-500" />
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1">
          <span>Progress</span>
          <span>{agent.progress}%</span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              agent.status === "active"
                ? "bg-green-500"
                : agent.status === "completed"
                  ? "bg-blue-500"
                  : agent.status === "error"
                    ? "bg-red-500"
                    : "bg-zinc-400"
            }`}
            style={{ width: `${agent.progress}%` }}
          />
        </div>
      </div>

      {/* Current Task */}
      {agent.currentTask && (
        <div className="mb-3 p-2 bg-zinc-50 dark:bg-zinc-900 rounded text-sm">
          <div className="font-medium text-zinc-900 dark:text-white mb-1">
            Current Task:
          </div>
          <div className="text-zinc-600 dark:text-zinc-400">
            {agent.currentTask}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div
        className={`grid gap-2 mb-3 ${compact ? "grid-cols-2" : "grid-cols-3"}`}
      >
        <div className={`text-center ${compact ? "text-xs" : "text-sm"}`}>
          <div className="font-bold text-indigo-600 dark:text-indigo-400">
            {agent.performance.confidence}%
          </div>
          <div className="text-zinc-500 dark:text-zinc-500 text-xs">
            Confidence
          </div>
        </div>
        <div className={`text-center ${compact ? "text-xs" : "text-sm"}`}>
          <div className="font-bold text-green-600 dark:text-green-400">
            {agent.performance.successRate}%
          </div>
          <div className="text-zinc-500 dark:text-zinc-500 text-xs">
            Success Rate
          </div>
        </div>
        {!compact && (
          <div className="text-center text-sm">
            <div className="font-bold text-purple-600 dark:text-purple-400">
              {agent.performance.tasksCompleted}
            </div>
            <div className="text-zinc-500 dark:text-zinc-500 text-xs">
              Tasks
            </div>
          </div>
        )}
      </div>

      {/* Resource Usage */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-600 dark:text-zinc-400">CPU</span>
          <span className={getResourceUsageColor(agent.resources.cpuUsage)}>
            {agent.resources.cpuUsage}%
          </span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1">
          <div
            className={`h-1 rounded-full bg-linear-to-r ${
              agent.resources.cpuUsage > 80
                ? "from-yellow-500 to-red-500"
                : agent.resources.cpuUsage > 60
                  ? "from-green-500 to-yellow-500"
                  : "from-green-400 to-green-500"
            }`}
            style={{ width: `${agent.resources.cpuUsage}%` }}
          />
        </div>
      </div>

      {/* Tools */}
      {agent.resources.toolsActive.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
            Active Tools:
          </div>
          <div className="flex flex-wrap gap-1">
            {agent.resources.toolsActive
              .slice(0, compact ? 2 : 3)
              .map((tool) => (
                <span
                  key={tool}
                  className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded text-xs"
                >
                  {tool}
                </span>
              ))}
            {agent.resources.toolsActive.length > (compact ? 2 : 3) && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400 px-1">
                +{agent.resources.toolsActive.length - (compact ? 2 : 3)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Expandable Details */}
      {!compact && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full mt-3 py-2 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded transition-colors"
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </button>
      )}

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700 space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-zinc-600 dark:text-zinc-400">
                Avg Execution:
              </div>
              <div className="font-medium">
                {agent.performance.avgExecutionTime.toFixed(1)}s
              </div>
            </div>
            <div>
              <div className="text-zinc-600 dark:text-zinc-400">
                Memory Usage:
              </div>
              <div
                className={`font-medium ${getResourceUsageColor(agent.resources.memoryUsage)}`}
              >
                {agent.resources.memoryUsage}%
              </div>
            </div>
            <div>
              <div className="text-zinc-600 dark:text-zinc-400">Messages:</div>
              <div className="font-medium">
                {agent.communication.messagesReceived}↓{" "}
                {agent.communication.messagesSent}↑
              </div>
            </div>
            <div>
              <div className="text-zinc-600 dark:text-zinc-400">
                Collaborators:
              </div>
              <div className="font-medium">
                {agent.communication.collaborations.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CollaborationFlow({
  collaboration,
  agents,
}: {
  collaboration: AgentCollaboration;
  agents: Map<string, AgentInstance>;
}) {
  const participatingAgents = collaboration.agents
    .map((id) => agents.get(id))
    .filter(Boolean) as AgentInstance[];

  const getCollaborationIcon = (type: AgentCollaboration["type"]) => {
    switch (type) {
      case "data_handoff":
        return ArrowRight;
      case "validation":
        return Shield;
      case "consensus":
        return MessageCircle;
      case "parallel_processing":
        return GitBranch;
      default:
        return Network;
    }
  };

  const CollabIcon = getCollaborationIcon(collaboration.type);
  const duration = collaboration.endTime
    ? (collaboration.endTime.getTime() - collaboration.startTime.getTime()) /
      1000
    : (Date.now() - collaboration.startTime.getTime()) / 1000;

  return (
    <div
      className={`p-3 rounded-lg border transition-all ${
        collaboration.status === "active"
          ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
          : collaboration.status === "completed"
            ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
            : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CollabIcon
            size={16}
            className={
              collaboration.status === "active"
                ? "text-blue-600 dark:text-blue-400"
                : collaboration.status === "completed"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
            }
          />
          <span className="font-medium text-sm text-zinc-900 dark:text-white">
            {collaboration.type
              .replace("_", " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          </span>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            collaboration.status === "active"
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              : collaboration.status === "completed"
                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
          }`}
        >
          {collaboration.status}
        </span>
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
        {collaboration.description}
      </p>

      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500">
        <div className="flex items-center gap-3">
          <span>
            Agents:{" "}
            {participatingAgents.map((a) => a.name.split(" ")[0]).join(", ")}
          </span>
          <span>Duration: {duration.toFixed(1)}s</span>
          {collaboration.resultConfidence && (
            <span>Confidence: {collaboration.resultConfidence}%</span>
          )}
        </div>
        {collaboration.dataExchanged && (
          <div className="text-right">
            <div>Data: {collaboration.dataExchanged.type}</div>
            <div>Quality: {collaboration.dataExchanged.quality}%</div>
          </div>
        )}
      </div>
    </div>
  );
}

function PhaseCoordination({
  orchestration,
  agents,
}: {
  orchestration: PhaseOrchestration;
  agents: Map<string, AgentInstance>;
}) {
  const orchestratorAgent = agents.get(orchestration.orchestrator);
  const phaseAgents = orchestration.agents;
  const completionPercentage = orchestration.actualDuration
    ? 100
    : Math.min(
        100,
        (Date.now() - orchestration.startTime.getTime()) /
          (orchestration.estimatedDuration * 10),
      );

  return (
    <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-semibold text-zinc-900 dark:text-white">
            {orchestration.phase} Coordination
          </h4>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Orchestrated by {orchestratorAgent?.name || "Unknown"}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            orchestration.status === "executing"
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              : orchestration.status === "completed"
                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                : orchestration.status === "convergence"
                  ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
          }`}
        >
          {orchestration.status.toUpperCase()}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400 mb-2">
          <span>Phase Progress</span>
          <span>{Math.round(completionPercentage)}%</span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {orchestration.qualityMetrics.consistency}%
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-500">
            Consistency
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {orchestration.qualityMetrics.completeness}%
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-500">
            Completeness
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {orchestration.qualityMetrics.confidence}%
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-500">
            Confidence
          </div>
        </div>
      </div>

      {/* Collaborations */}
      <div className="space-y-2">
        <h5 className="font-medium text-zinc-900 dark:text-white text-sm">
          Active Collaborations ({orchestration.collaborations.length})
        </h5>
        <div className="space-y-2">
          {orchestration.collaborations.slice(0, 3).map((collab) => (
            <CollaborationFlow
              key={collab.id}
              collaboration={collab}
              agents={agents}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface MultiAgentProgressVisualizationProps {
  showCollaborations?: boolean;
  showOrchestration?: boolean;
  compact?: boolean;
}

export function MultiAgentProgressVisualization({
  showCollaborations = true,
  showOrchestration = true,
  compact = false,
}: MultiAgentProgressVisualizationProps) {
  const agents = agentInstances.value;
  const collaborations = activeCollaborations.value;
  const orchestrations = phaseOrchestrations.value;
  const [filterType, setFilterType] = useState<AgentInstance["type"] | "all">(
    "all",
  );
  const [filterStatus, setFilterStatus] = useState<
    AgentInstance["status"] | "all"
  >("all");

  // Initialize sample data
  useEffect(() => {
    if (agents.size === 0) {
      const sampleAgents = new Map<string, AgentInstance>();

      // Data Processing Agents
      sampleAgents.set("data-acquisition-agent", {
        id: "data-acquisition-agent",
        name: "Data Acquisition Specialist",
        type: "specialist",
        phase: "phase-0",
        status: "completed",
        progress: 100,
        startTime: new Date(Date.now() - 600000),
        currentTask: "Data classification complete",
        performance: {
          tasksCompleted: 15,
          avgExecutionTime: 8.5,
          successRate: 98,
          confidence: 92,
        },
        resources: {
          cpuUsage: 15,
          memoryUsage: 40,
          toolsActive: ["CSV Reader", "Data Validator"],
        },
        communication: {
          messagesReceived: 5,
          messagesSent: 12,
          collaborations: ["ingestion-coordinator"],
        },
      });

      // Parallel Analysis Agents
      sampleAgents.set("intelligence-agent", {
        id: "intelligence-agent",
        name: "Intelligence Retrieval Agent",
        type: "specialist",
        phase: "phase-4",
        status: "active",
        progress: 75,
        startTime: new Date(Date.now() - 120000),
        currentTask: "Analyzing fraud patterns from knowledge base",
        performance: {
          tasksCompleted: 8,
          avgExecutionTime: 12.3,
          successRate: 87,
          confidence: 84,
        },
        resources: {
          cpuUsage: 78,
          memoryUsage: 62,
          toolsActive: [
            "Knowledge Search",
            "Pattern Analyzer",
            "Evidence Correlator",
          ],
        },
        communication: {
          messagesReceived: 15,
          messagesSent: 8,
          collaborations: ["threat-agent", "entity-agent"],
        },
      });

      sampleAgents.set("threat-agent", {
        id: "threat-agent",
        name: "Threat Intelligence Agent",
        type: "specialist",
        phase: "phase-5",
        status: "active",
        progress: 60,
        startTime: new Date(Date.now() - 100000),
        currentTask: "Gathering OSINT threat data",
        performance: {
          tasksCompleted: 6,
          avgExecutionTime: 15.7,
          successRate: 91,
          confidence: 88,
        },
        resources: {
          cpuUsage: 65,
          memoryUsage: 55,
          toolsActive: ["OSINT Gatherer", "Threat Correlator"],
        },
        communication: {
          messagesReceived: 12,
          messagesSent: 6,
          collaborations: ["intelligence-agent", "validation-coordinator"],
        },
      });

      // Coordination Agents
      sampleAgents.set("analysis-coordinator", {
        id: "analysis-coordinator",
        name: "Analysis Coordinator",
        type: "coordinator",
        phase: "phase-4-6",
        status: "active",
        progress: 68,
        startTime: new Date(Date.now() - 150000),
        currentTask: "Coordinating parallel analysis phases",
        performance: {
          tasksCompleted: 12,
          avgExecutionTime: 5.2,
          successRate: 96,
          confidence: 91,
        },
        resources: {
          cpuUsage: 35,
          memoryUsage: 45,
          toolsActive: ["Coordination Engine", "Message Broker"],
        },
        communication: {
          messagesReceived: 25,
          messagesSent: 18,
          collaborations: [
            "intelligence-agent",
            "threat-agent",
            "entity-agent",
          ],
        },
      });

      // Validation Agents
      sampleAgents.set("evidence-validator", {
        id: "evidence-validator",
        name: "Evidence Validation Agent",
        type: "validator",
        phase: "phase-11",
        status: "waiting",
        progress: 0,
        performance: {
          tasksCompleted: 3,
          avgExecutionTime: 18.9,
          successRate: 94,
          confidence: 96,
        },
        resources: {
          cpuUsage: 5,
          memoryUsage: 20,
          toolsActive: [],
        },
        communication: {
          messagesReceived: 3,
          messagesSent: 1,
          collaborations: ["analysis-coordinator"],
        },
      });

      // Orchestrator
      sampleAgents.set("theia-orchestrator", {
        id: "theia-orchestrator",
        name: "THEIA Orchestrator",
        type: "orchestrator",
        phase: "all",
        status: "active",
        progress: 45,
        startTime: new Date(Date.now() - 800000),
        currentTask: "Managing 16-phase fraud detection pipeline",
        performance: {
          tasksCompleted: 2,
          avgExecutionTime: 600,
          successRate: 100,
          confidence: 89,
        },
        resources: {
          cpuUsage: 25,
          memoryUsage: 35,
          toolsActive: ["Workflow Engine", "Agent Manager", "Quality Monitor"],
        },
        communication: {
          messagesReceived: 45,
          messagesSent: 62,
          collaborations: ["all-agents"],
        },
      });

      agentInstances.value = sampleAgents;

      // Sample collaborations
      activeCollaborations.value = [
        {
          id: "parallel-analysis-collab",
          agents: ["intelligence-agent", "threat-agent", "entity-agent"],
          type: "parallel_processing",
          status: "active",
          startTime: new Date(Date.now() - 120000),
          description:
            "Parallel execution of intelligence, threat, and entity analysis",
          resultConfidence: 85,
          dataExchanged: {
            type: "Risk Indicators",
            size: 2.5,
            quality: 88,
          },
        },
        {
          id: "validation-consensus",
          agents: ["intelligence-agent", "threat-agent"],
          type: "consensus",
          status: "completed",
          startTime: new Date(Date.now() - 300000),
          endTime: new Date(Date.now() - 250000),
          description: "Cross-validation of threat intelligence findings",
          resultConfidence: 92,
        },
      ];

      // Sample orchestration
      const sampleOrchestration = new Map();
      sampleOrchestration.set("phase-4-6-orchestration", {
        id: "phase-4-6-orchestration",
        phase: "Parallel Analysis (Phases 4-6)",
        agents: [
          sampleAgents.get("intelligence-agent")!,
          sampleAgents.get("threat-agent")!,
        ],
        collaborations: activeCollaborations.value,
        orchestrator: "analysis-coordinator",
        status: "executing",
        startTime: new Date(Date.now() - 150000),
        estimatedDuration: 180000,
        qualityMetrics: {
          consistency: 87,
          completeness: 75,
          confidence: 82,
        },
      });

      phaseOrchestrations.value = sampleOrchestration;
    }
  }, []);

  const filteredAgents = Array.from(agents.values()).filter((agent) => {
    if (filterType !== "all" && agent.type !== filterType) return false;
    if (filterStatus !== "all" && agent.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    totalAgents: agents.size,
    activeAgents: Array.from(agents.values()).filter(
      (a) => a.status === "active",
    ).length,
    completedAgents: Array.from(agents.values()).filter(
      (a) => a.status === "completed",
    ).length,
    avgConfidence:
      Array.from(agents.values()).reduce(
        (sum, a) => sum + a.performance.confidence,
        0,
      ) / agents.size,
    activeCollaborations: collaborations.filter((c) => c.status === "active")
      .length,
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
              Multi-Agent Progress Dashboard
            </h3>
            <p
              className={`text-zinc-600 dark:text-zinc-400 ${compact ? "text-sm" : ""}`}
            >
              Real-time coordination of 16-phase fraud detection agents
            </p>
          </div>
          <div
            className={`grid gap-4 ${compact ? "grid-cols-2 lg:grid-cols-5" : "grid-cols-2 md:grid-cols-5"} text-center`}
          >
            <div>
              <div
                className={`font-bold text-indigo-600 dark:text-indigo-400 ${compact ? "text-lg" : "text-2xl"}`}
              >
                {stats.totalAgents}
              </div>
              <div
                className={`text-zinc-500 dark:text-zinc-500 ${compact ? "text-xs" : "text-sm"}`}
              >
                Total Agents
              </div>
            </div>
            <div>
              <div
                className={`font-bold text-green-600 dark:text-green-400 ${compact ? "text-lg" : "text-2xl"}`}
              >
                {stats.activeAgents}
              </div>
              <div
                className={`text-zinc-500 dark:text-zinc-500 ${compact ? "text-xs" : "text-sm"}`}
              >
                Active
              </div>
            </div>
            <div>
              <div
                className={`font-bold text-blue-600 dark:text-blue-400 ${compact ? "text-lg" : "text-2xl"}`}
              >
                {stats.completedAgents}
              </div>
              <div
                className={`text-zinc-500 dark:text-zinc-500 ${compact ? "text-xs" : "text-sm"}`}
              >
                Completed
              </div>
            </div>
            <div>
              <div
                className={`font-bold text-purple-600 dark:text-purple-400 ${compact ? "text-lg" : "text-2xl"}`}
              >
                {Math.round(stats.avgConfidence)}%
              </div>
              <div
                className={`text-zinc-500 dark:text-zinc-500 ${compact ? "text-xs" : "text-sm"}`}
              >
                Avg Confidence
              </div>
            </div>
            <div>
              <div
                className={`font-bold text-orange-600 dark:text-orange-400 ${compact ? "text-lg" : "text-2xl"}`}
              >
                {stats.activeCollaborations}
              </div>
              <div
                className={`text-zinc-500 dark:text-zinc-500 ${compact ? "text-xs" : "text-sm"}`}
              >
                Collaborations
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label
              className={`text-zinc-700 dark:text-zinc-300 ${compact ? "text-sm" : ""}`}
            >
              Type:
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.currentTarget.value as any)}
              title="Filter agents by type"
              className={`border border-zinc-300 dark:border-zinc-600 rounded px-3 py-1 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white ${compact ? "text-sm" : ""}`}
            >
              <option value="all">All Types</option>
              <option value="specialist">Specialist</option>
              <option value="coordinator">Coordinator</option>
              <option value="validator">Validator</option>
              <option value="orchestrator">Orchestrator</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label
              className={`text-zinc-700 dark:text-zinc-300 ${compact ? "text-sm" : ""}`}
            >
              Status:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.currentTarget.value as any)}
              title="Filter agents by status"
              className={`border border-zinc-300 dark:border-zinc-600 rounded px-3 py-1 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white ${compact ? "text-sm" : ""}`}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="waiting">Waiting</option>
              <option value="completed">Completed</option>
              <option value="idle">Idle</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </div>

      {/* Phase Orchestration */}
      {showOrchestration && (
        <div className="space-y-4">
          <h4 className="font-semibold text-zinc-900 dark:text-white">
            Phase Orchestration
          </h4>
          <div className="space-y-4">
            {Array.from(orchestrations.values()).map((orchestration) => (
              <PhaseCoordination
                key={orchestration.id}
                orchestration={orchestration}
                agents={agents}
              />
            ))}
          </div>
        </div>
      )}

      {/* Agent Grid */}
      <div className="space-y-4">
        <h4 className="font-semibold text-zinc-900 dark:text-white">
          Agent Instances ({filteredAgents.length})
        </h4>
        <div
          className={`grid gap-4 ${compact ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}
        >
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} compact={compact} />
          ))}
        </div>
      </div>

      {/* Active Collaborations */}
      {showCollaborations && collaborations.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-zinc-900 dark:text-white">
            Active Collaborations ({collaborations.length})
          </h4>
          <div className="space-y-3">
            {collaborations.map((collaboration) => (
              <CollaborationFlow
                key={collaboration.id}
                collaboration={collaboration}
                agents={agents}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
