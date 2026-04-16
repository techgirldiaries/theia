import { X } from "lucide-react";
import { useEffect, useState } from "preact/hooks";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

export function Toast({
  message,
  type = "info",
  duration = 3000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: "bg-green-500 dark:bg-green-600",
    error: "bg-red-500 dark:bg-red-600",
    info: "bg-indigo-500 dark:bg-indigo-600",
  }[type];

  return (
    <div
      class={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div
        class={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-x-3 min-w-80 max-w-md`}
      >
        <span class="flex-1">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          class="p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Close notification"
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
