import {
  Download,
  Eye,
  Play,
  Shield,
  StopCircle,
  Trash2,
  Upload,
  X,
  AlertCircle,
} from "lucide-react";
import { getAuditLogs, showAuditLog } from "@/signals";

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

  const handleClose = () => {
    showAuditLog.value = false;
  };

  return (
    <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div class="h-full overflow-y-auto p-4">
        <div class="max-w-5xl mx-auto">
          {/* Header */}
          <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 mb-4 transition-colors">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-x-2">
                  <Shield size={24} strokeWidth={2} class="text-indigo-500" />
                  Audit Log
                </h2>
                <p class="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  Track all system activities and user actions
                </p>
              </div>
              <button
                onClick={handleClose}
                class="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                aria-label="Close audit log"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Audit Log Content */}
          <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 transition-colors">
            {auditLogs.length === 0 ? (
              <div class="text-center py-12">
                <Shield
                  size={48}
                  class="mx-auto mb-4 text-zinc-400"
                  strokeWidth={1.5}
                />
                <p class="text-zinc-500 dark:text-zinc-400 mb-2">
                  No audit entries recorded yet
                </p>
                <p class="text-sm text-zinc-400 dark:text-zinc-500">
                  System activities will be logged here
                </p>
              </div>
            ) : (
              <div class="space-y-2">
                {auditLogs
                  .slice()
                  .reverse()
                  .map((entry) => {
                    const Icon =
                      actionIcons[entry.action as AuditAction] || AlertCircle;
                    const colorClass =
                      actionColors[entry.action as AuditAction] ||
                      "text-gray-600 dark:text-gray-400";

                    return (
                      <div
                        key={entry.id}
                        class="flex items-start gap-x-3 p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <div
                          class={`p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 ${colorClass}`}
                        >
                          <Icon size={16} strokeWidth={2} />
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                            {entry.timestamp.toLocaleString()} • {entry.userId}
                          </p>
                          <p class="text-sm text-zinc-900 dark:text-white font-medium capitalize">
                            {entry.action.replace(/_/g, " ")}
                          </p>
                          <p class="text-sm text-zinc-600 dark:text-zinc-300 wrap-break-word">
                            {entry.details}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
