import * as Avatar from "@radix-ui/react-avatar";
import { FileText, Copy, Check, RefreshCw, AlertCircle } from "lucide-react";
import TimeAgo from "react-timeago";
import { useState } from "preact/hooks";
import { showToast, compactView, retryFailedMessage } from "@/signals";
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
  errorMessage?: string;
};

interface UserMessageProps {
  message: Message;
}

export function UserMessage({ message }: UserMessageProps) {
  const [copied, setCopied] = useState(false);

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

  const handleRetry = () => {
    retryFailedMessage(message.id);
  };

  return (
    <div
      class={`flex items-start gap-x-2 pl-12 md:pl-0 md:max-w-4/6 self-end flex-row-reverse group ${compactView.value ? "mb-2" : ""}`}
    >
      <div class="shrink-0">
        <Avatar.Root>
          <Avatar.Image
            src="/default-user-avatar.png"
            class="size-10 rounded-full border border-zinc-200 dark:border-zinc-700"
          />
          <Avatar.Fallback asChild>
            <div class="p-2 bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 font-semibold rounded-full transition-colors">
              ME
            </div>
          </Avatar.Fallback>
        </Avatar.Root>
      </div>
      <div class="flex flex-col gap-y-1 items-end flex-1">
        <div class="flex items-center justify-between w-full flex-row-reverse">
          <small class="flex gap-x-1.5 flex-row-reverse">
            <span class="text-zinc-700 dark:text-zinc-300">You</span>{" "}
            {message.id === "optimistic" || message.status === "sending" ? (
              <span class="text-zinc-500 dark:text-zinc-400">sending...</span>
            ) : (
              <span
                class="text-zinc-500 dark:text-zinc-400"
                title={message.createdAt.toLocaleString()}
              >
                <TimeAgo date={message.createdAt} />
              </span>
            )}
          </small>
          <div class="flex items-center gap-x-1">
            {message.status === "failed" && (
              <button
                onClick={handleRetry}
                class="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                title="Retry sending message"
              >
                <RefreshCw size={14} class="text-red-600 dark:text-red-400" />
              </button>
            )}
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
        </div>
        <div class="flex flex-col gap-y-2 items-end">
          <div
            class={`relative py-2 px-4 rounded-3xl rounded-tr-xs ${
              message.status === "failed"
                ? "bg-red-500/20 dark:bg-red-900/30 border border-red-500/50"
                : "bg-indigo-500 dark:bg-indigo-600"
            } text-white transition-colors ${compactView.value ? "py-1.5 px-3" : ""}`}
          >
            <p class={`text-end ${compactView.value ? "text-sm" : ""}`}>
              {message.text}
            </p>
            {message.status === "failed" && (
              <div class="flex items-center gap-x-1 mt-1 text-xs text-red-200">
                <AlertCircle size={12} />
                <span>{message.errorMessage || "Failed to send"}</span>
              </div>
            )}
          </div>
          {message.attachments && message.attachments.length > 0 && (
            <div class="flex flex-col gap-y-1">
              {message.attachments.map((attachment) => (
                <a
                  key={attachment.fileUrl}
                  href={attachment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-x-2 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-full text-sm text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  <FileText size={14} strokeWidth={2} />
                  <span class="truncate max-w-40">{attachment.fileName}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
