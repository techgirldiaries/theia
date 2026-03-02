import * as Avatar from "@radix-ui/react-avatar";
import { FileText } from "lucide-react";
import TimeAgo from "react-timeago";
import { agentAvatar, agentInitials, agentName } from "@/signals";
import { RiskBadge } from "@/components/risk-badge";
import { FraudReport } from "@/components/fraud-report";
import { isFraudReport, parseFraudReport } from "@/utils/parse-fraud-report";
import type { Attachment } from "@relevanceai/sdk";

type Message = {
  id: string;
  type: "agent-message" | "user-message";
  text: string;
  createdAt: Date;
  isAgent: () => boolean;
  attachments?: Attachment[];
};

interface AgentMessageProps {
  message: Message;
}

export function AgentMessage({ message }: AgentMessageProps) {
  // Check if message is a fraud report
  const isFraud = isFraudReport(message.text);
  const parsedReport = isFraud ? parseFraudReport(message.text) : null;

  // Extract risk score if present in message text (for non-fraud-report messages)
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

        {/* Render FraudReport component if this is a parsed fraud report */}
        {parsedReport ? (
          <FraudReport {...parsedReport} />
        ) : (
          <>
            {riskScore !== null && (
              <div class="mb-2">
                <RiskBadge score={riskScore} />
              </div>
            )}
            <div class="flex flex-col gap-y-2">
              <div class="py-2 px-4 rounded-3xl rounded-tl-xs bg-zinc-200 dark:bg-zinc-800 transition-colors">
                <div class="text-zinc-800 dark:text-white prose prose-sm dark:prose-invert max-w-none">
                  <p class="whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
              {message.attachments && message.attachments.length > 0 && (
                <div class="flex flex-col gap-y-1">
                  {message.attachments.map((attachment) => (
                    <a
                      key={attachment.fileUrl}
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex items-center gap-x-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-full text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                    >
                      <FileText size={14} strokeWidth={2} />
                      <span class="truncate max-w-40">
                        {attachment.fileName}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
