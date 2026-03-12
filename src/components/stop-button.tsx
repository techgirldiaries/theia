import { StopCircle } from "lucide-react";
import { useCallback } from "preact/hooks";
import {
  client,
  isAgentTyping,
  showToast,
  task,
  taskStatus,
  workforce,
} from "@/signals";

export function StopButton() {
  const handleStop = useCallback(async () => {
    if (!task.value || !client.value) {
      return;
    }

    const confirmStop = confirm(
      "Stop listening to the current workflow? The backend may continue processing.",
    );

    if (!confirmStop) {
      return;
    }

    try {
      // Unsubscribe from task events to stop receiving updates
      task.value.unsubscribe();
      isAgentTyping.value = false;

      // Try to signal the backend to stop (best-effort, may not be supported)
      if (workforce.value) {
        try {
          await client.value.fetch(
            `/workforce/tasks/${task.value.id}/update` as any,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                state: "cancelled",
              }),
            },
          );
          showToast("Workflow stopped successfully", "success");
        } catch (cancelError) {
          // Best-effort cancellation failed, but we've already unsubscribed
          console.warn("Backend cancellation not supported:", cancelError);
          showToast(
            "Disconnected from workflow. Backend may continue processing.",
            "info",
          );
        }
      } else {
        showToast(
          "Disconnected from task. Backend may continue processing.",
          "info",
        );
      }
    } catch (error) {
      console.error("Failed to stop workflow:", error);
      showToast("Disconnected from workflow", "info");
      isAgentTyping.value = false;
    }
  }, []);

  // Only show stop button when agent is actively processing
  if (!isAgentTyping.value || !task.value) {
    return null;
  }

  // Don't show for completed or error states
  const nonStoppableStates = ["completed", "cancelled", "error"];
  if (taskStatus.value && nonStoppableStates.includes(taskStatus.value)) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleStop}
      class="fixed bottom-24 right-8 z-50 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full p-4 shadow-lg cursor-pointer outline-red-500 outline-offset-3 transition-all hover:scale-105 active:scale-95 flex items-center gap-x-2 group"
      aria-label="Stop workflow"
      title="Stop current workflow"
    >
      <StopCircle size={24} strokeWidth={2} />
      <span class="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-medium">
        Stop Workflow
      </span>
    </button>
  );
}
