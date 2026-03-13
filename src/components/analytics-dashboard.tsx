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
// ...existing code...
import { BarChart } from "@/components/bar-chart";
import { LineChart } from "@/components/line-chart";
import { StatsCard } from "@/components/stats-card";
import {
  clearChatHistory,
  fraudStats,
  getChatSessions,
  performanceMetrics,
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
    <div class="space-y-4 animate-fade-in">
      {/* Header */}
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-6 transition-colors">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-zinc-900 dark:text-white">
              Fraud Detection Analytics
            </h2>
            <p class="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Analytics page content has been removed.
            </p>
          </div>
          <button
            class="ml-4 p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            title="Close Analytics Dashboard"
            onClick={() => {
              showAnalytics.value = false;
            }}
          >
            <X
              size={22}
              strokeWidth={2}
              class="text-zinc-500 dark:text-zinc-300"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
