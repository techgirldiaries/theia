import {
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Pause,
  Play,
} from "lucide-react";

type TaskStatus =
  | "not-started"
  | "idle"
  | "paused"
  | "queued"
  | "running"
  | "action"
  | "completed"
  | "cancelled"
  | "error";

interface TaskStatusIndicatorProps {
  status: TaskStatus;
  compact?: boolean;
}

export function TaskStatusIndicator({
  status,
  compact = false,
}: TaskStatusIndicatorProps) {
  const statusConfig: Record<
    TaskStatus,
    {
      icon: any;
      label: string;
      color: string;
      bg: string;
      animate?: boolean;
    }
  > = {
    "not-started": {
      icon: Clock,
      label: "Not Started",
      color: "text-zinc-500 dark:text-zinc-400",
      bg: "bg-zinc-100 dark:bg-zinc-800",
    },
    idle: {
      icon: Clock,
      label: "Idle",
      color: "text-zinc-500 dark:text-zinc-400",
      bg: "bg-zinc-100 dark:bg-zinc-800",
    },
    paused: {
      icon: Pause,
      label: "Paused",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/30",
    },
    queued: {
      icon: Clock,
      label: "Queued",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    running: {
      icon: Loader2,
      label: "Processing",
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
      animate: true,
    },
    action: {
      icon: Play,
      label: "Action Required",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
    completed: {
      icon: CheckCircle,
      label: "Completed",
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    cancelled: {
      icon: AlertCircle,
      label: "Cancelled",
      color: "text-zinc-500 dark:text-zinc-400",
      bg: "bg-zinc-100 dark:bg-zinc-800",
    },
    error: {
      icon: AlertCircle,
      label: "Error",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/30",
    },
  };

  const config = statusConfig[status] || statusConfig.idle;
  const Icon = config.icon;

  if (compact) {
    return (
      <div class={`inline-flex items-center gap-x-1.5 ${config.color}`}>
        <Icon
          size={14}
          strokeWidth={2}
          class={config.animate ? "animate-spin" : ""}
        />
        <span class="text-xs font-medium">{config.label}</span>
      </div>
    );
  }

  return (
    <div
      class={`inline-flex items-center gap-x-2 px-3 py-1.5 rounded-full ${config.bg} ${config.color}`}
    >
      <Icon
        size={16}
        strokeWidth={2}
        class={config.animate ? "animate-spin" : ""}
      />
      <span class="text-sm font-medium">{config.label}</span>
    </div>
  );
}
