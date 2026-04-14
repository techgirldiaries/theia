import type { AuditLogEntry, ChatSession, DatasetInfo } from "./types";
import {
  loadChatSessionsFromStorage,
  persistSessions,
  redactSessionPII,
  saveAuditLog,
  saveChatSessionToHistory,
} from "./storage";
import {
  agentMode,
  benchmarkResults,
  currentUserId,
  evaluationStreamState,
  interfaceMode,
  isAgentTyping,
  latestEnhancedReport,
  liveCaseProgress,
  maragConsensus,
  messages,
  performanceMetrics,
  perDatasetEvaluations,
  qualitativeEvaluation,
  task,
  taskStatus,
  toasts,
  uploadedDatasets,
} from "./state";
import type { InterfaceMode } from "./state";
import type { EnhancedFraudReport } from "@/types/fraud-report";
import type {
  PerDatasetEvaluation,
  QualitativeDimension,
  QualitativeEvaluation,
} from "@/types/evaluation";

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

// ── UI Preferences ────────────────────────────────────────────────────────────

/**
 * Changes the interface mode (easy/focus/balanced/expert) and persists the preference.
 * Also automatically sets the corresponding agent mode:
 * - Easy: Fast (Quick responses for simple tasks)
 * - Focus:Heavy (Team of multi-agent experts for deep analysis)
 * - Balanced: Auto (Automatically chooses Fast or Expert based on complexity)
 * - Expert: Expert (Deep thinking for complex problems)
 */
export function setInterfaceMode(mode: InterfaceMode) {
  interfaceMode.value = mode;
  localStorage.setItem("interfaceMode", mode);

  // Automatically set corresponding agent mode
  const agentModeMap = {
    easy: "fast" as const,
    focus: "heavy" as const, // Team of multi-agent experts
    balanced: "auto" as const,
    expert: "expert" as const,
  };

  agentMode.value = agentModeMap[mode];
  localStorage.setItem("agentMode", agentModeMap[mode]);
  logAuditEntry(
    "view",
    `Changed interface mode to: ${mode}, agent mode to: ${agentModeMap[mode]}`,
  );

  const modeLabels = {
    easy: "Easy Mode - Fast responses",
    focus: "Focus Mode - Team of experts",
    balanced: "Balanced Mode - Smart auto-selection",
    expert: "Expert Mode - Deep analysis",
  };

  showToast(modeLabels[mode], "success");
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

/**
 * Removes a failed message from the chat and triggers a retry.
 * Only works for messages with 'failed' status.
 */
export function retryFailedMessage(messageId: string) {
  const msg = messages.value.find((m) => m.id === messageId);
  if (!msg || msg.status !== "failed") return;

  // Remove the failed message; user can resend manually
  messages.value = messages.value.filter((m) => m.id !== messageId);
  showToast("Retrying message...", "info");
}

/**
 * Updates the text content of an existing message.
 * Useful when users need to correct typos or incomplete thoughts.
 */
export function editMessage(messageId: string, newText: string) {
  const index = messages.value.findIndex((m) => m.id === messageId);
  if (index === -1) return;

  // Create a new array to trigger reactivity
  const updatedMessages = [...messages.value];
  updatedMessages[index] = {
    ...updatedMessages[index],
    text: newText,
  };

  messages.value = updatedMessages;
  showToast("Message updated", "success");
  logAuditEntry("view", `Edited message: ${messageId}`);
}

/**
 * Marks all messages as read (used for notification management).
 */
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

// ── Evaluation actions ─────────────────────────────────────────────────────────

/**
 * Derives a QualitativeEvaluation from an EnhancedFraudReport.
 * Pure function — no side effects, no async calls.
 * Called by effects.ts whenever a full report is parsed from the stream.
 */
export function deriveQualitativeEvaluation(
  report: EnhancedFraudReport,
): QualitativeEvaluation {
  const dims: QualitativeDimension[] = [];

  function dim(
    id: string,
    label: string,
    score: number,
    rationale: string,
    evidenceFields: string[],
    recommendations: string[],
  ): QualitativeDimension {
    const grade =
      score >= 80 ? "PASS" : score >= 40 ? "PARTIAL" : "FAIL";
    return { id, label, grade, score, rationale, evidenceFields, recommendations };
  }

  // 1. Output Clarity
  const hasRiskFactors = (report.key_risk_factors?.length ?? 0) > 0;
  const hasRecs        = (report.recommendations?.length ?? 0) >= 2;
  const hasFraudTypes  = (report.fraud_types_detected?.length ?? 0) > 0;
  const clarityScore   = (hasRiskFactors ? 34 : 0) + (hasRecs ? 33 : 0) + (hasFraudTypes ? 33 : 0);
  dims.push(dim(
    "output_clarity", "Output Clarity", clarityScore,
    hasRecs && hasRiskFactors && hasFraudTypes
      ? "Report contains risk factors, recommendations, and identified fraud types."
      : "One or more required output sections are missing or empty.",
    ["key_risk_factors", "recommendations", "fraud_types_detected"],
    clarityScore < 100
      ? ["Ensure the agent returns ≥2 recommendations, named fraud types, and at least 1 key risk factor."]
      : [],
  ));

  // 2. Actionability
  const recText          = (report.recommendations ?? []).join(" ").toLowerCase();
  const hasActionKeywords = /sar|escalat|file|report|block|freeze|investigat/.test(recText);
  const hasAuditTrail    = (report.audit_trail?.length ?? 0) > 0;
  const actionScore      = (hasActionKeywords ? 60 : 0) + (hasAuditTrail ? 40 : 0);
  dims.push(dim(
    "actionability", "Actionability", actionScore,
    hasActionKeywords
      ? "Recommendations include concrete action verbs (SAR, escalate, file, block)."
      : "Recommendations lack specific actionable language.",
    ["recommendations", "audit_trail"],
    actionScore < 100
      ? [
          "Include at least one recommendation referencing SAR filing, account freezing, or escalation.",
          "Ensure audit trail is populated with phase-level actions.",
        ]
      : [],
  ));

  // 3–5. Regulatory compliance
  const cs = report.compliance_status ?? {};
  dims.push(dim(
    "regulatory_sar", "SAR Readiness",
    cs.sar_ready === true ? 100 : cs.sar_ready === false ? 0 : 50,
    cs.sar_ready === true ? "Report is marked SAR-ready by the compliance pipeline."
      : cs.sar_ready === false ? "Report explicitly marked as NOT SAR-ready."
      : "SAR readiness status was not determined.",
    ["compliance_status.sar_ready"],
    cs.sar_ready !== true ? ["Review compliance phase output for SAR eligibility criteria."] : [],
  ));

  dims.push(dim(
    "regulatory_gdpr", "GDPR Compliance",
    cs.gdpr_compliant === true ? 100 : cs.gdpr_compliant === false ? 0 : 50,
    cs.gdpr_compliant === true ? "Report is marked GDPR-compliant."
      : cs.gdpr_compliant === false ? "Report flagged as non-GDPR-compliant."
      : "GDPR compliance status was not determined.",
    ["compliance_status.gdpr_compliant"],
    cs.gdpr_compliant !== true ? ["Verify PII handling and data minimisation in the compliance phase."] : [],
  ));

  dims.push(dim(
    "regulatory_dora", "DORA Compliance",
    cs.dora_compliant === true ? 100 : cs.dora_compliant === false ? 0 : 50,
    cs.dora_compliant === true ? "Report is marked DORA-compliant."
      : cs.dora_compliant === false ? "Report flagged as non-DORA-compliant."
      : "DORA compliance status was not determined.",
    ["compliance_status.dora_compliant"],
    cs.dora_compliant !== true ? ["Ensure ICT risk and incident reporting fields are populated."] : [],
  ));

  // 6. Agent Consensus
  const consensusScore =
    report.marag_results?.agent_consensus?.consensus_score ?? null;
  const agentScore =
    consensusScore === null ? 0
    : consensusScore >= 0.7 ? 100
    : consensusScore >= 0.5 ? 50
    : 0;
  dims.push(dim(
    "agent_consensus", "Agent Consensus", agentScore,
    consensusScore === null
      ? "No MARAG consensus data present."
      : `Agent consensus score is ${(consensusScore * 100).toFixed(0)}% (threshold: 70%).`,
    ["marag_results.agent_consensus.consensus_score"],
    agentScore < 100 ? ["Review agent findings for conflicting evidence and resolution method."] : [],
  ));

  // 7. Pipeline Completion
  const meta      = report.processing_metadata;
  const completed = meta?.phases_completed ?? 0;
  const failed    = meta?.phases_failed    ?? 0;
  const pipeScore =
    failed === 0 && completed >= 13 ? 100
    : failed === 0 && completed >= 8 ? 60
    : failed > 0                     ? 20
    : 0;
  dims.push(dim(
    "pipeline_completion", "Pipeline Completion", pipeScore,
    `${completed} phases completed, ${failed} failed.`,
    ["processing_metadata.phases_completed", "processing_metadata.phases_failed"],
    pipeScore < 100
      ? [
          "Investigate failed phases in the audit trail.",
          "Re-run the analysis if critical phases (≥13) did not complete.",
        ]
      : [],
  ));

  // 8. Evidence Quality
  const auditLen         = report.audit_trail?.length ?? 0;
  const sf               = report.marag_results?.specialized_findings ?? {};
  const agentsWithFindings = [
    sf.TIRA_findings, sf.RCRA_findings, sf.HPRA_findings,
    sf.ERRA_findings, sf.BARA_findings,
  ].filter(Boolean).length;
  const evidScore =
    (auditLen >= 5 ? 50 : Math.round((auditLen / 5) * 50)) +
    (agentsWithFindings >= 3 ? 50 : Math.round((agentsWithFindings / 3) * 50));
  dims.push(dim(
    "evidence_quality", "Evidence Quality", evidScore,
    `Audit trail: ${auditLen} entries. ${agentsWithFindings}/5 agents provided specialised findings.`,
    ["audit_trail", "marag_results.specialized_findings"],
    evidScore < 100
      ? [
          ...(auditLen < 5 ? ["Ensure all pipeline phases log to the audit trail."] : []),
          ...(agentsWithFindings < 3
            ? ["At least 3 MARAG agents must provide findings for credible evidence."]
            : []),
        ]
      : [],
  ));

  const overallScore = Math.round(
    dims.reduce((s, d) => s + d.score, 0) / dims.length,
  );

  return {
    overallGrade: overallScore >= 80 ? "PASS" : overallScore >= 50 ? "PARTIAL" : "FAIL",
    overallScore,
    computedAt: new Date(),
    dimensions: dims,
  };
}

/**
 * Derives a QualitativeEvaluation for EVERY dataset that passed through
 * the same 15-phase pipeline, using dataset-specific performance metrics
 * plus shared report-level data (compliance, agent consensus).
 *
 * No dataset-specific configuration required — the function reads whatever
 * datasets appear in benchmarking_results.dataset_comparison.
 */
export function derivePerDatasetEvaluations(
  report: EnhancedFraudReport,
): Record<string, PerDatasetEvaluation> {
  const dc = report.benchmarking_results?.dataset_comparison;
  if (!dc || dc.datasets_analyzed.length === 0) return {};

  // Shared report-level data (identical for every dataset in this report)
  const cs = report.compliance_status ?? {};
  const consensusRaw =
    report.marag_results?.agent_consensus?.consensus_score ?? null;

  function dim(
    id: string,
    label: string,
    score: number,
    rationale: string,
    evidenceFields: string[],
    recommendations: string[],
  ): QualitativeDimension {
    const grade =
      score >= 80 ? "PASS" : score >= 40 ? "PARTIAL" : "FAIL";
    return { id, label, grade, score, rationale, evidenceFields, recommendations };
  }

  const result: Record<string, PerDatasetEvaluation> = {};

  for (const dsName of dc.datasets_analyzed) {
    const m = dc.performance_metrics[dsName];
    if (!m) continue;

    const qualityRaw = dc.data_quality_scores[dsName] ?? 0;
    const timeStr    = dc.processing_time_comparison[dsName] ?? "";
    const dims: QualitativeDimension[] = [];

    // ── 1. Precision (false positive control) ────────────────────────────────
    const precScore =
      m.precision >= 0.85 ? 100 : m.precision >= 0.70 ? 65 : m.precision >= 0.55 ? 30 : 0;
    dims.push(dim(
      "precision", "Precision", precScore,
      `Precision: ${(m.precision * 100).toFixed(1)}% — threshold ≥85% for PASS.`,
      [`benchmarking_results.dataset_comparison.performance_metrics.${dsName}.precision`],
      precScore < 80
        ? ["Tune the classification threshold to reduce false positives on this dataset."]
        : [],
    ));

    // ── 2. Recall (false negative control) ───────────────────────────────────
    const recScore =
      m.recall >= 0.80 ? 100 : m.recall >= 0.65 ? 65 : m.recall >= 0.50 ? 30 : 0;
    dims.push(dim(
      "recall", "Recall", recScore,
      `Recall: ${(m.recall * 100).toFixed(1)}% — threshold ≥80% for PASS.`,
      [`benchmarking_results.dataset_comparison.performance_metrics.${dsName}.recall`],
      recScore < 80
        ? ["Review false negative cases; consider lowering the fraud probability threshold."]
        : [],
    ));

    // ── 3. F1 Score (harmonic balance) ───────────────────────────────────────
    const f1Val   = m.f1_score;
    const f1Score = f1Val >= 0.82 ? 100 : f1Val >= 0.68 ? 65 : f1Val >= 0.55 ? 30 : 0;
    dims.push(dim(
      "f1_score", "F1 Score", f1Score,
      `F1: ${(f1Val * 100).toFixed(1)}% — threshold ≥82% for PASS.`,
      [`benchmarking_results.dataset_comparison.performance_metrics.${dsName}.f1_score`],
      f1Score < 80
        ? ["Balance precision/recall trade-off; investigate class imbalance for this dataset."]
        : [],
    ));

    // ── 4. AUC-ROC (discrimination ability) ──────────────────────────────────
    const aucVal   = m.auc_roc;
    const aucScore = aucVal >= 0.90 ? 100 : aucVal >= 0.75 ? 65 : aucVal >= 0.60 ? 30 : 0;
    dims.push(dim(
      "auc_roc", "AUC-ROC", aucScore,
      `AUC-ROC: ${(aucVal * 100).toFixed(1)}% — threshold ≥90% for PASS.`,
      [`benchmarking_results.dataset_comparison.performance_metrics.${dsName}.auc_roc`],
      aucScore < 80
        ? ["Investigate feature engineering and model calibration for this dataset."]
        : [],
    ));

    // ── 5. Data Quality ───────────────────────────────────────────────────────
    dims.push(dim(
      "data_quality", "Data Quality", qualityRaw,
      `Data quality score: ${qualityRaw}/100.`,
      [`benchmarking_results.dataset_comparison.data_quality_scores.${dsName}`],
      qualityRaw < 80
        ? ["Address missing values, schema violations, and outliers in this dataset."]
        : [],
    ));

    // ── 6. Processing Efficiency ──────────────────────────────────────────────
    const seconds = timeStr ? parseFloat(timeStr.replace(/[^0-9.]/g, "")) || 0 : 0;
    const effScore =
      seconds <= 0   ? 50   // unknown — neutral
      : seconds <= 30  ? 100
      : seconds <= 60  ? 70
      : seconds <= 120 ? 40
      : 10;
    dims.push(dim(
      "efficiency", "Processing Efficiency", effScore,
      seconds > 0
        ? `Pipeline completed in ${timeStr}.`
        : "Processing time not recorded.",
      [`benchmarking_results.dataset_comparison.processing_time_comparison.${dsName}`],
      effScore < 80 && seconds > 0
        ? ["Profile slow phases for this dataset; consider parallelising data ingestion."]
        : [],
    ));

    // ── 7. Agent Consensus (report-level, shared across all datasets) ─────────
    const agentConsScore =
      consensusRaw === null ? 0
      : consensusRaw >= 0.70 ? 100
      : consensusRaw >= 0.50 ? 50
      : 0;
    dims.push(dim(
      "agent_consensus", "Agent Consensus", agentConsScore,
      consensusRaw === null
        ? "No MARAG consensus data in this report."
        : `Consensus score: ${(consensusRaw * 100).toFixed(0)}% (shared across all datasets).`,
      ["marag_results.agent_consensus.consensus_score"],
      agentConsScore < 80
        ? ["Review MARAG agent conflicts; re-run with higher agent weight for this domain."]
        : [],
    ));

    // ── 8. Regulatory Compliance (report-level, shared across all datasets) ──
    const complianceCount =
      [cs.sar_ready, cs.gdpr_compliant, cs.dora_compliant].filter((v) => v === true).length;
    const compScore =
      complianceCount === 3 ? 100 : complianceCount === 2 ? 70 : complianceCount === 1 ? 40 : 0;
    dims.push(dim(
      "compliance", "Regulatory Compliance", compScore,
      `${complianceCount}/3 compliance checks passed (SAR, GDPR, DORA).`,
      ["compliance_status.sar_ready", "compliance_status.gdpr_compliant", "compliance_status.dora_compliant"],
      compScore < 100
        ? ["Address outstanding compliance checks in the pipeline's compliance phase."]
        : [],
    ));

    const overallScore = Math.round(
      dims.reduce((s, d) => s + d.score, 0) / dims.length,
    );

    result[dsName] = {
      datasetName: dsName,
      overallGrade: overallScore >= 80 ? "PASS" : overallScore >= 50 ? "PARTIAL" : "FAIL",
      overallScore,
      computedAt: new Date(),
      dimensions: dims,
    };
  }

  return result;
}

/**
 * Clears all evaluation signals and resets benchmarkResults + maragConsensus.
 * Call inside startNewChat() when starting a new session.
 */
export function resetEvaluationState(): void {
  latestEnhancedReport.value  = null;
  qualitativeEvaluation.value = null;
  perDatasetEvaluations.value = null;
  liveCaseProgress.value      = null;
  evaluationStreamState.value = {
    lastParsedAt:         null,
    successfulParseCount: 0,
    lastParseError:       null,
    isStreaming:          false,
  };
  benchmarkResults.value = null;
  maragConsensus.value   = null;
}

/**
 * Exports a combined evaluation JSON blob for download.
 */
export function exportEvaluationReport(): void {
  try {
    const payload = {
      exportedAt:              new Date().toISOString(),
      latestReport:            latestEnhancedReport.value,
      qualitativeEval:         qualitativeEvaluation.value,
      perDatasetEvaluations:   perDatasetEvaluations.value,
      benchmarkResults:        benchmarkResults.value,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
    );
    const caseId = latestEnhancedReport.value?.case_id ?? "unknown";
    triggerDownload(url, `theia-evaluation-${caseId}.json`);
    showToast("Evaluation report exported", "success");
  } catch (err) {
    console.error("Failed to export evaluation report:", err);
    showToast("Export failed", "error");
  }
}
