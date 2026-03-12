import React from "react";
import { TrendingUp } from "lucide-react";

interface PerformanceMetric {
  taskId: string;
  status: string;
  duration?: number;
  riskScore?: number;
  agentContributions?: string;
}

interface PerformanceDashboardProps {
  metrics: PerformanceMetric[];
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  metrics,
}) => {
  return (
    <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 mb-4 transition-colors">
      <div className="flex items-center gap-x-2 mb-3">
        <TrendingUp size={20} strokeWidth={2} className="text-indigo-500" />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Recent Performance Metrics
        </h3>
      </div>
      {metrics.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No performance data available yet
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="text-left py-2 px-3 text-zinc-600 dark:text-zinc-400 font-medium">
                  Task ID
                </th>
                <th className="text-left py-2 px-3 text-zinc-600 dark:text-zinc-400 font-medium">
                  Status
                </th>
                <th className="text-left py-2 px-3 text-zinc-600 dark:text-zinc-400 font-medium">
                  Duration
                </th>
                <th className="text-left py-2 px-3 text-zinc-600 dark:text-zinc-400 font-medium">
                  Risk Score
                </th>
                <th className="text-left py-2 px-3 text-zinc-600 dark:text-zinc-400 font-medium">
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
                    className="border-b border-zinc-100 dark:border-zinc-700/50"
                  >
                    <td className="py-2 px-3 text-zinc-700 dark:text-zinc-300 font-mono text-xs truncate max-w-32">
                      {metric.taskId.slice(0, 12)}...
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
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
                    <td className="py-2 px-3 text-zinc-700 dark:text-zinc-300">
                      {metric.duration
                        ? `${(metric.duration / 1000).toFixed(1)}s`
                        : "-"}
                    </td>
                    <td className="py-2 px-3">
                      {metric.riskScore !== undefined ? (
                        <span
                          className={`font-medium ${
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
                        <span className="text-zinc-400">-</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-zinc-700 dark:text-zinc-300">
                      {metric.agentContributions || "-"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PerformanceDashboard;
