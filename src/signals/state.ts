import { computed, signal } from "@preact/signals";
import { Agent, type Client, type Task, Workforce } from "@relevanceai/sdk";
import { ACCESS_PASSPHRASE } from "@/constant";
import {
  loadChatSessionsFromStorage,
  loadDatasetsFromStorage,
  loadMessagesFromStorage,
  loadMetricsFromStorage,
  saveChatSessionToHistory,
} from "./storage";
import type {
  BenchmarkResults,
  ChatSession,
  DatasetInfo,
  FraudStats,
  MARAGAgent,
  MARAGConsensus,
  Message,
  PerformanceMetric,
  QuickTemplate,
  ToastMessage,
  Visualization,
} from "./types";

// ── Startup: archive previous session then start fresh ────────────────────────
const _savedMessages = loadMessagesFromStorage();
if (_savedMessages.length > 0) {
  // Fire-and-forget: archive is a background operation.
  void saveChatSessionToHistory(_savedMessages);
  localStorage.removeItem("fraud-chat-history");
}

// ── Core signals ──────────────────────────────────────────────────────────────
// ...existing code...
export const uploadedDatasets = signal<DatasetInfo[]>(
  loadDatasetsFromStorage(),
);
export const performanceMetrics = signal<PerformanceMetric[]>(
  loadMetricsFromStorage(),
);

export const client = signal<Client>();
export const agent = signal<Agent>();
export const workforce = signal<Workforce>();
export const task = signal<Task<any, any>>();
export const isAgentTyping = signal(false);
export const taskStatus = signal<string | null>(null);
export const isInitialized = signal(false);
export const loadingError = signal<string | null>(null);
export const toasts = signal<ToastMessage[]>([]);
export const connectionRetryCount = signal(0);

// ── Auth ──────────────────────────────────────────────────────────────────────
/** Display name of the authenticated user; used in audit log entries. */
export const currentUserId = signal<string>("anonymous");
/** Whether the user has passed the auth gate. Always true when no passphrase is configured. */
export const isAuthenticated = signal<boolean>(!ACCESS_PASSPHRASE);

// ── UI state ──────────────────────────────────────────────────────────────────
export const showAnalytics = signal(false);
export const isDarkMode = signal(
  (() => {
    try {
      const saved = localStorage.getItem("darkMode");
      return saved !== null
        ? saved === "true"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  })(),
);
export const showScrollToBottom = signal(false);
export const showFileManager = signal(false);
export const showHistorySidebar = signal(false);
export const showReports = signal(false);
export const showDataManagement = signal(false);
export const showAuditLog = signal(false);
export const showSettings = signal(false);
export const showQuickActions = signal(false);
export const showPerformanceDashboard = signal(false);
export const compactView = signal(
  localStorage.getItem("compactView") === "true",
);
export const splitScreenMode = signal(false);
export const messageDraft = signal("");
export const isSidebarExpanded = signal(false);
export const selectedSessionForComparison = signal<ChatSession | null>(null);
export const sessionSearchQuery = signal("");
export const sessionTagFilter = signal<string | null>(null);
export const showKeyboardShortcuts = signal(false);
export const isVoiceRecording = signal(false);
export const showAutoComplete = signal(false);
export const autoCompleteQuery = signal("");
export const agentMode = signal<"auto" | "fast" | "expert" | "heavy">(
  (localStorage.getItem("agentMode") as any) || "expert",
);

// Interface mode: Controls UI complexity and feature visibility
export type InterfaceMode = "easy" | "focus" | "balanced" | "expert";
export const interfaceMode = signal<InterfaceMode>(
  (localStorage.getItem("interfaceMode") as InterfaceMode) || "balanced",
);

// ── MARAG, Visualization, Benchmark ──────────────────────────────────────────
export const maragAgents = signal<MARAGAgent[]>([]);
export const maragConsensus = signal<MARAGConsensus | null>(null);
export const showMARAGPanel = signal(false);
export const visualizations = signal<Visualization[]>([]);
export const showVisualizationGallery = signal(false);
export const selectedVisualization = signal<Visualization | null>(null);
export const benchmarkResults = signal<BenchmarkResults | null>(null);
export const showBenchmarkPanel = signal(false);

// ── Computed ──────────────────────────────────────────────────────────────────
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
  const avgResponseTime =
    metrics.reduce((sum, m) => sum + (m.duration ?? 0), 0) / totalAnalyzed;
  const successRate =
    (metrics.filter((m) => m.status === "complete" || m.status === "success")
      .length /
      totalAnalyzed) *
    100;

  return {
    totalAnalyzed,
    highRisk,
    mediumRisk,
    lowRisk,
    avgResponseTime,
    successRate,
  };
});

// ── Static data ───────────────────────────────────────────────────────────────
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

// ── Session query helper ──────────────────────────────────────────────────────
export function getChatSessions(): ChatSession[] {
  return loadChatSessionsFromStorage();
}
