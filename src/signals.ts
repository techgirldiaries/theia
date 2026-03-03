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
  status?: "sending" | "sent" | "failed";
  read?: boolean;
  errorMessage?: string;
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

type ChatSession = {
  id: string;
  startTime: Date;
  endTime: Date;
  messages: Message[];
  messageCount: number;
  tags?: string[];
  riskLevel?: "low" | "medium" | "high";
};

type AuditLogEntry = {
  id: string;
  timestamp: Date;
  action:
    | "view"
    | "export"
    | "delete"
    | "upload"
    | "session_start"
    | "session_end";
  userId: string;
  details: string;
  sessionId?: string;
};

type QuickTemplate = {
  id: string;
  title: string;
  prompt: string;
  category: "analysis" | "report" | "risk" | "investigation";
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

// Helper functions for chat sessions history
function saveChatSessionToHistory(msgs: Message[]): void {
  try {
    if (msgs.length === 0) return;

    // Detect risk level from messages
    let riskLevel: "low" | "medium" | "high" | undefined;
    for (const msg of msgs) {
      const riskMatch = msg.text.match(/Risk\s+Score[:\s]+(\d+)/i);
      if (riskMatch) {
        const score = parseInt(riskMatch[1]);
        if (score >= 70) riskLevel = "high";
        else if (score >= 45) riskLevel = "medium";
        else riskLevel = "low";
        break;
      }
    }

    const sessions = loadChatSessionsFromStorage();
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      startTime: msgs[0].createdAt,
      endTime: new Date(),
      messages: msgs,
      messageCount: msgs.length,
      tags: [],
      riskLevel,
    };

    sessions.push(newSession);
    const serialized = sessions.map((s) => ({
      ...s,
      startTime: s.startTime.toISOString(),
      endTime: s.endTime.toISOString(),
      messages: s.messages.map((m) => ({
        id: m.id,
        type: m.type,
        text: m.text,
        createdAt: m.createdAt.toISOString(),
        attachments: m.attachments,
        status: m.status,
        read: m.read,
      })),
    }));

    const jsonString = JSON.stringify(serialized.slice(-10));
    const encrypted = simpleEncrypt(jsonString);
    localStorage.setItem("fraud-chat-sessions", encrypted); // Keep last 10 sessions encrypted
  } catch (error) {
    console.error("Failed to save chat session:", error);
  }
}

function loadChatSessionsFromStorage(): ChatSession[] {
  try {
    const saved = localStorage.getItem("fraud-chat-sessions");
    if (!saved) return [];

    // Try to decrypt first, fallback to plain JSON if it fails (for backward compatibility)
    let jsonString: string;
    try {
      jsonString = simpleDecrypt(saved);
      JSON.parse(jsonString); // Test if valid JSON
    } catch {
      // If decryption fails, assume it's plain JSON
      jsonString = saved;
    }

    const parsed = JSON.parse(jsonString);
    return parsed.map((s: any) => ({
      id: s.id,
      startTime: new Date(s.startTime),
      endTime: new Date(s.endTime),
      messageCount: s.messageCount,
      tags: s.tags || [],
      riskLevel: s.riskLevel,
      messages: s.messages.map((m: any) => ({
        id: m.id,
        type: m.type,
        text: m.text,
        createdAt: new Date(m.createdAt),
        isAgent: () => m.type === "agent-message",
        attachments: m.attachments,
        status: m.status,
        read: m.read,
      })),
    }));
  } catch (error) {
    console.error("Failed to load chat sessions:", error);
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
  localStorage.removeItem("fraud-chat-sessions");
}

export function startNewChat() {
  // Save current conversation to history before clearing
  if (messages.value.length > 0) {
    const sessionId = `session-${Date.now()}`;
    saveChatSessionToHistory(messages.value);
    logAuditEntry(
      "session_end",
      `Ended session with ${messages.value.length} messages`,
      sessionId,
    );
    showToast(
      `Chat saved to history (${messages.value.length} messages)`,
      "success",
    );
  }

  // Clear the UI completely
  messages.value = [];

  // Unsubscribe from current task to start fresh
  if (task.value) {
    task.value.unsubscribe();
    task.value = undefined;
  }

  // Reset all task-related states
  isAgentTyping.value = false;
  taskStatus.value = null;

  // Log new session start
  logAuditEntry("session_start", "Started new chat session");

  // Scroll to top for empty state
  setTimeout(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, 100);
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

// Load saved messages on startup and archive them automatically
const savedMessages = loadMessagesFromStorage();

// Auto-archive any existing conversation from previous session
if (savedMessages.length > 0) {
  saveChatSessionToHistory(savedMessages);
  localStorage.removeItem("fraud-chat-history"); // Clear current chat storage
}

// Always start with empty chat on page reload
export const messages = signal<Message[]>([]);

// Load saved datasets and metrics
const savedDatasets = loadDatasetsFromStorage();
export const uploadedDatasets = signal<DatasetInfo[]>(savedDatasets);
const savedMetrics = loadMetricsFromStorage();
export const performanceMetrics = signal<PerformanceMetric[]>(savedMetrics);

// Helper to get chat sessions (computed on demand)
export function getChatSessions(): ChatSession[] {
  return loadChatSessionsFromStorage();
}

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

// New UI state signals
export const showScrollToBottom = signal(false);
export const showFileManager = signal(false);
export const compactView = signal(
  localStorage.getItem("compactView") === "true",
);
export const splitScreenMode = signal(false);
export const messageDraft = signal("");
export const selectedSessionForComparison = signal<ChatSession | null>(null);
export const sessionSearchQuery = signal("");
export const sessionTagFilter = signal<string | null>(null);
export const showKeyboardShortcuts = signal(false);
export const isVoiceRecording = signal(false);
export const showAutoComplete = signal(false);
export const autoCompleteQuery = signal("");

// Encryption key (in production, use a more secure method)
const ENCRYPTION_KEY = "fraud-intelligence-key-2026";

// Fraud analysis autocomplete suggestions
export const fraudAnalysisTerms = [
  "transaction analysis",
  "anomaly detection",
  "risk assessment",
  "fraud pattern identification",
  "suspicious activity report",
  "chargeback analysis",
  "identity verification",
  "account takeover detection",
  "payment fraud screening",
  "behavioral analysis",
  "velocity checks",
  "device fingerprinting",
  "geolocation analysis",
  "network analysis",
  "money laundering detection",
];

// Quick templates
export const quickTemplates = signal<QuickTemplate[]>([
  {
    id: "1",
    title: "Analyze for Anomalies",
    prompt:
      "Please analyze the uploaded dataset for anomalies, unusual patterns, and potential fraud indicators. Provide a detailed risk assessment.",
    category: "analysis",
  },
  {
    id: "2",
    title: "Generate Fraud Report",
    prompt:
      "Generate a comprehensive fraud report based on the data, including risk scores, fraud patterns, and recommendations.",
    category: "report",
  },
  {
    id: "3",
    title: "Risk Assessment",
    prompt:
      "Perform a risk assessment on the transactions and categorize them by risk level (low, medium, high).",
    category: "risk",
  },
  {
    id: "4",
    title: "Deep Investigation",
    prompt:
      "Conduct a deep investigation into suspicious activities, trace transaction patterns, and identify potential fraud networks.",
    category: "investigation",
  },
  {
    id: "5",
    title: "Evaluate Performance",
    prompt:
      "Evaluate the fraud detection performance metrics including accuracy, false positives, false negatives, and provide optimization recommendations.",
    category: "analysis",
  },
  {
    id: "6",
    title: "Compare Datasets",
    prompt:
      "Compare the uploaded datasets and identify differences in fraud patterns, transaction volumes, and risk profiles between them.",
    category: "analysis",
  },
  {
    id: "7",
    title: "Identify Trends",
    prompt:
      "Analyze temporal trends in the fraud data, identify seasonal patterns, emerging fraud types, and predict future risks.",
    category: "analysis",
  },
  {
    id: "8",
    title: "Compliance Check",
    prompt:
      "Review the transactions for compliance with AML/KYC regulations, flag suspicious transactions, and generate compliance reports.",
    category: "report",
  },
  {
    id: "9",
    title: "Customer Segmentation",
    prompt:
      "Segment customers based on transaction behavior, risk profiles, and fraud likelihood. Provide detailed profiles for each segment.",
    category: "analysis",
  },
  {
    id: "10",
    title: "Network Analysis",
    prompt:
      "Perform network analysis to identify fraud rings, connected suspicious accounts, and money laundering schemes.",
    category: "investigation",
  },
]);

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

// Audit log helpers
function saveAuditLog(entry: AuditLogEntry) {
  try {
    const saved = localStorage.getItem("fraud-audit-log");
    const logs: AuditLogEntry[] = saved ? JSON.parse(saved) : [];
    const serialized = {
      ...entry,
      timestamp: entry.timestamp.toISOString(),
    };
    logs.push(serialized);
    // Keep last 100 audit entries
    localStorage.setItem("fraud-audit-log", JSON.stringify(logs.slice(-100)));
  } catch (error) {
    console.error("Failed to save audit log:", error);
  }
}

export function logAuditEntry(
  action: AuditLogEntry["action"],
  details: string,
  sessionId?: string,
) {
  const entry: AuditLogEntry = {
    id: `audit-${Date.now()}`,
    timestamp: new Date(),
    action,
    userId: "current-user", // In production, use actual user ID
    details,
    sessionId,
  };
  saveAuditLog(entry);
}

export function getAuditLogs(): AuditLogEntry[] {
  try {
    const saved = localStorage.getItem("fraud-audit-log");
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return parsed.map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    }));
  } catch (error) {
    console.error("Failed to load audit logs:", error);
    return [];
  }
}

// Session restoration
export function restoreSession(session: ChatSession) {
  // Save current session if it has messages
  if (messages.value.length > 0) {
    saveChatSessionToHistory(messages.value);
  }

  // Restore the selected session
  messages.value = session.messages;

  // Reset task for fresh context
  if (task.value) {
    task.value.unsubscribe();
    task.value = undefined;
  }

  logAuditEntry("view", `Restored session: ${session.id}`, session.id);
  showToast(`Session restored (${session.messageCount} messages)`, "success");

  // Scroll to top
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 100);
}

// Session tagging
export function addTagToSession(sessionId: string, tag: string) {
  try {
    const sessions = loadChatSessionsFromStorage();
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      if (!session.tags) session.tags = [];
      if (!session.tags.includes(tag)) {
        session.tags.push(tag);
        const serialized = sessions.map((s) => ({
          ...s,
          startTime: s.startTime.toISOString(),
          endTime: s.endTime.toISOString(),
          messages: s.messages.map((m) => ({
            id: m.id,
            type: m.type,
            text: m.text,
            createdAt: m.createdAt.toISOString(),
            attachments: m.attachments,
            status: m.status,
            read: m.read,
          })),
        }));
        localStorage.setItem("fraud-chat-sessions", JSON.stringify(serialized));
        showToast(`Tag "${tag}" added`, "success");
      }
    }
  } catch (error) {
    console.error("Failed to add tag:", error);
  }
}

export function removeTagFromSession(sessionId: string, tag: string) {
  try {
    const sessions = loadChatSessionsFromStorage();
    const session = sessions.find((s) => s.id === sessionId);
    if (session && session.tags) {
      session.tags = session.tags.filter((t) => t !== tag);
      const serialized = sessions.map((s) => ({
        ...s,
        startTime: s.startTime.toISOString(),
        endTime: s.endTime.toISOString(),
        messages: s.messages.map((m) => ({
          id: m.id,
          type: m.type,
          text: m.text,
          createdAt: m.createdAt.toISOString(),
          attachments: m.attachments,
          status: m.status,
          read: m.read,
        })),
      }));
      localStorage.setItem("fraud-chat-sessions", JSON.stringify(serialized));
      showToast(`Tag "${tag}" removed`, "success");
    }
  } catch (error) {
    console.error("Failed to remove tag:", error);
  }
}

// Simple encryption/decryption utilities (for localStorage)
function simpleEncrypt(text: string): string {
  try {
    // Simple XOR cipher with base64 encoding (not cryptographically secure, but better than plain text)
    const key = ENCRYPTION_KEY;
    let encrypted = "";
    for (let i = 0; i < text.length; i++) {
      encrypted += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length),
      );
    }
    return btoa(encrypted);
  } catch (error) {
    console.error("Encryption failed:", error);
    return text;
  }
}

function simpleDecrypt(encrypted: string): string {
  try {
    const key = ENCRYPTION_KEY;
    const decoded = atob(encrypted);
    let decrypted = "";
    for (let i = 0; i < decoded.length; i++) {
      decrypted += String.fromCharCode(
        decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length),
      );
    }
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return encrypted;
  }
}

// PII Redaction utilities
function redactPII(text: string): string {
  let redacted = text;

  // Redact credit card numbers (most common patterns)
  redacted = redacted.replace(
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    "****-****-****-****",
  );

  // Redact SSN patterns
  redacted = redacted.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "***-**-****");

  // Redact email addresses
  redacted = redacted.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    "[REDACTED_EMAIL]",
  );

  // Redact phone numbers (various formats)
  redacted = redacted.replace(
    /(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
    "[REDACTED_PHONE]",
  );

  // Redact IP addresses
  redacted = redacted.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[REDACTED_IP]");

  // Redact common ID patterns (like account numbers)
  redacted = redacted.replace(/\b[A-Z]{2,}\d{6,}\b/g, "[REDACTED_ID]");

  return redacted;
}

function redactSessionPII(session: ChatSession): ChatSession {
  return {
    ...session,
    messages: session.messages.map((m) => ({
      ...m,
      text: redactPII(m.text),
    })),
  };
}

// Session export with PII redaction
export function exportSessionAsJSON(
  session: ChatSession,
  redactSensitiveData = true,
) {
  try {
    const exportSession = redactSensitiveData
      ? redactSessionPII(session)
      : session;
    const dataStr = JSON.stringify(exportSession, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fraud-session-${session.id}${redactSensitiveData ? "-redacted" : ""}.json`;
    link.click();
    URL.revokeObjectURL(url);
    logAuditEntry(
      "export",
      `Exported session as JSON${redactSensitiveData ? " (PII redacted)" : ""}: ${session.id}`,
      session.id,
    );
    showToast(
      `Session exported as JSON${redactSensitiveData ? " (PII redacted)" : ""}`,
      "success",
    );
  } catch (error) {
    console.error("Failed to export session:", error);
    showToast("Export failed", "error");
  }
}

export function exportSessionAsCSV(
  session: ChatSession,
  redactSensitiveData = true,
) {
  try {
    const exportSession = redactSensitiveData
      ? redactSessionPII(session)
      : session;
    const headers = ["Timestamp", "Type", "Message", "Attachments"];
    const rows = exportSession.messages.map((m) => [
      m.createdAt.toISOString(),
      m.type,
      `"${m.text.replace(/"/g, '""')}"`,
      m.attachments?.map((a) => a.fileName).join("; ") || "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fraud-session-${session.id}${redactSensitiveData ? "-redacted" : ""}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    logAuditEntry(
      "export",
      `Exported session as CSV${redactSensitiveData ? " (PII redacted)" : ""}: ${session.id}`,
      session.id,
    );
    showToast(
      `Session exported as CSV${redactSensitiveData ? " (PII redacted)" : ""}`,
      "success",
    );
  } catch (error) {
    console.error("Failed to export session:", error);
    showToast("Export failed", "error");
  }
}

// Message retry
export function retryFailedMessage(messageId: string) {
  const messageIndex = messages.value.findIndex((m) => m.id === messageId);
  if (messageIndex === -1) return;

  const failedMessage = messages.value[messageIndex];
  if (failedMessage.status !== "failed") return;

  // Remove failed message and retry
  messages.value = messages.value.filter((m) => m.id !== messageId);

  // Re-send the message
  showToast("Retrying message...", "info");

  // The actual retry logic would be in the Footer component
  // This just updates the state
}

// Mark messages as read
export function markMessagesAsRead() {
  messages.value = messages.value.map((m) => ({
    ...m,
    read: true,
  }));
}

// Delete dataset
export function deleteDataset(datasetId: string) {
  uploadedDatasets.value = uploadedDatasets.value.filter(
    (d) => d.id !== datasetId,
  );
  showToast("Dataset deleted", "success");
  logAuditEntry("delete", `Deleted dataset: ${datasetId}`);
}

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

    // Auto-scroll to bottom when new messages arrive
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

// Detect if user should see scroll to bottom button
if (typeof window !== "undefined") {
  window.addEventListener("scroll", () => {
    const isNearBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 300;
    showScrollToBottom.value = !isNearBottom && messages.value.length > 0;
  });
}

// Persist compact view preference
effect(() => {
  localStorage.setItem("compactView", compactView.value.toString());
});

// Persist draft message
effect(() => {
  if (messageDraft.value) {
    localStorage.setItem("fraud-message-draft", messageDraft.value);
  } else {
    localStorage.removeItem("fraud-message-draft");
  }
});

// Load draft on startup
if (typeof window !== "undefined") {
  const savedDraft = localStorage.getItem("fraud-message-draft");
  if (savedDraft) {
    messageDraft.value = savedDraft;
  }
}

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
