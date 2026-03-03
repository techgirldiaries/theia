import { Sparkles } from "lucide-react";
import { For } from "@preact/signals/utils";
import { quickTemplates } from "@/signals";

interface QuickTemplatesProps {
  onSelectTemplate: (prompt: string) => void;
}

const categoryColors = {
  analysis:
    "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  report:
    "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  risk: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
  investigation:
    "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
};

export function QuickTemplates({ onSelectTemplate }: QuickTemplatesProps) {
  return (
    <div class="mb-2 px-4">
      <div class="flex items-center gap-x-2 mb-2">
        <Sparkles size={14} class="text-indigo-500" />
        <span class="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Quick Templates
        </span>
      </div>
      <div class="flex flex-wrap gap-2">
        <For each={quickTemplates}>
          {(template) => (
            <button
              onClick={() => onSelectTemplate(template.prompt)}
              class={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:scale-105 ${categoryColors[template.category]}`}
              title={template.prompt}
            >
              {template.title}
            </button>
          )}
        </For>
      </div>
    </div>
  );
}
