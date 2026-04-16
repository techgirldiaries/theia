import { Copy, Download, Edit3, MoreHorizontal, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "preact/hooks";
import { logAuditEntry, messages, showToast } from "@/signals";

export function RightActionBar() {
  const [showMenu, setShowMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (
        shareRef.current &&
        !shareRef.current.contains(event.target as Node)
      ) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    showToast("Link copied to clipboard", "success");
    logAuditEntry("view", "Copied conversation link");
    setShowShareMenu(false);
  };

  const handleExport = async () => {
    if (messages.value.length === 0) {
      showToast("No messages to export", "info");
      return;
    }

    const conversationData = {
      timestamp: new Date().toISOString(),
      messages: messages.value.map((m) => ({
        type: m.type,
        text: m.text,
        createdAt: m.createdAt,
      })),
    };

    const blob = new Blob([JSON.stringify(conversationData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversation-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("Conversation exported", "success");
    logAuditEntry("export", "Exported conversation as JSON");
    setShowShareMenu(false);
  };

  const handleEdit = () => {
    // Add edit functionality
    logAuditEntry("view", "Opened editor");
  };

  return (
    <div class="fixed top-4 right-4 flex items-center gap-x-2 z-30">
      {/* More Options Menu */}
      <div class="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          class="p-2.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-full transition-colors border border-zinc-700"
          aria-label="More options"
        >
          <MoreHorizontal size={20} strokeWidth={1.5} />
        </button>

        {showMenu && (
          <div class="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <button
              onClick={handleExport}
              class="w-full flex items-center gap-x-3 px-4 py-3 text-sm text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <Download size={16} />
              <span>Export Chat</span>
            </button>
            <button
              onClick={handleCopyLink}
              class="w-full flex items-center gap-x-3 px-4 py-3 text-sm text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <Copy size={16} />
              <span>Copy Link</span>
            </button>
          </div>
        )}
      </div>

      {/* Share Button */}
      <div class="relative" ref={shareRef}>
        <button
          onClick={handleShare}
          class="flex items-center gap-x-2 px-4 py-2.5 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-full text-sm font-medium transition-colors border border-zinc-200 dark:border-zinc-700"
        >
          <Share2 size={16} strokeWidth={2} />
          <span>Share</span>
        </button>

        {showShareMenu && (
          <div class="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div class="p-2">
              <button
                onClick={handleCopyLink}
                class="w-full flex items-center gap-x-3 px-3 py-2.5 rounded-lg text-sm text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-left"
              >
                <Copy size={16} />
                <div>
                  <div class="font-medium">Copy Link</div>
                  <div class="text-xs text-zinc-500 dark:text-zinc-400">
                    Share this conversation
                  </div>
                </div>
              </button>
              <button
                onClick={handleExport}
                class="w-full flex items-center gap-x-3 px-3 py-2.5 rounded-lg text-sm text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-left"
              >
                <Download size={16} />
                <div>
                  <div class="font-medium">Export as JSON</div>
                  <div class="text-xs text-zinc-500 dark:text-zinc-400">
                    Download conversation
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Button */}
      <button
        onClick={handleEdit}
        class="p-2.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-full transition-colors border border-zinc-700"
        aria-label="Edit"
      >
        <Edit3 size={20} strokeWidth={1.5} />
      </button>
    </div>
  );
}
