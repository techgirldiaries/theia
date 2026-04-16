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

export type StreamOptions = {
  /** AbortSignal to cancel the stream at any time. */
  signal?: AbortSignal;
  /** Maximum number of consecutive poll retries on transient errors (default: 3). */
  maxRetries?: number;
  /** Timeout in milliseconds for each individual poll request (default: 10000). */
  pollTimeoutMs?: number;
  /** Interval in milliseconds between polls (default: 500). */
  pollInterval?: number;
};

class StreamError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "StreamError";
  }
}

async function poll(
  taskId: string,
  signal: AbortSignal,
  timeoutMs: number,
): Promise<Task> {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

  // Combine the caller's abort signal with our local timeout signal
  const combinedSignal = AbortSignal.any
    ? AbortSignal.any([signal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      signal: combinedSignal,
    });
    if (!response.ok) {
      throw new StreamError(
        `Poll failed with status ${response.status}: ${response.statusText}`,
      );
    }
    return response.json() as Promise<Task>;
  } catch (err) {
    if (err instanceof StreamError) throw err;
    if (signal.aborted) throw new StreamError("Stream was cancelled by caller");
    if (timeoutController.signal.aborted)
      throw new StreamError(`Poll timed out after ${timeoutMs}ms`);
    throw new StreamError(
      err instanceof Error ? err.message : "Network error during poll",
      err,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function* streamAgentResponse(
  taskId: string,
  options: StreamOptions = {},
): AsyncGenerator<StreamEvent> {
  const {
    signal = new AbortController().signal,
    maxRetries = 3,
    pollTimeoutMs = 10_000,
    pollInterval = 500,
  } = options;

  let previousMessages: Message[] = [];
  let isComplete = false;
  let hasError = false;
  let consecutiveErrors = 0;

  while (!isComplete && !hasError) {
    if (signal.aborted) {
      yield {
        type: "error",
        error: "Stream was cancelled",
        timestamp: new Date().toISOString(),
      };
      return;
    }

    try {
      const task = await poll(taskId, signal, pollTimeoutMs);
      consecutiveErrors = 0; // reset on success

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
        return;
      }

      if (task.status === "failed") {
        hasError = true;
        yield {
          type: "error",
          error: task.error || "Task failed",
          timestamp: new Date().toISOString(),
        };
        return;
      }

      await new Promise<void>((resolve, reject) => {
        const id = setTimeout(resolve, pollInterval);
        signal.addEventListener("abort", () => {
          clearTimeout(id);
          reject(new StreamError("Stream was cancelled"));
        });
      });
    } catch (error) {
      if (signal.aborted) {
        yield {
          type: "error",
          error: "Stream was cancelled",
          timestamp: new Date().toISOString(),
        };
        return;
      }

      consecutiveErrors += 1;

      if (consecutiveErrors > maxRetries) {
        yield {
          type: "error",
          error:
            error instanceof Error
              ? error.message
              : "Too many consecutive errors — streaming aborted",
          timestamp: new Date().toISOString(),
        };
        hasError = true;
      } else {
        // Exponential back-off before retrying
        const backoff = pollInterval * 2 ** (consecutiveErrors - 1);
        await new Promise<void>((resolve) => setTimeout(resolve, backoff));
      }
    }
  }
}
