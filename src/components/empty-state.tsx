import { ChevronDown, Focus, Layers, Sparkles, Users, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "preact/hooks";
import {
  interfaceMode,
  messageDraft,
  quickTemplates,
  setInterfaceMode,
  showToast,
} from "@/signals";
import type { InterfaceMode } from "@/signals/state";

export function EmptyState() {
  const [showQuickTemplates, setShowQuickTemplates] = useState(false);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [showInterfaceMode, setShowInterfaceMode] = useState(false);
  const templatesRef = useRef<HTMLDivElement>(null);
  const agentsRef = useRef<HTMLDivElement>(null);
  const interfaceModeRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        templatesRef.current &&
        !templatesRef.current.contains(event.target as Node)
      ) {
        setShowQuickTemplates(false);
      }
      if (
        agentsRef.current &&
        !agentsRef.current.contains(event.target as Node)
      ) {
        setShowAgentSelector(false);
      }
      if (
        interfaceModeRef.current &&
        !interfaceModeRef.current.contains(event.target as Node)
      ) {
        setShowInterfaceMode(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectInterfaceMode = (mode: InterfaceMode, modeName: string) => {
    setInterfaceMode(mode);
    setShowInterfaceMode(false);
    showToast(`Switched to ${modeName} mode`, "success");
  };

  const handleSelectTemplate = (prompt: string) => {
    messageDraft.value = prompt;
    setShowQuickTemplates(false);
    showToast("Template added to message", "success");
    // Focus on the input field
    setTimeout(() => {
      const inputElement = document.querySelector(
        'textarea[name="message"]',
      ) as HTMLTextAreaElement;
      if (inputElement) {
        inputElement.focus();
        inputElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const handleSelectAgent = (agentId: string, agentName: string) => {
    setShowAgentSelector(false);
    showToast(
      `Agent "${agentName}" selected for specialized analysis`,
      "success",
    );
    // Pre-fill message with agent-specific prompt
    const agentPrompts: Record<string, string> = {
      "fraud-analyst":
        "Please perform a comprehensive fraud analysis on my data with focus on transaction anomalies and suspicious patterns.",
      "risk-assessor":
        "Please evaluate the risk levels across my datasets and provide detailed risk scoring recommendations.",
      "compliance-checker":
        "Please review my data for regulatory compliance issues, AML/KYC violations, and generate compliance reports.",
      "pattern-detector":
        "Please detect unusual patterns, anomalies, and potential fraud networks in my transaction data.",
    };

    if (agentPrompts[agentId]) {
      messageDraft.value = agentPrompts[agentId];
      setTimeout(() => {
        const inputElement = document.querySelector(
          'textarea[name="message"]',
        ) as HTMLTextAreaElement;
        if (inputElement) {
          inputElement.focus();
          inputElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  };

  const categoryColors = {
    analysis:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 border-blue-200 dark:border-blue-800",
    report:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 border-purple-200 dark:border-purple-800",
    risk: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 border-red-200 dark:border-red-800",
    investigation:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50 border-orange-200 dark:border-orange-800",
  };

  const agents = [
    {
      id: "fraud-analyst",
      name: "Fraud Analyst",
      description: "Deep fraud detection",
    },
    {
      id: "risk-assessor",
      name: "Risk Assessor",
      description: "Risk evaluation",
    },
    {
      id: "compliance-checker",
      name: "Compliance Checker",
      description: "Regulatory compliance",
    },
    {
      id: "pattern-detector",
      name: "Pattern Detector",
      description: "Anomaly detection",
    },
  ];

  return (
    <div class="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* Logo/Title Section */}
      <div class="flex items-center gap-x-3 mb-12">
        <div class="w-16 h-16 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <svg
            class="w-10 h-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <h1 class="text-5xl font-bold text-zinc-900 dark:text-white">Theia</h1>
      </div>

      {/* Action Buttons */}
      <div class="flex items-center gap-x-3 mb-8">
        {/* Switch Interface Mode Button with Dropdown */}
        <div class="relative" ref={interfaceModeRef}>
          <button
            onClick={() => setShowInterfaceMode(!showInterfaceMode)}
            class="flex items-center gap-x-2 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full text-sm font-medium transition-all border border-zinc-200 dark:border-zinc-700 hover:scale-105 active:scale-95"
          >
            {interfaceMode.value === "focus" && (
              <Focus size={16} strokeWidth={2} />
            )}
            {interfaceMode.value === "balanced" && (
              <Layers size={16} strokeWidth={2} />
            )}
            {interfaceMode.value === "expert" && (
              <Zap size={16} strokeWidth={2} />
            )}
            <span>Switch Interface Mode</span>
            <ChevronDown
              size={14}
              strokeWidth={2}
              class={`transition-transform ${showInterfaceMode ? "rotate-180" : ""}`}
            />
          </button>

          {showInterfaceMode && (
            <div class="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div class="p-2 space-y-1">
                <button
                  onClick={() => handleSelectInterfaceMode("focus", "Focus")}
                  class={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center gap-x-2 ${
                    interfaceMode.value === "focus"
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                      : "text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  }`}
                >
                  <Focus size={16} />
                  <div class="flex-1">
                    <div class="font-medium text-sm">Focus Mode</div>
                    <div class="text-xs opacity-75 mt-0.5">
                      Minimal distractions for deep work
                    </div>
                  </div>
                </button>
                <button
                  onClick={() =>
                    handleSelectInterfaceMode("balanced", "Balanced")
                  }
                  class={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center gap-x-2 ${
                    interfaceMode.value === "balanced"
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                      : "text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  }`}
                >
                  <Layers size={16} />
                  <div class="flex-1">
                    <div class="font-medium text-sm">Balanced Mode</div>
                    <div class="text-xs opacity-75 mt-0.5">
                      Essential features visible (default)
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleSelectInterfaceMode("expert", "Expert")}
                  class={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center gap-x-2 ${
                    interfaceMode.value === "expert"
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                      : "text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  }`}
                >
                  <Zap size={16} />
                  <div class="flex-1">
                    <div class="font-medium text-sm">Expert Mode</div>
                    <div class="text-xs opacity-75 mt-0.5">
                      All advanced features accessible
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Templates Button with Dropdown */}
        <div class="relative" ref={templatesRef}>
          <button
            onClick={() => setShowQuickTemplates(!showQuickTemplates)}
            class="flex items-center gap-x-2 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full text-sm font-medium transition-all border border-zinc-200 dark:border-zinc-700 hover:scale-105 active:scale-95"
          >
            <Sparkles size={16} strokeWidth={2} />
            <span>Quick Templates</span>
          </button>

          {showQuickTemplates && (
            <div class="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div class="p-3 space-y-2 max-h-96 overflow-y-auto">
                {quickTemplates.value.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template.prompt)}
                    class={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${categoryColors[template.category]}`}
                  >
                    <div class="font-semibold mb-1">{template.title}</div>
                    <div class="text-xs opacity-75 line-clamp-2">
                      {template.prompt}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Select Agents Button with Dropdown */}
        <div class="relative" ref={agentsRef}>
          <button
            onClick={() => setShowAgentSelector(!showAgentSelector)}
            class="flex items-center gap-x-2 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full text-sm font-medium transition-all border border-zinc-200 dark:border-zinc-700 hover:scale-105 active:scale-95"
          >
            <Users size={16} strokeWidth={2} />
            <span>Select Agents</span>
            <ChevronDown
              size={14}
              strokeWidth={2}
              class={`transition-transform ${showAgentSelector ? "rotate-180" : ""}`}
            />
          </button>

          {showAgentSelector && (
            <div class="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div class="p-2 space-y-1">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => handleSelectAgent(agent.id, agent.name)}
                    class="w-full text-left px-3 py-2.5 rounded-lg text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <div class="font-medium text-sm">{agent.name}</div>
                    <div class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {agent.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Text */}
      <p class="text-center text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl mb-6">
        Detect Risk Early. Act Decisively. Stay Compliant.
      </p>

      {/* Interface Mode Indicator */}
      <div class="flex items-center gap-x-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs text-zinc-600 dark:text-zinc-400">
        {interfaceMode.value === "focus" && (
          <>
            <Focus size={14} />
            <span>Focus Mode - Minimal distractions enabled</span>
          </>
        )}
        {interfaceMode.value === "balanced" && (
          <>
            <Layers size={14} />
            <span>Balanced Mode - Essential features visible</span>
          </>
        )}
        {interfaceMode.value === "expert" && (
          <>
            <Zap size={14} />
            <span>Expert Mode - All features accessible</span>
          </>
        )}
      </div>
    </div>
  );
}
