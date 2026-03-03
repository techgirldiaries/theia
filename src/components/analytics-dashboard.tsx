import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  MessageSquare,
  TrendingUp,
  X,
} from "lucide-react";
import { StatsCard } from "@/components/stats-card";
import { BarChart } from "@/components/bar-chart";
import { LineChart } from "@/components/line-chart";
import { AuditLogViewer } from "@/components/audit-log-viewer";
import {
  clearChatHistory,
  fraudStats,
  getChatSessions,
  performanceMetrics,
  showAnalytics,
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
      value: Number((m.duration! / 1000).toFixed(1)), // Convert to seconds as number
    }));

  // Risk distribution for bar chart
  const riskDistributionData = [
    {
      label: "Low Risk",
      value: stats.lowRisk,
      color: "bg-green-500",
    },
    {
      label: "Medium Risk",
      value: stats.mediumRisk,
      color: "bg-yellow-500",
    },
    {
      label: "High Risk",
      value: stats.highRisk,
      color: "bg-red-500",
    },
  ];

  const handleClose = () => {
    showAnalytics.value = false;
  };

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

  return (
    <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div class="h-full overflow-y-auto p-4">
        <div class="max-w-6xl mx-auto">
          {/* Header */}
          <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 mb-4 transition-colors">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold text-zinc-900 dark:text-white">
                  Performance Analytics
                </h2>
                <p class="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  Real-time fraud detection metrics and system performance
                </p>
              </div>
              <button
                onClick={handleClose}
                class="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                aria-label="Close analytics"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <StatsCard
              title="Total Analyzed"
              value={stats.totalAnalyzed}
              subtitle="Fraud detection tasks"
              icon={<Activity size={20} strokeWidth={2} />}
              color="blue"
            />
            <StatsCard
              title="Success Rate"
              value={`${stats.successRate.toFixed(1)}%`}
              subtitle="Completed successfully"
              icon={<CheckCircle size={20} strokeWidth={2} />}
              color="green"
              trend={
                stats.successRate > 80
                  ? { value: 5, isPositive: true }
                  : undefined
              }
            />
            <StatsCard
              title="Avg Response Time"
              value={`${(stats.avgResponseTime / 1000).toFixed(1)}s`}
              subtitle="Per fraud analysis"
              icon={<Clock size={20} strokeWidth={2} />}
              color="purple"
            />
            <StatsCard
              title="High Risk Detected"
              value={stats.highRisk}
              subtitle={`${((stats.highRisk / (stats.totalAnalyzed || 1)) * 100).toFixed(0)}% of total`}
              icon={<AlertTriangle size={20} strokeWidth={2} />}
              color="red"
            />
          </div>

          {/* Charts Row */}
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <BarChart
              title="Risk Distribution"
              data={riskDistributionData}
              height={250}
            />
            <LineChart
              title="Response Time Trend"
              data={responseTimeData}
              height={250}
              color="stroke-purple-500"
              yAxisLabel="Response Time (seconds)"
            />
          </div>

          {/* Dataset Info */}
          <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 mb-4 transition-colors">
            <div class="flex items-center gap-x-2 mb-3">
              <Database size={20} strokeWidth={2} class="text-indigo-500" />
              <h3 class="text-lg font-semibold text-zinc-900 dark:text-white">
                Active Datasets
              </h3>
            </div>
            {datasets.length === 0 ? (
              <p class="text-sm text-zinc-500 dark:text-zinc-400">
                No datasets uploaded yet
              </p>
            ) : (
              <div class="space-y-2">
                {datasets.slice(-5).map((dataset) => (
                  <div
                    key={dataset.id}
                    class="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg"
                  >
                    <div class="flex-1">
                      <p class="text-sm font-medium text-zinc-900 dark:text-white">
                        {dataset.fileName}
                      </p>
                      <p class="text-xs text-zinc-500 dark:text-zinc-400">
                        Uploaded {dataset.uploadedAt.toLocaleString()}
                        {dataset.size &&
                          ` • ${(dataset.size / 1024).toFixed(1)} KB`}
                      </p>
                    </div>
                    <a
                      href={dataset.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat Sessions History */}
          <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 mb-4 transition-colors">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-x-2">
                <MessageSquare
                  size={20}
                  strokeWidth={2}
                  class="text-indigo-500"
                />
                <h3 class="text-lg font-semibold text-zinc-900 dark:text-white">
                  Saved Chat Sessions
                </h3>
              </div>
            </div>

            {chatSessions.length === 0 ? (
              <p class="text-sm text-zinc-500 dark:text-zinc-400">
                No saved chat sessions yet. Use "New Chat" to save current
                conversations.
              </p>
            ) : (
              <div class="space-y-2">
                {chatSessions
                  .slice()
                  .reverse()
                  .map((session) => {
                    const riskColors = {
                      high: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
                      medium:
                        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
                      low: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
                    };

                    return (
                      <div
                        key={session.id}
                        class={`p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg border transition-all hover:shadow-md ${
                          session.riskLevel
                            ? `border-l-4 ${riskColors[session.riskLevel].split(" ")[3]}`
                            : "border-zinc-200 dark:border-zinc-600"
                        }`}
                      >
                        <div class="flex items-start justify-between mb-2">
                          <div class="flex-1">
                            <p class="text-sm font-medium text-zinc-900 dark:text-white">
                              Session from{" "}
                              {session.startTime.toLocaleDateString()} at{" "}
                              {session.startTime.toLocaleTimeString()}
                            </p>
                            <p class="text-xs text-zinc-500 dark:text-zinc-400">
                              {session.messageCount} messages • Duration:{" "}
                              {Math.round(
                                (session.endTime.getTime() -
                                  session.startTime.getTime()) /
                                  60000,
                              )}{" "}
                              minutes
                            </p>
                          </div>
                          {session.riskLevel && (
                            <span
                              class={`text-xs px-2 py-1 rounded-full border ${riskColors[session.riskLevel]}`}
                            >
                              {session.riskLevel.toUpperCase()} RISK
                            </span>
                          )}
                        </div>

                        {/* Tags */}
                        {session.tags && session.tags.length > 0 && (
                          <div class="flex flex-wrap gap-1 mb-2">
                            {session.tags.map((tag) => (
                              <span
                                key={tag}
                                class="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div class="flex items-center gap-x-1 mt-2">
                          <button
                            onClick={() => {
                              const { restoreSession } = require("@/signals");
                              restoreSession(session);
                            }}
                            class="px-3 py-1 text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded transition-colors"
                            title="Restore this session"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => {
                              const {
                                exportSessionAsJSON,
                              } = require("@/signals");
                              exportSessionAsJSON(session);
                            }}
                            class="px-3 py-1 text-xs bg-zinc-200 dark:bg-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-500 text-zinc-700 dark:text-zinc-200 rounded transition-colors"
                            title="Export as JSON"
                          >
                            JSON
                          </button>
                          <button
                            onClick={() => {
                              const {
                                exportSessionAsCSV,
                              } = require("@/signals");
                              exportSessionAsCSV(session);
                            }}
                            class="px-3 py-1 text-xs bg-zinc-200 dark:bg-zinc-600 hover:bg-zinc-300 dark:hover:bg-zinc-500 text-zinc-700 dark:text-zinc-200 rounded transition-colors"
                            title="Export as CSV"
                          >
                            CSV
                          </button>
                          <button
                            onClick={() => {
                              const tag = prompt(
                                "Enter tag name (e.g., 'Credit Card Fraud', 'Identity Theft'):",
                              );
                              if (tag) {
                                const {
                                  addTagToSession,
                                } = require("@/signals");
                                addTagToSession(session.id, tag);
                              }
                            }}
                            class="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded transition-colors"
                            title="Add tag"
                          >
                            +Tag
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Recent Tasks */}
          <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 mb-4 transition-colors">
            <div class="flex items-center gap-x-2 mb-3">
              <TrendingUp size={20} strokeWidth={2} class="text-indigo-500" />
              <h3 class="text-lg font-semibold text-zinc-900 dark:text-white">
                Recent Performance Metrics
              </h3>
            </div>
            {metrics.length === 0 ? (
              <p class="text-sm text-zinc-500 dark:text-zinc-400">
                No performance data available yet
              </p>
            ) : (
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-zinc-200 dark:border-zinc-700">
                      <th class="text-left py-2 px-3 text-zinc-600 dark:text-zinc-400 font-medium">
                        Task ID
                      </th>
                      <th class="text-left py-2 px-3 text-zinc-600 dark:text-zinc-400 font-medium">
                        Status
                      </th>
                      <th class="text-left py-2 px-3 text-zinc-600 dark:text-zinc-400 font-medium">
                        Duration
                      </th>
                      <th class="text-left py-2 px-3 text-zinc-600 dark:text-zinc-400 font-medium">
                        Risk Score
                      </th>
                      <th class="text-left py-2 px-3 text-zinc-600 dark:text-zinc-400 font-medium">
                        Agents
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics
                      .slice(-10)
                      .reverse()
                      .map((metric) => (
                        <tr
                          key={metric.taskId}
                          class="border-b border-zinc-100 dark:border-zinc-700/50"
                        >
                          <td class="py-2 px-3 text-zinc-700 dark:text-zinc-300 font-mono text-xs truncate max-w-32">
                            {metric.taskId.slice(0, 12)}...
                          </td>
                          <td class="py-2 px-3">
                            <span
                              class={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                metric.status === "complete" ||
                                metric.status === "success"
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                  : metric.status === "error"
                                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                    : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                              }`}
                            >
                              {metric.status}
                            </span>
                          </td>
                          <td class="py-2 px-3 text-zinc-700 dark:text-zinc-300">
                            {metric.duration
                              ? `${(metric.duration / 1000).toFixed(1)}s`
                              : "-"}
                          </td>
                          <td class="py-2 px-3">
                            {metric.riskScore !== undefined ? (
                              <span
                                class={`font-medium ${
                                  metric.riskScore >= 70
                                    ? "text-red-600 dark:text-red-400"
                                    : metric.riskScore >= 45
                                      ? "text-yellow-600 dark:text-yellow-400"
                                      : "text-green-600 dark:text-green-400"
                                }`}
                              >
                                {metric.riskScore}/100
                              </span>
                            ) : (
                              <span class="text-zinc-400">-</span>
                            )}
                          </td>
                          <td class="py-2 px-3 text-zinc-700 dark:text-zinc-300">
                            {metric.agentContributions || "-"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Audit Log */}
          <AuditLogViewer />

          {/* Actions */}
          <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 transition-colors">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-semibold text-zinc-900 dark:text-white">
                  Data Management
                </h3>
                <p class="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  Clear all chat history, datasets, and performance metrics
                </p>
              </div>
              <button
                onClick={handleClearHistory}
                class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
