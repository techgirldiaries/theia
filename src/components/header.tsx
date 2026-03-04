import * as Avatar from "@radix-ui/react-avatar";
import { Menu, X } from "lucide-react";
import { ConnectionStatus } from "@/components/connection-status";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  agentAvatar,
  agentInitials,
  agentName,
  isSidebarExpanded,
} from "@/signals";

export function Header() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");

  const shouldShowToggle = isMobile || isTablet;

  return (
    <header class="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-zinc-900 border-b border-zinc-500/25 transition-colors z-50 overflow-hidden">
      <div class="flex items-center h-full px-2 sm:px-4">
        {/* Mobile/Tablet Sidebar Toggle */}
        {shouldShowToggle && (
          <button
            type="button"
            onClick={() => {
              isSidebarExpanded.value = !isSidebarExpanded.value;
            }}
            class="mr-2 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label={
              isSidebarExpanded.value ? "Close sidebar" : "Open sidebar"
            }
            aria-expanded={isSidebarExpanded.value ? "true" : "false"}
            aria-controls="main-sidebar"
          >
            {isSidebarExpanded.value ? (
              <X
                size={20}
                strokeWidth={2}
                class="text-black dark:text-zinc-300"
              />
            ) : (
              <Menu
                size={20}
                strokeWidth={2}
                class="text-black dark:text-zinc-300"
              />
            )}
          </button>
        )}

        {/* Logo Section */}
        <div class="w-12 sm:w-16 flex items-center justify-center shrink-0">
          <Avatar.Root>
            <Avatar.Image
              src={agentAvatar}
              class="size-8 sm:size-10 rounded-full border border-zinc-200 dark:border-zinc-700 transition-colors hover:border-indigo-500 cursor-pointer"
              alt={agentName}
            />
            <Avatar.Fallback class="size-8 sm:size-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs sm:text-sm font-semibold">
              {agentInitials}
            </Avatar.Fallback>
          </Avatar.Root>
        </div>

        {/* Title Section */}
        <div class="flex-1 px-2 sm:px-4 overflow-hidden">
          <hgroup class="flex flex-col gap-y-1">
            <h1 class="font-medium text-sm sm:text-md leading-none text-zinc-800 dark:text-white transition-colors truncate">
              Theia Fraud Intelligence
            </h1>
            <h2 class="text-xs text-zinc-600 dark:text-zinc-300 leading-none hidden sm:block">
              Detect Risk Early. Act Decisively. Stay Compliant.
            </h2>
          </hgroup>
        </div>

        {/* Connection Status - top right */}
        <div class="flex items-center shrink-0 pl-2 sm:pl-4">
          <ConnectionStatus />
        </div>
      </div>
    </header>
  );
}
