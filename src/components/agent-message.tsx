import * as Avatar from "@radix-ui/react-avatar";
import { FileText, Copy, Check } from "lucide-react";
import TimeAgo from "react-timeago";
import { useState } from "preact/hooks";
import { agentAvatar, agentInitials, agentName, showToast, compactView } from "@/signals";
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
  status?: "sending" | "sent" | "failed";
  read?: boolean;
};

interface AgentMessageProps {
  message: Message;
}

export function AgentMessage({ message }: AgentMessageProps) {
  const [copied, setCopied] = useState(false);
  
  // Check if message is a fraud report
  const isFraud = isFraudReport(message.text);
  const parsedReport = isFraud ? parseFraudReport(message.text) : null;

  // Extract risk score if present in message text (for non-fraud-report messages)
  const riskScoreMatch = message.text.match(/Risk Score[:\s]+(\d+)/i);
  const riskScore = riskScoreMatch ? parseInt(riskScoreMatch[1]) : null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      showToast("Message copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showToast("Failed to copy message", "error");
    }
  };

  return (
    <div class={`flex items-start gap-x-2 pr-12 md:pr-0 md:max-w-4/6 self-start group ${compactView.value ? 'mb-2' : ''}`}>
      <div class="shrink-0">
        <Avatar.Root>
          <Avatar.Image
            src={agentAvatar}
            class="size-10 rounded-full border border-zinc-200 dark:border-zinc-700"
          />
          <Avatar.Fallback>{agentInitials}</Avatar.Fallback>
        </Avatar.Root>
      </div>
      <div class="flex flex-col gap-y-1 items-start flex-1">
        <div class="flex items-center justify-between w-full">
          <small class="flex gap-x-1.5">
            <span class="text-zinc-700 dark:text-zinc-300">{agentName}</span>{" "}
            <span class="text-zinc-500 dark:text-zinc-400" title={message.createdAt.toLocaleString()}>
              <TimeAgo date={message.createdAt} />
            </span>
          </small>
          <button
            onClick={handleCopy}
            class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
            title="Copy message"
          >
            {copied ? (
              <Check size={14} class="text-green-600 dark:text-green-400" />
            ) : (
              <Copy size={14} class="text-zinc-500 dark:text-zinc-400" />
            )}
          </button>
        </div>

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
              <div class={`py-2 px-4 rounded-3xl rounded-tl-xs bg-zinc-200 dark:bg-zinc-800 transition-colors ${compactView.value ? 'py-1.5 px-3' : ''}`}>
                <div class={`text-zinc-800 dark:text-white prose prose-sm dark:prose-invert max-w-none ${compactView.value ? 'text-sm' : ''}`}>
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
