import { effect } from "@preact/signals";
import { Agent, Workforce } from "@relevanceai/sdk";
import { AGENT_ID, WORKFORCE_ID } from "@/constant";
import {
  saveChatSessionToHistory,
  saveDatasetsToStorage,
  saveMessagesToStorage,
  saveMetricsToStorage,
} from "./storage";
import {
  derivePerDatasetEvaluations,
  deriveQualitativeEvaluation,
  endPerformanceTracking,
  showToast,
} from "./actions";
import {
  agent,
  agentMode,
  benchmarkResults,
  client,
  compactView,
  connectionRetryCount,
  evaluationStreamState,
  isDarkMode,
  isAgentTyping,
  isInitialized,
  latestEnhancedReport,
  liveCaseProgress,
  loadingError,
  maragConsensus,
  messageDraft,
  messages,
  performanceMetrics,
  perDatasetEvaluations,
  qualitativeEvaluation,
  showScrollToBottom,
  task,
  taskStatus,
  uploadedDatasets,
  workforce,
} from "./state";
import {
  hasBenchmarkingData,
  hasMaragData,
  isEnhancedFraudReport,
  parseEnhancedFraudReport,
} from "@/utils/parse-fraud-report";
import type { LivePhaseStatus } from "@/types/evaluation";

// ── Dark mode ─────────────────────────────────────────────────────────────────
effect(() => {
  try {
    localStorage.setItem("darkMode", isDarkMode.value.toString());
    document.documentElement.classList.toggle("dark", isDarkMode.value);
  } catch {
    document.documentElement.classList.toggle("dark", isDarkMode.value);
  }
});

// ── Message persistence and auto-scroll ────────────────────────────────────────
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

// ── Auto-save session on tab or window close ───────────────────────────────────
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

// ── Dataset and metrics persistence ────────────────────────────────────────────
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
      (t.status as string) === "complete" ||
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
      const copy = [...msgs];
      if (message.type === "user-message" || !message.isAgent?.()) {
        // The SDK echoes the full user turn which includes all system-injected
        // file content. Preserve the clean display text the user typed; only
        // adopt the real message id so future updates find this entry.
        copy[optimisticIdx] = {
          ...copy[optimisticIdx],
          id: message.id ?? copy[optimisticIdx].id,
          status: "sent" as const,
        };
      } else {
        copy[optimisticIdx] = message;
      }
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

    // ── Enhanced report extraction ───────────────────────────────────────────
    // Run after the messages array is updated so UI reflects streaming text
    // while we attempt to parse the full JSON payload in the background.
    if (message.type === "agent-message" || message.isAgent?.()) {
      const text: string = message.text ?? "";

      // Fast guard — avoids expensive JSON.parse on every intermediate chunk
      if (isEnhancedFraudReport(text)) {
        evaluationStreamState.value = {
          ...evaluationStreamState.value,
          isStreaming: true,
          lastParseError: null,
        };

        const report = parseEnhancedFraudReport(text);

        if (report) {
          // 1. Persist the raw report
          latestEnhancedReport.value = report;

          // 2. Populate benchmarkResults signal (snake_case → camelCase adapter)
          if (hasBenchmarkingData(report)) {
            const br  = report.benchmarking_results!;
            const dc  = br.dataset_comparison;
            const pm: Record<string, any> = {};
            const pt: Record<string, string> = {};
            const qs: Record<string, number> = {};
            for (const [ds, m] of Object.entries(dc.performance_metrics)) {
              pm[ds] = {
                precision: m.precision,
                recall:    m.recall,
                f1Score:   m.f1_score,
                aucRoc:    m.auc_roc,
              };
            }
            for (const [ds, t] of Object.entries(dc.processing_time_comparison)) {
              pt[ds] = t;
            }
            for (const [ds, s] of Object.entries(dc.data_quality_scores)) {
              qs[ds] = s;
            }
            benchmarkResults.value = {
              datasetsAnalyzed:      dc.datasets_analyzed,
              performanceMetrics:    pm,
              processingTimes:       pt,
              qualityScores:         qs,
              statisticalSignificance: Object.entries(
                br.statistical_significance?.accuracy_differences ?? {},
              ).map(([comparison, d]) => ({
                comparison,
                pValue:      d.p_value,
                significant: d.significant,
                effectSize:  d.effect_size,
              })),
              bestPerformingDataset: br.best_performing_dataset,
              recommendations:       br.recommendations,
            };
          }

          // 3. Populate maragConsensus signal
          if (hasMaragData(report)) {
            const ac = report.marag_results!.agent_consensus;
            maragConsensus.value = {
              consensusScore: ac.consensus_score,
              agentScores:    ac.agent_confidence_scores as Record<string, number>,
              correlations:   Object.entries(
                ac.evidence_triangulation.cross_agent_correlations,
              ).map(([key, strength]) => {
                const agents = key.split("_");
                return { agents, finding: key, strength: strength as number };
              }),
              conflicts: ac.evidence_triangulation.conflict_resolution
                ? [
                    {
                      agents: [],
                      issue: `${ac.evidence_triangulation.conflict_resolution.conflicts_detected} conflict(s) via ${ac.evidence_triangulation.conflict_resolution.resolution_method}`,
                    },
                  ]
                : [],
              finalScore:        ac.collaborative_risk_assessment.weighted_final_score,
              uncertaintySources:
                ac.collaborative_risk_assessment.uncertainty_quantification
                  .uncertainty_sources,
            };
          }

          // 4. Populate liveCaseProgress from phase_results
          const phaseResults = report.phase_results;
          if (phaseResults && Object.keys(phaseResults).length > 0) {
            const livePhases: Record<string, LivePhaseStatus> = {};
            let completedCount = 0;
            let currentPhase   = Object.keys(phaseResults)[0] ?? "phase-0";

            for (const [key, pr] of Object.entries(phaseResults)) {
              const status: LivePhaseStatus["status"] =
                pr.status === "completed" ? "completed"
                : pr.status === "failed"  ? "failed"
                : pr.status === "skipped" ? "skipped"
                : "pending";
              if (status === "completed") completedCount++;
              else if (status !== "failed" && status !== "skipped") currentPhase = key;
              livePhases[key] = {
                phaseId:   key,
                status,
                progress:  status === "completed" ? 100 : status === "failed" ? 0 : 50,
                duration:  pr.duration,
                confidence: pr.confidence !== undefined ? pr.confidence * 100 : undefined,
                riskScore: pr.risk_score,
                toolsUsed: pr.tools_used,
              };
            }
            liveCaseProgress.value = {
              caseId:          report.case_id,
              overallProgress: Math.round(
                (completedCount / Object.keys(phaseResults).length) * 100,
              ),
              currentPhase,
              phases:      livePhases,
              completedAt:
                completedCount === Object.keys(phaseResults).length
                  ? new Date()
                  : null,
            };
          }

          // 5. Derive qualitative evaluation (aggregate + per-dataset)
          qualitativeEvaluation.value  = deriveQualitativeEvaluation(report);
          perDatasetEvaluations.value  = derivePerDatasetEvaluations(report);

          // 6. Update stream state
          evaluationStreamState.value = {
            isStreaming:          false,
            lastParsedAt:         new Date(),
            successfulParseCount: evaluationStreamState.value.successfulParseCount + 1,
            lastParseError:       null,
          };
        } else {
          // JSON is partial / still streaming — mark as streaming, not failed
          evaluationStreamState.value = {
            ...evaluationStreamState.value,
            isStreaming:    true,
            lastParseError: "Partial JSON (streaming in progress)",
          };
        }
      }
    }
    // ── End enhanced report extraction ───────────────────────────────────────
  });

  return () => {
    t.unsubscribe();
  };
});
