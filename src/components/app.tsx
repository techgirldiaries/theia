import { For } from "@preact/signals/utils";
import type { Attachment } from "@relevanceai/sdk";
import { AgentMessage } from "@/components/agent-message";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { AuditLogViewer } from "@/components/audit-log-viewer";
import { AuthGate } from "@/components/auth-gate";
import { DatasetsManager } from "@/components/datasets-manager";
import { EmptyState } from "@/components/empty-state";
import { Footer } from "@/components/footer";
import { FraudReportsViewer } from "@/components/fraud-reports-viewer";
import { Header } from "@/components/header";
import { HistorySidebar } from "@/components/history-sidebar";
import { KeyboardShortcutsPanel } from "@/components/keyboard-shortcuts";
import { LeftSidebar } from "@/components/left-sidebar";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { PerformanceMetrics } from "@/components/performance-metrics";
import { QuickActions } from "@/components/quick-actions";
import { RightActionBar } from "@/components/right-action-bar";
import { ScrollToBottomButton } from "@/components/scroll-to-bottom";
import { Settings } from "@/components/settings";
import { StopButton } from "@/components/stop-button";
import { Toast } from "@/components/toast";
import { UserMessage } from "@/components/user-message";
import { FileManagerPanel } from "@/components/file-manager";
import {
  dismissToast,
  interfaceMode,
  isAgentTyping,
  isAuthenticated,
  isInitialized,
  loadingError,
  messages,
  showAnalytics,
  showAuditLog,
  showFileManager,
  showQuickActions,
  showReports,
  showSettings,
  splitScreenMode,
  toasts,
  workforce,
} from "@/signals";

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
  // Show auth gate when passphrase is configured and user hasn't authenticated yet.
  if (!isAuthenticated.value) {
    return <AuthGate />;
  }

  if (!isInitialized.value) {
    return (
      <div class="flex items-center justify-center min-h-dvh bg-zinc-50 dark:bg-zinc-950">
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
      <div class="flex items-center justify-center min-h-dvh bg-zinc-50 dark:bg-zinc-950 p-4">
        <div class="max-w-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/50 rounded-lg p-6">
          <h2 class="text-red-600 dark:text-red-400 text-xl font-bold mb-2">
            Configuration Error
          </h2>
          <p class="text-red-700 dark:text-red-300 mb-4">
            {loadingError.value}
          </p>
          <div class="bg-zinc-100 dark:bg-zinc-900 rounded p-3 text-sm font-mono text-zinc-700 dark:text-zinc-300">
            <p class="mb-2">Check your .env file:</p>
            <pre class="text-xs text-zinc-600 dark:text-zinc-400">
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
    <div class="flex flex-col min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      {/* Left Navigation Sidebar - Hidden in easy and focus modes */}
      {interfaceMode.value !== "easy" && interfaceMode.value !== "focus" && (
        <LeftSidebar />
      )}

      {/* Right Action Bar - Expert mode only */}
      {interfaceMode.value === "expert" && <RightActionBar />}

      <Header />
      <div
        class={`flex flex-1 pt-16 pb-20 ${splitScreenMode.value ? "flex-col lg:flex-row" : "flex-col"}`}
      >
        <main
          class={`${splitScreenMode.value ? "w-full lg:w-1/2" : "w-full"} ${
            // Adjust padding based on interface mode
            interfaceMode.value === "easy" || interfaceMode.value === "focus"
              ? "pl-0 pr-0" // No sidebars in easy/focus mode
              : interfaceMode.value === "balanced"
                ? "pl-0 md:pl-16 lg:pl-16 1440:pl-56 pr-0" // Left sidebar only
                : "pl-0 md:pl-16 lg:pl-16 1440:pl-56 pr-0" // Both sidebars in expert
          } py-4 bg-zinc-50 dark:bg-zinc-950 transition-all duration-300 overflow-auto`}
        >
          {/* Show dataset manager inline when Datasets is selected */}
          {showFileManager.value && !splitScreenMode.value && (
            <div class="max-w-4xl mx-auto">
              <DatasetsManager />
            </div>
          )}

          {/* Show analytics dashboard when Analytics is selected (not in split screen) */}
          {showAnalytics.value && !splitScreenMode.value && (
            <div class="max-w-6xl mx-auto">
              <AnalyticsDashboard />
            </div>
          )}

          {/* Show reports inline when Reports is selected */}
          {showReports.value && !splitScreenMode.value && (
            <div class="max-w-4xl mx-auto">
              <FraudReportsViewer />
            </div>
          )}

          {/* Show audit log inline when Audit Log is selected */}
          {showAuditLog.value && !splitScreenMode.value && (
            <div class="max-w-6xl mx-auto">
              <AuditLogViewer />
            </div>
          )}

          {/* Show quick actions when Quick Actions is selected */}
          {showQuickActions.value && !splitScreenMode.value && (
            <div class="max-w-4xl mx-auto">
              <QuickActions />
            </div>
          )}

          {/* Show settings when Settings is selected */}
          {showSettings.value && !splitScreenMode.value && (
            <div class="max-w-4xl mx-auto">
              <Settings />
            </div>
          )}

          {/* Show chat messages only when no other view is active */}
          {!showFileManager.value &&
            !showAnalytics.value &&
            !showReports.value &&
            !showAuditLog.value &&
            !showQuickActions.value &&
            !showSettings.value && (
              <div class="chat-container w-full max-w-4xl mx-auto px-4 flex flex-col gap-y-4 min-h-[calc(100vh-12rem)] pb-4">
                {messages.value.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div class="chat-messages flex flex-col gap-y-4 flex-1">
                    {messages.value.map((m) =>
                      m.isAgent?.() || m.type === "agent-message" ? (
                        <AgentMessage key={m.id} message={m as Message} />
                      ) : (
                        <UserMessage key={m.id} message={m as Message} />
                      ),
                    )}
                  </div>
                )}
                {isAgentTyping.value && (
                  <LoadingSkeleton isWorkforce={!!workforce.value} />
                )}
                <div class="h-20 shrink-0"></div>
              </div>
            )}
        </main>
        {splitScreenMode.value && (
          <div class="w-full lg:w-1/2 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 overflow-auto">
            <PerformanceMetrics />
          </div>
        )}
      </div>
      <Footer />
      <StopButton />
      <ScrollToBottomButton />

      {/* History Sidebar - Available in balanced and expert modes */}
      {interfaceMode.value !== "easy" && interfaceMode.value !== "focus" && (
        <HistorySidebar />
      )}

      {/* Keyboard Shortcuts Panel - Available in all modes */}
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
    </div>
  );
}
