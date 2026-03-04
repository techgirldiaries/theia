import { ChevronDown, Lightbulb, Users, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "preact/hooks";

export type AgentMode = "auto" | "fast" | "expert" | "heavy";

interface Mode {
  id: AgentMode;
  label: string;
  description: string;
  icon: any;
}

const modes: Mode[] = [
  {
    id: "auto",
    label: "Auto",
    description: "Chooses Fast or Expert",
    icon: Zap,
  },
  {
    id: "fast",
    label: "Fast",
    description: "Quick responses",
    icon: Zap,
  },
  {
    id: "expert",
    label: "Expert",
    description: "Thinks hard",
    icon: Lightbulb,
  },
  {
    id: "heavy",
    label: "Heavy",
    description: "Team of experts",
    icon: Users,
  },
];

interface ModeSelectorProps {
  selectedMode: AgentMode;
  onModeChange: (mode: AgentMode) => void;
  disabled?: boolean;
}

export function ModeSelector({
  selectedMode,
  onModeChange,
  disabled,
}: ModeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentMode = modes.find((m) => m.id === selectedMode) || modes[2]; // Default to expert

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (mode: AgentMode) => {
    onModeChange(mode);
    setIsOpen(false);
  };

  return (
    <div class="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        class="flex items-center gap-x-1.5 px-2.5 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed outline-indigo-500 outline-offset-2"
        aria-label="Select mode"
      >
        <currentMode.icon size={16} strokeWidth={2} />
        <span class="text-xs">{currentMode.label}</span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          class={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div class="absolute bottom-full right-0 mb-2 w-64 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div class="p-2 space-y-1">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = mode.id === selectedMode;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => handleSelect(mode.id)}
                  class={`w-full flex items-start gap-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    isSelected
                      ? "bg-indigo-500 text-white"
                      : "text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={2}
                    class={`mt-0.5 shrink-0 ${isSelected ? "text-white" : "text-zinc-500 dark:text-zinc-400"}`}
                  />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-x-2">
                      <span class="font-medium">{mode.label}</span>
                      {isSelected && (
                        <svg
                          class="w-4 h-4 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <p
                      class={`text-xs mt-0.5 ${isSelected ? "text-white/90" : "text-zinc-500 dark:text-zinc-400"}`}
                    >
                      {mode.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
