import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  MessageSquare,
  TrendingUp,
  X,
  BarChart3,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { BarChart } from "@/components/bar-chart";
import { LineChart } from "@/components/line-chart";
import { StatsCard } from "@/components/stats-card";
import {
  benchmarkResults,
  clearChatHistory,
  evaluationStreamState,
  fraudStats,
  getChatSessions,
  performanceMetrics,
  qualitativeEvaluation,
  showAnalytics,
  splitScreenMode,
  uploadedDatasets,
} from "@/signals";

export function AnalyticsDashboard() {
  const stats = fraudStats.value;
  const metrics = performanceMetrics.value;
  const datasets = uploadedDatasets.value;
  const chatSessions = getChatSessions();

  // Calculate response times over time for line chart
  const responseTimeData = metrics
    .filter((m) => m.duration)
    .slice(-10)
    .map((m, i) => ({
      label: `T${i + 1}`,
      value: Number((m.duration! / 1000).toFixed(1)),
    }));

  // Risk distribution for bar chart
  const riskDistributionData = [
    { label: "Low Risk",    value: stats.lowRisk,    color: "bg-green-500" },
    { label: "Medium Risk", value: stats.mediumRisk, color: "bg-yellow-500" },
    { label: "High Risk",   value: stats.highRisk,   color: "bg-red-500" },
  ];

  // Dataset quality scores for bar chart
  const datasetQualityData = datasets.slice(0, 5).map((d) => ({
    label: d.fileName.replace(/\.[^.]+$/, "").slice(0, 12),
    value: d.rows ? Math.min(100, Math.round((d.rows / 10000) * 10)) : 50,
    color: "bg-indigo-500",
  }));

  const handleClearHistory = () => {
    if (
      confirm(
        "Are you sure you want to clear all chat history, datasets, and performance metrics? This action cannot be undone.",
      )
    ) {
      clearChatHistory();
      showAnalytics.value = false;
    }
  };

  // Live evaluation state
  const evalStream  = evaluationStreamState.value;
  const benchmark   = benchmarkResults.value;
  const qualEval    = qualitativeEvaluation.value;

  return (
    <div class="space-y-4 animate-fade-in">
      {/* ── Header ── */}
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-6 transition-colors">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-zinc-900 dark:text-white">
              Fraud Detection Analytics
            </h2>
            <p class="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Session performance, risk distribution, and live evaluation status
            </p>
          </div>
          <button
            class="ml-4 p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            title="Close Analytics Dashboard"
            onClick={() => { showAnalytics.value = false; }}
          >
            <X size={22} strokeWidth={2} class="text-zinc-500 dark:text-zinc-300" />
          </button>
        </div>
      </div>

      {/* ── Section 1: Overview Stats ── */}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Analyses"
          value={stats.totalAnalyzed.toString()}
          icon={<MessageSquare size={20} />}
          color="blue"
        />
        <StatsCard
          title="High Risk Cases"
          value={stats.highRisk.toString()}
          icon={<AlertTriangle size={20} />}
          color="red"
        />
        <StatsCard
          title="Avg Response"
          value={`${stats.avgResponseTime.toFixed(1)}s`}
          icon={<Clock size={20} />}
          color="yellow"
        />
        <StatsCard
          title="Success Rate"
          value={`${stats.successRate.toFixed(0)}%`}
          icon={<CheckCircle size={20} />}
          color="green"
        />
      </div>

      {/* ── Section 2: Charts ── */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Risk distribution */}
        <BarChart
          title="Risk Distribution"
          data={riskDistributionData}
          height={180}
        />

        {/* Response times */}
        {responseTimeData.length > 0 ? (
          <LineChart
            title="Response Times (s)"
            data={responseTimeData}
            height={180}
          />
        ) : (
          <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 flex items-center justify-center text-sm text-zinc-400 dark:text-zinc-500" style="height:180px">
            No response time data yet
          </div>
        )}
      </div>

      {/* ── Section 3: Datasets ── */}
      {datasets.length > 0 && (
        <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
          <h3 class="text-base font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
            <Database size={16} class="text-indigo-500" />
            Uploaded Datasets ({datasets.length})
          </h3>
          <div class="space-y-2">
            {datasets.slice(0, 5).map((d) => (
              <div
                key={d.id}
                class="flex items-center justify-between text-sm"
              >
                <span class="text-zinc-700 dark:text-zinc-300 font-mono truncate max-w-xs">
                  {d.fileName}
                </span>
                <span class="text-zinc-500 dark:text-zinc-400 shrink-0 ml-2">
                  {d.rows != null ? `${d.rows.toLocaleString()} rows` : d.type}
                </span>
              </div>
            ))}
            {datasets.length > 5 && (
              <p class="text-xs text-zinc-400 dark:text-zinc-500">
                +{datasets.length - 5} more datasets
              </p>
            )}
          </div>
          {datasetQualityData.length > 0 && (
            <div class="mt-4">
              <BarChart
                title="Dataset Size Indicator"
                data={datasetQualityData}
                height={120}
                showValues={false}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Section 4: Live Evaluation Status ── */}
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
        <h3 class="text-base font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
          <Zap size={16} class="text-indigo-500" />
          Live Evaluation Status
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stream state */}
          <div class="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Report Stream</p>
            {evalStream.isStreaming ? (
              <span class="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm font-medium">
                <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse inline-block" />
                Streaming…
              </span>
            ) : evalStream.lastParsedAt ? (
              <span class="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-medium">
                <span class="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Live · {evalStream.successfulParseCount} report{evalStream.successfulParseCount !== 1 ? "s" : ""} parsed
              </span>
            ) : (
              <span class="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 text-sm">
                <span class="w-2 h-2 rounded-full bg-zinc-400 inline-block" />
                No data yet
              </span>
            )}
            {evalStream.lastParseError && !evalStream.isStreaming && (
              <p class="text-xs text-red-500 mt-1 truncate">{evalStream.lastParseError}</p>
            )}
          </div>

          {/* Benchmark summary */}
          <div class="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
              <TrendingUp size={11} /> Benchmarking
            </p>
            {benchmark ? (
              <div class="space-y-1">
                <p class="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {benchmark.datasetsAnalyzed.length} dataset{benchmark.datasetsAnalyzed.length !== 1 ? "s" : ""} compared
                </p>
                <p class="text-xs text-zinc-500 dark:text-zinc-400">
                  Best: <span class="font-medium text-zinc-700 dark:text-zinc-300">{benchmark.bestPerformingDataset}</span>
                </p>
                {benchmark.bestPerformingDataset && benchmark.performanceMetrics[benchmark.bestPerformingDataset] && (
                  <p class="text-xs text-zinc-400 dark:text-zinc-500">
                    F1 {(benchmark.performanceMetrics[benchmark.bestPerformingDataset].f1Score * 100).toFixed(1)}%
                    · AUC {(benchmark.performanceMetrics[benchmark.bestPerformingDataset].aucRoc * 100).toFixed(1)}%
                  </p>
                )}
              </div>
            ) : (
              <p class="text-sm text-zinc-400 dark:text-zinc-500">No benchmark data</p>
            )}
          </div>

          {/* Qualitative summary */}
          <div class="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3">
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
              <ShieldCheck size={11} /> Qualitative Grade
            </p>
            {qualEval ? (
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span
                    class={`text-sm font-bold px-2 py-0.5 rounded-full ${
                      qualEval.overallGrade === "PASS"
                        ? "bg-emerald-100 dark:bg-emerald-800/40 text-emerald-700 dark:text-emerald-300"
                        : qualEval.overallGrade === "PARTIAL"
                          ? "bg-amber-100 dark:bg-amber-800/40 text-amber-700 dark:text-amber-300"
                          : "bg-red-100 dark:bg-red-800/40 text-red-700 dark:text-red-300"
                    }`}
                  >
                    {qualEval.overallGrade}
                  </span>
                  <span class="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {qualEval.overallScore}/100
                  </span>
                </div>
                <p class="text-xs text-zinc-400 dark:text-zinc-500">
                  {qualEval.dimensions.filter((d) => d.grade === "PASS").length} of {qualEval.dimensions.length} dimensions passed
                </p>
              </div>
            ) : (
              <p class="text-sm text-zinc-400 dark:text-zinc-500">No evaluation yet</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Session History ── */}
      {chatSessions.length > 0 && (
        <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
          <h3 class="text-base font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
            <Activity size={16} class="text-indigo-500" />
            Session History ({chatSessions.length})
          </h3>
          <div class="space-y-2">
            {chatSessions.slice(0, 5).map((session) => (
              <div
                key={session.id}
                class="flex items-center justify-between text-sm border border-zinc-100 dark:border-zinc-700 rounded p-2"
              >
                <div class="flex items-center gap-2">
                  <MessageSquare size={14} class="text-zinc-400" />
                  <span class="text-zinc-700 dark:text-zinc-300">
                    {session.messageCount} message{session.messageCount !== 1 ? "s" : ""}
                  </span>
                </div>
                <span class="text-zinc-400 dark:text-zinc-500 text-xs">
                  {new Date(session.startTime).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Clear History ── */}
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Clear All Data</p>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Permanently removes all chat history, datasets, and performance metrics.
            </p>
          </div>
          <button
            class="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            onClick={handleClearHistory}
          >
            Clear History
          </button>
        </div>
      </div>
    </div>
  );
}
