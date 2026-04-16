import {
  AlertTriangle,
  Database,
  MessageSquare,
  Trash2,
  X,
} from "lucide-react";
import {
  clearChatHistory,
  getChatSessions,
  messages,
  performanceMetrics,
  showDataManagement,
  uploadedDatasets,
} from "@/signals";

export function DataManagement() {
  const handleClose = () => {
    showDataManagement.value = false;
  };

  const handleClearAllData = () => {
    if (
      confirm(
        "Are you sure you want to clear ALL data? This includes:\n\n• All chat messages and history\n• All uploaded datasets\n• All performance metrics\n• All saved sessions\n\nThis action cannot be undone.",
      )
    ) {
      clearChatHistory();
      alert("All data has been cleared successfully.");
    }
  };

  const handleClearMessages = () => {
    if (
      confirm(
        "Clear all chat messages? Your datasets and metrics will be preserved.",
      )
    ) {
      messages.value = [];
    }
  };

  const handleClearDatasets = () => {
    if (
      confirm(
        "Delete all uploaded datasets? Your chat history will be preserved.",
      )
    ) {
      uploadedDatasets.value = [];
    }
  };

  const handleClearMetrics = () => {
    if (
      confirm(
        "Clear all performance metrics? Your chat history and datasets will be preserved.",
      )
    ) {
      performanceMetrics.value = [];
    }
  };

  const stats = {
    messages: messages.value.length,
    datasets: uploadedDatasets.value.length,
    metrics: performanceMetrics.value.length,
    sessions: getChatSessions().length,
  };

  return (
    <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div class="h-full overflow-y-auto p-4 flex items-center justify-center">
        <div class="max-w-2xl w-full">
          {/* Header */}
          <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 mb-4 transition-colors">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold text-zinc-900 dark:text-white">
                  Data Management
                </h2>
                <p class="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  Manage and clear your application data
                </p>
              </div>
              <button
                onClick={handleClose}
                class="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                aria-label="Close data management"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Storage Overview */}
          <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 mb-4 transition-colors">
            <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Storage Overview
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-4">
                <div class="flex items-center gap-x-2 mb-2">
                  <MessageSquare size={16} class="text-blue-500" />
                  <span class="text-sm text-zinc-600 dark:text-zinc-400">
                    Messages
                  </span>
                </div>
                <p class="text-2xl font-bold text-zinc-900 dark:text-white">
                  {stats.messages}
                </p>
              </div>
              <div class="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-4">
                <div class="flex items-center gap-x-2 mb-2">
                  <Database size={16} class="text-green-500" />
                  <span class="text-sm text-zinc-600 dark:text-zinc-400">
                    Datasets
                  </span>
                </div>
                <p class="text-2xl font-bold text-zinc-900 dark:text-white">
                  {stats.datasets}
                </p>
              </div>
              <div class="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-4">
                <div class="flex items-center gap-x-2 mb-2">
                  <AlertTriangle size={16} class="text-purple-500" />
                  <span class="text-sm text-zinc-600 dark:text-zinc-400">
                    Metrics
                  </span>
                </div>
                <p class="text-2xl font-bold text-zinc-900 dark:text-white">
                  {stats.metrics}
                </p>
              </div>
              <div class="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-4">
                <div class="flex items-center gap-x-2 mb-2">
                  <MessageSquare size={16} class="text-indigo-500" />
                  <span class="text-sm text-zinc-600 dark:text-zinc-400">
                    Sessions
                  </span>
                </div>
                <p class="text-2xl font-bold text-zinc-900 dark:text-white">
                  {stats.sessions}
                </p>
              </div>
            </div>
          </div>

          {/* Individual Clear Actions */}
          <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 mb-4 transition-colors">
            <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Clear Specific Data
            </h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                <div>
                  <p class="text-sm font-medium text-zinc-900 dark:text-white">
                    Clear Messages
                  </p>
                  <p class="text-xs text-zinc-500 dark:text-zinc-400">
                    Remove all chat messages from current session
                  </p>
                </div>
                <button
                  onClick={handleClearMessages}
                  disabled={stats.messages === 0}
                  class="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>

              <div class="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                <div>
                  <p class="text-sm font-medium text-zinc-900 dark:text-white">
                    Delete Datasets
                  </p>
                  <p class="text-xs text-zinc-500 dark:text-zinc-400">
                    Remove all uploaded CSV, JSON, and Excel files
                  </p>
                </div>
                <button
                  onClick={handleClearDatasets}
                  disabled={stats.datasets === 0}
                  class="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>

              <div class="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                <div>
                  <p class="text-sm font-medium text-zinc-900 dark:text-white">
                    Clear Metrics
                  </p>
                  <p class="text-xs text-zinc-500 dark:text-zinc-400">
                    Remove all performance and analytics data
                  </p>
                </div>
                <button
                  onClick={handleClearMetrics}
                  disabled={stats.metrics === 0}
                  class="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Clear All Data - Danger Zone */}
          <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 transition-colors">
            <div class="flex items-start gap-x-3 mb-4">
              <AlertTriangle
                size={20}
                class="text-red-600 dark:text-red-400 shrink-0 mt-0.5"
              />
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-red-900 dark:text-red-300 mb-1">
                  Danger Zone
                </h3>
                <p class="text-sm text-red-700 dark:text-red-400">
                  Clear all data including messages, datasets, metrics, and
                  sessions. This action cannot be undone.
                </p>
              </div>
            </div>
            <button
              onClick={handleClearAllData}
              class="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-x-2"
            >
              <Trash2 size={16} />
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
