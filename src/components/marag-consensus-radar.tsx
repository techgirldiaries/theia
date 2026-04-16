/**
 * MARAG Consensus Radar Chart Component
 * Displays multi-agent confidence scores in radar chart format
 */

import { useState } from "preact/hooks";
import { BarChart3, Download, Info } from "lucide-react";
import type { AgentConsensus, MaragAgentId } from "@/types/marag";

interface MaragConsensusRadarProps {
  consensus: AgentConsensus;
  compact?: boolean;
}

export function MaragConsensusRadar({
  consensus,
  compact = false,
}: MaragConsensusRadarProps) {
  const [showDetails, setShowDetails] = useState(false);

  const agents: MaragAgentId[] = ["TIRA", "RCRA", "HPRA", "ERRA", "BARA"];

  const getAgentColor = (agentId: MaragAgentId): string => {
    const colors: Record<MaragAgentId, string> = {
      TIRA: "#EF4444", // Red
      RCRA: "#3B82F6", // Blue
      HPRA: "#A855F7", // Purple
      ERRA: "#10B981", // Green
      BARA: "#F97316", // Orange
    };
    return colors[agentId];
  };

  const getAgentName = (agentId: MaragAgentId): string => {
    const names: Record<MaragAgentId, string> = {
      TIRA: "Threat Intelligence",
      RCRA: "Regulatory Compliance",
      HPRA: "Historical Patterns",
      ERRA: "Entity Relationships",
      BARA: "Behavioral Analysis",
    };
    return names[agentId];
  };

  const getConfidenceLevel = (
    score: number,
  ): {
    label: string;
    color: string;
  } => {
    if (score >= 0.8) return { label: "High", color: "text-green-600" };
    if (score >= 0.6) return { label: "Medium", color: "text-yellow-600" };
    return { label: "Low", color: "text-red-600" };
  };

  // Calculate radar chart points (Pentagon)
  const calculateRadarPoints = () => {
    const centerX = 150;
    const centerY = 150;
    const radius = 100;
    const angleStep = (2 * Math.PI) / 5;
    const startAngle = -Math.PI / 2; // Start at top

    return agents.map((agent, index) => {
      const confidence = consensus.agent_confidence_scores[agent] || 0;
      const angle = startAngle + index * angleStep;
      const distance = confidence * radius;

      return {
        agent,
        confidence,
        x: centerX + distance * Math.cos(angle),
        y: centerY + distance * Math.sin(angle),
        labelX: centerX + (radius + 30) * Math.cos(angle),
        labelY: centerY + (radius + 30) * Math.sin(angle),
      };
    });
  };

  const points = calculateRadarPoints();
  const pathData = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Draw background grid circles
  const gridCircles = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={20} className="text-indigo-600" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            MARAG Consensus Analysis
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            title="Toggle details"
          >
            <Info size={16} className="text-zinc-600 dark:text-zinc-400" />
          </button>
          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-full">
            {Math.round(consensus.consensus_score * 100)}% Consensus
          </span>
        </div>
      </div>

      {/* Radar Chart SVG */}
      <div className="flex justify-center mb-6">
        <svg width="300" height="300" viewBox="0 0 300 300">
          {/* Background grid circles */}
          {gridCircles.map((scale) => (
            <circle
              key={scale}
              cx="150"
              cy="150"
              r={100 * scale}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-zinc-300 dark:text-zinc-600"
              strokeDasharray="2,2"
            />
          ))}

          {/* Grid lines from center */}
          {points.map((point, index) => (
            <line
              key={`line-${index}`}
              x1="150"
              y1="150"
              x2={point.labelX}
              y2={point.labelY}
              stroke="currentColor"
              strokeWidth="1"
              className="text-zinc-300 dark:text-zinc-600"
              strokeDasharray="2,2"
            />
          ))}

          {/* Confidence polygon */}
          <polygon
            points={pathData}
            fill="rgba(99, 102, 241, 0.2)"
            stroke="rgb(99, 102, 241)"
            strokeWidth="2"
          />

          {/* Agent points */}
          {points.map((point) => (
            <g key={point.agent}>
              {/* Point */}
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill={getAgentColor(point.agent)}
                stroke="white"
                strokeWidth="2"
              />

              {/* Label */}
              <text
                x={point.labelX}
                y={point.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-medium fill-zinc-700 dark:fill-zinc-300"
              >
                {point.agent}
              </text>

              {/* Confidence value */}
              <text
                x={point.labelX}
                y={point.labelY + 12}
                textAnchor="middle"
                className="text-xs fill-zinc-500 dark:fill-zinc-400"
              >
                {Math.round(point.confidence * 100)}%
              </text>
            </g>
          ))}

          {/* Center consensus score */}
          <g>
            <circle
              cx="150"
              cy="150"
              r="25"
              fill="white"
              stroke="rgb(99, 102, 241)"
              strokeWidth="2"
              className="dark:fill-zinc-800"
            />
            <text
              x="150"
              y="145"
              textAnchor="middle"
              className="text-xs font-medium fill-zinc-600 dark:fill-zinc-400"
            >
              Consensus
            </text>
            <text
              x="150"
              y="160"
              textAnchor="middle"
              className="text-lg font-bold fill-indigo-600"
            >
              {Math.round(consensus.consensus_score * 100)}%
            </text>
          </g>
        </svg>
      </div>

      {/* Agent Confidence List */}
      {!compact && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {agents.map((agent) => {
            const confidence = consensus.agent_confidence_scores[agent] || 0;
            const level = getConfidenceLevel(confidence);
            return (
              <div
                key={agent}
                className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3"
              >
                <div
                  className="w-3 h-3 rounded-full mb-2"
                  style={{ backgroundColor: getAgentColor(agent) }}
                ></div>
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  {getAgentName(agent)}
                </p>
                <p className="text-lg font-bold text-zinc-900 dark:text-white">
                  {Math.round(confidence * 100)}%
                </p>
                <p className={`text-xs font-medium ${level.color}`}>
                  {level.label}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Information */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Weighted Final Score */}
            <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Weighted Final Score
              </h4>
              <p className="text-2xl font-bold text-indigo-600">
                {consensus.collaborative_risk_assessment.weighted_final_score}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                Risk Score (0-100)
              </p>
            </div>

            {/* Confidence Interval */}
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Confidence Interval
              </h4>
              <p className="text-xl font-bold text-blue-600">
                [
                {
                  consensus.collaborative_risk_assessment
                    .uncertainty_quantification.confidence_interval[0]
                }
                ,{" "}
                {
                  consensus.collaborative_risk_assessment
                    .uncertainty_quantification.confidence_interval[1]
                }
                ]
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                95% Confidence
              </p>
            </div>

            {/* Conflicts Resolved */}
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Conflicts Resolved
              </h4>
              <p className="text-2xl font-bold text-green-600">
                {
                  consensus.evidence_triangulation.conflict_resolution
                    .conflicts_resolved
                }
                /
                {
                  consensus.evidence_triangulation.conflict_resolution
                    .conflicts_detected
                }
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                {
                  consensus.evidence_triangulation.conflict_resolution
                    .resolution_method
                }
              </p>
            </div>
          </div>

          {/* Uncertainty Sources */}
          {consensus.collaborative_risk_assessment.uncertainty_quantification
            .uncertainty_sources.length > 0 && (
            <div className="mt-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-1">
                <Info size={12} />
                Uncertainty Sources
              </h4>
              <ul className="space-y-1">
                {consensus.collaborative_risk_assessment.uncertainty_quantification.uncertainty_sources.map(
                  (source, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-1"
                    >
                      <span>[WARNING]</span>
                      <span>{source}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
