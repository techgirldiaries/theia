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
      "Are you sure you want to stop the current workflow? This action cannot be undone.",
    );

    if (!confirmStop) {
      return;
    }

    try {
      // For workforce tasks, we can try to update the requested state to "stop"
      if (workforce.value) {
        await client.value.fetch(
          `/workforce/tasks/${task.value.id}/metadata` as any,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              requested_state: "stop",
            }),
          },
        );

        showToast("Workflow stop requested", "info");
        isAgentTyping.value = false;
      } else {
        // For agent tasks, we can't directly stop them but we can unsubscribe
        task.value.unsubscribe();
        showToast("Disconnected from task", "info");
        isAgentTyping.value = false;
      }
    } catch (error) {
      console.error("Failed to stop workflow:", error);
      showToast(
        "Failed to stop workflow. It may complete on its own.",
        "error",
      );
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
