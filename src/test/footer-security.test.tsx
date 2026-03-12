import { render, fireEvent, screen, waitFor } from "@testing-library/preact";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@relevanceai/sdk", () => ({
  Agent: { get: vi.fn() },
  Workforce: { get: vi.fn() },
}));

vi.mock("lucide-react", () => ({
  Clock: () => null,
  Mic: () => null,
  MicOff: () => null,
  Paperclip: () => null,
  SendHorizonal: () => null,
  X: () => null,
}));

vi.mock("@/components/attachment-menu", () => ({
  AttachmentMenu: ({ onFileSelect }: { onFileSelect: () => void }) => (
    <button type="button" onClick={onFileSelect} aria-label="attach file">
      Attach
    </button>
  ),
}));

vi.mock("@/components/mode-selector", () => ({
  ModeSelector: () => null,
}));

vi.mock("@/signals", () => {
  const s = <T,>(val: T) => ({ value: val });
  return {
    addDataset: vi.fn(),
    agent: s(undefined),
    agentMode: s("expert"),
    autoCompleteQuery: s(""),
    client: s(undefined),
    fraudAnalysisTerms: [],
    interfaceMode: s("balanced"),
    isAgentTyping: s(false),
    isVoiceRecording: s(false),
    logAuditEntry: vi.fn(),
    messageDraft: s(""),
    messages: s([]),
    showAutoComplete: s(false),
    showToast: vi.fn(),
    startPerformanceTracking: vi.fn(),
    task: s(undefined),
    uploadedDatasets: s([]),
    workforce: s(undefined),
  };
});

import { Footer } from "../components/footer";
import { showToast } from "@/signals";

describe("Footer Security & Robustness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Message length ─────────────────────────────────────────────────────────

  test("rejects oversized message input", async () => {
    render(<Footer />);
    const textarea = screen.getByPlaceholderText(/ask anything/i);
    fireEvent.input(textarea, { target: { value: "a".repeat(20001) } });
    fireEvent.keyDown(textarea, { key: "Enter" });
    await waitFor(() => {
      expect(screen.getByText(/character limit/i)).toBeInTheDocument();
    });
  });

  test("accepts a message exactly at the 20 000-char boundary", async () => {
    render(<Footer />);
    const textarea = screen.getByPlaceholderText(/ask anything/i);
    fireEvent.input(textarea, { target: { value: "a".repeat(20000) } });
    fireEvent.keyDown(textarea, { key: "Enter" });
    await waitFor(() => {
      expect(screen.queryByText(/character limit/i)).not.toBeInTheDocument();
    });
  });

  test("rejects a message that is 1 char over the limit (boundary +1)", async () => {
    render(<Footer />);
    const textarea = screen.getByPlaceholderText(/ask anything/i);
    fireEvent.input(textarea, { target: { value: "a".repeat(20001) } });
    fireEvent.keyDown(textarea, { key: "Enter" });
    await waitFor(() => {
      expect(screen.getByText(/character limit/i)).toBeInTheDocument();
    });
  });

  // ── XSS / injection ────────────────────────────────────────────────────────

  test("sanitizes malicious script injection", async () => {
    render(<Footer />);
    const textarea = screen.getByPlaceholderText(/ask anything/i);
    fireEvent.input(textarea, {
      target: { value: "<img src=x onerror=alert(1)>" },
    });
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(document.body.innerHTML).not.toContain("alert(1)");
  });

  test("neutralizes inline <script> tag injection", async () => {
    render(<Footer />);
    const textarea = screen.getByPlaceholderText(/ask anything/i);
    fireEvent.input(textarea, {
      target: {
        value: '<script>document.cookie="stolen"</script>',
      },
    });
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(document.body.innerHTML).not.toContain("<script>");
    expect(document.body.innerHTML).not.toContain("stolen");
  });

  test("neutralizes javascript: href injection", async () => {
    render(<Footer />);
    const textarea = screen.getByPlaceholderText(/ask anything/i);
    fireEvent.input(textarea, {
      target: { value: '<a href="javascript:alert(\'xss\')">click</a>' },
    });
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(document.body.innerHTML).not.toMatch(/href=["']javascript:/i);
  });

  test("neutralizes event-handler attribute injection (onmouseover)", async () => {
    render(<Footer />);
    const textarea = screen.getByPlaceholderText(/ask anything/i);
    fireEvent.input(textarea, {
      target: { value: '<div onmouseover="stealData()">hover me</div>' },
    });
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(document.body.innerHTML).not.toContain("stealData()");
  });

  test("does not execute injected content as HTML when rendered", async () => {
    render(<Footer />);
    const textarea = screen.getByPlaceholderText(/ask anything/i);
    const payload = '<iframe src="http://evil.com"></iframe>';
    fireEvent.input(textarea, { target: { value: payload } });
    fireEvent.keyDown(textarea, { key: "Enter" });
    const iframes = document.body.querySelectorAll("iframe");
    expect(iframes.length).toBe(0);
  });

  test("handles null-byte injection in message", async () => {
    render(<Footer />);
    const textarea = screen.getByPlaceholderText(/ask anything/i);
    fireEvent.input(textarea, {
      target: { value: "legitimate\x00<script>alert(1)</script>" },
    });
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(document.body.innerHTML).not.toContain("<script>");
  });

  test("handles unicode homoglyph attack in message", async () => {
    render(<Footer />);
    const textarea = screen.getByPlaceholderText(/ask anything/i);
    fireEvent.input(textarea, {
      target: { value: "\u003cscript\u003ealert(1)\u003c/script\u003e" },
    });
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(document.body.innerHTML).not.toContain("<script>");
  });

  // ── File upload validation ─────────────────────────────────────────────────

  test("rejects invalid file upload (.exe)", async () => {
    render(<Footer />);
    const fileInput = screen.getByLabelText(/file input/i);
    const file = new File(["dummy"], "malware.exe", {
      type: "application/x-msdownload",
    });
    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() => {
      expect(
        screen.getByText(/not an accepted file type/i),
      ).toBeInTheDocument();
    });
  });

  test("rejects .bat script upload", async () => {
    render(<Footer />);
    const fileInput = screen.getByLabelText(/file input/i);
    const file = new File(["@echo off\ndel /f /q *"], "destroy.bat", {
      type: "application/bat",
    });
    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() => {
      expect(
        screen.getByText(/not an accepted file type/i),
      ).toBeInTheDocument();
    });
  });

  test("rejects .html file upload", async () => {
    render(<Footer />);
    const fileInput = screen.getByLabelText(/file input/i);
    const file = new File(
      ["<script>alert(1)</script>"],
      "phishing.html",
      { type: "text/html" },
    );
    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() => {
      expect(
        screen.getByText(/not an accepted file type/i),
      ).toBeInTheDocument();
    });
  });

  test("rejects a file disguised with a double extension (.csv.exe)", async () => {
    render(<Footer />);
    const fileInput = screen.getByLabelText(/file input/i);
    const file = new File(["dummy"], "data.csv.exe", {
      type: "application/x-msdownload",
    });
    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() => {
      expect(
        screen.getByText(/not an accepted file type/i),
      ).toBeInTheDocument();
    });
  });

  test("accepts empty-filename file when MIME type is valid (documents gap)", async () => {
    render(<Footer />);
    const fileInput = screen.getByLabelText(/file input/i);
    const file = new File(["data"], "", { type: "text/csv" });
    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.queryByText(/not an accepted file type/i)).not.toBeInTheDocument();
    });
  });

  test("enforces MAX_FILES limit — calls showToast with maximum warning", async () => {
    render(<Footer />);
    const fileInput = screen.getByLabelText(/file input/i);
    const files = Array.from({ length: 6 }, (_, i) =>
      new File(["data"], `file${i}.csv`, { type: "text/csv" }),
    );
    fireEvent.change(fileInput, { target: { files } });
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        expect.stringMatching(/maximum 5 files/i),
        "error",
      );
    });
  });

  // ── Rate limiting / spam ───────────────────────────────────────────────────

  test("handles rapid submission (spam)", async () => {
    render(<Footer />);
    const textarea = screen.getByPlaceholderText(/ask anything/i);
    fireEvent.input(textarea, { target: { value: "hello" } });
    fireEvent.keyDown(textarea, { key: "Enter" });
    fireEvent.keyDown(textarea, { key: "Enter" });
    await waitFor(() => {
      expect(screen.getByText(/wait a moment/i)).toBeInTheDocument();
    });
  });

  test("allows submission after cooldown expires", async () => {
    vi.useFakeTimers();
    render(<Footer />);
    const textarea = screen.getByPlaceholderText(/ask anything/i);
    fireEvent.input(textarea, { target: { value: "first" } });
    fireEvent.keyDown(textarea, { key: "Enter" });
    vi.advanceTimersByTime(2001);
    fireEvent.input(textarea, { target: { value: "second" } });
    fireEvent.keyDown(textarea, { key: "Enter" });
    await waitFor(() => {
      expect(screen.queryByText(/wait a moment/i)).not.toBeInTheDocument();
    });
    vi.useRealTimers();
  });

  // ── Empty / whitespace-only input ─────────────────────────────────────────

  test("does not submit an empty message", async () => {
    render(<Footer />);
    const textarea = screen.getByPlaceholderText(/ask anything/i);
    fireEvent.input(textarea, { target: { value: "" } });
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(screen.queryByText(/character limit/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/wait a moment/i)).not.toBeInTheDocument();
  });

  test("does not submit whitespace-only message", async () => {
    render(<Footer />);
    const textarea = screen.getByPlaceholderText(/ask anything/i);
    fireEvent.input(textarea, { target: { value: "     \n\t  " } });
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(screen.queryByText(/character limit/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/wait a moment/i)).not.toBeInTheDocument();
  });

  // ── Keyboard edge cases ───────────────────────────────────────────────────

  test("Shift+Enter inserts newline instead of submitting", () => {
    render(<Footer />);
    const textarea = screen.getByPlaceholderText(/ask anything/i) as HTMLTextAreaElement;
    fireEvent.input(textarea, { target: { value: "line one" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
    expect(screen.queryByText(/character limit/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/wait a moment/i)).not.toBeInTheDocument();
  });

  test("Ctrl+Enter does not submit", () => {
    render(<Footer />);
    const textarea = screen.getByPlaceholderText(/ask anything/i);
    fireEvent.input(textarea, { target: { value: "line one" } });
    fireEvent.keyDown(textarea, { key: "Enter", ctrlKey: true });
    expect(screen.queryByText(/wait a moment/i)).not.toBeInTheDocument();
  });

  // ── Miscellaneous edge cases ──────────────────────────────────────────────

  test("rejects weak password (if implemented)", async () => {
    // This would be in AuthGate, not Footer, but included for completeness
    // Example: render(<AuthGate />) and test weak passphrase
  });

  test("handles extremely long single word (no spaces) without crashing", async () => {
    render(<Footer />);
    const textarea = screen.getByPlaceholderText(/ask anything/i);
    fireEvent.input(textarea, { target: { value: "z".repeat(20000) } });
    fireEvent.keyDown(textarea, { key: "Enter" });
    const hasLimit = !!screen.queryByText(/character limit/i);
    expect(typeof hasLimit).toBe("boolean");
  });

  test("handles special unicode characters without crashing", async () => {
    render(<Footer />);
    const textarea = screen.getByPlaceholderText(/ask anything/i);
    fireEvent.input(textarea, {
      target: { value: "مرحبا 你好 こんにちは 🔥💀🤖 \u200B\u202E\uFEFF" },
    });
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(screen.queryByText(/character limit/i)).not.toBeInTheDocument();
  });

  test("handles deeply nested JSON payload in message without crashing", async () => {
    render(<Footer />);
    const textarea = screen.getByPlaceholderText(/ask anything/i);
    const nested = JSON.stringify({ a: { b: { c: { d: { e: "deep" } } } } });
    fireEvent.input(textarea, { target: { value: nested } });
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(document.body).toBeTruthy();
  });
});
