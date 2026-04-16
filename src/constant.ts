import type { Region } from "@relevanceai/sdk";

export const REGION = import.meta.env.VITE_REGION as Region;
export const PROJECT = import.meta.env.VITE_PROJECT;
export const AGENT_ID = import.meta.env.VITE_AGENT_ID;
export const WORKFORCE_ID = import.meta.env.VITE_WORKFORCE_ID;

/**
 * Optional passphrase that gates access to the app.
 * When set, an auth screen is shown on load and the passphrase is used to
 * derive the AES-GCM key that encrypts localStorage session data.
 * Leave unset (or empty) for open / development deployments.
 */
export const ACCESS_PASSPHRASE: string | undefined =
  import.meta.env.VITE_ACCESS_PASSPHRASE || undefined;
