import { useState, useEffect } from "preact/hooks";
import { signal } from "@preact/signals";
import {
  Brain,
  Shield,
  Clock,
  Network,
  Activity,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Info,
  TrendingUp,
  Users,
  Eye,
} from "lucide-react";

// MARAG Agent Types
export interface MARAGAgent {
  id: string;
  name: string;
  acronym: string;
  domain: string;
  status: "idle" | "active" | "completed" | "error";
  confidence: number | null;
  findings: string[];
  icon: any;
  color: string;
}

export interface MARAGConsensus {
  consensusScore: number;
  agentScores: Record<string, number>;
  correlations: Record<string, number>;
  conflicts: {
    detected: number;
    resolved: number;
    method: string;
  };
  finalScore: number;
  uncertaintySources: string[];
}

// MARAG signals
export const maragAgents = signal<MARAGAgent[]>([
  {
    id: "TIRA",
    name: "Threat Intelligence RAG Agent",
    acronym: "TIRA",
    domain: "Cybersecurity threats, attack patterns, threat actor profiles",
    status: "idle",
    confidence: null,
    findings: [],
    icon: Shield,
    color: "red",
  },
  {
    id: "RCRA",
    name: "Regulatory Compliance RAG Agent",
    acronym: "RCRA",
    domain: "AML/KYC regulations, sanctions lists, compliance",
    status: "idle",
    confidence: null,
    findings: [],
    icon: CheckCircle,
    color: "blue",
  },
  {
    id: "HPRA",
    name: "Historical Pattern RAG Agent",
    acronym: "HPRA",
    domain: "Fraud patterns, historical cases, typology analysis",
    status: "idle",
    confidence: null,
    findings: [],
    icon: Clock,
    color: "purple",
  },
  {
    id: "ERRA",
    name: "Entity Relationship RAG Agent",
    acronym: "ERRA",
    domain: "Entity networks, relationship mapping, graph analysis",
    status: "idle",
    confidence: null,
    findings: [],
    icon: Network,
    color: "green",
  },
  {
    id: "BARA",
    name: "Behavioral Analysis RAG Agent",
    acronym: "BARA",
    domain: "User behavior patterns, biometric analysis, device intelligence",
    status: "idle",
    confidence: null,
    findings: [],
    icon: Activity,
    color: "orange",
  },
]);

export const maragConsensus = signal<MARAGConsensus | null>(null);
export const showMARAGPanel = signal(false);

interface MARAGStatusPanelProps {
  compact?: boolean;
}

export function MARAGStatusPanel({ compact = false }: MARAGStatusPanelProps) {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const toggleAgent = (agentId: string) => {
    setExpandedAgent(expandedAgent === agentId ? null : agentId);
  };

  const getAgentStatusIcon = (agent: MARAGAgent) => {
    switch (agent.status) {
      case "active":
        return <Loader2 size={16} className="animate-spin text-blue-600" />;
      case "completed":
        return <CheckCircle size={16} className="text-green-600" />;
      case "error":
        return <AlertTriangle size={16} className="text-red-600" />;
      default:
        return <Info size={16} className="text-gray-400" />;
    }
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      red: "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700",
      blue: "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700",
      purple:
        "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700",
      green:
        "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700",
      orange:
        "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700",
    };
    return (
      colorMap[color] ||
      "bg-gray-100 dark:bg-gray-900/30 border-gray-300 dark:border-gray-700"
    );
  };

  return (
    <div
      className={`bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg ${compact ? "p-3" : "p-6"}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain size={20} className="text-indigo-600" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Multi-Agent RAG (MARAG)
          </h3>
        </div>
        {maragConsensus.value && (
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
            <TrendingUp size={14} className="text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              Consensus: {Math.round(maragConsensus.value.consensusScore * 100)}
              %
            </span>
          </div>
        )}
      </div>

      {/* Agent Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {maragAgents.value.map((agent) => {
          const AgentIcon = agent.icon;
          return (
            <button
              key={agent.id}
              onClick={() => toggleAgent(agent.id)}
              className={`${getColorClass(agent.color)} border rounded-lg p-3 text-left transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AgentIcon size={18} className={`text-${agent.color}-600`} />
                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-white">
                    {agent.acronym}
                  </h4>
                </div>
                {getAgentStatusIcon(agent)}
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2 line-clamp-2">
                {agent.domain}
              </p>

              {agent.confidence !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    Confidence
                  </span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {Math.round(agent.confidence * 100)}%
                  </span>
                </div>
              )}

              {expandedAgent === agent.id && agent.findings.length > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-300 dark:border-zinc-600">
                  <h5 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Findings:
                  </h5>
                  <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                    {agent.findings.slice(0, 3).map((finding, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-indigo-600">•</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Consensus Details */}
      {maragConsensus.value && !compact && (
        <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
          <h4 className="font-semibold text-sm text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
            <Users size={16} className="text-indigo-600" />
            Collaborative Intelligence Synthesis
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            <div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Consensus Score
              </span>
              <p className="text-lg font-bold text-indigo-600">
                {Math.round(maragConsensus.value.consensusScore * 100)}%
              </p>
            </div>
            <div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Final Risk Score
              </span>
              <p className="text-lg font-bold text-zinc-900 dark:text-white">
                {maragConsensus.value.finalScore}
              </p>
            </div>
            <div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Conflicts Resolved
              </span>
              <p className="text-lg font-bold text-green-600">
                {maragConsensus.value.conflicts.resolved}/
                {maragConsensus.value.conflicts.detected}
              </p>
            </div>
          </div>

          {maragConsensus.value.uncertaintySources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
              <h5 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1">
                <Eye size={12} />
                Uncertainty Sources:
              </h5>
              <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                {maragConsensus.value.uncertaintySources.map((source, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-amber-600">⚠</span>
                    <span>{source}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
