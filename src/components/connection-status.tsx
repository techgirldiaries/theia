import { Signal, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { isInitialized, loadingError, agentName } from "@/signals";

export function ConnectionStatus() {
  if (!isInitialized.value) {
    return (
      <div class="flex items-center gap-x-2 text-xs text-amber-600 dark:text-amber-400">
        <RefreshCw size={14} class="animate-spin" strokeWidth={2} />
        <span>Connecting...</span>
      </div>
    );
  }

  if (loadingError.value) {
    return (
      <div class="flex items-center gap-x-2 text-xs text-red-600 dark:text-red-400">
        <WifiOff size={14} strokeWidth={2} />
        <span>Disconnected</span>
      </div>
    );
  }

  return (
    <div class="flex items-center gap-x-2 text-xs text-green-600 dark:text-green-400">
      <div class="relative">
        <Wifi size={14} strokeWidth={2} />
        <span class="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      </div>
      <span>Connected to {agentName.value}</span>
    </div>
  );
}
