import { For, Show } from "@preact/signals/utils";
import { AgentMessage } from "@/components/agent-message";
import { AgentTyping } from "@/components/agent-typing";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { EmptyState } from "@/components/empty-state";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { UserMessage } from "@/components/user-message";
import { Toast } from "@/components/toast";
import { StopButton } from "@/components/stop-button";
import { ScrollToBottomButton } from "@/components/scroll-to-bottom";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { FileManagerPanel } from "@/components/file-manager";
import { KeyboardShortcutsPanel } from "@/components/keyboard-shortcuts";
import {
  dismissToast,
  isAgentTyping,
  isInitialized,
  loadingError,
  messages,
  showAnalytics,
  toasts,
  splitScreenMode,
} from "@/signals";
import type { Attachment } from "@relevanceai/sdk";

type Message = {
  id: string;
  type: "agent-message" | "user-message";
  text: string;
  createdAt: Date;
  isAgent: () => boolean;
  attachments?: Attachment[];
  status?: "sending" | "sent" | "failed";
  read?: boolean;
};

export function App() {
  if (!isInitialized.value) {
    return (
      <div class="flex items-center justify-center min-h-dvh dark:bg-zinc-950">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-indigo-500 border-r-transparent mb-4"></div>
          <p class="text-zinc-600 dark:text-zinc-400">
            Initialising Super-Squad...
          </p>
          <p class="text-zinc-500 dark:text-zinc-500 text-sm mt-2">
            Connecting to workforce
          </p>
        </div>
      </div>
    );
  }

  if (loadingError.value) {
    return (
      <div class="flex items-center justify-center min-h-dvh dark:bg-zinc-950 p-4">
        <div class="max-w-md bg-red-900/20 border border-red-500/50 rounded-lg p-6">
          <h2 class="text-red-400 text-xl font-bold mb-2">
            Configuration Error
          </h2>
          <p class="text-red-300 mb-4">{loadingError.value}</p>
          <div class="bg-zinc-900 rounded p-3 text-sm font-mono text-zinc-300">
            <p class="mb-2">Check your .env file:</p>
            <pre class="text-xs text-zinc-400">
              VITE_REGION=your_region_here VITE_PROJECT=your_project_id_here
              VITE_WORKFORCE_ID=your_workforce_id_here
            </pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            class="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div class="flex flex-col min-h-dvh dark:bg-zinc-950">
      <Header />
      <div
        class={`flex flex-1 ${splitScreenMode.value ? "flex-row" : "flex-col"}`}
      >
        <main
          class={`${splitScreenMode.value ? "w-1/2" : "w-full"} p-4 bg-zinc-50 dark:bg-zinc-950 transition-colors overflow-auto`}
        >
          <div class="max-w-3xl mx-auto flex flex-col gap-y-4">
            <For each={messages} fallback={<EmptyState />}>
              {(m) =>
                m.isAgent() ? (
                  <AgentMessage message={m as Message} />
                ) : (
                  <UserMessage message={m as Message} />
                )
              }
            </For>
            <Show when={isAgentTyping}>
              <LoadingSkeleton />
            </Show>
          </div>
        </main>
        {splitScreenMode.value && (
          <div class="w-1/2 border-l border-zinc-200 dark:border-zinc-800 overflow-auto">
            <AnalyticsDashboard />
          </div>
        )}
      </div>
      <Footer />
      <StopButton />
      <ScrollToBottomButton />
      <FileManagerPanel />
      <KeyboardShortcutsPanel />
      {/* Toast notifications */}
      <For each={toasts}>
        {(toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => dismissToast(toast.id)}
          />
        )}
      </For>
      {/* Analytics Dashboard (full screen mode) */}
      <Show when={showAnalytics && !splitScreenMode.value}>
        <AnalyticsDashboard />
      </Show>
    </div>
  );
}
