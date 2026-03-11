import type { Attachment } from "@relevanceai/sdk";
import { Clock, Mic, MicOff, Paperclip, SendHorizonal, X } from "lucide-react";
import type { SubmitEventHandler } from "preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { AttachmentMenu, type RecentFile } from "@/components/attachment-menu";
import { ModeSelector } from "@/components/mode-selector";
import {
  addDataset,
  agent,
  agentMode,
  autoCompleteQuery,
  client,
  fraudAnalysisTerms,
  isAgentTyping,
  isVoiceRecording,
  logAuditEntry,
  messageDraft,
  messages,
  showAutoComplete,
  showToast,
  startPerformanceTracking,
  task,
  uploadedDatasets,
  workforce,
} from "@/signals";

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

const MAX_MESSAGE_LENGTH = 20_000;
const MAX_FILES = 5;
const MAX_PREVIEW_READ_BYTES = 128 * 1024;
const MAX_PREVIEW_LINES = 20;
const MAX_PREVIEW_CHARACTERS = 2_500;
const ALLOWED_MIME_TYPES = new Set([
  "text/csv",
  "application/json",
  "text/plain",
  "text/tab-separated-values",
  "application/vnd.ms-excel",
  "application/octet-stream", // some browsers report this for .csv
]);
const ALLOWED_EXTENSIONS = /\.(csv|json|txt|log|tsv)$/i;
const SUBMIT_COOLDOWN_MS = 2_000;

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }
  return `${bytes} B`;
}

function trimPreviewText(
  text: string,
  maxLines: number,
): { preview: string; wasTrimmed: boolean } {
  const normalized = text.replace(/\r\n/g, "\n").trimEnd();
  const lines = normalized.split("\n");
  const limitedLines = lines.slice(0, maxLines).join("\n").trimEnd();
  let preview = limitedLines;
  let wasTrimmed = lines.length > maxLines;

  if (preview.length > MAX_PREVIEW_CHARACTERS) {
    preview = preview.slice(0, MAX_PREVIEW_CHARACTERS).trimEnd();
    wasTrimmed = true;
  }

  if (wasTrimmed && preview.length > 0) {
    preview = `${preview}\n...`;
  }

  return { preview, wasTrimmed };
}

export function Footer() {
  const input = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const dropZone = useRef<HTMLDivElement>(null);
  const lastSubmitTime = useRef(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedRecentFiles, setSelectedRecentFiles] = useState<RecentFile[]>(
    [],
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<
    string[]
  >([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

  // Initialize Web Speech API
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");

        if (input.current) {
          input.current.value = transcript;
          messageDraft.value = transcript;
          handleInput();
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        isVoiceRecording.value = false;
      };

      recognitionInstance.onend = () => {
        isVoiceRecording.value = false;
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // Voice input toggle
  const toggleVoiceInput = useCallback(() => {
    if (!recognition) {
      alert(
        "Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.",
      );
      return;
    }

    if (isVoiceRecording.value) {
      recognition.stop();
      isVoiceRecording.value = false;
    } else {
      recognition.start();
      isVoiceRecording.value = true;
      logAuditEntry("view", "Started voice input");
    }
  }, [recognition]);

  // Autocomplete logic
  useEffect(() => {
    if (input.current) {
      const value = input.current.value.toLowerCase();
      const lastWord = value.split(/\s+/).pop() || "";

      if (lastWord.length >= 2) {
        const matches = fraudAnalysisTerms
          .filter((term) => term.toLowerCase().includes(lastWord))
          .slice(0, 5);

        if (matches.length > 0) {
          setAutoCompleteSuggestions(matches);
          showAutoComplete.value = true;
          autoCompleteQuery.value = lastWord;
        } else {
          showAutoComplete.value = false;
        }
      } else {
        showAutoComplete.value = false;
      }
    }
  }, [messageDraft.value]);

  // Handle autocomplete selection
  const selectSuggestion = useCallback((suggestion: string) => {
    if (input.current) {
      const words = input.current.value.split(/\s+/);
      words.pop(); // Remove last incomplete word
      words.push(suggestion);
      input.current.value = `${words.join(" ")} `;
      messageDraft.value = input.current.value;
      handleInput();
      showAutoComplete.value = false;
      input.current.focus();
    }
  }, []);

  // Load saved draft on mount
  useEffect(() => {
    if (input.current && messageDraft.value) {
      input.current.value = messageDraft.value;
      handleInput();
    }
  }, []);

  // Update textarea when messageDraft changes (e.g., from template selection)
  useEffect(() => {
    if (input.current && input.current.value !== messageDraft.value) {
      input.current.value = messageDraft.value || "";
      // Only handle the auto-resize, don't call full handleInput to avoid loops
      input.current.style.height = "auto";
      input.current.style.height = `${Math.min(input.current.scrollHeight, 400)}px`;
    }
  }, [messageDraft.value]);

  // Save draft when input changes
  const _handleDraftChange = useCallback(() => {
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

  const validateFile = useCallback((file: File): string | null => {
    const mimeOk = ALLOWED_MIME_TYPES.has(file.type);
    const extOk = ALLOWED_EXTENSIONS.test(file.name);
    if (!mimeOk && !extOk)
      return `"${file.name}" is not an accepted file type (CSV, JSON, TXT, TSV).`;
    return null;
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const incoming = Array.from(files);
        const errors = incoming.map(validateFile).filter(Boolean);
        if (errors.length > 0) {
          showToast(errors[0]!, "error");
          return;
        }
        setSelectedFiles((prev) => {
          const merged = [...prev, ...incoming];
          if (merged.length > MAX_FILES) {
            showToast(`Maximum ${MAX_FILES} files per submission.`, "error");
            return prev;
          }
          return merged;
        });
        logAuditEntry(
          "upload",
          `Dropped ${files.length} file(s) via drag-and-drop`,
        );
      }
    },
    [validateFile],
  );

  const readFileSlice = useCallback(
    async (
      file: File,
    ): Promise<{ text: string; sourceWasTrimmed: boolean }> => {
      const text = await file.slice(0, MAX_PREVIEW_READ_BYTES).text();
      return {
        text,
        sourceWasTrimmed: file.size > MAX_PREVIEW_READ_BYTES,
      };
    },
    [],
  );

  const readCSVPreview = useCallback(
    async (file: File) => {
      try {
        const { text, sourceWasTrimmed } = await readFileSlice(file);
        const preview = trimPreviewText(text, 6);
        return {
          preview: preview.preview,
          isPartial: sourceWasTrimmed || preview.wasTrimmed,
        };
      } catch (error) {
        console.error("Failed to read CSV preview:", error);
        return { preview: "", isPartial: false };
      }
    },
    [readFileSlice],
  );

  const readJSONPreview = useCallback(
    async (file: File) => {
      try {
        const { text, sourceWasTrimmed } = await readFileSlice(file);

        if (!sourceWasTrimmed) {
          const json = JSON.parse(text);
          const formatted = JSON.stringify(json, null, 2);
          const preview = trimPreviewText(formatted, MAX_PREVIEW_LINES);
          return {
            preview: preview.preview,
            isPartial: preview.wasTrimmed,
          };
        }

        const preview = trimPreviewText(text, MAX_PREVIEW_LINES);
        return {
          preview: preview.preview,
          isPartial: sourceWasTrimmed || preview.wasTrimmed,
        };
      } catch (error) {
        console.error("Failed to read JSON preview:", error);
        return { preview: "", isPartial: false };
      }
    },
    [readFileSlice],
  );

  const readTXTPreview = useCallback(
    async (file: File) => {
      try {
        const { text, sourceWasTrimmed } = await readFileSlice(file);
        const preview = trimPreviewText(text, 15);
        return {
          preview: preview.preview,
          isPartial: sourceWasTrimmed || preview.wasTrimmed,
        };
      } catch (error) {
        console.error("Failed to read TXT preview:", error);
        return { preview: "", isPartial: false };
      }
    },
    [readFileSlice],
  );

  const readTSVPreview = useCallback(
    async (file: File) => {
      try {
        const { text, sourceWasTrimmed } = await readFileSlice(file);
        const preview = trimPreviewText(text, 6);
        return {
          preview: preview.preview,
          isPartial: sourceWasTrimmed || preview.wasTrimmed,
        };
      } catch (error) {
        console.error("Failed to read TSV preview:", error);
        return { preview: "", isPartial: false };
      }
    },
    [readFileSlice],
  );

  const getFilePreview = async (
    file: File,
  ): Promise<{ preview: string; format: string; isPartial: boolean }> => {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".csv")) {
      return { ...(await readCSVPreview(file)), format: "csv" };
    } else if (fileName.endsWith(".json")) {
      return { ...(await readJSONPreview(file)), format: "json" };
    } else if (fileName.endsWith(".txt") || fileName.endsWith(".log")) {
      return { ...(await readTXTPreview(file)), format: "text" };
    } else if (fileName.endsWith(".tsv")) {
      return { ...(await readTSVPreview(file)), format: "tsv" };
    } else {
      return { preview: "", format: "unknown", isPartial: false };
    }
  };

  const handleFileSelect = useCallback(() => {
    fileInput.current?.click();
  }, []);

  const handleFileChange = useCallback(() => {
    const files = fileInput.current?.files;
    if (files && files.length > 0) {
      const incoming = Array.from(files);
      // Validate each file
      for (const file of incoming) {
        const err = validateFile(file);
        if (err) {
          showToast(err, "error");
          if (fileInput.current) fileInput.current.value = "";
          return;
        }
      }
      setSelectedFiles((prev) => {
        const merged = [...prev, ...incoming];
        if (merged.length > MAX_FILES) {
          showToast(`Maximum ${MAX_FILES} files per submission.`, "error");
          if (fileInput.current) fileInput.current.value = "";
          return prev;
        }
        return merged;
      });
      if (fileInput.current) fileInput.current.value = "";
      logAuditEntry(
        "upload",
        `Selected ${files.length} file(s): ${Array.from(files)
          .map((f) => f.name)
          .join(", ")}`,
      );
    }
  }, [validateFile]);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeRecentFile = useCallback((index: number) => {
    setSelectedRecentFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleInput = useCallback(() => {
    if (input.current) {
      // Auto-resize textarea
      input.current.style.height = "auto";
      input.current.style.height = `${Math.min(input.current.scrollHeight, 400)}px`;
      // Save draft
      messageDraft.value = input.current.value;
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Handle autocomplete navigation
      if (showAutoComplete.value && autoCompleteSuggestions.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedSuggestionIndex((prev) =>
            Math.min(prev + 1, autoCompleteSuggestions.length - 1),
          );
          return;
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedSuggestionIndex((prev) => Math.max(prev - 1, 0));
          return;
        } else if (e.key === "Tab") {
          e.preventDefault();
          selectSuggestion(autoCompleteSuggestions[selectedSuggestionIndex]);
          return;
        } else if (e.key === "Escape") {
          e.preventDefault();
          showAutoComplete.value = false;
          return;
        }
      }

      // Alt+V for voice input
      if (e.altKey && e.key === "v") {
        e.preventDefault();
        toggleVoiceInput();
        return;
      }

      // Submit on Enter (without Shift), allow Shift+Enter for new lines
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const form = input.current?.closest("form");
        if (form && !isAgentTyping.value && !isUploading) {
          form.requestSubmit();
        }
      }
    },
    [
      isUploading,
      autoCompleteSuggestions,
      selectedSuggestionIndex,
      selectSuggestion,
      toggleVoiceInput,
    ],
  );

  const handleSubmit = useCallback<SubmitEventHandler<HTMLFormElement>>(
    async (e) => {
      e.preventDefault();

      if (isAgentTyping.value || isUploading) {
        return;
      }

      // Rate limit: enforce minimum gap between submissions
      const now = Date.now();
      if (now - lastSubmitTime.current < SUBMIT_COOLDOWN_MS) {
        showToast("Please wait a moment before sending again.", "info");
        return;
      }
      lastSubmitTime.current = now;

      const form = e.currentTarget;
      const data = new FormData(form);
      const message = data.get("message") as string | null;
      if (
        !message?.trim() &&
        selectedFiles.length === 0 &&
        selectedRecentFiles.length === 0
      ) {
        return;
      }

      // Enforce message length cap
      if ((message?.length ?? 0) > MAX_MESSAGE_LENGTH) {
        showToast(
          `Message exceeds the ${MAX_MESSAGE_LENGTH.toLocaleString()} character limit.`,
          "error",
        );
        return;
      }

      // Upload files first if any are selected
      let uploadedAttachments: Attachment[] = [];
      const fileDetailsWithPreviews: string[] = [];

      if (selectedFiles.length > 0 && client.value) {
        setIsUploading(true);
        try {
          // Upload files and read previews in parallel
          const uploadPromises = selectedFiles.map((file) =>
            client.value?.uploadTempFile(file),
          );
          const previewPromises = selectedFiles.map((file) =>
            getFilePreview(file),
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
              preview: previews[index].preview || undefined,
              previewFormat: previews[index].preview
                ? previews[index].format
                : undefined,
            });

            // Build detailed file info with preview
            let fileDetail = `- File: ${attachment.fileName}\n  URL: ${attachment.fileUrl}\n  Size: ${formatFileSize(file.size)}`;
            if (previews[index].preview) {
              const previewFormat = previews[index].format;
              const previewHeading = previews[index].isPartial
                ? "Preview excerpt"
                : "Preview";
              fileDetail += `\n  ${previewHeading}:\n\`\`\`${previewFormat}\n${previews[index].preview}\n\`\`\``;
            }
            fileDetailsWithPreviews.push(fileDetail);
          });
        } catch (error) {
          console.error("Failed to upload files:", error);
          showToast(
            "Failed to upload files. The temporary upload service may still reject very large datasets.",
            "error",
          );
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      // Append re-used recent files — no new upload needed, use stored URL and preview
      for (const recentFile of selectedRecentFiles) {
        const att = {
          fileUrl: recentFile.fileUrl,
          fileName: recentFile.fileName,
        } as Attachment;
        uploadedAttachments = [...uploadedAttachments, att];

        const sizeNote = recentFile.size
          ? ` (${formatFileSize(recentFile.size)})`
          : "";
        let fileDetail = `- File: ${recentFile.fileName}${sizeNote}\n  URL: ${recentFile.fileUrl}`;
        if (recentFile.preview) {
          const previewFormat = recentFile.previewFormat ?? "csv";
          fileDetail += `\n  Preview excerpt:\n\`\`\`${previewFormat}\n${recentFile.preview}\n\`\`\``;
        }
        fileDetailsWithPreviews.push(fileDetail);
      }

      // Build message with file information
      let messageText = message?.trim() || "";
      if (uploadedAttachments.length > 0) {
        const fileList = fileDetailsWithPreviews.join("\n\n");
        const allFiles = [...selectedFiles, ...selectedRecentFiles];
        const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024; // 50 MB
        const hasLargeFile = allFiles.some(
          (f) =>
            ((f as File).size ?? (f as RecentFile).size ?? 0) >
            LARGE_FILE_THRESHOLD,
        );
        const instructions = hasLargeFile
          ? "✅ Instructions: The file(s) are accessible at the URL(s) above. These datasets are large — use the preview excerpt to understand the schema and column layout, then sample or stream rows from the URL rather than loading the entire file at once."
          : "✅ Instructions: The file(s) are uploaded and accessible at the URL(s) above. Please fetch and analyse the dataset from the provided URL(s). The preview shows the structure (column names and sample rows).";
        messageText = `${messageText}\n\n📎 Dataset Files:\n${fileList}\n\n${instructions}`;
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
        messageDraft.value = "";
      }
      setSelectedFiles([]);
      setSelectedRecentFiles([]);
    },
    [input, selectedFiles, selectedRecentFiles, isUploading],
  );

  // Cloud storage handlers
  const handleConnectGoogleDrive = useCallback(() => {
    // Google Drive API integration would go here
    showToast("Google Drive integration is not yet implemented", "info");
    logAuditEntry("action", "Attempted Google Drive connection");
  }, []);

  const handleConnectOneDrive = useCallback(() => {
    // Microsoft OneDrive API integration would go here
    showToast("OneDrive integration is not yet implemented", "info");
    logAuditEntry("action", "Attempted OneDrive connection");
  }, []);

  const recentFilesForMenu: RecentFile[] = uploadedDatasets.value
    .slice()
    .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
    .slice(0, 10)
    .map((d) => ({
      id: d.id,
      fileName: d.fileName,
      fileUrl: d.fileUrl,
      uploadedAt: d.uploadedAt,
      size: d.size,
      preview: d.preview,
      previewFormat: d.previewFormat,
    }));

  const handleRecentFileSelect = useCallback(
    (file: RecentFile) => {
      setSelectedRecentFiles((prev) => {
        if (prev.some((f) => f.id === file.id)) return prev;
        if (prev.length + selectedFiles.length >= MAX_FILES) {
          showToast(`Maximum ${MAX_FILES} files per submission.`, "error");
          return prev;
        }
        return [...prev, file];
      });
      input.current?.focus();
      logAuditEntry("action", `Re-used recent dataset: ${file.fileName}`);
    },
    [selectedFiles],
  );

  return (
    <footer class="fixed bottom-0 left-0 right-0 h-auto min-h-16 pl-0 md:pl-16 lg:pl-16 1440:pl-56 pr-0 py-2 border-t border-zinc-500/25 bg-white dark:bg-zinc-900 transition-all duration-300 z-10 flex items-center">
      <div ref={dropZone} class="w-full max-w-4xl mx-auto px-4">
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

        <form
          class="flex flex-col gap-y-2"
          onSubmit={handleSubmit}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {(selectedFiles.length > 0 || selectedRecentFiles.length > 0) && (
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
              {selectedRecentFiles.map((file, index) => (
                <div
                  key={`${file.id}-recent`}
                  class="flex items-center gap-x-1.5 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded-full text-sm text-indigo-700 dark:text-indigo-300 transition-colors"
                >
                  <Clock
                    size={12}
                    strokeWidth={2}
                    class="shrink-0 opacity-70"
                  />
                  <span class="truncate max-w-50">{file.fileName}</span>
                  <button
                    type="button"
                    onClick={() => removeRecentFile(index)}
                    class="p-0.5 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-full transition-colors"
                    aria-label={`Remove ${file.fileName}`}
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
          {/* Unified Input Bar */}
          <div class="flex items-center gap-x-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-full px-2 py-1.5 shadow-sm hover:shadow-md transition-shadow relative">
            <input
              ref={fileInput}
              type="file"
              multiple
              class="hidden"
              onChange={handleFileChange}
              aria-label="File input"
            />

            {/* Attachment Menu */}
            <AttachmentMenu
              onFileSelect={handleFileSelect}
              onConnectGoogleDrive={handleConnectGoogleDrive}
              onConnectOneDrive={handleConnectOneDrive}
              recentFiles={recentFilesForMenu}
              onRecentFileSelect={handleRecentFileSelect}
              disabled={isUploading || isAgentTyping.value}
            />

            <div class="flex-1 relative px-2">
              {/* Autocomplete Dropdown */}
              {showAutoComplete.value && autoCompleteSuggestions.length > 0 && (
                <div class="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden z-10">
                  {autoCompleteSuggestions.map((suggestion, index) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => selectSuggestion(suggestion)}
                      class={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        index === selectedSuggestionIndex
                          ? "bg-indigo-500 text-white"
                          : "text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                  <div class="px-4 py-1.5 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
                    <p class="text-xs text-zinc-500 dark:text-zinc-400">
                      Press Tab to accept • ↑↓ to navigate • Esc to dismiss
                    </p>
                  </div>
                </div>
              )}

              <textarea
                ref={input}
                placeholder="Ask anything"
                disabled={isUploading || isVoiceRecording.value}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                rows={1}
                class="w-full bg-transparent border-none px-0 py-2 outline-none text-zinc-800 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-none max-h-52 overflow-y-auto"
                name="message"
                maxLength={MAX_MESSAGE_LENGTH}
              />

              {/* Voice Recording Indicator */}
              {isVoiceRecording.value && (
                <div class="absolute top-2 right-2 flex items-center gap-x-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                  <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>Recording...</span>
                </div>
              )}
            </div>

            {/* Mode Selector */}
            <ModeSelector
              selectedMode={agentMode.value}
              onModeChange={(mode) => {
                agentMode.value = mode;
                logAuditEntry("view", `Changed agent mode to ${mode}`);
              }}
              disabled={isUploading || isAgentTyping.value}
            />

            <button
              type="button"
              onClick={toggleVoiceInput}
              disabled={isUploading || isAgentTyping.value}
              class={`p-2.5 rounded-full transition-all cursor-pointer outline-indigo-500 outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 ${
                isVoiceRecording.value
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
              }`}
              aria-label={
                isVoiceRecording.value ? "Stop recording" : "Start voice input"
              }
              title="Alt+V for voice input"
            >
              {isVoiceRecording.value ? (
                <MicOff size={20} strokeWidth={1.5} />
              ) : (
                <Mic size={20} strokeWidth={1.5} />
              )}
            </button>

            <button
              type="submit"
              disabled={isUploading || isAgentTyping.value}
              class="bg-indigo-500 dark:bg-indigo-600 text-white rounded-full p-2.5 cursor-pointer hover:bg-indigo-600 dark:hover:bg-indigo-700 active:bg-indigo-700 dark:active:bg-indigo-800 outline-indigo-500 outline-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              aria-label="Send message"
            >
              <SendHorizonal size={20} strokeWidth={1.5} />
            </button>
          </div>
        </form>
      </div>
    </footer>
  );
}
