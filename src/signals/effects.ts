import { effect } from "@preact/signals";
import { Agent, Workforce } from "@relevanceai/sdk";
import { AGENT_ID, WORKFORCE_ID } from "@/constant";
import {
  saveChatSessionToHistory,
  saveDatasetsToStorage,
  saveMessagesToStorage,
  saveMetricsToStorage,
} from "./storage";
import { endPerformanceTracking, showToast } from "./actions";
import {
  agent,
  agentMode,
  client,
  compactView,
  connectionRetryCount,
  isDarkMode,
  isAgentTyping,
  isInitialized,
  loadingError,
  messageDraft,
  messages,
  performanceMetrics,
  showScrollToBottom,
  task,
  taskStatus,
  uploadedDatasets,
  workforce,
} from "./state";

// ── Dark mode ─────────────────────────────────────────────────────────────────
effect(() => {
  try {
    localStorage.setItem("darkMode", isDarkMode.value.toString());
    document.documentElement.classList.toggle("dark", isDarkMode.value);
  } catch {
    document.documentElement.classList.toggle("dark", isDarkMode.value);
  }
});

// ── Message persistence + auto-scroll ────────────────────────────────────────
effect(() => {
  if (messages.value.length > 0) {
    saveMessagesToStorage(messages.value);
    setTimeout(() => {
      const isNearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100;
      if (isNearBottom) {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 100);
  }
});

// ── Auto-save session on tab/window close ───────────────────────────────────
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    if (messages.value.length > 0) {
      saveChatSessionToHistory(messages.value);
    }
  });
}

// ── Scroll-to-bottom button visibility ───────────────────────────────────────
if (typeof window !== "undefined") {
  window.addEventListener("scroll", () => {
    showScrollToBottom.value =
      messages.value.length > 0 &&
      window.innerHeight + window.scrollY <
        document.documentElement.scrollHeight - 300;
  });
}

// ── Preference persistence ────────────────────────────────────────────────────
effect(() => {
  localStorage.setItem("compactView", compactView.value.toString());
});

effect(() => {
  localStorage.setItem("agentMode", agentMode.value);
});

effect(() => {
  if (messageDraft.value) {
    localStorage.setItem("fraud-message-draft", messageDraft.value);
  } else {
    localStorage.removeItem("fraud-message-draft");
  }
});

// ── Load draft on startup ─────────────────────────────────────────────────────
if (typeof window !== "undefined") {
  const savedDraft = localStorage.getItem("fraud-message-draft");
  if (savedDraft) messageDraft.value = savedDraft;
}

// ── Dataset + metrics persistence ────────────────────────────────────────────
effect(() => {
  if (uploadedDatasets.value.length > 0) {
    saveDatasetsToStorage(uploadedDatasets.value);
  }
});

effect(() => {
  if (performanceMetrics.value.length > 0) {
    saveMetricsToStorage(performanceMetrics.value);
  }
});

// ── Relevance AI connection ───────────────────────────────────────────────────
effect(() => {
  if (!client.value) return;

  const attemptConnection = (retryCount = 0) => {
    const timeout = (ms: number) =>
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Connection timeout")), ms),
      );

    if (WORKFORCE_ID) {
      console.log(
        `Attempting to load workforce: ${WORKFORCE_ID} (attempt ${retryCount + 1})`,
      );
      Promise.race([Workforce.get(WORKFORCE_ID, client.value!), timeout(30000)])
        .then((w: any) => {
          console.log("Workforce loaded successfully");
          workforce.value = w;
          isInitialized.value = true;
          loadingError.value = null;
          connectionRetryCount.value = 0;
          if (retryCount > 0) {
            showToast("Successfully reconnected to workforce!", "success");
          }
        })
        .catch((error) => {
          console.error("Failed to load workforce:", error);
          loadingError.value =
            "Failed to connect to workforce. Please check your configuration.";
          isInitialized.value = true;
          if (retryCount < 3) {
            const delay = Math.min(1000 * 2 ** retryCount, 5000);
            connectionRetryCount.value = retryCount + 1;
            showToast(
              `Connection failed. Retrying in ${delay / 1000}s...`,
              "info",
            );
            setTimeout(() => attemptConnection(retryCount + 1), delay);
          } else {
            showToast(
              "Failed to connect to workforce after multiple attempts",
              "error",
            );
          }
        });
    } else if (AGENT_ID) {
      console.log(
        `Attempting to load agent: ${AGENT_ID} (attempt ${retryCount + 1})`,
      );
      Promise.race([Agent.get(AGENT_ID, client.value!), timeout(30000)])
        .then((a: any) => {
          console.log("Agent loaded successfully");
          agent.value = a;
          isInitialized.value = true;
          loadingError.value = null;
          connectionRetryCount.value = 0;
          if (retryCount > 0) {
            showToast("Successfully reconnected to agent!", "success");
          }
        })
        .catch((error) => {
          console.error("Failed to load agent:", error);
          loadingError.value =
            "Failed to connect to agent. Please check your configuration.";
          isInitialized.value = true;
          if (retryCount < 3) {
            const delay = Math.min(1000 * 2 ** retryCount, 5000);
            connectionRetryCount.value = retryCount + 1;
            showToast(
              `Connection failed. Retrying in ${delay / 1000}s...`,
              "info",
            );
            setTimeout(() => attemptConnection(retryCount + 1), delay);
          } else {
            showToast(
              "Failed to connect to agent after multiple attempts",
              "error",
            );
          }
        });
    } else {
      console.error("No AGENT_ID or WORKFORCE_ID configured");
      loadingError.value = "No AGENT_ID or WORKFORCE_ID configured.";
      isInitialized.value = true;
    }
  };

  attemptConnection();
});

// ── Task event listeners ──────────────────────────────────────────────────────
effect(() => {
  const t = task.value;
  if (!t) return;

  taskStatus.value = t.status;

  t.addEventListener("updated", () => {
    taskStatus.value = t.status;

    if (t.status === "queued") {
      showToast("Your request is queued for processing", "info");
    } else if (t.status === "running") {
      isAgentTyping.value = true;
    } else if (
      (t.status as string) === "completed" ||
      (t.status as string) === "success"
    ) {
      isAgentTyping.value = false;
      showToast("Analysis completed successfully", "success");

      const msgs = messages.value;
      const lastMsg = msgs[msgs.length - 1];
      let riskScore: number | undefined;
      let agentContributions: number | undefined;
      if (lastMsg?.type === "agent-message") {
        const match = lastMsg.text.match(/Risk\s+Score[:\s]+(\d+)/i);
        if (match) riskScore = parseInt(match[1], 10);
        const agentMatches = lastMsg.text.match(
          /\d+\.\s*\w+(?:\s+\w+)*\s*Agent/g,
        );
        agentContributions = agentMatches?.length;
      }
      endPerformanceTracking(t.id, t.status, riskScore, agentContributions);
    } else if (t.status === "error" || (t.status as string) === "stopped") {
      isAgentTyping.value = false;
      endPerformanceTracking(t.id, t.status);
    }
  });

  t.addEventListener("error", ({ detail }: any) => {
    const { message } = detail;
    console.error("Task error:", message);
    showToast(
      `Error: ${message.text || "An unexpected error occurred"}`,
      "error",
    );
    isAgentTyping.value = false;
  });

  t.addEventListener("message", ({ detail }: any) => {
    const { message } = detail;
    const msgs = messages.value;
    const optimisticIdx = msgs.findIndex(
      (m) => m.type === "user-message" && m.id === "optimistic",
    );

    if (optimisticIdx !== -1) {
      // Replace the optimistic placeholder with the first confirmed message
      const copy = [...msgs];
      copy[optimisticIdx] = message;
      messages.value = copy;
      isAgentTyping.value = true;
    } else {
      // If a message with the same ID already exists, update it in-place
      // (streaming: the SDK fires multiple events for the same message ID)
      const existingIdx = msgs.findIndex((m) => m.id === message.id);
      if (existingIdx !== -1) {
        const copy = [...msgs];
        copy[existingIdx] = message;
        messages.value = copy;
      } else {
        // Skip SDK-echoed user-messages that carry no visible content —
        // the SDK can fire a second user-message event after the optimistic
        // placeholder has already been consumed, producing a blank bubble.
        const isEmptyUserMsg =
          (message.type === "user-message" || !message.isAgent?.()) &&
          !message.text?.trim() &&
          !message.attachments?.length;
        if (!isEmptyUserMsg) {
          messages.value = [...msgs, message];
        }
      }
      if (message.type === "agent-message" || message.isAgent?.()) {
        isAgentTyping.value = false;
      }
    }
  });

  return () => {
    t.unsubscribe();
  };
});
