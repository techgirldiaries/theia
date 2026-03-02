import * as Avatar from "@radix-ui/react-avatar";
import TimeAgo from "react-timeago";
import { agentAvatar, agentInitials, agentName } from "@/signals";
import { RiskBadge } from "@/components/risk-badge";

type Message = {
  id: string;
  type: "agent-message" | "user-message";
  text: string;
  createdAt: Date;
  isAgent: () => boolean;
};

interface AgentMessageProps {
  message: Message;
}

export function AgentMessage({ message }: AgentMessageProps) {
  // Extract risk score if present in message text
  const riskScoreMatch = message.text.match(/Risk Score[:\s]+(\d+)/i);
  const riskScore = riskScoreMatch ? parseInt(riskScoreMatch[1]) : null;

  return (
    <div class="flex items-start gap-x-2 pr-12 md:pr-0 md:max-w-4/6 self-start">
      <div class="shrink-0">
        <Avatar.Root>
          <Avatar.Image
            src={agentAvatar}
            class="size-10 rounded-full border border-zinc-200 dark:border-zinc-700"
          />
          <Avatar.Fallback>{agentInitials}</Avatar.Fallback>
        </Avatar.Root>
      </div>
      <div class="flex flex-col gap-y-1 items-start">
        <small class="flex gap-x-1.5">
          <span class="text-zinc-700 dark:text-zinc-300">{agentName}</span>{" "}
          <span class="text-zinc-500 dark:text-zinc-400">
            <TimeAgo date={message.createdAt} />
          </span>
        </small>
        {riskScore !== null && (
          <div class="mb-2">
            <RiskBadge score={riskScore} />
          </div>
        )}
        <div class="py-2 px-4 rounded-3xl rounded-tl-xs bg-zinc-200 dark:bg-zinc-800 transition-colors">
          <div class="text-zinc-800 dark:text-white prose prose-sm dark:prose-invert max-w-none">
            <p class="whitespace-pre-wrap">{message.text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
