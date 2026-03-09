import {
  ChevronLeft,
  Clock,
  Cloud,
  FileText,
  Folder,
  History,
  Paperclip,
  Pen,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "preact/hooks";

export interface RecentFile {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
  size?: number;
  /** Stored preview so the agent can access data even if temp URL expired */
  preview?: string;
  previewFormat?: string;
}

interface AttachmentMenuProps {
  onFileSelect: () => void;
  onAddText?: () => void;
  onDrawSketch?: () => void;
  onOpenRecent?: () => void;
  onConnectGoogleDrive?: () => void;
  onConnectOneDrive?: () => void;
  /** Live list of previously uploaded datasets shown in the Recent Files panel. */
  recentFiles?: RecentFile[];
  /** Called when the user picks a file from the Recent Files panel. */
  onRecentFileSelect?: (file: RecentFile) => void;
  disabled?: boolean;
}

export function AttachmentMenu({
  onFileSelect,
  onAddText,
  onDrawSketch,
  onOpenRecent,
  onConnectGoogleDrive,
  onConnectOneDrive,
  recentFiles = [],
  onRecentFileSelect,
  disabled,
}: AttachmentMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showRecentPanel, setShowRecentPanel] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowRecentPanel(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleFileSelect = () => {
    setIsOpen(false);
    onFileSelect();
  };

  const handleAddText = () => {
    setIsOpen(false);
    onAddText?.();
  };

  const handleDrawSketch = () => {
    setIsOpen(false);
    onDrawSketch?.();
  };

  const handleOpenRecent = () => {
    setIsOpen(false);
    onOpenRecent?.();
  };

  const handleConnectGoogleDrive = () => {
    setIsOpen(false);
    onConnectGoogleDrive?.();
  };

  const handleConnectOneDrive = () => {
    setIsOpen(false);
    onConnectOneDrive?.();
  };

  const handleOpenRecentFiles = () => {
    // Open the inline recent-files sub-panel instead of calling the old handler
    setShowRecentPanel(true);
  };

  const handleRecentFileSelect = (file: RecentFile) => {
    setIsOpen(false);
    setShowRecentPanel(false);
    onRecentFileSelect?.(file);
  };

  const menuItems = [
    {
      icon: Upload,
      label: "Upload a file",
      description: "CSV, JSON, or other data files",
      onClick: handleFileSelect,
      enabled: true,
    },
    {
      icon: Cloud,
      label: "Connect Google Drive",
      description: "Import files from Google Drive",
      onClick: handleConnectGoogleDrive,
      enabled: !!onConnectGoogleDrive,
    },
    {
      icon: Cloud,
      label: "Connect Microsoft OneDrive",
      description: "Import files from OneDrive",
      onClick: handleConnectOneDrive,
      enabled: !!onConnectOneDrive,
    },
    {
      icon: Folder,
      label: "Recent Files",
      description:
        recentFiles.length > 0
          ? `${recentFiles.length} file${recentFiles.length !== 1 ? "s" : ""} available`
          : "No recent files",
      onClick: handleOpenRecentFiles,
      enabled: true,
      hasSubPanel: true,
    },
    {
      icon: FileText,
      label: "Add text content",
      description: "Paste or type text data",
      onClick: handleAddText,
      enabled: !!onAddText,
    },
    {
      icon: Pen,
      label: "Draw a sketch",
      description: "Create a visual diagram",
      onClick: handleDrawSketch,
      enabled: !!onDrawSketch,
    },
    {
      icon: History,
      label: "Recent",
      description: "Previously uploaded files",
      onClick: handleOpenRecent,
      enabled: !!onOpenRecent,
    },
  ];

  function formatFileSize(bytes?: number) {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatRelativeTime(date: Date) {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div class="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) setShowRecentPanel(false);
        }}
        disabled={disabled}
        class={`p-2.5 rounded-full transition-colors cursor-pointer outline-indigo-500 outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 ${
          isOpen
            ? "bg-zinc-100 dark:bg-zinc-700 text-indigo-500"
            : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
        }`}
        aria-label="Attachment options"
      >
        <Paperclip size={20} strokeWidth={1.5} />
      </button>

      {isOpen && (
        <div class="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Recent Files sub-panel */}
          {showRecentPanel ? (
            <>
              <div class="flex items-center gap-x-2 px-3 py-2.5 border-b border-zinc-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setShowRecentPanel(false)}
                  class="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 transition-colors"
                  aria-label="Back"
                >
                  <ChevronLeft size={16} strokeWidth={2} />
                </button>
                <span class="text-sm font-semibold text-zinc-900 dark:text-white">
                  Recent Files
                </span>
                <span class="ml-auto text-xs text-zinc-400 dark:text-zinc-500">
                  {recentFiles.length} file{recentFiles.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div class="max-h-64 overflow-y-auto">
                {recentFiles.length === 0 ? (
                  <div class="px-4 py-6 text-center">
                    <Folder
                      size={32}
                      class="mx-auto mb-2 text-zinc-300 dark:text-zinc-600"
                      strokeWidth={1.5}
                    />
                    <p class="text-sm text-zinc-500 dark:text-zinc-400">
                      No recent files yet
                    </p>
                    <p class="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                      Upload a dataset to get started
                    </p>
                  </div>
                ) : (
                  <div class="p-2 space-y-1">
                    {recentFiles.map((file) => (
                      <button
                        key={file.id}
                        type="button"
                        onClick={() => handleRecentFileSelect(file)}
                        class="w-full flex items-start gap-x-3 px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 group"
                      >
                        <FileText
                          size={18}
                          strokeWidth={1.5}
                          class="mt-0.5 shrink-0 text-indigo-500 dark:text-indigo-400"
                        />
                        <div class="flex-1 min-w-0">
                          <div class="text-sm font-medium text-zinc-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {file.fileName}
                          </div>
                          <div class="flex items-center gap-x-2 mt-0.5">
                            <span class="text-xs text-zinc-400 dark:text-zinc-500">
                              {formatRelativeTime(file.uploadedAt)}
                            </span>
                            {file.size && (
                              <>
                                <span class="text-zinc-300 dark:text-zinc-600">
                                  ·
                                </span>
                                <span class="text-xs text-zinc-400 dark:text-zinc-500">
                                  {formatFileSize(file.size)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div class="border-t border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-zinc-50 dark:bg-zinc-900">
                <p class="text-xs text-zinc-500 dark:text-zinc-400">
                  Selecting a file re-uses its uploaded URL
                </p>
              </div>
            </>
          ) : (
            /* Main menu */
            <>
              <div class="p-2 space-y-1">
                {menuItems
                  .filter((item) => item.enabled)
                  .map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={item.onClick}
                        class="w-full flex items-start gap-x-3 px-3 py-2.5 rounded-lg text-left transition-colors text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      >
                        <Icon
                          size={20}
                          strokeWidth={1.5}
                          class="mt-0.5 shrink-0 text-zinc-500 dark:text-zinc-400"
                        />
                        <div class="flex-1 min-w-0">
                          <div class="font-medium text-sm flex items-center gap-x-1">
                            {item.label}
                            {(item as any).hasSubPanel && (
                              <span class="ml-auto text-zinc-400 dark:text-zinc-500">
                                ›
                              </span>
                            )}
                          </div>
                          <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
              </div>

              <div class="border-t border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-zinc-50 dark:bg-zinc-900">
                <p class="text-xs text-zinc-500 dark:text-zinc-400">
                  Supported: CSV, JSON, TXT, TSV, LOG
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
