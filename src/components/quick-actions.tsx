import {
  Database,
  Download,
  MessageSquare,
  RefreshCw,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useEffect } from "preact/hooks";
import {
  clearChatHistory,
  getChatSessions,
  logAuditEntry,
  messages,
  performanceMetrics,
  showQuickActions,
  showToast,
  uploadedDatasets,
} from "@/signals";

export function QuickActions() {
  const handleClose = () => {
    showQuickActions.value = false;
  };

  // Enhanced keyboard support for financial professionals
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
      // Alt + 1-6 for quick access to actions
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const num = parseInt(e.key);
        switch (num) {
          case 1:
            handleExportData();
            break;
          case 2:
            handleResetSession();
            break;
          case 3:
            handleClearMessages();
            break;
          case 4:
            handleClearDatasets();
            break;
          case 5:
            handleClearAll();
            break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const handleClearAll = () => {
    if (
      confirm(
        "Are you sure you want to clear ALL data? This includes:\n\n• All chat messages and history\n• All uploaded datasets\n• All performance metrics\n• All saved sessions\n\nThis action cannot be undone.",
      )
    ) {
      clearChatHistory();
      uploadedDatasets.value = [];
      performanceMetrics.value = [];
      showToast("All data has been cleared successfully", "success");
      logAuditEntry("delete", "Cleared all data");
    }
  };

  const handleClearMessages = () => {
    if (
      confirm(
        "Clear all chat messages? Your datasets and metrics will be preserved.",
      )
    ) {
      messages.value = [];
      showToast("Chat messages cleared", "success");
      logAuditEntry("delete", "Cleared chat messages");
    }
  };

  const handleClearDatasets = () => {
    if (
      confirm(
        "Delete all uploaded datasets? Your chat history will be preserved.",
      )
    ) {
      uploadedDatasets.value = [];
      showToast("Datasets cleared", "success");
      logAuditEntry("delete", "Cleared datasets");
    }
  };

  const handleExportData = () => {
    try {
      const data = {
        messages: messages.value,
        datasets: uploadedDatasets.value,
        metrics: performanceMetrics.value,
        sessions: getChatSessions(),
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `theia-fraud-intelligence-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("Data exported successfully", "success");
      logAuditEntry("export", "Exported all data");
    } catch (error) {
      showToast("Export failed", "error");
      logAuditEntry("export", `Export failed: ${error}`);
    }
  };

  const handleResetSession = () => {
    if (
      confirm(
        "Reset current session? This will clear current chat but preserve your datasets.",
      )
    ) {
      messages.value = [];
      showToast("Session reset", "success");
      logAuditEntry("session_end", "Reset session");
    }
  };

  const stats = {
    messages: messages.value.length,
    datasets: uploadedDatasets.value.length,
    metrics: performanceMetrics.value.length,
    sessions: getChatSessions().length,
  };

  return (
    <div
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-actions-title"
      aria-describedby="quick-actions-desc"
    >
      <div class="h-full overflow-y-auto p-4 flex items-center justify-center">
        <div class="max-w-2xl w-full">
          {/* Header */}
          <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 mb-4 transition-colors">
            <div class="flex items-center justify-between">
              <div>
                <h2
                  id="quick-actions-title"
                  class="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2"
                >
                  <Zap size={24} class="text-indigo-500" aria-hidden="true" />
                  Quick Actions
                </h2>
                <p
                  id="quick-actions-desc"
                  class="text-sm text-zinc-600 dark:text-zinc-400 mt-1"
                >
                  Fast access to common data operations and system controls
                </p>
              </div>
              <button
                onClick={handleClose}
                class="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-800"
                aria-label="Close quick actions panel"
                type="button"
              >
                <X size={20} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 mb-4 transition-colors">
            <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-3">
              Current Session Overview
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.messages}
                </div>
                <div class="text-sm text-blue-600 dark:text-blue-400">
                  Messages
                </div>
              </div>
              <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.datasets}
                </div>
                <div class="text-sm text-green-600 dark:text-green-400">
                  Datasets
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 transition-colors">
            <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Data Operations
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExportData}
                type="button"
                class="flex items-center gap-3 p-4 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-800 hover:scale-[1.02] active:scale-[0.98]"
                aria-describedby="export-desc"
              >
                <Download size={20} aria-hidden="true" />
                <span class="font-medium">Export Data</span>
                <span id="export-desc" class="sr-only">
                  Download all fraud analysis data and reports as JSON file
                </span>
              </button>

              <button
                onClick={handleResetSession}
                type="button"
                class="flex items-center gap-3 p-4 rounded-lg bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-800/30 text-yellow-700 dark:text-yellow-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-800 hover:scale-[1.02] active:scale-[0.98]"
                aria-describedby="reset-desc"
              >
                <RefreshCw size={20} aria-hidden="true" />
                <span class="font-medium">Reset Session</span>
                <span id="reset-desc" class="sr-only">
                  Clear current chat while preserving uploaded datasets
                </span>
              </button>

              <button
                onClick={handleClearMessages}
                type="button"
                class="flex items-center gap-3 p-4 rounded-lg bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-800/30 text-orange-700 dark:text-orange-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-800 hover:scale-[1.02] active:scale-[0.98]"
                aria-describedby="clear-messages-desc"
              >
                <MessageSquare size={20} aria-hidden="true" />
                <span class="font-medium">Clear Messages</span>
                <span id="clear-messages-desc" class="sr-only">
                  Remove all chat messages while keeping datasets and metrics
                </span>
              </button>

              <button
                onClick={handleClearDatasets}
                type="button"
                class="flex items-center gap-3 p-4 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-800/30 text-purple-700 dark:text-purple-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-800 hover:scale-[1.02] active:scale-[0.98]"
                aria-describedby="clear-datasets-desc"
              >
                <Database size={20} aria-hidden="true" />
                <span class="font-medium">Clear Datasets</span>
                <span id="clear-datasets-desc" class="sr-only">
                  Remove all uploaded fraud detection datasets
                </span>
              </button>

              <button
                onClick={handleClearAll}
                type="button"
                class="flex items-center gap-3 p-4 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-800/30 text-red-700 dark:text-red-300 transition-all duration-200 col-span-1 sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-800 hover:scale-[1.02] active:scale-[0.98]"
                aria-describedby="clear-all-desc"
              >
                <Trash2 size={20} aria-hidden="true" />
                <span class="font-medium">Clear All Data</span>
                <span id="clear-all-desc" class="sr-only">
                  Permanently delete all chat history, datasets, and performance
                  metrics
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
