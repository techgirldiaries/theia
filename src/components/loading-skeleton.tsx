import * as Avatar from "@radix-ui/react-avatar";
import { agentAvatar, agentInitials } from "@/signals";

export function LoadingSkeleton() {
  return (
    <div class="flex items-start gap-x-2 pr-12 md:pr-0 md:max-w-3xl self-start animate-pulse">
      <div class="shrink-0">
        <Avatar.Root>
          <Avatar.Image
            src={agentAvatar}
            class="size-10 rounded-full border border-zinc-200 dark:border-zinc-700"
          />
          <Avatar.Fallback>{agentInitials}</Avatar.Fallback>
        </Avatar.Root>
      </div>
      <div class="flex flex-col gap-y-2 flex-1">
        <div class="flex items-center gap-x-2">
          <div class="h-3 w-24 bg-zinc-300 dark:bg-zinc-700 rounded"></div>
          <div class="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
        <div class="py-2 px-4 rounded-3xl rounded-tl-xs bg-zinc-200 dark:bg-zinc-800">
          <div class="space-y-2">
            <div class="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-full"></div>
            <div class="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-5/6"></div>
            <div class="h-4 bg-zinc-300 dark:bg-zinc-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
