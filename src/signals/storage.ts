import type {
  AuditLogEntry,
  ChatSession,
  DatasetInfo,
  Message,
  PerformanceMetric,
} from "./types";

// ── AES-GCM Encryption ────────────────────────────────────────────────────────

const PBKDF2_ITERATIONS = 100_000;
const SALT_STORAGE_KEY = "fraud-enc-salt";

// In-memory AES-GCM key. null = open mode (no passphrase set).
let _activeKey: CryptoKey | null = null;

/**
 * Derives an AES-256-GCM key from the given passphrase via PBKDF2 and caches
 * it in memory (never written to disk). A random salt is persisted to
 * localStorage so the same passphrase always yields the same derived key,
 * enabling decryption of data across page reloads.
 * Call this after the user authenticates; it also reloads the sessions cache.
 */
export async function initEncryptionKeyFromPassphrase(
  passphrase: string,
): Promise<void> {
  let saltHex = localStorage.getItem(SALT_STORAGE_KEY);
  if (!saltHex) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    saltHex = Array.from(salt)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    localStorage.setItem(SALT_STORAGE_KEY, saltHex);
  }
  const salt = new Uint8Array(
    saltHex.match(/.{2}/g)!.map((h) => Number.parseInt(h, 16)),
  );
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  _activeKey = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
  // Reload sessions cache using the newly derived key.
  await _loadSessionsFromDisk();
}

/**
 * Encrypts plaintext with AES-256-GCM.
 * In open (no-passphrase) mode returns the value unchanged so that history
 * continues to persist as readable JSON.
 */
export async function encryptData(plaintext: string): Promise<string> {
  if (!_activeKey) return plaintext;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    _activeKey,
    encoded,
  );
  const combined = new Uint8Array(12 + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), 12);
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts a value produced by encryptData.
 * In open mode returns the value unchanged.
 */
export async function decryptData(ciphertext: string): Promise<string> {
  if (!_activeKey) return ciphertext;
  const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    _activeKey,
    data,
  );
  return new TextDecoder().decode(decrypted);
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

// ── Sessions in-memory cache ──────────────────────────────────────────────────

let _sessionsCache: ChatSession[] = [];

async function _loadSessionsFromDisk(): Promise<void> {
  try {
    const saved = localStorage.getItem("fraud-chat-sessions");
    if (!saved) {
      _sessionsCache = [];
      return;
    }
    const json = await decryptData(saved);
    _sessionsCache = JSON.parse(json).map(deserializeSession);
  } catch {
    // Corrupted data or wrong key — clear so the app stays usable.
    localStorage.removeItem("fraud-chat-sessions");
    _sessionsCache = [];
  }
}

/** Resolves once the sessions cache has been populated from localStorage. */
export const sessionsReady: Promise<void> = _loadSessionsFromDisk();

/** Synchronous read from the in-memory cache. Always up-to-date. */
export function loadChatSessionsFromStorage(): ChatSession[] {
  return [..._sessionsCache];
}

/** Archive a completed conversation to history. */
export async function saveChatSessionToHistory(msgs: Message[]): Promise<void> {
  if (msgs.length === 0) return;
  await sessionsReady; // ensure initial load is complete before appending
  let riskLevel: "low" | "medium" | "high" | undefined;
  for (const msg of msgs) {
    const match = msg.text.match(/Risk\s+Score[:\s]+(\d+)/i);
    if (match) {
      const score = Number.parseInt(match[1], 10);
      riskLevel = score >= 70 ? "high" : score >= 45 ? "medium" : "low";
      break;
    }
  }
  const updated: ChatSession[] = [
    ..._sessionsCache,
    {
      id: `session-${Date.now()}`,
      startTime: msgs[0].createdAt,
      endTime: new Date(),
      messages: msgs,
      messageCount: msgs.length,
      tags: [],
      riskLevel,
    },
  ].slice(-10);
  await persistSessions(updated);
}

/**
 * Persist sessions — updates the in-memory cache immediately (synchronous) so
 * callers reading via loadChatSessionsFromStorage() see up-to-date data even
 * before the async disk-write completes.
 */
export async function persistSessions(sessions: ChatSession[]): Promise<void> {
  _sessionsCache = sessions;
  const json = JSON.stringify(sessions.map(serializeSession));
  const encrypted = await encryptData(json);
  localStorage.setItem("fraud-chat-sessions", encrypted);
}

// ── Datasets ──────────────────────────────────────────────────────────────────

function serializeDataset(d: DatasetInfo) {
  return {
    ...d,
    uploadedAt: d.uploadedAt.toISOString(),
  };
}

function deserializeDataset(d: any): DatasetInfo {
  return {
    ...d,
    uploadedAt: new Date(d.uploadedAt),
  };
}

export function saveDatasetsToStorage(datasets: DatasetInfo[]) {
  try {
    localStorage.setItem(
      "fraud-datasets",
      JSON.stringify(datasets.map(serializeDataset)),
    );
  } catch (error) {
    console.error("Failed to save datasets:", error);
  }
}

export function loadDatasetsFromStorage(): DatasetInfo[] {
  try {
    const saved = localStorage.getItem("fraud-datasets");
    if (!saved) return [];
    return JSON.parse(saved).map(deserializeDataset);
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
