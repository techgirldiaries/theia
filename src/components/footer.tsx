import { Paperclip, SendHorizonal, X } from "lucide-react";
import type { SubmitEventHandler } from "preact";
import { useCallback, useRef, useState, useEffect } from "preact/hooks";
import { QuickTemplates } from "@/components/quick-templates";
import {
  addDataset,
  agent,
  client,
  isAgentTyping,
  messages,
  startPerformanceTracking,
  task,
  workforce,
  messageDraft,
  logAuditEntry,
} from "@/signals";
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

export function Footer() {
  const input = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const dropZone = useRef<HTMLDivElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Load saved draft on mount
  useEffect(() => {
    if (input.current && messageDraft.value) {
      input.current.value = messageDraft.value;
      handleInput();
    }
  }, []);

  // Save draft when input changes
  const handleDraftChange = useCallback(() => {
    if (input.current) {
      messageDraft.value = input.current.value;
    }
  }, []);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
      logAuditEntry(
        "upload",
        `Dropped ${files.length} file(s) via drag-and-drop`,
      );
    }
  }, []);

  // Template selection handler
  const handleSelectTemplate = useCallback((prompt: string) => {
    if (input.current) {
      input.current.value = prompt;
      messageDraft.value = prompt;
      handleInput();
      input.current.focus();
    }
  }, []);

  // Helper to read CSV preview (first 5 rows)
  const readCSVPreview = async (file: File): Promise<string> => {
    try {
      const text = await file.text();
      const lines = text.split("\n").slice(0, 6); // Header + 5 rows
      return lines.join("\n");
    } catch (error) {
      console.error("Failed to read CSV preview:", error);
      return "";
    }
  };

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

  const handleInput = useCallback(() => {
    if (input.current) {
      // Auto-resize textarea
      input.current.style.height = "auto";
      input.current.style.height = `${Math.min(input.current.scrollHeight, 200)}px`;
      // Save draft
      messageDraft.value = input.current.value;
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Submit on Enter (without Shift), allow Shift+Enter for new lines
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const form = input.current?.closest("form");
        if (form && !isAgentTyping.value && !isUploading) {
          form.requestSubmit();
        }
      }
    },
    [isUploading],
  );

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
      let fileDetailsWithPreviews: string[] = [];

      if (selectedFiles.length > 0 && client.value) {
        setIsUploading(true);
        try {
          // Upload files and read previews in parallel
          const uploadPromises = selectedFiles.map((file) =>
            client.value!.uploadTempFile(file),
          );
          const previewPromises = selectedFiles.map((file) =>
            file.name.toLowerCase().endsWith(".csv")
              ? readCSVPreview(file)
              : Promise.resolve(""),
          );

          uploadedAttachments = await Promise.all(uploadPromises);
          const previews = await Promise.all(previewPromises);

          // Log audit entry
          logAuditEntry(
            "upload",
            `Uploaded ${selectedFiles.length} file(s): ${selectedFiles.map((f) => f.name).join(", ")}`,
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

            // Build detailed file info with preview
            let fileDetail = `- File: ${attachment.fileName}\n  URL: ${attachment.fileUrl}\n  Size: ${(file.size / 1024).toFixed(2)} KB`;
            if (previews[index]) {
              fileDetail += `\n  Preview (first 5 rows):\n\`\`\`csv\n${previews[index]}\n\`\`\``;
            }
            fileDetailsWithPreviews.push(fileDetail);
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
        const fileList = fileDetailsWithPreviews.join("\n\n");
        messageText = `${messageText}\n\n📎 Dataset Files:\n${fileList}\n\n✅ Instructions: The file(s) are uploaded and accessible at the URL(s) above. Please fetch and analyze the complete dataset from the provided URL(s). The preview shows the structure (column names and sample rows).`;
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
          status: "sending",
        } as Message,
      ];

      if (!workforce.value && !agent.value) {
        return;
      }

      // Send message and get/create task
      let t: any;
      if (workforce.value) {
        t = await workforce.value.sendMessage(messageText, task.value);
      } else if (agent.value) {
        if (task.value) {
          t = await agent.value.sendMessage(
            message?.trim() || "[Files attached]",
            uploadedAttachments,
            task.value,
          );
        } else {
          t = await agent.value.sendMessage(
            message?.trim() || "[Files attached]",
            uploadedAttachments,
          );
        }
      }

      // Update task reference and start tracking if it's a new task
      if (task.value !== t) {
        task.value = t;
        // Start tracking performance for this task
        startPerformanceTracking(t.id);
      }

      if (input.current) {
        input.current.value = "";
        input.current.style.height = "auto";
        input.current.focus();
      }
      setSelectedFiles([]);
      // Clear draft
      messageDraft.value = "";
    },
    [input, selectedFiles, isUploading],
  );

  return (
    <footer class="p-4 border-t border-zinc-500/25 sticky bottom-0 bg-white dark:bg-zinc-900 transition-colors">
      <div ref={dropZone} class="max-w-3xl mx-auto">
        {/* Drag-and-drop overlay */}
        {isDragging && (
          <div
            class="fixed inset-0 bg-indigo-500/20 backdrop-blur-sm z-40 flex items-center justify-center pointer-events-none"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div class="bg-white dark:bg-zinc-900 border-2 border-dashed border-indigo-500 rounded-lg p-8 text-center">
              <Paperclip size={48} class="mx-auto mb-2 text-indigo-500" />
              <p class="text-xl font-semibold text-zinc-900 dark:text-white">
                Drop files here
              </p>
              <p class="text-sm text-zinc-600 dark:text-zinc-400">
                CSV, JSON, and other data files
              </p>
            </div>
          </div>
        )}

        {/* Quick Templates */}
        {messages.value.length === 0 && (
          <QuickTemplates onSelectTemplate={handleSelectTemplate} />
        )}

        <form
          class="flex flex-col gap-y-2"
          onSubmit={handleSubmit}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
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
          <div class="flex items-end gap-x-2">
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
              class="p-3 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer outline-indigo-500 outline-offset-3 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              aria-label="Attach file"
            >
              <Paperclip size={24} strokeWidth={1.5} />
            </button>
            <textarea
              ref={input}
              placeholder="Analyse transaction data, detect fraud patterns or ask about risk scoring..."
              disabled={isUploading}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              rows={1}
              class="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-3 rounded-2xl outline-indigo-500 outline-offset-3 text-zinc-800 dark:text-white dark:placeholder-zinc-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-none max-h-50 overflow-y-auto"
              name="message"
            />
            <button
              type="submit"
              disabled={isUploading || isAgentTyping.value}
              class="bg-indigo-500 dark:bg-indigo-600 text-white rounded-full p-3 cursor-pointer hover:bg-indigo-600 dark:hover:bg-indigo-700 active:bg-indigo-700 dark:active:bg-indigo-800 outline-indigo-500 outline-offset-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              aria-label="Send message"
            >
              <SendHorizonal size={24} strokeWidth={1.5} />
            </button>
          </div>
        </form>
      </div>
    </footer>
  );
}
