import { ArrowDown } from "lucide-react";
import { Show } from "@preact/signals/utils";
import { showScrollToBottom } from "@/signals";

export function ScrollToBottomButton() {
  const handleScrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <Show when={showScrollToBottom}>
      <button
        onClick={handleScrollToBottom}
        class="fixed bottom-24 right-4 md:right-8 p-3 bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-full shadow-lg transition-all hover:scale-110 z-40 animate-bounce"
        title="Scroll to bottom"
        aria-label="Scroll to bottom"
      >
        <ArrowDown size={20} />
      </button>
    </Show>
  );
}
