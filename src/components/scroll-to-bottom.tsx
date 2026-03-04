import { ArrowDown, ArrowUp } from "lucide-react";
import { Show } from "@preact/signals/utils";
import { showScrollToBottom } from "@/signals";
import { useState, useEffect } from "preact/hooks";

export function ScrollToBottomButton() {
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show scroll to top if scrolled past 300px
      setShowScrollToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
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

      {showScrollToTop && (
        <button
          onClick={handleScrollToTop}
          class="fixed bottom-40 right-4 md:right-8 p-3 bg-zinc-500 hover:bg-zinc-600 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white rounded-full shadow-lg transition-all hover:scale-110 z-40"
          title="Scroll to top"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </>
  );
}
