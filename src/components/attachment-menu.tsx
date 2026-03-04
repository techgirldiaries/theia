import {
  Paperclip,
  Upload,
  FileText,
  Pen,
  Folder,
  History,
} from "lucide-react";
import { useState, useRef, useEffect } from "preact/hooks";

interface AttachmentMenuProps {
  onFileSelect: () => void;
  onAddText?: () => void;
  onDrawSketch?: () => void;
  onOpenRecent?: () => void;
  disabled?: boolean;
}

export function AttachmentMenu({
  onFileSelect,
  onAddText,
  onDrawSketch,
  onOpenRecent,
  disabled,
}: AttachmentMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
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

  const menuItems = [
    {
      icon: Upload,
      label: "Upload a file",
      description: "CSV, JSON, or other data files",
      onClick: handleFileSelect,
      enabled: true,
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

  return (
    <div class="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
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
                      <div class="font-medium text-sm">{item.label}</div>
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
        </div>
      )}
    </div>
  );
}
