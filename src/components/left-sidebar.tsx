import * as Collapsible from "@radix-ui/react-collapsible";
import type { ComponentType } from "preact";
import {
  Activity,
  ClipboardList,
  Database,
  FileText,
  FolderOpen,
  HelpCircle,
  History,
  Layout,
  Search,
  Settings,
  User,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "preact/hooks";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  isDarkMode,
  isSidebarExpanded,
  logAuditEntry,
  showAnalytics,
  showAuditLog,
  showDataManagement,
  showFileManager,
  showHistorySidebar,
  showKeyboardShortcuts,
  showQuickActions,
  showReports,
  showSettings,
  splitScreenMode,
  startNewChat,
} from "@/signals";

export function LeftSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  // Use media query hooks for responsive behavior
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
  const isDesktop = useMediaQuery(
    "(min-width: 1024px) and (max-width: 1439px)",
  );
  const isLargeScreen = useMediaQuery("(min-width: 1440px)");

  // Calculate showLabel for consistent use throughout component
  // Large screens always show labels (static expanded), mobile/tablet use signal, desktop uses hover state
  const showLabel = isLargeScreen
    ? true
    : isMobile || isTablet
      ? isSidebarExpanded.value
      : isExpanded;

  // Handle keyboard shortcuts (Ctrl+B to toggle sidebar, arrow keys for navigation)
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Toggle sidebar with Ctrl+B
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        if (isMobile || isTablet) {
          isSidebarExpanded.value = !isSidebarExpanded.value;
        } else if (isDesktop) {
          // Only allow toggle on desktop, not large screens (large screens are always expanded)
          setIsExpanded(!isExpanded);
        }
        // Large screens don't respond to Ctrl+B as they're static
      }

      // Quick navigation with Alt + number keys for financial professionals
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= menuItems.length) {
          e.preventDefault();
          menuItems[num - 1]?.onClick();
        }
      }
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [isMobile, isTablet, isDesktop, isExpanded]);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    if ((!isMobile && !isTablet) || !isSidebarExpanded.value) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        isSidebarExpanded.value = false;
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isTablet, isSidebarExpanded.value]);

  // Track active panels
  useEffect(() => {
    if (showFileManager.value) setActiveItem("files");
    else if (showAnalytics.value) setActiveItem("analytics");
    else if (showReports.value) setActiveItem("reports");
    else if (showAuditLog.value) setActiveItem("audit-log");
    else if (showHistorySidebar.value) setActiveItem("history");
    else if (showQuickActions.value) setActiveItem("quick-actions");
    else if (showSettings.value) setActiveItem("settings");
    else if (splitScreenMode.value) setActiveItem("performance");
    else setActiveItem(null); // No active view - showing chat
  }, [
    showAnalytics.value,
    showFileManager.value,
    showReports.value,
    showAuditLog.value,
    showHistorySidebar.value,
    showQuickActions.value,
    showSettings.value,
    splitScreenMode.value,
  ]);

  const handleNewChat = () => {
    startNewChat();
    // Close all views to return to chat
    showAnalytics.value = false;
    showFileManager.value = false;
    showReports.value = false;
    showAuditLog.value = false;
    showQuickActions.value = false;
    showSettings.value = false;
    splitScreenMode.value = false;
    setActiveItem("new-chat");
    logAuditEntry("view", "Started new chat from sidebar");
    if (isMobile || isTablet) isSidebarExpanded.value = false;
  };

  const handleSearch = () => {
    setActiveItem("search");
    if (isMobile || isTablet) isSidebarExpanded.value = false;
    // Add search functionality
  };

  const handleAnalytics = () => {
    // Close all other views
    showFileManager.value = false;
    showReports.value = false;
    showAuditLog.value = false;
    showQuickActions.value = false;
    showSettings.value = false;
    splitScreenMode.value = false;
    // Toggle analytics
    showAnalytics.value = !showAnalytics.value;
    setActiveItem("analytics");
    if (isMobile || isTablet) isSidebarExpanded.value = false;
  };

  const handleFiles = () => {
    // Close all other views
    showAnalytics.value = false;
    showReports.value = false;
    showAuditLog.value = false;
    showQuickActions.value = false;
    showSettings.value = false;
    splitScreenMode.value = false;
    // Toggle file manager
    showFileManager.value = !showFileManager.value;
    setActiveItem("files");
    if (isMobile || isTablet) isSidebarExpanded.value = false;
  };

  const handleReports = () => {
    // Close all other views
    showAnalytics.value = false;
    showFileManager.value = false;
    showAuditLog.value = false;
    showQuickActions.value = false;
    showSettings.value = false;
    splitScreenMode.value = false;
    // Toggle reports
    showReports.value = !showReports.value;
    setActiveItem("reports");
    if (isMobile || isTablet) isSidebarExpanded.value = false;
  };

  const handleHistory = () => {
    showHistorySidebar.value = !showHistorySidebar.value;
    setActiveItem("history");
    if (isMobile || isTablet) isSidebarExpanded.value = false;
  };

  const handleDataManagement = () => {
    // Close all other views
    showAnalytics.value = false;
    showFileManager.value = false;
    showReports.value = false;
    showAuditLog.value = false;
    showSettings.value = false;
    splitScreenMode.value = false;
    // Toggle quick actions
    showQuickActions.value = !showQuickActions.value;
    setActiveItem("quick-actions");
    if (isMobile || isTablet) isSidebarExpanded.value = false;
  };

  const handleHelp = () => {
    showKeyboardShortcuts.value = !showKeyboardShortcuts.value;
    logAuditEntry("view", "Opened keyboard shortcuts help");
    if (isMobile || isTablet) isSidebarExpanded.value = false;
  };

  const handleSettings = () => {
    // Close all other views
    showAnalytics.value = false;
    showFileManager.value = false;
    showReports.value = false;
    showAuditLog.value = false;
    showQuickActions.value = false;
    splitScreenMode.value = false;
    // Toggle settings
    showSettings.value = !showSettings.value;
    setActiveItem("settings");
    if (isMobile || isTablet) isSidebarExpanded.value = false;
  };

  const handleAuditLog = () => {
    // Close all other views
    showAnalytics.value = false;
    showFileManager.value = false;
    showReports.value = false;
    showQuickActions.value = false;
    showSettings.value = false;
    splitScreenMode.value = false;
    // Toggle audit log
    showAuditLog.value = !showAuditLog.value;
    setActiveItem("audit-log");
    if (isMobile || isTablet) isSidebarExpanded.value = false;
  };

  const handlePerformance = () => {
    // Close all other views
    showAnalytics.value = false;
    showFileManager.value = false;
    showReports.value = false;
    showAuditLog.value = false;
    showQuickActions.value = false;
    showSettings.value = false;
    // Toggle split screen
    splitScreenMode.value = !splitScreenMode.value;
    setActiveItem("performance");
    if (isMobile || isTablet) isSidebarExpanded.value = false;
  };

  const menuItems: Array<{
    id: string;
    icon: ComponentType<any>;
    label: string;
    onClick: () => void;
    ariaLabel?: string;
  }> = [
    {
      id: "new-chat",
      icon: Zap,
      label: "New Analysis",
      onClick: handleNewChat,
      ariaLabel: "Start new fraud analysis session (Alt+1)",
    },
    {
      id: "search",
      icon: Search,
      label: "Search",
      onClick: handleSearch,
      ariaLabel: "Search through analysis history (Alt+2)",
    },
    {
      id: "files",
      icon: FolderOpen,
      label: "Datasets",
      onClick: handleFiles,
      ariaLabel: "Manage fraud detection datasets (Alt+3)",
    },
    {
      id: "analytics",
      icon: Activity,
      label: "Analytics",
      onClick: handleAnalytics,
      ariaLabel: "View fraud detection analytics and metrics (Alt+4)",
    },
    {
      id: "performance",
      icon: Layout,
      label: "Performance",
      onClick: handlePerformance,
      ariaLabel: "Monitor system performance and efficiency (Alt+5)",
    },
    {
      id: "reports",
      icon: FileText,
      label: "Reports",
      onClick: handleReports,
      ariaLabel: "Generate and view fraud analysis reports (Alt+6)",
    },
    {
      id: "audit-log",
      icon: ClipboardList,
      label: "Audit Log",
      onClick: handleAuditLog,
      ariaLabel: "Review security audit logs and compliance records (Alt+7)",
    },
    {
      id: "history",
      icon: History,
      label: "History",
      onClick: handleHistory,
      ariaLabel: "Access analysis history and previous sessions (Alt+8)",
    },
    {
      id: "help",
      icon: HelpCircle,
      label: "Help",
      onClick: handleHelp,
      ariaLabel: "View keyboard shortcuts and help documentation (Alt+9)",
    },
  ];

  return (
    <>
      {/* Mobile/Tablet Backdrop */}
      {(isMobile || isTablet) && isSidebarExpanded.value && (
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 animate-in fade-in duration-200"
          onClick={() => (isSidebarExpanded.value = false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Full-screen overlay on mobile/tablet, fixed on desktop */}
      <Collapsible.Root
        open={isMobile || isTablet ? isSidebarExpanded.value : true}
        onOpenChange={(open) => {
          if (isMobile || isTablet) {
            isSidebarExpanded.value = open;
          }
        }}
      >
        <Collapsible.Content
          forceMount
          id="main-sidebar"
          class={`fixed bg-white dark:bg-zinc-950 border-r border-zinc-300 dark:border-zinc-800 flex flex-col transition-all duration-300 ease-in-out z-40 ${
            isMobile || isTablet
              ? // Mobile/Tablet: Full-screen overlay, starts below header
                isSidebarExpanded.value
                ? "left-0 top-16 bottom-16 w-64 translate-x-0"
                : "left-0 top-16 bottom-16 w-64 -translate-x-full"
              : isLargeScreen
                ? // Large Screen: Static expanded sidebar, full-width
                  "left-0 top-16 h-[calc(100vh-4rem)] w-56"
                : // Desktop: Fixed sidebar with hover expansion
                  isExpanded
                  ? "left-0 top-16 h-[calc(100vh-4rem)] w-44"
                  : "left-0 top-16 h-[calc(100vh-4rem)] w-16"
          }`}
          onMouseEnter={() =>
            isDesktop && !isLargeScreen && setIsExpanded(true)
          }
          onMouseLeave={() =>
            isDesktop && !isLargeScreen && setIsExpanded(false)
          }
          ref={sidebarRef}
          role="navigation"
          aria-label="Main navigation sidebar"
        >
          {/* Menu Items */}
          <nav
            class="flex-1 flex flex-col space-y-2 px-3 pt-6 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-400 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent"
            role="navigation"
            aria-label="Main navigation menu"
          >
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              // Special handling for performance item - use splitScreenMode for active state
              const isActive =
                item.id === "performance"
                  ? splitScreenMode.value
                  : activeItem === item.id;

              return (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  type="button"
                  class={`flex items-center gap-x-3 h-10 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 hover:scale-[1.02] active:scale-[0.98] ${
                    showLabel ? "px-3" : "px-2 justify-center"
                  } ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  }`}
                  title={item.ariaLabel || item.label}
                  aria-label={item.ariaLabel || item.label}
                  aria-current={isActive ? "page" : undefined}
                  aria-describedby={`${item.id}-desc`}
                >
                  <Icon
                    size={20}
                    strokeWidth={1.5}
                    class="shrink-0"
                    aria-hidden="true"
                  />
                  {showLabel && (
                    <span class="text-sm font-medium whitespace-nowrap overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200">
                      {item.label}
                    </span>
                  )}
                  <span id={`${item.id}-desc`} class="sr-only">
                    Navigation item {index + 1} of {menuItems.length}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div class="pb-6 flex flex-col space-y-2 px-3 border-t border-zinc-300 dark:border-zinc-800 pt-4">
            <div class="text-xs text-zinc-500 dark:text-zinc-600 px-3 mb-2">
              System Controls
            </div>

            {/* Quick Actions */}
            <button
              onClick={handleDataManagement}
              type="button"
              class={`flex items-center gap-x-3 h-10 rounded-lg transition-all duration-200 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 hover:scale-[1.02] active:scale-[0.98] ${
                activeItem === "quick-actions"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
              aria-label="Quick data operations and system actions"
              title="Quick Actions - Data Operations Hub"
              aria-current={activeItem === "quick-actions" ? "page" : undefined}
            >
              <Zap
                size={20}
                strokeWidth={1.5}
                class="shrink-0"
                aria-hidden="true"
              />
              {showLabel && (
                <span class="text-sm whitespace-nowrap overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200">
                  Quick Actions
                </span>
              )}
            </button>

            {/* Settings */}
            <button
              onClick={handleSettings}
              type="button"
              class={`flex items-center gap-x-3 h-10 rounded-lg transition-all duration-200 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 hover:scale-[1.02] active:scale-[0.98] ${
                activeItem === "settings"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
              aria-label="Application settings and preferences"
              title="Settings - Configure Application Preferences"
              aria-current={activeItem === "settings" ? "page" : undefined}
            >
              <Settings
                size={20}
                strokeWidth={1.5}
                class="shrink-0"
                aria-hidden="true"
              />
              {showLabel && (
                <span class="text-sm whitespace-nowrap overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200">
                  Settings
                </span>
              )}
            </button>

            {/* User Profile Button */}
            <button
              type="button"
              class="flex items-center gap-x-3 h-10 rounded-lg bg-purple-600 text-white font-semibold transition-all duration-200 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 hover:scale-105 active:scale-95 hover:shadow-lg"
              aria-label="User profile and account settings"
              title="User Profile - Account Management"
            >
              <User
                size={20}
                strokeWidth={2}
                class="shrink-0"
                aria-hidden="true"
              />
              {showLabel && (
                <span class="text-sm whitespace-nowrap overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200">
                  Profile
                </span>
              )}
            </button>
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
    </>
  );
}
