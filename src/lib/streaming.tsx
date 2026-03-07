type StreamEvent =
  | { type: "message"; content: string; timestamp: string }
  | { type: "complete"; taskId: string; timestamp: string }
  | { type: "error"; error: string; timestamp: string };

type Message = {
  role: string;
  content: string;
};

type Task = {
  messages: Message[];
  status: string;
  error?: string;
};

async function poll(taskId: string): Promise<Task> {
  const response = await fetch(`/api/tasks/${taskId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch task: ${response.statusText}`);
  }
  return response.json();
}

export async function* streamAgentResponse(
  taskId: string,
): AsyncGenerator<StreamEvent> {
  const pollInterval = 500;
  let previousMessages: Message[] = [];
  let isComplete = false;
  let hasError = false;

  while (!isComplete && !hasError) {
    try {
      const task = await poll(taskId);

      // Stream new messages
      if (task.messages && task.messages.length > previousMessages.length) {
        const newMessages = task.messages.slice(previousMessages.length);

        for (const message of newMessages) {
          if (message.role === "agent") {
            yield {
              type: "message",
              content: message.content,
              timestamp: new Date().toISOString(),
            };
          }
        }
        previousMessages = task.messages;
      }

      // Check completion
      if (task.status === "complete") {
        isComplete = true;
        yield {
          type: "complete",
          taskId,
          timestamp: new Date().toISOString(),
        };
      }

      if (task.status === "failed") {
        hasError = true;
        yield {
          type: "error",
          error: task.error || "Task failed",
          timestamp: new Date().toISOString(),
        };
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    } catch (error) {
      yield {
        type: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
      hasError = true;
    }
  }
}
