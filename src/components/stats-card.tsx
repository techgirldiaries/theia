import type { ComponentChildren } from "preact";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ComponentChildren;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "red" | "yellow" | "purple";
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "blue",
}: StatsCardProps) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    green: "bg-green-500/10 text-green-600 dark:text-green-400",
    red: "bg-red-500/10 text-red-600 dark:text-red-400",
    yellow: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  };

  return (
    <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 transition-colors">
      <div class="flex items-start justify-between mb-2">
        <div class="flex-1">
          <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-1">{title}</p>
          <div class="flex items-baseline gap-x-2">
            <p class="text-2xl font-bold text-zinc-900 dark:text-white">
              {value}
            </p>
            {trend && (
              <span
                class={`text-xs font-medium ${
                  trend.isPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p class="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div class={`p-2 rounded-lg ${colorClasses[color]} shrink-0`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
