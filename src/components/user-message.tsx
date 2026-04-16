import * as Avatar from "@radix-ui/react-avatar";
import type { Attachment } from "@relevanceai/sdk";
import {
  AlertCircle,
  Check,
  Copy,
  FileText,
  Pencil,
  RefreshCw,
  X,
} from "lucide-react";
import { useState } from "preact/hooks";
import TimeAgo from "react-timeago";
import {
  compactView,
  editMessage,
  retryFailedMessage,
  showToast,
} from "@/signals";

/**
 * Parses simple markdown syntax in user messages.
 * Supports: **bold**, *italic*, [links](url), and line breaks.
 * HTML is escaped for security.
 */
function parseUserMarkdown(text: string): string {
  if (!text) return "";

  // Escape HTML characters to prevent XSS
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Apply markdown formatting
  html = html
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // **bold**
    .replace(/\*(.*?)\*/g, "<em>$1</em>") // *italic*
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline opacity-90 hover:opacity-100 break-all">$1</a>',
    ) // [text](url)
    .replace(/\n/g, "<br>"); // Line breaks

  return html;
}

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
  // Component state
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.text);

  // Copy message text to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      showToast("Message copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (_error) {
      showToast("Failed to copy message", "error");
    }
  };

  // Retry sending a failed message
  const handleRetry = () => {
    retryFailedMessage(message.id);
  };

  // Enter edit mode
  const handleEdit = () => {
    setIsEditing(true);
    setEditedText(message.text);
  };

  // Save edited message
  const handleSaveEdit = () => {
    if (!editedText.trim()) {
      showToast("Message cannot be empty", "error");
      return;
    }
    editMessage(message.id, editedText.trim());
    setIsEditing(false);
  };

  // Cancel editing and revert to original text
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedText(message.text);
  };

  // Keyboard shortcuts for edit mode: Ctrl+Enter to save, Escape to cancel
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  return (
    <div
      class={`flex items-start gap-x-2 w-full max-w-full self-end flex-row-reverse group ${compactView.value ? "mb-2" : ""}`}
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
        {/* Message header with timestamp and action buttons */}
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

          {/* Action buttons: retry, edit, copy */}
          <div class="flex items-center gap-x-1">
            {/* Show retry button only for failed messages */}
            {message.status === "failed" && (
              <button
                onClick={handleRetry}
                class="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                title="Retry sending message"
              >
                <RefreshCw size={14} class="text-red-600 dark:text-red-400" />
              </button>
            )}

            {/* Show edit button only for sent messages (not during sending or editing) */}
            {message.status !== "sending" &&
              message.id !== "optimistic" &&
              !isEditing && (
                <button
                  onClick={handleEdit}
                  class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                  title="Edit message"
                >
                  <Pencil size={14} class="text-zinc-500 dark:text-zinc-400" />
                </button>
              )}

            {/* Copy button - always available */}
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
        {/* Message content: either edit mode or display mode */}
        <div class="flex flex-col gap-y-2 items-end w-full">
          {isEditing ? (
            // Edit mode: textarea with save/cancel buttons
            <div class="w-full max-w-full flex flex-col gap-y-2">
              <textarea
                value={editedText}
                onInput={(e) =>
                  setEditedText((e.target as HTMLTextAreaElement).value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Edit your message..."
                class="w-full min-h-20 max-h-60 py-2 px-4 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-indigo-500 dark:border-indigo-600 text-zinc-900 dark:text-zinc-100 resize-none focus:outline-none"
                autoFocus
              />
              <div class="flex items-center gap-x-2 justify-end">
                <button
                  onClick={handleCancelEdit}
                  class="px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 text-sm font-medium transition-colors flex items-center gap-x-1"
                >
                  <X size={14} />
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  class="px-3 py-1.5 rounded-lg bg-indigo-500 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-sm font-medium transition-colors flex items-center gap-x-1"
                >
                  <Check size={14} />
                  Save (Ctrl+Enter)
                </button>
              </div>
            </div>
          ) : (
            // Display mode: rendered message with styling
            <div
              class={`relative py-2 px-4 rounded-3xl rounded-tr-xs max-w-full ${
                message.status === "failed"
                  ? "bg-red-500/20 dark:bg-red-900/30 border border-red-500/50"
                  : "bg-indigo-500 dark:bg-indigo-600"
              } text-white transition-colors ${compactView.value ? "py-1.5 px-3" : ""}`}
            >
              <div
                class={`text-end wrap-break-word ${compactView.value ? "text-sm" : ""}`}
                // biome-ignore lint/security/noDangerouslySetInnerHtml: content is user-supplied text with HTML-escaped, link-only markdown
                dangerouslySetInnerHTML={{
                  __html: parseUserMarkdown(message.text),
                }}
              />
              {/* Show error message for failed sends */}
              {message.status === "failed" && (
                <div class="flex items-center gap-x-1 mt-1 text-xs text-red-200">
                  <AlertCircle size={12} />
                  <span>{message.errorMessage || "Failed to send"}</span>
                </div>
              )}
            </div>
          )}

          {/* Display file attachments if present */}
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
