import { computed, effect, signal } from "@preact/signals";
import {
  Agent,
  type Attachment,
  type Client,
  type Task,
  type TaskStatus,
  Workforce,
} from "@relevanceai/sdk";
import { AGENT_ID, WORKFORCE_ID } from "@/constant";

type ToastMessage = {
  id: string;
  message: string;
  type: "success" | "error" | "info";
};

type Message = {
  id: string;
  type: "agent-message" | "user-message";
  text: string;
  createdAt: Date;
  isAgent: () => boolean;
  attachments?: Attachment[];
};

type DatasetInfo = {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
  size?: number;
};

type PerformanceMetric = {
  taskId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: TaskStatus;
  riskScore?: number;
  agentContributions?: number;
};

type FraudStats = {
  totalAnalyzed: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  avgResponseTime: number;
  successRate: number;
};

// Helper functions for message persistence
function saveMessagesToStorage(msgs: Message[]) {
  try {
    const serialized = msgs.map((m) => ({
      id: m.id,
      type: m.type,
      text: m.text,
      createdAt: m.createdAt.toISOString(),
      attachments: m.attachments,
    }));
    localStorage.setItem("fraud-chat-history", JSON.stringify(serialized));
  } catch (error) {
    console.error("Failed to save messages:", error);
  }
}

function loadMessagesFromStorage(): Message[] {
  try {
    const saved = localStorage.getItem("fraud-chat-history");
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    return parsed.map((m: any) => ({
      id: m.id,
      type: m.type,
      text: m.text,
      createdAt: new Date(m.createdAt),
      isAgent: () => m.type === "agent-message",
      attachments: m.attachments,
    }));
  } catch (error) {
    console.error("Failed to load messages:", error);
    return [];
  }
}

export function clearChatHistory() {
  messages.value = [];
  uploadedDatasets.value = [];
  performanceMetrics.value = [];
  localStorage.removeItem("fraud-chat-history");
  localStorage.removeItem("fraud-datasets");
  localStorage.removeItem("fraud-performance");
}

// Helper functions for dataset persistence
function saveDatasetsToStorage(datasets: DatasetInfo[]) {
  try {
    const serialized = datasets.map((d) => ({
      ...d,
      uploadedAt: d.uploadedAt.toISOString(),
    }));
    localStorage.setItem("fraud-datasets", JSON.stringify(serialized));
  } catch (error) {
    console.error("Failed to save datasets:", error);
  }
}

function loadDatasetsFromStorage(): DatasetInfo[] {
  try {
    const saved = localStorage.getItem("fraud-datasets");
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return parsed.map((d: any) => ({
      ...d,
      uploadedAt: new Date(d.uploadedAt),
    }));
  } catch (error) {
    console.error("Failed to load datasets:", error);
    return [];
  }
}

// Helper functions for performance metrics persistence
function saveMetricsToStorage(metrics: PerformanceMetric[]) {
  try {
    const serialized = metrics.map((m) => ({
      ...m,
      startTime: m.startTime.toISOString(),
      endTime: m.endTime?.toISOString(),
    }));
    localStorage.setItem("fraud-performance", JSON.stringify(serialized));
  } catch (error) {
    console.error("Failed to save metrics:", error);
  }
}

function loadMetricsFromStorage(): PerformanceMetric[] {
  try {
    const saved = localStorage.getItem("fraud-performance");
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return parsed.map((m: any) => ({
      ...m,
      startTime: new Date(m.startTime),
      endTime: m.endTime ? new Date(m.endTime) : undefined,
    }));
  } catch (error) {
    console.error("Failed to load metrics:", error);
    return [];
  }
}

// Load saved messages on startup
const savedMessages = loadMessagesFromStorage();
export const messages = signal<Message[]>(savedMessages);

// Load saved datasets and metrics
const savedDatasets = loadDatasetsFromStorage();
export const uploadedDatasets = signal<DatasetInfo[]>(savedDatasets);
const savedMetrics = loadMetricsFromStorage();
export const performanceMetrics = signal<PerformanceMetric[]>(savedMetrics);

export const client = signal<Client>();
export const agent = signal<Agent>();
export const workforce = signal<Workforce>();
export const task = signal<Task<any, any>>();
export const isAgentTyping = signal(false);
export const taskStatus = signal<TaskStatus | null>(null);
export const isInitialized = signal(false);
export const loadingError = signal<string | null>(null);
export const toasts = signal<ToastMessage[]>([]);
export const connectionRetryCount = signal(0);
export const showAnalytics = signal(false);
export const isDarkMode = signal(
  localStorage.getItem("darkMode") === "true" ||
    (localStorage.getItem("darkMode") === "false"
      ? false
      : window.matchMedia("(prefers-color-scheme: dark)").matches),
);

export const agentName = computed(
  () => agent.value?.name ?? workforce.value?.name,
);
export const agentInitials = computed(() =>
  agentName.value
    ?.split(/\W+/)
    .slice(0, 2)
    .map((s) => s.toLocaleUpperCase().charAt(0))
    .join(""),
);
export const agentAvatar = computed(() => agent.value?.avatar);
export const agentDescription = computed(() => agent.value?.description);

// Toast notification helpers
export function showToast(
  message: string,
  type: "success" | "error" | "info" = "info",
) {
  const id = `toast-${Date.now()}-${Math.random()}`;
  toasts.value = [...toasts.value, { id, message, type }];
}

export function dismissToast(id: string) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

// Dataset management helpers
export function addDataset(dataset: DatasetInfo) {
  uploadedDatasets.value = [...uploadedDatasets.value, dataset];
  showToast(`Dataset "${dataset.fileName}" uploaded successfully`, "success");
}

export function getActiveDataset(): DatasetInfo | null {
  const datasets = uploadedDatasets.value;
  return datasets.length > 0 ? datasets[datasets.length - 1] : null;
}

// Performance metrics helpers
export function startPerformanceTracking(taskId: string): void {
  const metric: PerformanceMetric = {
    taskId,
    startTime: new Date(),
    status: "in_progress",
  };
  performanceMetrics.value = [...performanceMetrics.value, metric];
}

export function endPerformanceTracking(
  taskId: string,
  status: TaskStatus,
  riskScore?: number,
  agentContributions?: number,
): void {
  const metrics = performanceMetrics.value;
  const index = metrics.findIndex((m) => m.taskId === taskId);
  if (index !== -1) {
    const metric = metrics[index];
    const endTime = new Date();
    const duration = endTime.getTime() - metric.startTime.getTime();
    metrics[index] = {
      ...metric,
      endTime,
      duration,
      status,
      riskScore,
      agentContributions,
    };
    performanceMetrics.value = [...metrics];
  }
}

// Computed fraud statistics
export const fraudStats = computed<FraudStats>(() => {
  const metrics = performanceMetrics.value.filter((m) => m.endTime);
  const totalAnalyzed = metrics.length;

  if (totalAnalyzed === 0) {
    return {
      totalAnalyzed: 0,
      highRisk: 0,
      mediumRisk: 0,
      lowRisk: 0,
      avgResponseTime: 0,
      successRate: 0,
    };
  }

  const highRisk = metrics.filter((m) => (m.riskScore ?? 0) >= 70).length;
  const mediumRisk = metrics.filter(
    (m) => (m.riskScore ?? 0) >= 45 && (m.riskScore ?? 0) < 70,
  ).length;
  const lowRisk = metrics.filter((m) => (m.riskScore ?? 0) < 45).length;

  const totalDuration = metrics.reduce((sum, m) => sum + (m.duration ?? 0), 0);
  const avgResponseTime = totalDuration / totalAnalyzed;

  const successfulTasks = metrics.filter(
    (m) => m.status === "complete" || m.status === "success",
  ).length;
  const successRate = (successfulTasks / totalAnalyzed) * 100;

  return {
    totalAnalyzed,
    highRisk,
    mediumRisk,
    lowRisk,
    avgResponseTime,
    successRate,
  };
});

// Persist dark mode preference
effect(() => {
  localStorage.setItem("darkMode", isDarkMode.value.toString());
  if (isDarkMode.value) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
});

// Persist chat history to localStorage
effect(() => {
  if (messages.value.length > 0) {
    saveMessagesToStorage(messages.value);
  }
});

// Persist datasets to localStorage
effect(() => {
  if (uploadedDatasets.value.length > 0) {
    saveDatasetsToStorage(uploadedDatasets.value);
  }
});

// Persist performance metrics to localStorage
effect(() => {
  if (performanceMetrics.value.length > 0) {
    saveMetricsToStorage(performanceMetrics.value);
  }
});

// Connection with retry logic
effect(() => {
  if (client.value) {
    const attemptConnection = (retryCount = 0) => {
      if (WORKFORCE_ID) {
        Workforce.get(WORKFORCE_ID, client.value!)
          .then((w) => {
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

            // Auto-retry up to 3 times
            if (retryCount < 3) {
              const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
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
        Agent.get(AGENT_ID, client.value!)
          .then((a) => {
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

            // Auto-retry up to 3 times
            if (retryCount < 3) {
              const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
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
        loadingError.value = "No AGENT_ID or WORKFORCE_ID configured.";
        isInitialized.value = true;
      }
    };

    attemptConnection();
  }
});

effect(() => {
  const t = task.value;

  if (t) {
    // Track task status
    taskStatus.value = t.status;

    // Listen for status updates
    t.addEventListener("updated", () => {
      taskStatus.value = t.status;

      // Show status change notifications for important states
      if (t.status === "queued") {
        showToast("Your request is queued for processing", "info");
      } else if (t.status === "running") {
        isAgentTyping.value = true;
      } else if (t.status === "completed" || t.status === "success") {
        isAgentTyping.value = false;
        showToast("Analysis completed successfully", "success");

        // End performance tracking - extract risk score from messages
        const lastMessage = messages.value[messages.value.length - 1];
        let riskScore: number | undefined;
        let agentContributions: number | undefined;

        if (lastMessage && lastMessage.type === "agent-message") {
          const riskMatch = lastMessage.text.match(/Risk\s+Score[:\s]+(\d+)/i);
          if (riskMatch) {
            riskScore = parseInt(riskMatch[1]);
          }
          // Count agent mentions
          const agentMatches = lastMessage.text.match(
            /\d+\.\s*\w+(?:\s+\w+)*\s*Agent/g,
          );
          agentContributions = agentMatches ? agentMatches.length : undefined;
        }

        endPerformanceTracking(t.id, t.status, riskScore, agentContributions);
      } else if (t.status === "error" || t.status === "stopped") {
        isAgentTyping.value = false;
        endPerformanceTracking(t.id, t.status);
      }
    });

    // Listen for error events
    t.addEventListener("error", ({ detail }: any) => {
      const { message } = detail;
      console.error("Task error:", message);
      showToast(
        `Error: ${message.text || "An unexpected error occurred"}`,
        "error",
      );
      isAgentTyping.value = false;
    });

    // Listen for message events
    t.addEventListener("message", ({ detail }: any) => {
      const { message } = detail;
      const msgs = messages.value;
      const optimistic = msgs.find(
        (m) => m.type === "user-message" && m.id === "optimistic",
      );

      if (optimistic) {
        const i = msgs.indexOf(optimistic);
        const copy = msgs.concat();
        copy.splice(i, 1, message);

        messages.value = copy;
        isAgentTyping.value = true;
      } else {
        messages.value = [...msgs, message];

        if (message.type === "agent-message") {
          isAgentTyping.value = false;
        }
      }
    });
  }

  return () => {
    t?.unsubscribe();
  };
});
