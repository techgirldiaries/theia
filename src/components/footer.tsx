import { Paperclip, SendHorizonal, X } from "lucide-react";
import type { SubmitEventHandler } from "preact";
import { useCallback, useRef, useState } from "preact/hooks";
import {
  addDataset,
  agent,
  client,
  isAgentTyping,
  messages,
  startPerformanceTracking,
  task,
  workforce,
} from "@/signals";
import type { Attachment } from "@relevanceai/sdk";

type Message = {
  id: string;
  type: "agent-message" | "user-message";
  text: string;
  createdAt: Date;
  isAgent: () => boolean;
  attachments?: Attachment[];
};

export function Footer() {
  const input = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback(() => {
    fileInput.current?.click();
  }, []);

  const handleFileChange = useCallback(() => {
    const files = fileInput.current?.files;
    if (files && files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
      if (fileInput.current) {
        fileInput.current.value = "";
      }
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback<SubmitEventHandler<HTMLFormElement>>(
    async (e) => {
      e.preventDefault();

      if (isAgentTyping.value || isUploading) {
        return;
      }

      const form = e.currentTarget;
      const data = new FormData(form);
      const message = data.get("message") as string | null;
      if (!message?.trim() && selectedFiles.length === 0) {
        return;
      }

      // Upload files first if any are selected
      let uploadedAttachments: Attachment[] = [];
      if (selectedFiles.length > 0 && client.value) {
        setIsUploading(true);
        try {
          uploadedAttachments = await Promise.all(
            selectedFiles.map((file) => client.value!.uploadTempFile(file)),
          );

          // Store dataset info for multi-agent access
          uploadedAttachments.forEach((attachment, index) => {
            const file = selectedFiles[index];
            addDataset({
              id: `dataset-${Date.now()}-${index}`,
              fileName: attachment.fileName,
              fileUrl: attachment.fileUrl,
              uploadedAt: new Date(),
              size: file.size,
            });
          });
        } catch (error) {
          console.error("Failed to upload files:", error);
          alert("Failed to upload files. Please try again.");
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      // Build message with file information
      let messageText = message?.trim() || "";
      if (uploadedAttachments.length > 0) {
        const fileList = uploadedAttachments
          .map((att) => `- ${att.fileName}`)
          .join("\n");
        messageText = `${messageText}\n\nAttached files:\n${fileList}`;
      }

      messages.value = [
        ...messages.value,
        {
          id: "optimistic",
          type: "user-message",
          text: message?.trim() || "[Files attached]",
          createdAt: new Date(),
          isAgent: () => false,
          attachments: uploadedAttachments,
        } as Message,
      ];

      if (!workforce.value && !agent.value) {
        return;
      }

      const t = workforce.value
        ? await workforce.value.sendMessage(messageText, task.value!)
        : await agent.value!.sendMessage(
            message?.trim() || "[Files attached]",
            uploadedAttachments,
            task.value!,
          );
      if (task.value !== t) {
        task.value = t;
        // Start tracking performance for this task
        startPerformanceTracking(t.id);
      }

      if (input.current) {
        input.current.value = "";
        input.current.focus();
      }
      setSelectedFiles([]);
    },
    [input, selectedFiles, isUploading],
  );

  return (
    <footer class="p-4 border-t border-zinc-500/25 sticky bottom-0 bg-white dark:bg-zinc-900 transition-colors">
      <form
        class="max-w-3xl mx-auto flex flex-col gap-y-2"
        onSubmit={handleSubmit}
      >
        {selectedFiles.length > 0 && (
          <div class="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                class="flex items-center gap-x-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-full text-sm text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                <span class="truncate max-w-50">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  class="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
                  aria-label={`Remove ${file.name}`}
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}
        {isUploading && (
          <div class="flex items-center gap-x-2 text-sm text-indigo-600 dark:text-indigo-400">
            <div class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-solid border-indigo-600 dark:border-indigo-400 border-r-transparent"></div>
            <span>Uploading files...</span>
          </div>
        )}
        <div class="flex items-center gap-x-2">
          <input
            ref={fileInput}
            type="file"
            multiple
            class="hidden"
            onChange={handleFileChange}
            aria-label="File input"
          />
          <button
            type="button"
            onClick={handleFileSelect}
            disabled={isUploading || isAgentTyping.value}
            class="p-3 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer outline-indigo-500 outline-offset-3 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Attach file"
          >
            <Paperclip size={24} strokeWidth={1.5} />
          </button>
          <input
            ref={input}
            type="text"
            placeholder="Analyse transaction data, detect fraud patterns or ask about risk scoring..."
            disabled={isUploading}
            class="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-3 rounded-full outline-indigo-500 outline-offset-3 text-zinc-800 dark:text-white dark:placeholder-zinc-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            name="message"
          />
          <button
            type="submit"
            disabled={isUploading || isAgentTyping.value}
            class="bg-indigo-500 dark:bg-indigo-600 text-white rounded-full p-3 cursor-pointer hover:bg-indigo-600 dark:hover:bg-indigo-700 active:bg-indigo-700 dark:active:bg-indigo-800 outline-indigo-500 outline-offset-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <SendHorizonal size={24} strokeWidth={1.5} />
          </button>
        </div>
      </form>
    </footer>
  );
}
