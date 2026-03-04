import { useState, useEffect } from "preact/hooks";
import { signal, computed } from "@preact/signals";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Flag,
  Loader2,
  Scale,
  Shield,
  TrendingUp,
  User,
  Users,
  MessageCircle,
  ArrowUpRight,
  AlertCircle,
  Eye,
  Play,
  Pause,
  RotateCcw,
  UserCheck,
  Timer,
  Activity,
} from "lucide-react";

export interface CaseMetadata {
  id: string;
  title: string;
  priority: "low" | "medium" | "high" | "critical";
  status:
    | "initial"
    | "investigation"
    | "analysis"
    | "review"
    | "resolved"
    | "escalated";
  riskScore: number;
  confidenceLevel: number;
  assignedTo?: {
    type: "ai" | "human" | "hybrid";
    name: string;
    id: string;
  };
  createdAt: Date;
  updatedAt: Date;
  estimatedCompletion?: Date;
  actualCompletion?: Date;
  slaStatus: "within" | "approaching" | "breached";
  escalationLevel: number; // 0-3 (0=none, 1=supervisor, 2=manager, 3=executive)
  tags: string[];
  category:
    | "ATO"
    | "Payment Fraud"
    | "Identity Fraud"
    | "Merchant Fraud"
    | "Unknown";
  datasetId?: string;
  transactionCount: number;
  totalAmount?: number;
}

export interface CaseActivity {
  id: string;
  caseId: string;
  timestamp: Date;
  type:
    | "status_change"
    | "assignment"
    | "escalation"
    | "comment"
    | "phase_complete"
    | "alert";
  performer: {
    type: "ai" | "human";
    name: string;
    id: string;
  };
  details: string;
  metadata?: Record<string, any>;
}

export interface EscalationRule {
  id: string;
  name: string;
  condition: {
    type: "risk_score" | "sla_time" | "confidence" | "manual";
    threshold?: number;
    timeLimit?: number; // in minutes
  };
  target: {
    level: number;
    assignTo?: string;
    notify: string[];
  };
  priority: "low" | "medium" | "high" | "critical";
  isActive: boolean;
}

export interface HandoffRequest {
  id: string;
  caseId: string;
  fromAgent: string;
  toHuman: string;
  reason:
    | "complexity"
    | "policy_violation"
    | "low_confidence"
    | "escalation"
    | "manual_review";
  status: "pending" | "accepted" | "rejected";
  requestedAt: Date;
  message?: string;
  context: {
    currentPhase: string;
    completedPhases: string[];
    riskFactors: string[];
    recommendations: string[];
  };
}

// Signals for case management
export const activeCases = signal<Map<string, CaseMetadata>>(new Map());
export const caseActivities = signal<Map<string, CaseActivity[]>>(new Map());
export const escalationRules = signal<EscalationRule[]>([
  {
    id: "high-risk",
    name: "High Risk Threshold",
    condition: { type: "risk_score", threshold: 75 },
    target: { level: 1, notify: ["supervisor@company.com"] },
    priority: "high",
    isActive: true,
  },
  {
    id: "sla-breach",
    name: "SLA Time Breach",
    condition: { type: "sla_time", timeLimit: 120 },
    target: { level: 2, notify: ["manager@company.com"] },
    priority: "critical",
    isActive: true,
  },
]);
export const pendingHandoffs = signal<HandoffRequest[]>([]);

const getPriorityColor = (priority: CaseMetadata["priority"]) => {
  switch (priority) {
    case "critical":
      return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950";
    case "high":
      return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950";
    case "medium":
      return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950";
    default:
      return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950";
  }
};

const getStatusColor = (status: CaseMetadata["status"]) => {
  switch (status) {
    case "resolved":
      return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950";
    case "escalated":
      return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950";
    case "review":
      return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950";
    case "analysis":
      return "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950";
    case "investigation":
      return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950";
    default:
      return "text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950";
  }
};

function CaseCard({
  caseData,
  onView,
  onEscalate,
  onReassign,
}: {
  caseData: CaseMetadata;
  onView: (caseId: string) => void;
  onEscalate: (caseId: string) => void;
  onReassign: (caseId: string) => void;
}) {
  const activities = caseActivities.value.get(caseData.id) || [];
  const recentActivity = activities[0];
  const timeSinceUpdate = recentActivity
    ? Math.floor(
        (Date.now() - recentActivity.timestamp.getTime()) / (1000 * 60),
      )
    : 0;

  const getSLAStatusColor = (slaStatus: CaseMetadata["slaStatus"]) => {
    switch (slaStatus) {
      case "breached":
        return "text-red-600 dark:text-red-400";
      case "approaching":
        return "text-yellow-600 dark:text-yellow-400";
      default:
        return "text-green-600 dark:text-green-400";
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-zinc-900 dark:text-white">
              {caseData.id}
            </h4>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(caseData.priority)}`}
            >
              {caseData.priority.toUpperCase()}
            </span>
            {caseData.escalationLevel > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full text-xs">
                <Flag size={12} />L{caseData.escalationLevel}
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
            {caseData.title}
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <span>{caseData.category}</span>
            <span>{caseData.transactionCount} transactions</span>
            {caseData.totalAmount && (
              <span>${caseData.totalAmount.toLocaleString()}</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div
            className={`text-2xl font-bold mb-1 ${
              caseData.riskScore > 70
                ? "text-red-600"
                : caseData.riskScore > 40
                  ? "text-yellow-600"
                  : "text-green-600"
            }`}
          >
            {caseData.riskScore}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Risk Score
          </div>
        </div>
      </div>

      {/* Status & Assignment */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(caseData.status)}`}
          >
            {caseData.status.replace("_", " ").toUpperCase()}
          </span>
          <span className={`text-xs ${getSLAStatusColor(caseData.slaStatus)}`}>
            SLA: {caseData.slaStatus}
          </span>
        </div>
        {caseData.assignedTo && (
          <div className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
            {caseData.assignedTo.type === "human" ? (
              <User size={12} />
            ) : caseData.assignedTo.type === "hybrid" ? (
              <Users size={12} />
            ) : (
              <Activity size={12} />
            )}
            <span>{caseData.assignedTo.name}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1">
          <span>Confidence: {caseData.confidenceLevel}%</span>
          <span>Updated {timeSinceUpdate}m ago</span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-indigo-500 transition-all"
            style={{ width: `${caseData.confidenceLevel}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {caseData.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded text-xs"
            >
              {tag}
            </span>
          ))}
          {caseData.tags.length > 2 && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              +{caseData.tags.length - 2}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onView(caseData.id)}
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            title="View case details"
          >
            <Eye size={14} />
          </button>
          {caseData.riskScore > 50 && (
            <button
              onClick={() => onEscalate(caseData.id)}
              className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 transition-colors"
              title="Escalate case"
            >
              <ArrowUpRight size={14} />
            </button>
          )}
          <button
            onClick={() => onReassign(caseData.id)}
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            title="Reassign case"
          >
            <UserCheck size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function HandoffPanel({
  handoffs,
  onAccept,
  onReject,
}: {
  handoffs: HandoffRequest[];
  onAccept: (handoffId: string) => void;
  onReject: (handoffId: string) => void;
}) {
  if (handoffs.length === 0) return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center gap-2">
        <AlertTriangle size={16} />
        Pending Human Review ({handoffs.length})
      </h4>
      <div className="space-y-3">
        {handoffs.map((handoff) => (
          <div
            key={handoff.id}
            className="bg-white dark:bg-zinc-800 rounded-lg p-3 border border-yellow-300 dark:border-yellow-700"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-medium text-zinc-900 dark:text-white text-sm">
                  Case {handoff.caseId}
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  Reason: {handoff.reason.replace("_", " ")} • Requested{" "}
                  {Math.floor(
                    (Date.now() - handoff.requestedAt.getTime()) / (1000 * 60),
                  )}
                  m ago
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAccept(handoff.id)}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                >
                  Accept
                </button>
                <button
                  onClick={() => onReject(handoff.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                >
                  Reject
                </button>
              </div>
            </div>

            {handoff.message && (
              <div className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">
                "{handoff.message}"
              </div>
            )}

            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Phase: {handoff.context.currentPhase} • Completed:{" "}
              {handoff.context.completedPhases.length}/16 phases
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface EnhancedCaseManagementProps {
  showHandoffs?: boolean;
  showEscalationRules?: boolean;
  compact?: boolean;
}

export function EnhancedCaseManagement({
  showHandoffs = true,
  showEscalationRules = false,
  compact = false,
}: EnhancedCaseManagementProps) {
  const cases = Array.from(activeCases.value.values());
  const handoffs = pendingHandoffs.value;
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    CaseMetadata["status"] | "all"
  >("all");
  const [filterPriority, setFilterPriority] = useState<
    CaseMetadata["priority"] | "all"
  >("all");

  // Initialize with sample data
  useEffect(() => {
    if (cases.length === 0) {
      const sampleCases = new Map<string, CaseMetadata>();

      // Add sample cases
      [
        "FRAUD-20241204-001",
        "FRAUD-20241204-002",
        "FRAUD-20241204-003",
      ].forEach((id, index) => {
        sampleCases.set(id, {
          id,
          title: `Suspicious Transaction Pattern ${index + 1}`,
          priority: ["high", "medium", "critical"][
            index
          ] as CaseMetadata["priority"],
          status: ["investigation", "analysis", "review"][
            index
          ] as CaseMetadata["status"],
          riskScore: [85, 62, 91][index],
          confidenceLevel: [78, 85, 72][index],
          assignedTo: {
            type: ["ai", "hybrid", "human"][index] as any,
            name: ["THEIA Agent", "Sarah & THEIA", "Alex Johnson"][index],
            id: "agent-001",
          },
          createdAt: new Date(Date.now() - (index + 1) * 3600000),
          updatedAt: new Date(Date.now() - index * 600000),
          slaStatus: ["approaching", "within", "breached"][
            index
          ] as CaseMetadata["slaStatus"],
          escalationLevel: [1, 0, 2][index],
          tags: [
            ["ATO", "High Volume"],
            ["Payment", "Cross-border"],
            ["Identity", "Synthetic"],
          ][index],
          category: ["ATO", "Payment Fraud", "Identity Fraud"][
            index
          ] as CaseMetadata["category"],
          transactionCount: [15, 8, 23][index],
          totalAmount: [150000, 45000, 890000][index],
        });
      });

      activeCases.value = sampleCases;

      // Add sample handoff
      pendingHandoffs.value = [
        {
          id: "handoff-001",
          caseId: "FRAUD-20241204-001",
          fromAgent: "THEIA Agent",
          toHuman: "fraud-analyst",
          reason: "low_confidence",
          status: "pending",
          requestedAt: new Date(Date.now() - 300000),
          message:
            "Complex pattern detected requiring human expertise in crypto fraud",
          context: {
            currentPhase: "phase-8",
            completedPhases: ["phase-0", "phase-1", "phase-2", "phase-3"],
            riskFactors: [
              "High transaction velocity",
              "New device",
              "Geo-location anomaly",
            ],
            recommendations: [
              "Manual review recommended",
              "Contact customer",
              "Place temporary hold",
            ],
          },
        },
      ];
    }
  }, []);

  const handleAcceptHandoff = (handoffId: string) => {
    const handoff = handoffs.find((h) => h.id === handoffId);
    if (handoff) {
      // Update case assignment
      const updatedCases = new Map(activeCases.value);
      const caseData = updatedCases.get(handoff.caseId);
      if (caseData) {
        caseData.assignedTo = {
          type: "human",
          name: "Current User",
          id: "user-001",
        };
        caseData.status = "review";
        updatedCases.set(handoff.caseId, caseData);
        activeCases.value = updatedCases;
      }

      // Remove handoff
      pendingHandoffs.value = handoffs.filter((h) => h.id !== handoffId);
    }
  };

  const handleRejectHandoff = (handoffId: string) => {
    pendingHandoffs.value = handoffs.filter((h) => h.id !== handoffId);
  };

  const handleViewCase = (caseId: string) => {
    setSelectedCase(caseId);
    // In a real implementation, this would open a detailed case view
    console.log("Viewing case:", caseId);
  };

  const handleEscalateCase = (caseId: string) => {
    const updatedCases = new Map(activeCases.value);
    const caseData = updatedCases.get(caseId);
    if (caseData) {
      caseData.escalationLevel = Math.min(3, caseData.escalationLevel + 1);
      caseData.status = "escalated";
      caseData.priority = "critical";
      updatedCases.set(caseId, caseData);
      activeCases.value = updatedCases;
    }
  };

  const handleReassignCase = (caseId: string) => {
    // In a real implementation, this would open a reassignment dialog
    console.log("Reassigning case:", caseId);
  };

  const filteredCases = cases.filter((c) => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (filterPriority !== "all" && c.priority !== filterPriority) return false;
    return true;
  });

  const stats = {
    total: cases.length,
    highRisk: cases.filter((c) => c.riskScore > 70).length,
    escalated: cases.filter((c) => c.escalationLevel > 0).length,
    pendingReview: cases.filter((c) => c.status === "review").length,
    slaBreach: cases.filter((c) => c.slaStatus === "breached").length,
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
              Case Management Dashboard
            </h3>
            <p
              className={`text-zinc-600 dark:text-zinc-400 ${compact ? "text-sm" : ""}`}
            >
              Executive oversight and AI-Human coordination
            </p>
          </div>
          <div
            className={`grid gap-4 ${compact ? "grid-cols-3 lg:grid-cols-5" : "grid-cols-2 md:grid-cols-5"} text-center`}
          >
            <div>
              <div
                className={`font-bold text-indigo-600 dark:text-indigo-400 ${compact ? "text-lg" : "text-2xl"}`}
              >
                {stats.total}
              </div>
              <div
                className={`text-zinc-600 dark:text-zinc-400 ${compact ? "text-xs" : "text-sm"}`}
              >
                Total Cases
              </div>
            </div>
            <div>
              <div
                className={`font-bold text-red-600 dark:text-red-400 ${compact ? "text-lg" : "text-2xl"}`}
              >
                {stats.highRisk}
              </div>
              <div
                className={`text-zinc-600 dark:text-zinc-400 ${compact ? "text-xs" : "text-sm"}`}
              >
                High Risk
              </div>
            </div>
            <div>
              <div
                className={`font-bold text-orange-600 dark:text-orange-400 ${compact ? "text-lg" : "text-2xl"}`}
              >
                {stats.escalated}
              </div>
              <div
                className={`text-zinc-600 dark:text-zinc-400 ${compact ? "text-xs" : "text-sm"}`}
              >
                Escalated
              </div>
            </div>
            <div>
              <div
                className={`font-bold text-blue-600 dark:text-blue-400 ${compact ? "text-lg" : "text-2xl"}`}
              >
                {stats.pendingReview}
              </div>
              <div
                className={`text-zinc-600 dark:text-zinc-400 ${compact ? "text-xs" : "text-sm"}`}
              >
                Pending Review
              </div>
            </div>
            <div>
              <div
                className={`font-bold text-red-600 dark:text-red-400 ${compact ? "text-lg" : "text-2xl"}`}
              >
                {stats.slaBreach}
              </div>
              <div
                className={`text-zinc-600 dark:text-zinc-400 ${compact ? "text-xs" : "text-sm"}`}
              >
                SLA Breach
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
              Status:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.currentTarget.value as any)}
              className={`border border-zinc-300 dark:border-zinc-600 rounded px-3 py-1 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white ${compact ? "text-sm" : ""}`}
            >
              <option value="all">All</option>
              <option value="initial">Initial</option>
              <option value="investigation">Investigation</option>
              <option value="analysis">Analysis</option>
              <option value="review">Review</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalated</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label
              className={`text-zinc-700 dark:text-zinc-300 ${compact ? "text-sm" : ""}`}
            >
              Priority:
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.currentTarget.value as any)}
              className={`border border-zinc-300 dark:border-zinc-600 rounded px-3 py-1 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white ${compact ? "text-sm" : ""}`}
            >
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Handoff Panel */}
      {showHandoffs && (
        <HandoffPanel
          handoffs={handoffs}
          onAccept={handleAcceptHandoff}
          onReject={handleRejectHandoff}
        />
      )}

      {/* Case Grid */}
      <div
        className={`grid gap-4 ${compact ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}
      >
        {filteredCases.map((caseData) => (
          <CaseCard
            key={caseData.id}
            caseData={caseData}
            onView={handleViewCase}
            onEscalate={handleEscalateCase}
            onReassign={handleReassignCase}
          />
        ))}
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
          <FileText size={48} className="mx-auto mb-4 opacity-50" />
          <p>No cases match the current filters</p>
        </div>
      )}
    </div>
  );
}
