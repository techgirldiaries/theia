import { X, Keyboard } from "lucide-react";
import { Show } from "@preact/signals/utils";
import { showKeyboardShortcuts } from "@/signals";
import { useEffect } from "preact/hooks";

const shortcuts = [
  { key: "Ctrl/Cmd + Enter", description: "Send message" },
  { key: "Shift + Enter", description: "New line in message" },
  { key: "?", description: "Show/hide keyboard shortcuts" },
  { key: "Ctrl/Cmd + K", description: "Focus message input" },
  { key: "Ctrl/Cmd + /", description: "Toggle quick templates" },
  { key: "Ctrl/Cmd + N", description: "Start new chat" },
  { key: "Ctrl/Cmd + D", description: "Toggle dark mode" },
  { key: "Ctrl/Cmd + F", description: "Open file manager" },
  { key: "Ctrl/Cmd + S", description: "Toggle split screen" },
  { key: "Ctrl/Cmd + P", description: "Toggle analytics" },
  { key: "Ctrl/Cmd + B", description: "Toggle compact view" },
  { key: "Esc", description: "Close modals/overlays" },
  { key: "Alt + V", description: "Start voice input" },
  { key: "↓ / ↑", description: "Navigate autocomplete suggestions" },
  { key: "Tab", description: "Accept autocomplete suggestion" },
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
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <div
          class="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div class="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
            <div class="flex items-center gap-x-2">
              <Keyboard size={20} class="text-indigo-500" />
              <h2 class="text-lg font-semibold text-zinc-900 dark:text-white">
                Keyboard Shortcuts
              </h2>
            </div>
            <button
              onClick={handleClose}
              class="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Close shortcuts panel"
            >
              <X size={20} class="text-zinc-500 dark:text-zinc-400" />
            </button>
          </div>

          {/* Shortcuts List */}
          <div class="flex-1 overflow-y-auto p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.key}
                  class="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700"
                >
                  <span class="text-sm text-zinc-600 dark:text-zinc-300">
                    {shortcut.description}
                  </span>
                  <kbd class="px-2 py-1 text-xs font-mono bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded shadow-sm text-zinc-900 dark:text-white">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>

            {/* Pro Tips */}
            <div class="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
              <h3 class="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2">
                Pro Tips
              </h3>
              <ul class="text-xs text-indigo-700 dark:text-indigo-400 space-y-1">
                <li>• Use voice input for hands-free fraud analysis</li>
                <li>• Quick templates save time on common queries</li>
                <li>
                  • Split screen mode lets you chat and review analytics
                  simultaneously
                </li>
                <li>• All sessions are encrypted in storage for security</li>
                <li>• PII is automatically redacted when exporting reports</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div class="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:dark:bg-zinc-900">
            <p class="text-xs text-zinc-600 dark:text-zinc-400 text-center">
              Press{" "}
              <kbd class="px-1.5 py-0.5 text-xs font-mono bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded">
                ?
              </kbd>{" "}
              anytime to toggle this panel
            </p>
          </div>
        </div>
      </div>
    </Show>
  );
}
