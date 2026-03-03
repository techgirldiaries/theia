import { X, FileText, Download, Trash2 } from "lucide-react";
import { Show, For } from "@preact/signals/utils";
import { showFileManager, uploadedDatasets, deleteDataset } from "@/signals";

export function FileManagerPanel() {
  const handleClose = () => {
    showFileManager.value = false;
  };

  const handleDelete = (datasetId: string) => {
    if (confirm("Are you sure you want to delete this dataset?")) {
      deleteDataset(datasetId);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Show when={showFileManager}>
      <div
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <div
          class="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div class="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 class="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-x-2">
              <FileText size={20} />
              File Manager
            </h2>
            <button
              onClick={handleClose}
              class="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Close file manager"
            >
              <X size={20} class="text-zinc-500 dark:text-zinc-400" />
            </button>
          </div>

          {/* File List */}
          <div class="flex-1 overflow-y-auto p-4">
            <For
              each={uploadedDatasets}
              fallback={
                <div class="text-center py-8 text-zinc-500 dark:text-zinc-400">
                  <FileText size={48} class="mx-auto mb-2 opacity-50" />
                  <p>No files uploaded yet</p>
                </div>
              }
            >
              {(dataset) => (
                <div class="flex items-center justify-between p-3 mb-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                  <div class="flex items-center gap-x-3 flex-1 min-w-0">
                    <FileText size={20} class="text-indigo-500 shrink-0" />
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-zinc-900 dark:text-white truncate">
                        {dataset.fileName}
                      </p>
                      <div class="flex items-center gap-x-2 text-xs text-zinc-500 dark:text-zinc-400">
                        <span>{formatFileSize(dataset.size)}</span>
                        <span>•</span>
                        <span>
                          {new Date(dataset.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-x-1">
                    <a
                      href={dataset.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                      title="Download file"
                    >
                      <Download
                        size={16}
                        class="text-zinc-600 dark:text-zinc-300"
                      />
                    </a>
                    <button
                      onClick={() => handleDelete(dataset.id)}
                      class="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      title="Delete file"
                    >
                      <Trash2
                        size={16}
                        class="text-red-600 dark:text-red-400"
                      />
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>

          {/* Footer */}
          <div class="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
            <p class="text-sm text-zinc-600 dark:text-zinc-400">
              Total files: {uploadedDatasets.value.length}
            </p>
          </div>
        </div>
      </div>
    </Show>
  );
}
