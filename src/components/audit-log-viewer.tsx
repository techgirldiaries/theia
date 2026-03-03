import {
  Shield,
  Eye,
  Download,
  Trash2,
  Upload,
  Play,
  StopCircle,
} from "lucide-react";
import { getAuditLogs } from "@/signals";

type AuditAction =
  | "view"
  | "export"
  | "delete"
  | "upload"
  | "session_start"
  | "session_end";

const actionIcons: Record<AuditAction, any> = {
  view: Eye,
  export: Download,
  delete: Trash2,
  upload: Upload,
  session_start: Play,
  session_end: StopCircle,
};

const actionColors: Record<AuditAction, string> = {
  view: "text-blue-600 dark:text-blue-400",
  export: "text-green-600 dark:text-green-400",
  delete: "text-red-600 dark:text-red-400",
  upload: "text-purple-600 dark:text-purple-400",
  session_start: "text-indigo-600 dark:text-indigo-400",
  session_end: "text-zinc-600 dark:text-zinc-400",
};

export function AuditLogViewer() {
  const auditLogs = getAuditLogs();

  return (
    <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 transition-colors">
      <div class="flex items-center gap-x-2 mb-3">
        <Shield size={20} strokeWidth={2} class="text-indigo-500" />
        <h3 class="text-lg font-semibold text-zinc-900 dark:text-white">
          Audit Log
        </h3>
      </div>

      {auditLogs.length === 0 ? (
        <p class="text-sm text-zinc-500 dark:text-zinc-400">
          No audit entries recorded yet
        </p>
      ) : (
        <div class="space-y-2 max-h-96 overflow-y-auto">
          {auditLogs
            .slice()
            .reverse()
            .map((entry) => {
              const Icon = actionIcons[entry.action as AuditAction];
              const colorClass = actionColors[entry.action as AuditAction];

              return (
                <div
                  key={entry.id}
                  class="flex items-start gap-x-3 p-2 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-sm"
                >
                  <div
                    class={`p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 ${colorClass}`}
                  >
                    <Icon size={14} strokeWidth={2} />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">
                      {entry.timestamp.toLocaleString()} • {entry.userId}
                    </p>
                    <p class="text-sm text-zinc-900 dark:text-white font-medium capitalize">
                      {entry.action.replace(/_/g, " ")}
                    </p>
                    <p class="text-xs text-zinc-600 dark:text-zinc-300 truncate">
                      {entry.details}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
