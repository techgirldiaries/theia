import { computed, effect, signal } from "@preact/signals";
import { Agent, type Client, type Task, Workforce } from "@relevanceai/sdk";
import { AGENT_ID, WORKFORCE_ID } from "@/constant";

type Message = {
  id: string;
  type: "agent-message" | "user-message";
  text: string;
  createdAt: Date;
  isAgent: () => boolean;
};

// Helper functions for message persistence
function saveMessagesToStorage(msgs: Message[]) {
  try {
    const serialized = msgs.map((m) => ({
      id: m.id,
      type: m.type,
      text: m.text,
      createdAt: m.createdAt.toISOString(),
    }));
    localStorage.setItem("fraud-chat-history", JSON.stringify(serialized));
  } catch (error) {
    console.error("Failed to save messages:", error);
  }
}

function loadMessagesFromStorage(): Message[] {
  try {
    const saved = localStorage.getItem("fraud-chat-history");
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    return parsed.map((m: any) => ({
      id: m.id,
      type: m.type,
      text: m.text,
      createdAt: new Date(m.createdAt),
      isAgent: () => m.type === "agent-message",
    }));
  } catch (error) {
    console.error("Failed to load messages:", error);
    return [];
  }
}

export function clearChatHistory() {
  messages.value = [];
  localStorage.removeItem("fraud-chat-history");
}

// Load saved messages on startup
const savedMessages = loadMessagesFromStorage();
export const messages = signal<Message[]>(savedMessages);
export const client = signal<Client>();
export const agent = signal<Agent>();
export const workforce = signal<Workforce>();
export const task = signal<Task<any, any>>();
export const isAgentTyping = signal(false);
export const isInitialized = signal(false);
export const loadingError = signal<string | null>(null);
export const isDarkMode = signal(
  localStorage.getItem("darkMode") === "true" ||
    (localStorage.getItem("darkMode") === "false"
      ? false
      : window.matchMedia("(prefers-color-scheme: dark)").matches),
);

export const agentName = computed(
  () => agent.value?.name ?? workforce.value?.name,
);
export const agentInitials = computed(() =>
  agentName.value
    ?.split(/\W+/)
    .slice(0, 2)
    .map((s) => s.toLocaleUpperCase().charAt(0))
    .join(""),
);
export const agentAvatar = computed(() => agent.value?.avatar);
export const agentDescription = computed(() => agent.value?.description);

// Persist dark mode preference
effect(() => {
  localStorage.setItem("darkMode", isDarkMode.value.toString());
  if (isDarkMode.value) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
});

// Persist chat history to localStorage
effect(() => {
  if (messages.value.length > 0) {
    saveMessagesToStorage(messages.value);
  }
});

effect(() => {
  if (client.value) {
    if (WORKFORCE_ID) {
      Workforce.get(WORKFORCE_ID, client.value)
        .then((w) => {
          workforce.value = w;
          isInitialized.value = true;
          loadingError.value = null;
        })
        .catch((error) => {
          console.error("Failed to load workforce:", error);
          loadingError.value =
            "Failed to connect to workforce. Please check your configuration.";
          isInitialized.value = true;
        });
    } else if (AGENT_ID) {
      Agent.get(AGENT_ID, client.value)
        .then((a) => {
          agent.value = a;
          isInitialized.value = true;
          loadingError.value = null;
        })
        .catch((error) => {
          console.error("Failed to load agent:", error);
          loadingError.value =
            "Failed to connect to agent. Please check your configuration.";
          isInitialized.value = true;
        });
    } else {
      loadingError.value = "No AGENT_ID or WORKFORCE_ID configured.";
      isInitialized.value = true;
    }
  }
});

effect(() => {
  const t = task.value;

  if (t) {
    t.addEventListener("message", ({ detail }: any) => {
      const { message } = detail;
      const msgs = messages.value;
      const optimistic = msgs.find(
        (m) => m.type === "user-message" && m.id === "optimistic",
      );

      if (optimistic) {
        const i = msgs.indexOf(optimistic);
        const copy = msgs.concat();
        copy.splice(i, 1, message);

        messages.value = copy;
        isAgentTyping.value = true;
      } else {
        messages.value = [...msgs, message];

        if (message.type === "agent-message") {
          isAgentTyping.value = false;
        }
      }
    });
  }

  return () => {
    t?.unsubscribe();
  };
});
