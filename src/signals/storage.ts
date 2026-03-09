import type {
  AuditLogEntry,
  ChatSession,
  DatasetInfo,
  Message,
  PerformanceMetric,
} from "./types";

// ── Encryption ────────────────────────────────────────────────────────────────

const ENCRYPTION_KEY = "fraud-intelligence-key-2026";

export function simpleEncrypt(text: string): string {
  try {
    let encrypted = "";
    for (let i = 0; i < text.length; i++) {
      encrypted += String.fromCharCode(
        text.charCodeAt(i) ^
          ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length),
      );
    }
    return btoa(encrypted);
  } catch (error) {
    console.error("Encryption failed:", error);
    return text;
  }
}

export function simpleDecrypt(encrypted: string): string {
  try {
    const decoded = atob(encrypted);
    let decrypted = "";
    for (let i = 0; i < decoded.length; i++) {
      decrypted += String.fromCharCode(
        decoded.charCodeAt(i) ^
          ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length),
      );
    }
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error(`Decryption failed: ${error}`);
  }
}

// ── PII Redaction ─────────────────────────────────────────────────────────────

export function redactPII(text: string): string {
  return text
    .replace(
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
      "****-****-****-****",
    )
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "***-**-****")
    .replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      "[REDACTED_EMAIL]",
    )
    .replace(
      /(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
      "[REDACTED_PHONE]",
    )
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[REDACTED_IP]")
    .replace(/\b[A-Z]{2,}\d{6,}\b/g, "[REDACTED_ID]");
}

export function redactSessionPII(session: ChatSession): ChatSession {
  return {
    ...session,
    messages: session.messages.map((m) => ({ ...m, text: redactPII(m.text) })),
  };
}

// ── Messages ──────────────────────────────────────────────────────────────────

export function saveMessagesToStorage(msgs: Message[]) {
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

export function loadMessagesFromStorage(): Message[] {
  try {
    const saved = localStorage.getItem("fraud-chat-history");
    if (!saved) return [];
    return JSON.parse(saved).map((m: any) => ({
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

// ── Chat Sessions ─────────────────────────────────────────────────────────────

function serializeSession(s: ChatSession) {
  return {
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
  };
}

function deserializeSession(s: any): ChatSession {
  return {
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
  };
}

export function loadChatSessionsFromStorage(): ChatSession[] {
  try {
    const saved = localStorage.getItem("fraud-chat-sessions");
    if (!saved) return [];
    let jsonString: string;
    try {
      jsonString = simpleDecrypt(saved);
      JSON.parse(jsonString); // validate
    } catch (decryptError) {
      console.warn(
        "Chat sessions decryption failed, clearing corrupted data:",
        decryptError,
      );
      localStorage.removeItem("fraud-chat-sessions");
      return [];
    }
    return JSON.parse(jsonString).map(deserializeSession);
  } catch (error) {
    console.error("Failed to load chat sessions:", error);
    return [];
  }
}

export function saveChatSessionToHistory(msgs: Message[]): void {
  try {
    if (msgs.length === 0) return;
    let riskLevel: "low" | "medium" | "high" | undefined;
    for (const msg of msgs) {
      const match = msg.text.match(/Risk\s+Score[:\s]+(\d+)/i);
      if (match) {
        const score = parseInt(match[1], 10);
        riskLevel = score >= 70 ? "high" : score >= 45 ? "medium" : "low";
        break;
      }
    }
    const sessions = loadChatSessionsFromStorage();
    sessions.push({
      id: `session-${Date.now()}`,
      startTime: msgs[0].createdAt,
      endTime: new Date(),
      messages: msgs,
      messageCount: msgs.length,
      tags: [],
      riskLevel,
    });
    const jsonString = JSON.stringify(
      sessions.slice(-10).map(serializeSession),
    );
    localStorage.setItem("fraud-chat-sessions", simpleEncrypt(jsonString));
  } catch (error) {
    console.error("Failed to save chat session:", error);
  }
}

/** Persist sessions as plain JSON (used by tag/delete operations). */
export function persistSessions(sessions: ChatSession[]) {
  localStorage.setItem(
    "fraud-chat-sessions",
    JSON.stringify(sessions.map(serializeSession)),
  );
}

// ── Datasets ──────────────────────────────────────────────────────────────────

export function saveDatasetsToStorage(datasets: DatasetInfo[]) {
  try {
    localStorage.setItem(
      "fraud-datasets",
      JSON.stringify(
        datasets.map((d) => ({ ...d, uploadedAt: d.uploadedAt.toISOString() })),
      ),
    );
  } catch (error) {
    console.error("Failed to save datasets:", error);
  }
}

export function loadDatasetsFromStorage(): DatasetInfo[] {
  try {
    const saved = localStorage.getItem("fraud-datasets");
    if (!saved) return [];
    return JSON.parse(saved).map((d: any) => ({
      ...d,
      uploadedAt: new Date(d.uploadedAt),
    }));
  } catch (error) {
    console.error("Failed to load datasets:", error);
    return [];
  }
}

// ── Performance Metrics ───────────────────────────────────────────────────────

export function saveMetricsToStorage(metrics: PerformanceMetric[]) {
  try {
    localStorage.setItem(
      "fraud-performance",
      JSON.stringify(
        metrics.map((m) => ({
          ...m,
          startTime: m.startTime.toISOString(),
          endTime: m.endTime?.toISOString(),
        })),
      ),
    );
  } catch (error) {
    console.error("Failed to save metrics:", error);
  }
}

export function loadMetricsFromStorage(): PerformanceMetric[] {
  try {
    const saved = localStorage.getItem("fraud-performance");
    if (!saved) return [];
    return JSON.parse(saved).map((m: any) => ({
      ...m,
      startTime: new Date(m.startTime),
      endTime: m.endTime ? new Date(m.endTime) : undefined,
    }));
  } catch (error) {
    console.error("Failed to load metrics:", error);
    return [];
  }
}

// ── Audit Log ─────────────────────────────────────────────────────────────────

export function saveAuditLog(entry: AuditLogEntry) {
  try {
    const saved = localStorage.getItem("fraud-audit-log");
    const logs: any[] = saved ? JSON.parse(saved) : [];
    logs.push({ ...entry, timestamp: entry.timestamp.toISOString() });
    localStorage.setItem("fraud-audit-log", JSON.stringify(logs.slice(-100)));
  } catch (error) {
    console.error("Failed to save audit log:", error);
  }
}
