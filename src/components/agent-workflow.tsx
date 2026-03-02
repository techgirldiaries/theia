interface AgentPhase {
  phase: number;
  name: string;
  agents: string[];
  status: "pending" | "active" | "completed";
}

interface AgentWorkflowProps {
  currentPhase?: number;
}

export function AgentWorkflow({ currentPhase = 0 }: AgentWorkflowProps) {
  const phases: AgentPhase[] = [
    {
      phase: 0,
      name: "Data Acquisition",
      agents: ["DATA ACQUISITION"],
      status:
        currentPhase > 0
          ? "completed"
          : currentPhase === 0
            ? "active"
            : "pending",
    },
    {
      phase: 1,
      name: "Ingestion & Assessment",
      agents: ["INGESTION", "MONITOR", "PATTERN-DRIFT"],
      status:
        currentPhase > 1
          ? "completed"
          : currentPhase === 1
            ? "active"
            : "pending",
    },
    {
      phase: 2,
      name: "Intelligence Gathering",
      agents: ["THEIA-RETRIEVAL", "OSINT/THREAT", "ENTITY_GRAPH"],
      status:
        currentPhase > 2
          ? "completed"
          : currentPhase === 2
            ? "active"
            : "pending",
    },
    {
      phase: 3,
      name: "Behavioural & Compliance",
      agents: ["BEHAVIOURAL", "KYC_SANCTIONS", "MERCHANT-GEO"],
      status:
        currentPhase > 3
          ? "completed"
          : currentPhase === 3
            ? "active"
            : "pending",
    },
    {
      phase: 4,
      name: "Decision & Governance",
      agents: ["CLASSIFIER", "THEIA-REASONING", "COMPLIANCE-SAR", "GOVERNANCE"],
      status:
        currentPhase > 4
          ? "completed"
          : currentPhase === 4
            ? "active"
            : "pending",
    },
    {
      phase: 5,
      name: "Supervisory Oversight",
      agents: ["FRAUD-SUPERVISOR"],
      status: currentPhase >= 5 ? "completed" : "pending",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500 dark:bg-green-600";
      case "active":
        return "bg-blue-500 dark:bg-blue-600 animate-pulse";
      case "pending":
      default:
        return "bg-zinc-300 dark:bg-zinc-700";
    }
  };

  return (
    <div class="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <h3 class="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        Theia Workflow Status
      </h3>
      <div class="space-y-2">
        {phases.map((phase) => (
          <div key={phase.phase} class="flex items-start gap-x-3">
            <div
              class={`mt-1 w-3 h-3 rounded-full ${getStatusColor(phase.status)}`}
            />
            <div class="flex-1">
              <p class="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                Phase {phase.phase}: {phase.name}
              </p>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">
                {phase.agents.join(" → ")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
