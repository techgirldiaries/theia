import { render } from "preact";
import { Suspense } from "preact/compat";
import { App } from "@/components/app";

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function showFatalError(message: string) {
  const appElement = document.getElementById("app");
  if (!appElement) return;

  appElement.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#09090b;color:#f4f4f5;padding:16px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
      <div style="max-width:680px;width:100%;border:1px solid #52525b;border-radius:12px;padding:20px;background:#18181b;">
        <h1 style="margin:0 0 8px 0;font-size:20px;line-height:1.2;">Unable to render UI</h1>
        <p style="margin:0 0 12px 0;color:#d4d4d8;">A runtime error prevented the application from loading.</p>
        <pre style="margin:0;white-space:pre-wrap;word-break:break-word;color:#fca5a5;background:#27272a;padding:12px;border-radius:8px;">${escapeHtml(message)}</pre>
      </div>
    </div>
  `;
}

window.addEventListener("error", (event) => {
  const message = event.error?.stack ?? event.message ?? "Unknown error";
  showFatalError(message);
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  const message =
    (reason && (reason.stack ?? reason.message)) || String(reason);
  showFatalError(message);
});

const appElement = document.getElementById("app");

if (appElement) {
  try {
    render(
      <Suspense fallback={<em>loading...</em>}>
        <App />
      </Suspense>,
      appElement,
    );
  } catch (error) {
    const message =
      error instanceof Error ? (error.stack ?? error.message) : String(error);
    showFatalError(message);
  }
} else {
  showFatalError("Could not find #app element");
}
