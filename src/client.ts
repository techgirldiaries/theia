import { Client, Key } from "@relevanceai/sdk";
import { AGENT_ID, PROJECT, REGION, WORKFORCE_ID } from "@/constant";
import { client, isInitialized, loadingError } from "@/signals";

// Timeout wrapper to prevent hanging
function withTimeout<T>(promise: Promise<T>, timeoutMs = 30000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Connection timeout")), timeoutMs),
    ),
  ]);
}

withTimeout(
  Promise.resolve(tryStoredEmbedKey()).then((key) => key ?? generateEmbedKey()),
)
  .then((key) => {
    client.value = new Client(key);
  })
  .catch((error) => {
    console.error("Failed to initialize client:", error);
    loadingError.value = `Failed to initialize: ${error.message || "Unknown error"}`;
    isInitialized.value = true; // Set to true to stop showing "Connecting..."
  });

async function generateEmbedKey() {
  console.log("Generating embed key for WORKFORCE_ID:", WORKFORCE_ID);
  console.log("Region:", REGION, "Project:", PROJECT);

  const key = await Key.generateEmbedKey({
    region: REGION,
    project: PROJECT,
    ...(WORKFORCE_ID ? { workforceId: WORKFORCE_ID } : { agentId: AGENT_ID }),
  });

  console.log("Embed key generated successfully");

  const { key: embedKey, taskPrefix } = key.toJSON();
  const storageKey = WORKFORCE_ID ? `r-wf-${WORKFORCE_ID}` : `r-${AGENT_ID}`;
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      embedKey: embedKey,
      conversationPrefix: taskPrefix,
    }),
  );

  return key;
}

function tryStoredEmbedKey() {
  try {
    const storageKey = WORKFORCE_ID ? `r-wf-${WORKFORCE_ID}` : `r-${AGENT_ID}`;
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? "null");

    if (stored?.embedKey && stored?.conversationPrefix) {
      console.log("Using stored embed key from localStorage");
      return new Key({
        key: stored.embedKey,
        region: REGION,
        project: PROJECT,
        ...(WORKFORCE_ID
          ? { workforceId: WORKFORCE_ID }
          : { agentId: AGENT_ID }),
        taskPrefix: stored.conversationPrefix,
      });
    }
    console.log("No stored embed key found, will generate new one");
  } catch (error) {
    console.error("Error reading stored key:", error);
  }
}
