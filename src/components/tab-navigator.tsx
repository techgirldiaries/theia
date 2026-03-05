/**
 * Tab Navigator Component
 * Provides tabbed interface for multi-section content display
 */

import { useState } from "preact/hooks";
import type { ComponentChildren } from "preact";

export interface Tab {
  id: string;
  label: string;
  icon?: any;
  badge?: number;
  content: ComponentChildren;
  condition?: boolean;
}

interface TabNavigatorProps {
  tabs: Tab[];
  defaultTab?: string;
}

export function TabNavigator({ tabs, defaultTab }: TabNavigatorProps) {
  const visibleTabs = tabs.filter((tab) => tab.condition !== false);
  const [activeTab, setActiveTab] = useState(
    defaultTab || visibleTabs[0]?.id || "",
  );

  const activeTabContent = visibleTabs.find(
    (tab) => tab.id === activeTab,
  )?.content;

  if (visibleTabs.length === 0) {
    return null;
  }

  return (
    <div class="w-full">
      {/* Tab Headers */}
      <div class="border-b border-zinc-200 dark:border-zinc-700 mb-4">
        <div class="flex flex-wrap gap-2">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                class={`px-4 py-2 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <span class="flex items-center gap-2">
                  {Icon && <Icon size={16} />}
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span class="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </span>
                {activeTab === tab.id && (
                  <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div class="animate-fadeIn">{activeTabContent}</div>
    </div>
  );
}
