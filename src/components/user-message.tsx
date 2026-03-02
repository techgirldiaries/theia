import * as Avatar from "@radix-ui/react-avatar";
import { FileText } from "lucide-react";
import TimeAgo from "react-timeago";
import type { Attachment } from "@relevanceai/sdk";

type Message = {
  id: string;
  type: "agent-message" | "user-message";
  text: string;
  createdAt: Date;
  isAgent: () => boolean;
  attachments?: Attachment[];
};

interface UserMessageProps {
  message: Message;
}

export function UserMessage({ message }: UserMessageProps) {
  return (
    <div class="flex items-start gap-x-2 pl-12 md:pl-0 md:max-w-4/6 self-end flex-row-reverse">
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
      <div class="flex flex-col gap-y-1 items-end">
        <small class="flex gap-x-1.5 flex-row-reverse">
          <span class="text-zinc-700 dark:text-zinc-300">You</span>{" "}
          {message.id === "optimistic" ? (
            <span class="text-zinc-500 dark:text-zinc-400">sending...</span>
          ) : (
            <span class="text-zinc-500 dark:text-zinc-400">
              <TimeAgo date={message.createdAt} />
            </span>
          )}
        </small>
        <div class="flex flex-col gap-y-2 items-end">
          <div class="py-2 px-4 rounded-3xl rounded-tr-xs bg-indigo-500 dark:bg-indigo-600 text-white transition-colors">
            <p class="text-end">{message.text}</p>
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
