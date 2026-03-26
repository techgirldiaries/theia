import {
  Monitor,
  Moon,
  Palette,
  Settings as SettingsIcon,
  Sun,
  X,
} from "lucide-react";
import { useEffect } from "preact/hooks";
import { isDarkMode, logAuditEntry, showSettings, showToast } from "@/signals";

export function Settings() {
  const handleClose = () => {
    showSettings.value = false;
  };

  // Enhanced keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
      // Number keys for quick theme selection
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key) {
          case "1":
            handleThemeChange("light");
            break;
          case "2":
            handleThemeChange("dark");
            break;
          case "3":
            handleThemeChange("system");
            break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    if (theme === "system") {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      isDarkMode.value = systemPrefersDark;
      localStorage.removeItem("darkMode");
      showToast("Theme set to system preference", "success");
    } else {
      isDarkMode.value = theme === "dark";
      localStorage.setItem("darkMode", (theme === "dark").toString());
      showToast(`Switched to ${theme} mode`, "success");
    }
    logAuditEntry("view", `Changed theme to ${theme}`);
  };

  const getCurrentTheme = (): "light" | "dark" | "system" => {
    const stored = localStorage.getItem("darkMode");
    if (stored === null) return "system";
    return stored === "true" ? "dark" : "light";
  };

  const currentTheme = getCurrentTheme();

  return (
    <div
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      aria-describedby="settings-desc"
    >
      <div class="h-full overflow-y-auto p-4 flex items-center justify-center">
        <div class="max-w-2xl w-full">
          {/* Header */}
          <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 mb-4 transition-colors">
            <div class="flex items-center justify-between">
              <div>
                <h2
                  id="settings-title"
                  class="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2"
                >
                  <SettingsIcon
                    size={24}
                    class="text-indigo-500"
                    aria-hidden="true"
                  />
                  System Settings
                </h2>
                <p
                  id="settings-desc"
                  class="text-sm text-zinc-600 dark:text-zinc-400 mt-1"
                >
                  Configure application preferences and display options
                </p>
              </div>
              <button
                onClick={handleClose}
                class="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-800"
                aria-label="Close settings panel"
                type="button"
              >
                <X size={20} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>
          {/* Theme Settings */}
          <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 mb-4 transition-colors">
            <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Palette size={20} class="text-purple-500" aria-hidden="true" />
              Display Theme
            </h3>

            <div class="space-y-3">
              <p class="text-sm text-zinc-600 dark:text-zinc-400">
                Select the visual theme that best suits your workflow
                preferences
              </p>

              <fieldset class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <legend class="sr-only">Theme selection options</legend>
                <button
                  onClick={() => handleThemeChange("light")}
                  type="button"
                  class={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-800 hover:scale-[1.02] active:scale-[0.98] ${
                    currentTheme === "light"
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500"
                      : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                  }`}
                  aria-pressed={currentTheme === "light"}
                  aria-describedby="light-theme-desc"
                >
                  <Sun size={20} class="text-yellow-500" aria-hidden="true" />
                  <div class="text-left">
                    <div class="font-medium text-zinc-900 dark:text-white">
                      Light Theme
                    </div>
                    <div
                      id="light-theme-desc"
                      class="text-sm text-zinc-600 dark:text-zinc-400"
                    >
                      Bright, professional interface
                    </div>
                  </div>
                  {currentTheme === "light" && (
                    <div
                      class="ml-auto w-3 h-3 rounded-full bg-indigo-500"
                      aria-hidden="true"
                    ></div>
                  )}
                </button>

                <button
                  onClick={() => handleThemeChange("dark")}
                  type="button"
                  class={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-800 hover:scale-[1.02] active:scale-[0.98] ${
                    currentTheme === "dark"
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500"
                      : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                  }`}
                  aria-pressed={currentTheme === "dark"}
                  aria-describedby="dark-theme-desc"
                >
                  <Moon size={20} class="text-blue-500" aria-hidden="true" />
                  <div class="text-left">
                    <div class="font-medium text-zinc-900 dark:text-white">
                      Dark Theme
                    </div>
                    <div
                      id="dark-theme-desc"
                      class="text-sm text-zinc-600 dark:text-zinc-400"
                    >
                      Reduced eye strain interface
                    </div>
                  </div>
                  {currentTheme === "dark" && (
                    <div
                      class="ml-auto w-3 h-3 rounded-full bg-indigo-500"
                      aria-hidden="true"
                    ></div>
                  )}
                </button>

                <button
                  onClick={() => handleThemeChange("system")}
                  type="button"
                  class={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-800 hover:scale-[1.02] active:scale-[0.98] ${
                    currentTheme === "system"
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500"
                      : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                  }`}
                  aria-pressed={currentTheme === "system"}
                  aria-describedby="system-theme-desc"
                >
                  <Monitor
                    size={20}
                    class="text-green-500"
                    aria-hidden="true"
                  />
                  <div class="text-left">
                    <div class="font-medium text-zinc-900 dark:text-white">
                      System Theme
                    </div>
                    <div
                      id="system-theme-desc"
                      class="text-sm text-zinc-600 dark:text-zinc-400"
                    >
                      Match device preference
                    </div>
                  </div>
                  {currentTheme === "system" && (
                    <div
                      class="ml-auto w-3 h-3 rounded-full bg-indigo-500"
                      aria-hidden="true"
                    ></div>
                  )}
                </button>
              </fieldset>
            </div>
          </div>
          {/* Privacy & Data */}
          <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 transition-colors">
            <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Security & Compliance
            </h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between py-3 border-b border-zinc-200 dark:border-zinc-700 last:border-b-0">
                <div>
                  <div class="font-medium text-zinc-900 dark:text-white">
                    Local Data Storage
                  </div>
                  <div class="text-sm text-zinc-600 dark:text-zinc-400">
                    All fraud analysis data stored locally for security
                    compliance
                  </div>
                </div>
                <div
                  class="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium"
                  role="status"
                  aria-label="Local storage is enabled"
                >
                  Enabled
                </div>
              </div>

              <div class="flex items-center justify-between py-3">
                <div>
                  <div class="font-medium text-zinc-900 dark:text-white">
                    Performance Analytics
                  </div>
                  <div class="text-sm text-zinc-600 dark:text-zinc-400">
                    Fraud detection metrics and system performance tracking
                  </div>
                </div>
                <div
                  class="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium"
                  role="status"
                  aria-label="Analytics are stored locally only"
                >
                  Local Only
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
