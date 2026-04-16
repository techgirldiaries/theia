/**
 * Visualization URL Validator Component
 * Tests and reports on visualization accessibility
 */

import { useState } from "preact/hooks";
import { signal } from "@preact/signals";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Download,
} from "lucide-react";
import type { EnhancedFraudReport } from "@/types/fraud-report";

export interface VisualizationStatus {
  filename: string;
  url: string;
  status: "checking" | "accessible" | "inaccessible" | "error";
  httpStatus?: number;
  errorMessage?: string;
  contentType?: string;
  size?: number;
}

export const visualizationStatuses = signal<VisualizationStatus[]>([]);

interface VisualizationValidatorProps {
  report: EnhancedFraudReport;
  onComplete?: (results: VisualizationStatus[]) => void;
}

export function VisualizationValidator({
  report,
  onComplete,
}: VisualizationValidatorProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [results, setResults] = useState<VisualizationStatus[]>([]);

  const allVisualizations = [
    ...(report.visualizations?.generated_charts || []),
    ...(report.visualizations?.marag_charts || []),
    ...(report.visualizations?.benchmarking_charts || []),
  ];

  /**
   * Check if a URL is accessible
   */
  const checkVisualizationUrl = async (
    url: string,
    filename: string,
  ): Promise<VisualizationStatus> => {
    try {
      const response = await fetch(url, { method: "HEAD" });

      return {
        filename,
        url,
        status: response.ok ? "accessible" : "inaccessible",
        httpStatus: response.status,
        contentType: response.headers.get("content-type") || undefined,
        size: Number.parseInt(response.headers.get("content-length") || "0"),
      };
    } catch (error) {
      return {
        filename,
        url,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  /**
   * Validate all visualizations
   */
  const validateAllVisualizations = async () => {
    setIsValidating(true);
    const statuses: VisualizationStatus[] = [];

    // Initialize with checking status
    const initialStatuses = allVisualizations.map((viz) => ({
      filename: viz.filename,
      url: viz.download_url,
      status: "checking" as const,
    }));
    setResults(initialStatuses);
    visualizationStatuses.value = initialStatuses;

    // Check each visualization
    for (const viz of allVisualizations) {
      const status = await checkVisualizationUrl(
        viz.download_url,
        viz.filename,
      );
      statuses.push(status);

      // Update results incrementally
      setResults([...statuses]);
      visualizationStatuses.value = [...statuses];
    }

    setIsValidating(false);
    onComplete?.(statuses);
  };

  const accessibleCount = results.filter(
    (r) => r.status === "accessible",
  ).length;
  const inaccessibleCount = results.filter(
    (r) => r.status === "inaccessible" || r.status === "error",
  ).length;

  return (
    <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-semibold text-zinc-900 dark:text-white">
            Visualization URL Validator
          </h3>
          <p class="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Verify all {allVisualizations.length} visualization URLs are
            accessible
          </p>
        </div>
        <button
          type="button"
          onClick={validateAllVisualizations}
          disabled={isValidating}
          class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-400 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <RefreshCw size={16} class={isValidating ? "animate-spin" : ""} />
          {isValidating ? "Validating..." : "Validate URLs"}
        </button>
      </div>

      {/* Summary */}
      {results.length > 0 && (
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-1">
              <CheckCircle size={16} class="text-green-600" />
              <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Accessible
              </span>
            </div>
            <p class="text-2xl font-bold text-zinc-900 dark:text-white">
              {accessibleCount}
            </p>
          </div>

          <div class="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-1">
              <XCircle size={16} class="text-red-600" />
              <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Inaccessible
              </span>
            </div>
            <p class="text-2xl font-bold text-zinc-900 dark:text-white">
              {inaccessibleCount}
            </p>
          </div>

          <div class="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-1">
              <AlertTriangle size={16} class="text-amber-600" />
              <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Checking
              </span>
            </div>
            <p class="text-2xl font-bold text-zinc-900 dark:text-white">
              {results.filter((r) => r.status === "checking").length}
            </p>
          </div>
        </div>
      )}

      {/* Results List */}
      {results.length > 0 && (
        <div class="space-y-2 max-h-96 overflow-y-auto">
          {results.map((result) => (
            <div
              key={result.url}
              class="flex items-start justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg"
            >
              <div class="flex items-start gap-3 flex-1 min-w-0">
                {/* Status Icon */}
                {result.status === "checking" && (
                  <RefreshCw
                    size={16}
                    class="text-zinc-400 mt-1 animate-spin shrink-0"
                  />
                )}
                {result.status === "accessible" && (
                  <CheckCircle size={16} class="text-green-600 mt-1 shrink-0" />
                )}
                {result.status === "inaccessible" && (
                  <XCircle size={16} class="text-red-600 mt-1 shrink-0" />
                )}
                {result.status === "error" && (
                  <AlertTriangle
                    size={16}
                    class="text-amber-600 mt-1 shrink-0"
                  />
                )}

                {/* File Info */}
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-zinc-900 dark:text-white truncate">
                    {result.filename}
                  </p>
                  <p
                    class="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5"
                    title={result.url}
                  >
                    {result.url}
                  </p>

                  {/* Status Details */}
                  {result.status === "accessible" && (
                    <div class="flex items-center gap-3 mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                      {result.httpStatus && (
                        <span>Status: {result.httpStatus}</span>
                      )}
                      {result.contentType && (
                        <span>Type: {result.contentType}</span>
                      )}
                      {result.size && result.size > 0 && (
                        <span>Size: {formatFileSize(result.size)}</span>
                      )}
                    </div>
                  )}

                  {result.status === "inaccessible" && (
                    <p class="text-xs text-red-600 dark:text-red-400 mt-1">
                      HTTP {result.httpStatus}: Not accessible
                    </p>
                  )}

                  {result.status === "error" && (
                    <p class="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      {result.errorMessage}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              {result.status === "accessible" && (
                <div class="flex items-center gap-2 ml-2 shrink-0">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
                    title="Open in new tab"
                  >
                    <ExternalLink
                      size={14}
                      class="text-zinc-600 dark:text-zinc-400"
                    />
                  </a>
                  <a
                    href={result.url}
                    download={result.filename}
                    class="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
                    title="Download"
                  >
                    <Download
                      size={14}
                      class="text-zinc-600 dark:text-zinc-400"
                    />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {allVisualizations.length === 0 && (
        <div class="text-center py-8 text-zinc-500 dark:text-zinc-400">
          No visualizations found in this report
        </div>
      )}
    </div>
  );
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 10) / 10} ${sizes[i]}`;
}

/**
 * Standalone function to validate URLs programmatically
 */
export async function validateVisualizationUrls(
  report: EnhancedFraudReport,
): Promise<VisualizationStatus[]> {
  const allVisualizations = [
    ...(report.visualizations?.generated_charts || []),
    ...(report.visualizations?.marag_charts || []),
    ...(report.visualizations?.benchmarking_charts || []),
  ];

  const results: VisualizationStatus[] = [];

  for (const viz of allVisualizations) {
    try {
      const response = await fetch(viz.download_url, { method: "HEAD" });

      results.push({
        filename: viz.filename,
        url: viz.download_url,
        status: response.ok ? "accessible" : "inaccessible",
        httpStatus: response.status,
        contentType: response.headers.get("content-type") || undefined,
        size: Number.parseInt(response.headers.get("content-length") || "0"),
      });
    } catch (error) {
      results.push({
        filename: viz.filename,
        url: viz.download_url,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

/**
 * Generate validation report for console/logs
 */
export function generateValidationReport(
  results: VisualizationStatus[],
): string {
  const accessible = results.filter((r) => r.status === "accessible").length;
  const inaccessible = results.filter(
    (r) => r.status === "inaccessible" || r.status === "error",
  ).length;

  let report = "=== VISUALIZATION URL VALIDATION REPORT ===\n\n";
  report += `Total: ${results.length}\n`;
  report += `[OK] Accessible: ${accessible}\n`;
  report += `[ERROR] Inaccessible: ${inaccessible}\n\n`;

  if (inaccessible > 0) {
    report += "FAILED URLs:\n";
    for (const result of results) {
      if (result.status === "inaccessible" || result.status === "error") {
        report += `  [ERROR] ${result.filename}\n`;
        report += `     URL: ${result.url}\n`;
        if (result.httpStatus) {
          report += `     HTTP Status: ${result.httpStatus}\n`;
        }
        if (result.errorMessage) {
          report += `     Error: ${result.errorMessage}\n`;
        }
      }
    }
  }

  return report;
}
