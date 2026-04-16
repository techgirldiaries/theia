import * as Avatar from "@radix-ui/react-avatar";
import { BrainCircuit } from "lucide-react";
import { agentAvatar, agentInitials, agentName } from "@/signals";

interface LoadingSkeletonProps {
  /** When true (multi-agent workforce), shows the animated "Thinking" pill
   *  instead of the generic skeleton bars. */
  isWorkforce?: boolean;
}

export function LoadingSkeleton({ isWorkforce = false }: LoadingSkeletonProps) {
  return (
    <div class="flex items-start gap-x-2 pr-12 md:pr-0 md:max-w-3xl self-start">
      <div class="shrink-0">
        <Avatar.Root>
          <Avatar.Image
            src={agentAvatar}
            class="size-10 rounded-full border border-zinc-200 dark:border-zinc-700"
          />
          <Avatar.Fallback>{agentInitials}</Avatar.Fallback>
        </Avatar.Root>
      </div>

      {isWorkforce ? (
        /* ── "Thinking" indicator for multi-agent workflow ── */
        <div class="flex flex-col gap-y-1">
          <small class="text-zinc-500 dark:text-zinc-400">{agentName}</small>
          <div class="py-2.5 px-4 rounded-3xl rounded-tl-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 inline-flex items-center gap-x-2.5">
            <BrainCircuit
              size={16}
              strokeWidth={1.5}
              class="text-indigo-500 dark:text-indigo-400 shrink-0 animate-pulse"
            />
            <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Thinking
            </span>
            <span class="flex items-center gap-x-1" aria-hidden="true">
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 thinking-dot thinking-dot-1" />
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 thinking-dot thinking-dot-2" />
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 thinking-dot thinking-dot-3" />
            </span>
          </div>
        </div>
      ) : (
        /* ── Generic skeleton bars ── */
        <div class="flex flex-col gap-y-2 flex-1 animate-pulse">
          <div class="flex items-center gap-x-2">
            <div class="h-3 w-24 bg-zinc-300 dark:bg-zinc-700 rounded" />
            <div class="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
          <div class="py-2 px-4 rounded-3xl rounded-tl-xs bg-zinc-200 dark:bg-zinc-800">
            <div class="space-y-2">
              <div class="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-full" />
              <div class="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-5/6" />
              <div class="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-4/6" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
