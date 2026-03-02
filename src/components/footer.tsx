import { Paperclip, SendHorizonal, X } from "lucide-react";
import type { SubmitEventHandler } from "preact";
import { useCallback, useRef, useState } from "preact/hooks";
import { agent, isAgentTyping, messages, task, workforce } from "@/signals";

type Message = {
  id: string;
  type: "agent-message" | "user-message";
  text: string;
  createdAt: Date;
  isAgent: () => boolean;
};

export function Footer() {
  const input = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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

      if (isAgentTyping.value) {
        return;
      }

      const form = e.currentTarget;
      const data = new FormData(form);
      const message = data.get("message") as string | null;
      if (!message?.trim()) {
        return;
      }

      messages.value = [
        ...messages.value,
        {
          id: "optimistic",
          type: "user-message",
          text: message,
          createdAt: new Date(),
          isAgent: () => false,
        } as Message,
      ];

      if (!workforce.value && !agent.value) {
        return;
      }

      const t = workforce.value
        ? await workforce.value.sendMessage(message, task.value!)
        : await agent.value!.sendMessage(message, task.value!);
      if (task.value !== t) {
        task.value = t;
      }

      if (input.current) {
        input.current.value = "";
        input.current.focus();
      }
      setSelectedFiles([]);
    },
    [input, selectedFiles],
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
            class="p-3 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer outline-indigo-500 outline-offset-3"
            aria-label="Attach file"
          >
            <Paperclip size={24} strokeWidth={1.5} />
          </button>
          <input
            ref={input}
            type="text"
            placeholder="Analyse transaction data, detect fraud patterns or ask about risk scoring..."
            class="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-3 rounded-full outline-indigo-500 outline-offset-3 text-zinc-800 dark:text-white dark:placeholder-zinc-400 transition-colors"
            name="message"
          />
          <button
            type="submit"
            class="bg-indigo-500 dark:bg-indigo-600 text-white rounded-full p-3 cursor-pointer hover:bg-indigo-600 dark:hover:bg-indigo-700 active:bg-indigo-700 dark:active:bg-indigo-800 outline-indigo-500 outline-offset-3 transition-colors"
            aria-label="Send message"
          >
            <SendHorizonal size={24} strokeWidth={1.5} />
          </button>
        </div>
      </form>
    </footer>
  );
}
