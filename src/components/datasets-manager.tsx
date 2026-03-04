import { Database, Trash2, Upload, X } from "lucide-react";
import { showFileManager, uploadedDatasets } from "@/signals";

export function DatasetsManager() {
  const datasets = uploadedDatasets.value;

  const handleClose = () => {
    showFileManager.value = false;
  };

  const handleDelete = (datasetId: string) => {
    if (confirm("Are you sure you want to delete this dataset?")) {
      // Remove from uploadedDatasets
      uploadedDatasets.value = uploadedDatasets.value.filter(
        (ds) => ds.id !== datasetId,
      );
    }
  };

  return (
    <div class="animate-fade-in" role="region" aria-label="Dataset Manager">
      {/* Header */}
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-6 mb-4 shadow-sm transition-colors">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-zinc-900 dark:text-white">
              Dataset Manager
            </h2>
            <p class="text-sm text-zinc-700 dark:text-zinc-300 mt-1">
              Manage your uploaded datasets and fraud detection data files
            </p>
          </div>
          <button
            onClick={handleClose}
            class="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            aria-label="Close dataset manager"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Dataset List */}
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-6 shadow-sm transition-colors">
        <div class="flex items-center gap-x-2 mb-4">
          <Database size={20} strokeWidth={2} class="text-indigo-500" />
          <h3 class="text-lg font-semibold text-zinc-900 dark:text-white">
            Active Datasets
          </h3>
          <span class="ml-auto text-sm text-zinc-500 dark:text-zinc-400">
            {datasets.length} dataset{datasets.length !== 1 ? "s" : ""}
          </span>
        </div>

        {datasets.length === 0 ? (
          <div class="text-center py-12" role="status" aria-live="polite">
            <Upload
              size={48}
              class="mx-auto mb-4 text-zinc-400"
              aria-hidden="true"
            />
            <p class="text-zinc-700 dark:text-zinc-300 mb-2 font-medium">
              No datasets uploaded yet
            </p>
            <p class="text-sm text-zinc-600 dark:text-zinc-400">
              Upload CSV, JSON, or Excel files through the chat interface
            </p>
          </div>
        ) : (
          <div class="space-y-3">
            {datasets.map((dataset) => (
              <div
                key={dataset.id}
                class="flex items-start justify-between p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg border border-zinc-200 dark:border-zinc-600 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
              >
                <div class="flex-1">
                  <div class="flex items-center gap-x-2 mb-2">
                    <Database size={16} class="text-indigo-500 shrink-0" />
                    <h4 class="text-sm font-semibold text-zinc-900 dark:text-white">
                      {dataset.fileName}
                    </h4>
                    <span
                      class={`text-xs px-2 py-0.5 rounded-full ${
                        dataset.type === "csv"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : dataset.type === "json"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                            : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                      }`}
                    >
                      {dataset.type?.toUpperCase() || "FILE"}
                    </span>
                  </div>

                  <div class="grid grid-cols-2 gap-2 text-xs text-zinc-700 dark:text-zinc-300 mb-2">
                    <div>
                      <span class="font-semibold">Uploaded:</span>{" "}
                      {dataset.uploadedAt.toLocaleDateString()} at{" "}
                      {dataset.uploadedAt.toLocaleTimeString()}
                    </div>
                    {dataset.size && (
                      <div>
                        <span class="font-semibold">Size:</span>{" "}
                        {dataset.size > 1024 * 1024
                          ? `${(dataset.size / (1024 * 1024)).toFixed(2)} MB`
                          : `${(dataset.size / 1024).toFixed(1)} KB`}
                      </div>
                    )}
                    {dataset.rows !== undefined && (
                      <div>
                        <span class="font-semibold">Rows:</span>{" "}
                        {dataset.rows.toLocaleString()}
                      </div>
                    )}
                    {dataset.columns !== undefined && (
                      <div>
                        <span class="font-semibold">Columns:</span>{" "}
                        {dataset.columns}
                      </div>
                    )}
                  </div>

                  {dataset.description && (
                    <p class="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                      {dataset.description}
                    </p>
                  )}
                </div>

                <div class="flex items-center gap-x-2 ml-4">
                  <a
                    href={dataset.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="px-3 py-1.5 text-xs font-medium bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(dataset.id)}
                    class="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    aria-label="Delete dataset"
                    title="Delete dataset"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div class="mt-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2">
          💡 Tips for Dataset Management
        </h4>
        <ul class="text-xs text-indigo-700 dark:text-indigo-400 space-y-1">
          <li>
            • Upload datasets via drag & drop or the attachment menu in the chat
          </li>
          <li>• Supported formats: CSV, JSON, Excel (XLSX, XLS)</li>
          <li>• Datasets are automatically analyzed for fraud patterns</li>
          <li>• Large files may take longer to process</li>
        </ul>
      </div>
    </div>
  );
}
