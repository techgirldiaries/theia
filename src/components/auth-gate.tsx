import { ShieldCheck } from "lucide-react";
import { useCallback, useRef, useState } from "preact/hooks";
import { ACCESS_PASSPHRASE } from "@/constant";
import { initEncryptionKeyFromPassphrase } from "@/signals/storage";
import { currentUserId, isAuthenticated } from "@/signals";

export function AuthGate() {
  const passphraseRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: Event) => {
    e.preventDefault();
    const entered = passphraseRef.current?.value ?? "";
    const name = nameRef.current?.value.trim() || "analyst";

    if (entered !== ACCESS_PASSPHRASE) {
      setError("Incorrect passphrase. Please try again.");
      passphraseRef.current!.value = "";
      passphraseRef.current!.focus();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Derive AES-GCM key from the passphrase and reload the sessions cache.
      await initEncryptionKeyFromPassphrase(entered);
      currentUserId.value = name;
      isAuthenticated.value = true;
    } catch {
      setError("Failed to initialise encryption. Please reload and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div class="flex items-center justify-center min-h-dvh bg-zinc-950 p-4">
      <div class="w-full max-w-sm">
        {/* Logo / branding */}
        <div class="flex flex-col items-center mb-8 gap-y-3">
          <div class="p-3 bg-indigo-600 rounded-2xl">
            <ShieldCheck size={32} class="text-white" strokeWidth={1.5} />
          </div>
          <h1 class="text-2xl font-bold text-white tracking-tight">
            Fraud Intelligence
          </h1>
          <p class="text-zinc-400 text-sm text-center">
            Enter your display name and passphrase to continue.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          class="flex flex-col gap-y-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
        >
          {/* Display name */}
          <div class="flex flex-col gap-y-1.5">
            <label for="auth-name" class="text-sm font-medium text-zinc-300">
              Your name
            </label>
            <input
              ref={nameRef}
              id="auth-name"
              type="text"
              placeholder="e.g. Jane Smith"
              autocomplete="name"
              maxLength={80}
              required
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Passphrase */}
          <div class="flex flex-col gap-y-1.5">
            <label
              for="auth-passphrase"
              class="text-sm font-medium text-zinc-300"
            >
              Passphrase
            </label>
            <input
              ref={passphraseRef}
              id="auth-passphrase"
              type="password"
              placeholder="Enter passphrase"
              autocomplete="current-password"
              required
              class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {error && (
            <p class="text-sm text-red-400 bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            class="mt-1 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Verifying…" : "Access"}
          </button>
        </form>
      </div>
    </div>
  );
}
