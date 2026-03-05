import { useState } from "preact/hooks";
import { signal } from "@preact/signals";
import {
  BarChart3,
  Download,
  Eye,
  Image as ImageIcon,
  Maximize2,
  X,
  Info,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

export interface Visualization {
  chartType: string;
  downloadUrl: string;
  filename: string;
  phase?: string;
  explanation: {
    title: string;
    keyInsights: string[];
    riskIndicators: string[];
    recommendations: string[];
    technicalDetails: string;
  };
}

export const visualizations = signal<Visualization[]>([]);
export const showVisualizationGallery = signal(false);

interface VisualizationGalleryProps {
  visualizations?: Visualization[];
  compact?: boolean;
}

export function VisualizationGallery({
  visualizations: propsVisualizations,
  compact = false,
}: VisualizationGalleryProps) {
  const [selectedViz, setSelectedViz] = useState<Visualization | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const vizList = propsVisualizations || visualizations.value;

  const handleDownload = (viz: Visualization) => {
    window.open(viz.downloadUrl, "_blank");
  };

  const getPhaseColor = (phase?: string) => {
    if (!phase) return "text-gray-600 bg-gray-100 dark:bg-gray-800";

    const phaseNum = parseInt(phase.replace(/\D/g, "") || "0");
    if (phaseNum <= 3) return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
    if (phaseNum <= 6)
      return "text-purple-600 bg-purple-100 dark:bg-purple-900/30";
    if (phaseNum <= 9)
      return "text-green-600 bg-green-100 dark:bg-green-900/30";
    return "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30";
  };

  const formatChartType = (type: string) => {
    return type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (vizList.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-8 text-center">
        <ImageIcon size={48} className="mx-auto mb-4 text-zinc-400" />
        <p className="text-zinc-500 dark:text-zinc-400 mb-2">
          No visualizations generated yet
        </p>
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          Visualizations will appear here after fraud analysis
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 size={20} className="text-indigo-600" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Visual Analytics Gallery
          </h3>
          <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full">
            {vizList.length} charts
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            title={`Switch to ${viewMode === "grid" ? "list" : "grid"} view`}
          >
            {viewMode === "grid" ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <rect x="2" y="2" width="12" height="2" />
                <rect x="2" y="7" width="12" height="2" />
                <rect x="2" y="12" width="12" height="2" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <rect x="2" y="2" width="5" height="5" />
                <rect x="9" y="2" width="5" height="5" />
                <rect x="2" y="9" width="5" height="5" />
                <rect x="9" y="9" width="5" height="5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Visualization Grid/List */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-4"
        }
      >
        {vizList.map((viz, idx) => (
          <div
            key={idx}
            className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Chart Preview */}
            <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-800">
              <img
                src={viz.downloadUrl}
                alt={viz.explanation.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <button
                onClick={() => setSelectedViz(viz)}
                className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-zinc-800 transition-colors"
                title="View details"
              >
                <Maximize2
                  size={16}
                  className="text-zinc-700 dark:text-zinc-300"
                />
              </button>
            </div>

            {/* Chart Info */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-sm text-zinc-900 dark:text-white line-clamp-2">
                  {viz.explanation.title}
                </h4>
                {viz.phase && (
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getPhaseColor(viz.phase)}`}
                  >
                    {viz.phase}
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                {formatChartType(viz.chartType)}
              </p>

              {/* Key Insights Preview */}
              {viz.explanation.keyInsights.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Key Insights:
                  </p>
                  <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                    {viz.explanation.keyInsights
                      .slice(0, 2)
                      .map((insight, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-indigo-600">•</span>
                          <span className="line-clamp-2">{insight}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(viz)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <Download size={14} />
                  Download
                </button>
                <button
                  onClick={() => setSelectedViz(viz)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <Eye size={14} />
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed View Modal */}
      {selectedViz && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {selectedViz.explanation.title}
              </h3>
              <button
                onClick={() => setSelectedViz(null)}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                title="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Chart Image */}
              <div className="relative">
                <img
                  src={selectedViz.downloadUrl}
                  alt={selectedViz.explanation.title}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700"
                />
                <button
                  onClick={() => handleDownload(selectedViz)}
                  className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-lg transition-colors"
                >
                  <Download size={16} />
                  Download Image
                </button>
              </div>

              {/* Key Insights */}
              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                  <TrendingUp size={18} className="text-blue-600" />
                  Key Insights
                </h4>
                <ul className="space-y-2">
                  {selectedViz.explanation.keyInsights.map((insight, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300"
                    >
                      <CheckCircle
                        size={16}
                        className="text-blue-600 mt-0.5 shrink-0"
                      />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risk Indicators */}
              {selectedViz.explanation.riskIndicators.length > 0 && (
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-600" />
                    Risk Indicators
                  </h4>
                  <ul className="space-y-2">
                    {selectedViz.explanation.riskIndicators.map(
                      (indicator, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300"
                        >
                          <AlertTriangle
                            size={16}
                            className="text-amber-600 mt-0.5 shrink-0"
                          />
                          <span>{indicator}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {selectedViz.explanation.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                    <ExternalLink size={18} className="text-green-600" />
                    Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {selectedViz.explanation.recommendations.map((rec, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300"
                      >
                        <CheckCircle
                          size={16}
                          className="text-green-600 mt-0.5 shrink-0"
                        />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technical Details */}
              <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
                <h4 className="font-semibold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                  <Info size={18} className="text-indigo-600" />
                  Technical Details
                </h4>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {selectedViz.explanation.technicalDetails}
                </p>
              </div>

              {/* File Info */}
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                <p>
                  <strong>Filename:</strong> {selectedViz.filename}
                </p>
                <p>
                  <strong>Chart Type:</strong>{" "}
                  {formatChartType(selectedViz.chartType)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
