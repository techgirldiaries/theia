import * as Avatar from "@radix-ui/react-avatar";
import {
  BarChart3,
  MessageSquarePlus,
  Moon,
  Sun,
  Trash2,
  FolderOpen,
  Maximize2,
  Minimize2,
  Layout,
} from "lucide-react";
import {
  agentAvatar,
  agentInitials,
  agentName,
  clearChatHistory,
  isDarkMode,
  messages,
  showAnalytics,
  startNewChat,
  showFileManager,
  compactView,
  splitScreenMode,
} from "@/signals";
import { ConnectionStatus } from "@/components/connection-status";

export function Header() {
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
  };

  const handleClearHistory = () => {
    if (messages.value.length > 0) {
      if (confirm("Clear all chat history? This cannot be undone.")) {
        clearChatHistory();
      }
    }
  };

  const toggleAnalytics = () => {
    showAnalytics.value = !showAnalytics.value;
    // Disable split screen when toggling to full analytics
    if (showAnalytics.value) {
      splitScreenMode.value = false;
    }
  };

  const handleNewChat = () => {
    startNewChat();
  };

  const toggleFileManager = () => {
    showFileManager.value = !showFileManager.value;
  };

  const toggleCompactView = () => {
    compactView.value = !compactView.value;
  };

  const toggleSplitScreen = () => {
    splitScreenMode.value = !splitScreenMode.value;
    // Close full analytics when enabling split screen
    if (splitScreenMode.value) {
      showAnalytics.value = false;
    }
  };

  return (
    <header class="p-4 border-b border-zinc-500/25 sticky top-0 bg-white dark:bg-zinc-900 transition-colors">
      <div class="max-w-3xl mx-auto">
        <div class="flex items-center gap-x-2.5">
          <Avatar.Root>
            <Avatar.Image
              src={agentAvatar}
              class="size-10 rounded-full border border-zinc-200 dark:border-zinc-700 transition-colors"
              alt={agentName}
            />
            <Avatar.Fallback>{agentInitials}</Avatar.Fallback>
          </Avatar.Root>
          <hgroup class="flex flex-col flex-1 gap-y-1">
            <h1 class="font-medium text-md leading-none text-zinc-800 dark:text-white transition-colors">
              Theia Fraud Intelligence
            </h1>
            <div class="flex items-center gap-x-2">
              <h2 class="text-xs text-zinc-500 dark:text-zinc-400 leading-none">
                Detect Risk Early. Act Decisively. Stay Compliant.
              </h2>
              <span class="text-zinc-300 dark:text-zinc-600">•</span>
              <ConnectionStatus />
            </div>
          </hgroup>
          <button
            type="button"
            onClick={handleNewChat}
            class="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Start new chat"
            title="New Chat"
          >
            <MessageSquarePlus size={20} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={toggleFileManager}
            class="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Open file manager"
            title="File Manager"
          >
            <FolderOpen size={20} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={toggleSplitScreen}
            class={`p-2 rounded-lg transition-colors cursor-pointer ${
              splitScreenMode.value
                ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
            aria-label="Toggle split screen"
            title="Split Screen"
          >
            <Layout size={20} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={toggleCompactView}
            class={`p-2 rounded-lg transition-colors cursor-pointer ${
              compactView.value
                ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
            aria-label="Toggle compact view"
            title={compactView.value ? "Expanded View" : "Compact View"}
          >
            {compactView.value ? (
              <Maximize2 size={20} strokeWidth={1.5} />
            ) : (
              <Minimize2 size={20} strokeWidth={1.5} />
            )}
          </button>
          <button
            type="button"
            onClick={toggleAnalytics}
            class="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="View analytics"
            title="Performance Analytics"
          >
            <BarChart3 size={20} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={handleClearHistory}
            class="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Clear chat history"
            title="Clear chat history"
          >
            <Trash2 size={20} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={toggleDarkMode}
            class="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {isDarkMode.value ? (
              <Sun size={20} strokeWidth={1.5} />
            ) : (
              <Moon size={20} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
