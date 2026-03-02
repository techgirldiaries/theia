import { For, Show } from "@preact/signals/utils";
import { AgentMessage } from "@/components/agent-message";
import { AgentTyping } from "@/components/agent-typing";
import { EmptyState } from "@/components/empty-state";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { UserMessage } from "@/components/user-message";
import {
  isAgentTyping,
  isInitialized,
  loadingError,
  messages,
} from "@/signals";

type Message = {
  id: string;
  type: "agent-message" | "user-message";
  text: string;
  createdAt: Date;
  isAgent: () => boolean;
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
      <main class="flex-1 p-4 bg-zinc-50 dark:bg-zinc-950 transition-colors">
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
            <AgentTyping />
          </Show>
        </div>
      </main>
      <Footer />
    </div>
  );
}
