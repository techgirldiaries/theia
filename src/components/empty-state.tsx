import * as Avatar from "@radix-ui/react-avatar";
import {
  agentAvatar,
  agentDescription,
  agentInitials,
  agentName,
} from "@/signals";
import { AgentWorkflow } from "@/components/agent-workflow";

export function EmptyState() {
  return (
    <div class="flex flex-col items-center justify-center min-h-[50vh] px-4">
      <Avatar.Root>
        <Avatar.Image
          src={agentAvatar}
          class="size-24 rounded-full border-2 border-zinc-200 dark:border-zinc-700 mb-4 transition-colors"
          alt={agentName}
        />
        <Avatar.Fallback class="size-24 rounded-full border-2 border-zinc-200 dark:border-zinc-700 mb-4 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
          {agentInitials}
        </Avatar.Fallback>
      </Avatar.Root>
      <h2 class="text-xl font-semibold text-zinc-900 dark:text-white mb-2 transition-colors">
        {agentName}
      </h2>
      <p class="text-center text-zinc-600 dark:text-zinc-400 max-w-md mb-6 transition-colors">
        {agentDescription.value ||
          "A multi-agent RAG system that analyses transaction patterns, evaluates behavioural risk and identifies potential fraud in real time. It generates evidence-based insights with full audit trails and transparent decision logic to support human analysts and regulatory accountability. Upload your approved dataset to begin structured, explainable analysis."}
      </p>
      <div class="w-full max-w-2xl">
        <AgentWorkflow currentPhase={0} />
      </div>
    </div>
  );
}
