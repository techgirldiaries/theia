import { Show } from "@preact/signals/utils";
import { Keyboard, X } from "lucide-react";
import { useEffect } from "preact/hooks";
import { showKeyboardShortcuts } from "@/signals";

const shortcuts = [
  {
    key: "Ctrl/Cmd + Enter",
    description: "Submit fraud analysis request",
    category: "Analysis",
  },
  {
    key: "Shift + Enter",
    description: "Add line break in analysis input",
    category: "Analysis",
  },
  { key: "?", description: "Show/hide keyboard shortcuts", category: "Help" },
  {
    key: "Ctrl/Cmd + K",
    description: "Focus analysis input field",
    category: "Navigation",
  },
  {
    key: "Ctrl/Cmd + /",
    description: "Toggle fraud analysis templates",
    category: "Templates",
  },
  {
    key: "Ctrl/Cmd + N",
    description: "Start new analysis session",
    category: "Session",
  },
  {
    key: "Ctrl/Cmd + D",
    description: "Toggle dark/light theme",
    category: "Interface",
  },
  {
    key: "Ctrl/Cmd + F",
    description: "Open dataset manager",
    category: "Data",
  },
  {
    key: "Ctrl/Cmd + S",
    description: "Toggle performance monitor",
    category: "Analytics",
  },
  {
    key: "Ctrl/Cmd + P",
    description: "View analytics dashboard",
    category: "Analytics",
  },
  {
    key: "Ctrl/Cmd + B",
    description: "Toggle sidebar visibility",
    category: "Interface",
  },
  {
    key: "Esc",
    description: "Close dialogs and panels",
    category: "Navigation",
  },
  {
    key: "Alt + 1-9",
    description: "Quick navigation to menu items",
    category: "Navigation",
  },
  {
    key: "↓ / ↑",
    description: "Navigate suggestions and results",
    category: "Navigation",
  },
  {
    key: "Tab",
    description: "Accept autocomplete suggestion",
    category: "Navigation",
  },
];

export function KeyboardShortcutsPanel() {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Show shortcuts panel when '?' is pressed
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const target = e.target as HTMLElement;
        // Don't trigger if typing in input/textarea
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          showKeyboardShortcuts.value = !showKeyboardShortcuts.value;
        }
      }

      // ESC closes the shortcuts panel
      if (e.key === "Escape" && showKeyboardShortcuts.value) {
        showKeyboardShortcuts.value = false;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const handleClose = () => {
    showKeyboardShortcuts.value = false;
  };

  return (
    <Show when={showKeyboardShortcuts}>
      <div
        class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={handleClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        aria-describedby="shortcuts-desc"
      >
        <div
          class="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div class="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
            <div class="flex items-center gap-x-3">
              <Keyboard size={24} class="text-indigo-500" aria-hidden="true" />
              <div>
                <h2
                  id="shortcuts-title"
                  class="text-xl font-semibold text-zinc-900 dark:text-white"
                >
                  Keyboard Shortcuts
                </h2>
                <p
                  id="shortcuts-desc"
                  class="text-sm text-zinc-600 dark:text-zinc-400 mt-1"
                >
                  Optimize your fraud analysis workflow with keyboard shortcuts
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              type="button"
              class="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
              aria-label="Close keyboard shortcuts panel"
            >
              <X
                size={20}
                class="text-zinc-500 dark:text-zinc-400"
                aria-hidden="true"
              />
            </button>
          </div>

          {/* Shortcuts List */}
          <div class="flex-1 overflow-y-auto p-6">
            {/* Group shortcuts by category */}
            {Object.entries(
              shortcuts.reduce(
                (acc, shortcut) => {
                  if (!acc[shortcut.category]) acc[shortcut.category] = [];
                  acc[shortcut.category].push(shortcut);
                  return acc;
                },
                {} as Record<string, typeof shortcuts>,
              ),
            ).map(([category, categoryShortcuts]) => (
              <div key={category} class="mb-6 last:mb-0">
                <h3 class="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
                  {category === "Analysis" && "[SEARCH]"}
                  {category === "Navigation" && "[NAV]"}
                  {category === "Data" && "[DATA]"}
                  {category === "Analytics" && "[ANALYTICS]"}
                  {category === "Templates" && "[TEMPLATE]"}
                  {category === "Session" && "[SESSION]"}
                  {category === "Interface" && "[SETTINGS]"}
                  {category === "Help" && "[?]"}
                  {category}
                </h3>
                <div class="space-y-2">
                  {categoryShortcuts.map((shortcut) => (
                    <div
                      key={shortcut.key}
                      class="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <span class="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                        {shortcut.description}
                      </span>
                      <kbd class="px-3 py-1.5 text-xs font-mono bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm text-zinc-900 dark:text-white font-semibold">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Financial Industry Tips */}
            <div class="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg">
              <h3 class="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-3 flex items-center gap-2">
                [TIP] Financial Analysis Pro Tips
              </h3>
              <ul class="text-sm text-indigo-800 dark:text-indigo-300 space-y-2">
                <li class="flex items-start gap-2">
                  <span class="text-indigo-500 mt-0.5">•</span>
                  Use{" "}
                  <kbd class="px-1.5 py-0.5 text-xs font-mono bg-white/50 dark:bg-black/30 rounded">
                    Alt + 1-9
                  </kbd>{" "}
                  for instant access to analysis tools
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-indigo-500 mt-0.5">•</span>
                  Templates speed up common fraud detection queries and
                  compliance reports
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-indigo-500 mt-0.5">•</span>
                  Performance monitor helps track analysis efficiency and system
                  load
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-indigo-500 mt-0.5">•</span>
                  All sensitive data remains encrypted and stored locally for
                  security
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-indigo-500 mt-0.5">•</span>
                  Quick export functions ensure compliance with audit
                  requirements
                </li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div class="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div class="flex items-center justify-between">
              <p class="text-sm text-zinc-600 dark:text-zinc-400">
                Press{" "}
                <kbd class="px-2 py-1 text-xs font-mono bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded shadow-sm">
                  ?
                </kbd>{" "}
                anytime to toggle this panel
              </p>
              <div class="text-xs text-zinc-500 dark:text-zinc-500">
                Theia Fraud Intelligence v1.0
              </div>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
