import {
  X,
  Clock,
  MessageSquare,
  Trash2,
  Search,
  AlertCircle,
} from "lucide-react";
import { useState } from "preact/hooks";
import { Show } from "@preact/signals/utils";
import {
  showHistorySidebar,
  getChatSessions,
  restoreSession,
  deleteSession,
  sessionSearchQuery,
  logAuditEntry,
} from "@/signals";

type ChatSession = {
  id: string;
  startTime: Date;
  endTime: Date;
  messages: any[];
  messageCount: number;
  tags?: string[];
  riskLevel?: "low" | "medium" | "high";
};

export function HistorySidebar() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Load sessions when sidebar opens
  const handleOpen = () => {
    const loadedSessions = getChatSessions();
    setSessions(loadedSessions);
  };

  // Call handleOpen when sidebar becomes visible
  if (showHistorySidebar.value && sessions.length === 0) {
    handleOpen();
  }

  const handleClose = () => {
    showHistorySidebar.value = false;
    logAuditEntry("view", "Closed history sidebar");
  };

  const handleRestoreSession = (session: ChatSession) => {
    restoreSession(session);
    showHistorySidebar.value = false;
  };

  const handleDeleteSession = (sessionId: string, e: Event) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this session?")) {
      deleteSession(sessionId);
      setSessions(getChatSessions());
      logAuditEntry("delete", `Deleted session: ${sessionId}`);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    sessionSearchQuery.value = query;
  };

  const filteredSessions = sessions.filter((session) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const messagesText = session.messages
      .map((m) => m.text.toLowerCase())
      .join(" ");

    return (
      messagesText.includes(query) ||
      session.id.toLowerCase().includes(query) ||
      session.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const getRiskBadgeClass = (riskLevel?: string) => {
    switch (riskLevel) {
      case "high":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
      case "low":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      default:
        return "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400";
    }
  };

  const getSessionPreview = (session: ChatSession) => {
    const lastMessage = session.messages[session.messages.length - 1];
    if (!lastMessage) return "No messages";
    return (
      lastMessage.text.substring(0, 80) +
      (lastMessage.text.length > 80 ? "..." : "")
    );
  };

  return (
    <Show when={showHistorySidebar}>
      <div class="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Sidebar */}
        <div class="relative w-full max-w-md bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-left duration-300">
          {/* Header */}
          <div class="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
            <div class="flex items-center gap-x-2">
              <Clock size={20} class="text-indigo-500" />
              <h2 class="text-lg font-semibold text-zinc-900 dark:text-white">
                Chat History
              </h2>
            </div>
            <button
              onClick={handleClose}
              class="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              aria-label="Close sidebar"
            >
              <X size={20} class="text-zinc-600 dark:text-zinc-400" />
            </button>
          </div>

          {/* Search */}
          <div class="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <div class="relative">
              <Search
                size={18}
                class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onInput={(e) => handleSearch(e.currentTarget.value)}
                class="w-full pl-10 pr-4 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Sessions List */}
          <div class="flex-1 overflow-y-auto p-4">
            {filteredSessions.length === 0 ? (
              <div class="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle
                  size={48}
                  class="text-zinc-300 dark:text-zinc-700 mb-3"
                />
                <p class="text-zinc-500 dark:text-zinc-400 text-sm">
                  {searchQuery
                    ? "No sessions match your search"
                    : "No saved sessions yet"}
                </p>
                <p class="text-zinc-400 dark:text-zinc-600 text-xs mt-1">
                  {!searchQuery &&
                    "Start a conversation to create your first session"}
                </p>
              </div>
            ) : (
              <div class="space-y-2">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => handleRestoreSession(session)}
                    class="group p-4 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
                  >
                    <div class="flex items-start justify-between gap-x-3 mb-2">
                      <div class="flex items-center gap-x-2 flex-1 min-w-0">
                        <MessageSquare
                          size={16}
                          class="text-indigo-500 shrink-0"
                        />
                        <span class="text-sm font-medium text-zinc-900 dark:text-white truncate">
                          {formatDate(session.startTime)}
                        </span>
                        {session.riskLevel && (
                          <span
                            class={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${getRiskBadgeClass(session.riskLevel)}`}
                          >
                            {session.riskLevel}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        class="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-all"
                        aria-label="Delete session"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <p class="text-xs text-zinc-600 dark:text-zinc-400 mb-2 line-clamp-2">
                      {getSessionPreview(session)}
                    </p>

                    <div class="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500">
                      <span>{session.messageCount} messages</span>
                      {session.tags && session.tags.length > 0 && (
                        <div class="flex gap-x-1">
                          {session.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              class="px-2 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div class="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <p class="text-xs text-zinc-500 dark:text-zinc-400 text-center">
              {sessions.length} session{sessions.length !== 1 ? "s" : ""} saved
            </p>
          </div>
        </div>
      </div>
    </Show>
  );
}
