import { Focus, Layers, Zap } from "lucide-react";
import { interfaceMode, setInterfaceMode } from "@/signals";
import type { InterfaceMode } from "@/signals/state";

/**
 * Interface Mode Switcher Component
 * Allows users to toggle between Focus, Balanced, and Expert modes.
 * - Focus: Minimal UI for distraction-free analysis
 * - Balanced: Essential features visible (default)
 * - Expert: All advanced features and panels accessible
 */
export function InterfaceModeSwitcher({
  compact = false,
}: {
  compact?: boolean;
}) {
  const modes: Array<{
    id: InterfaceMode;
    label: string;
    icon: any;
    description: string;
  }> = [
    {
      id: "focus",
      label: "Focus",
      icon: Focus,
      description: "Minimal distractions",
    },
    {
      id: "balanced",
      label: "Balanced",
      icon: Layers,
      description: "Essential features",
    },
    {
      id: "expert",
      label: "Expert",
      icon: Zap,
      description: "All features",
    },
  ];

  return (
    <div
      class={`flex ${compact ? "flex-col" : "flex-row"} items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1`}
    >
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = interfaceMode.value === mode.id;

        return (
          <button
            key={mode.id}
            onClick={() => setInterfaceMode(mode.id)}
            class={`flex items-center ${compact ? "justify-center w-full" : "gap-x-1.5"} ${compact ? "px-2" : "px-3"} py-1.5 rounded-md text-sm font-medium transition-all ${
              isActive
                ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
            title={`${mode.label} Mode - ${mode.description}`}
            aria-label={`Switch to ${mode.label} mode: ${mode.description}`}
          >
            <Icon size={16} strokeWidth={2} />
            {!compact && <span class="whitespace-nowrap">{mode.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
