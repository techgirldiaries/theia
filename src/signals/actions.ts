import type { AuditLogEntry, ChatSession, DatasetInfo } from "./types";
import {
  loadChatSessionsFromStorage,
  persistSessions,
  redactSessionPII,
  saveAuditLog,
  saveChatSessionToHistory,
} from "./storage";
import {
  currentUserId,
  isAgentTyping,
  messages,
  performanceMetrics,
  task,
  taskStatus,
  toasts,
  uploadedDatasets,
} from "./state";

// ── Toast ─────────────────────────────────────────────────────────────────────

export function showToast(
  message: string,
  type: "success" | "error" | "info" = "info",
) {
  toasts.value = [
    ...toasts.value,
    { id: `toast-${Date.now()}-${Math.random()}`, message, type },
  ];
}

export function dismissToast(id: string) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

// ── Audit ─────────────────────────────────────────────────────────────────────

export function logAuditEntry(
  action: AuditLogEntry["action"],
  details: string,
  sessionId?: string,
) {
  saveAuditLog({
    id: `audit-${Date.now()}`,
    timestamp: new Date(),
    action,
    userId: currentUserId.value,
    details,
    sessionId,
  });
}

export function getAuditLogs(): AuditLogEntry[] {
  try {
    const saved = localStorage.getItem("fraud-audit-log");
    if (!saved) return [];
    return JSON.parse(saved).map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    }));
  } catch (error) {
    console.error("Failed to load audit logs:", error);
    return [];
  }
}

// ── Datasets ──────────────────────────────────────────────────────────────────

export function addDataset(dataset: DatasetInfo) {
  uploadedDatasets.value = [...uploadedDatasets.value, dataset];
  showToast(`Dataset "${dataset.fileName}" uploaded successfully`, "success");
}

export function getActiveDataset(): DatasetInfo | null {
  const datasets = uploadedDatasets.value;
  return datasets.length > 0 ? datasets[datasets.length - 1] : null;
}

export function deleteDataset(datasetId: string) {
  uploadedDatasets.value = uploadedDatasets.value.filter(
    (d) => d.id !== datasetId,
  );
  showToast("Dataset deleted", "success");
  logAuditEntry("delete", `Deleted dataset: ${datasetId}`);
}

// ── Performance Metrics ───────────────────────────────────────────────────────

export function startPerformanceTracking(taskId: string): void {
  performanceMetrics.value = [
    ...performanceMetrics.value,
    { taskId, startTime: new Date(), status: "in_progress" },
  ];
}

export function endPerformanceTracking(
  taskId: string,
  status: string,
  riskScore?: number,
  agentContributions?: number,
): void {
  const metrics = [...performanceMetrics.value];
  const index = metrics.findIndex((m) => m.taskId === taskId);
  if (index === -1) return;
  const endTime = new Date();
  metrics[index] = {
    ...metrics[index],
    endTime,
    duration: endTime.getTime() - metrics[index].startTime.getTime(),
    status,
    riskScore,
    agentContributions,
  };
  performanceMetrics.value = metrics;
}

// ── Messages ──────────────────────────────────────────────────────────────────

export function retryFailedMessage(messageId: string) {
  const msg = messages.value.find((m) => m.id === messageId);
  if (!msg || msg.status !== "failed") return;
  messages.value = messages.value.filter((m) => m.id !== messageId);
  showToast("Retrying message...", "info");
}

export function editMessage(messageId: string, newText: string) {
  const index = messages.value.findIndex((m) => m.id === messageId);
  if (index === -1) return;

  const updatedMessages = [...messages.value];
  updatedMessages[index] = {
    ...updatedMessages[index],
    text: newText,
  };
  messages.value = updatedMessages;
  showToast("Message updated", "success");
  logAuditEntry("view", `Edited message: ${messageId}`);
}

export function markMessagesAsRead() {
  messages.value = messages.value.map((m) => ({ ...m, read: true }));
}

// ── Chat / Session ────────────────────────────────────────────────────────────

export function clearChatHistory() {
  messages.value = [];
  uploadedDatasets.value = [];
  performanceMetrics.value = [];
  localStorage.removeItem("fraud-chat-history");
  localStorage.removeItem("fraud-datasets");
  localStorage.removeItem("fraud-performance");
  localStorage.removeItem("fraud-chat-sessions");
}

export async function startNewChat() {
  if (messages.value.length > 0) {
    const sessionId = `session-${Date.now()}`;
    await saveChatSessionToHistory(messages.value);
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
  messages.value = [];
  if (task.value) {
    task.value.unsubscribe();
    task.value = undefined;
  }
  isAgentTyping.value = false;
  taskStatus.value = null;
  logAuditEntry("session_start", "Started new chat session");
  setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
}

export async function restoreSession(session: ChatSession) {
  if (messages.value.length > 0) await saveChatSessionToHistory(messages.value);
  messages.value = session.messages;
  if (task.value) {
    task.value.unsubscribe();
    task.value = undefined;
  }
  logAuditEntry("view", `Restored session: ${session.id}`, session.id);
  showToast(`Session restored (${session.messageCount} messages)`, "success");
  setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
}

export async function addTagToSession(sessionId: string, tag: string) {
  try {
    const sessions = loadChatSessionsFromStorage();
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      if (!session.tags) session.tags = [];
      if (!session.tags.includes(tag)) {
        session.tags.push(tag);
        await persistSessions(sessions);
        showToast(`Tag "${tag}" added`, "success");
      }
    }
  } catch (error) {
    console.error("Failed to add tag:", error);
  }
}

export async function removeTagFromSession(sessionId: string, tag: string) {
  try {
    const sessions = loadChatSessionsFromStorage();
    const session = sessions.find((s) => s.id === sessionId);
    if (session?.tags) {
      session.tags = session.tags.filter((t) => t !== tag);
      await persistSessions(sessions);
      showToast(`Tag "${tag}" removed`, "success");
    }
  } catch (error) {
    console.error("Failed to remove tag:", error);
  }
}

export async function deleteSession(sessionId: string) {
  try {
    await persistSessions(
      loadChatSessionsFromStorage().filter((s) => s.id !== sessionId),
    );
    showToast("Session deleted", "success");
    logAuditEntry("delete", `Deleted session: ${sessionId}`);
  } catch (error) {
    console.error("Failed to delete session:", error);
    showToast("Failed to delete session", "error");
  }
}

// ── Session export ────────────────────────────────────────────────────────────

function triggerDownload(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportSessionAsJSON(
  session: ChatSession,
  redactSensitiveData = true,
) {
  try {
    const data = redactSensitiveData ? redactSessionPII(session) : session;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const suffix = redactSensitiveData ? "-redacted" : "";
    triggerDownload(url, `fraud-session-${session.id}${suffix}.json`);
    logAuditEntry(
      "export",
      `Exported session as JSON${suffix ? " (PII redacted)" : ""}: ${session.id}`,
      session.id,
    );
    showToast(
      `Session exported as JSON${suffix ? " (PII redacted)" : ""}`,
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
    const data = redactSensitiveData ? redactSessionPII(session) : session;
    const rows = data.messages.map((m) => [
      m.createdAt.toISOString(),
      m.type,
      `"${m.text.replace(/"/g, '""')}"`,
      m.attachments?.map((a) => a.fileName).join("; ") || "",
    ]);
    const csv = [
      ["Timestamp", "Type", "Message", "Attachments"].join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const suffix = redactSensitiveData ? "-redacted" : "";
    triggerDownload(url, `fraud-session-${session.id}${suffix}.csv`);
    logAuditEntry(
      "export",
      `Exported session as CSV${suffix ? " (PII redacted)" : ""}: ${session.id}`,
      session.id,
    );
    showToast(
      `Session exported as CSV${suffix ? " (PII redacted)" : ""}`,
      "success",
    );
  } catch (error) {
    console.error("Failed to export session:", error);
    showToast("Export failed", "error");
  }
}
