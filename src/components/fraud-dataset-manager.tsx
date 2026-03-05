import { useState, useEffect } from "preact/hooks";
import { signal, computed } from "@preact/signals";
import {
  Database,
  FileText,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  CreditCard,
  Smartphone,
  DollarSign,
  Calendar,
  MapPin,
  Users,
  Shield,
  Eye,
  Download,
  BarChart3,
  Zap,
  Info,
  Activity,
  Target,
  Filter,
} from "lucide-react";
import { uploadedDatasets } from "@/signals";

export interface FraudDatasetMetadata {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
  size: number;
  type: "csv" | "json" | "xlsx";

  // Fraud-specific metadata
  datasetCategory:
    | "payment_system"
    | "credit_card"
    | "mobile_money"
    | "general";
  fraudType: "synthetic" | "real" | "anonymized" | "simulated";

  // Dataset characteristics
  stats: {
    totalTransactions: number;
    fraudulentTransactions: number;
    fraudRate: number;
    dateRange: {
      start: Date;
      end: Date;
    };
    columns: {
      name: string;
      type: "numeric" | "categorical" | "temporal" | "identifier";
      uniqueValues?: number;
      missingRate: number;
    }[];
  };

  // Analysis readiness
  qualityScore: number;
  readinessIndicators: {
    dataCompleteness: number;
    fraudLabeling: boolean;
    temporalConsistency: number;
    featureRichness: number;
  };

  // Recommended phases
  suggestedPhases: string[];
  riskFactors: string[];

  // Processing status
  processingStatus: "uploading" | "analyzing" | "ready" | "error";
  analysisResults?: {
    suspiciousPatterns: string[];
    anomalyScore: number;
    recommendedActions: string[];
  };
}

// Enhanced signals for fraud dataset management
export const fraudDatasets = signal<FraudDatasetMetadata[]>([]);
export const selectedDatasetForAnalysis = signal<string | null>(null);
export const datasetAnalysisProgress = signal<Map<string, number>>(new Map());

// Dataset categorization patterns
const DATASET_PATTERNS = {
  payment_system: {
    patterns: [/PS_\d+_\d+.*log/, /payment.*system/, /transaction.*log/i],
    icon: DollarSign,
    color: "green",
    description: "Payment system transaction logs",
    expectedColumns: ["amount", "type", "nameOrig", "nameDest", "isFraud"],
    fraudIndicators: ["isFraud", "fraud", "label"],
  },
  credit_card: {
    patterns: [/creditcard/, /credit.*card/, /cc.*transaction/i],
    icon: CreditCard,
    color: "blue",
    description: "Credit card transaction data",
    expectedColumns: ["Time", "Amount", "Class", "V1", "V2"],
    fraudIndicators: ["Class", "fraud", "label"],
  },
  mobile_money: {
    patterns: [/mobile.*money/, /synthetic.*mobile/, /mobile.*transaction/i],
    icon: Smartphone,
    color: "purple",
    description: "Mobile money transaction dataset",
    expectedColumns: ["step", "type", "amount", "nameOrig", "isFraud"],
    fraudIndicators: ["isFraud", "fraud", "label"],
  },
  general: {
    patterns: [],
    icon: Database,
    color: "gray",
    description: "General fraud detection dataset",
    expectedColumns: [],
    fraudIndicators: ["fraud", "label", "suspicious"],
  },
};

function categorizeDataset(
  fileName: string,
  columns?: string[],
): FraudDatasetMetadata["datasetCategory"] {
  for (const [category, config] of Object.entries(DATASET_PATTERNS)) {
    if (config.patterns.some((pattern) => pattern.test(fileName))) {
      return category as FraudDatasetMetadata["datasetCategory"];
    }
  }
  return "general";
}

function detectFraudType(
  fileName: string,
  stats?: any,
): FraudDatasetMetadata["fraudType"] {
  if (/synthetic/i.test(fileName)) return "synthetic";
  if (/anon|anonymized/i.test(fileName)) return "anonymized";
  if (/sim|simulated/i.test(fileName)) return "simulated";
  return "real";
}

function calculateQualityScore(stats: FraudDatasetMetadata["stats"]): number {
  const completeness =
    1 -
    stats.columns.reduce((sum, col) => sum + col.missingRate, 0) /
      stats.columns.length;
  const hasFraudLabels = stats.columns.some((col) =>
    ["fraud", "isFraud", "Class", "label"].some((indic) =>
      col.name.toLowerCase().includes(indic.toLowerCase()),
    ),
  );
  const featureRichness = Math.min(1, stats.columns.length / 10);

  return Math.round(
    (completeness * 0.4 +
      (hasFraudLabels ? 1 : 0.3) * 0.4 +
      featureRichness * 0.2) *
      100,
  );
}

function generateSuggestedPhases(
  category: FraudDatasetMetadata["datasetCategory"],
  stats: any,
): string[] {
  const basePhases = ["phase-0", "phase-1", "phase-2"];

  switch (category) {
    case "payment_system":
      return [...basePhases, "phase-4", "phase-5", "phase-7", "phase-9"];
    case "credit_card":
      return [...basePhases, "phase-3", "phase-4", "phase-7", "phase-8"];
    case "mobile_money":
      return [...basePhases, "phase-4", "phase-6", "phase-7", "phase-9"];
    default:
      return basePhases;
  }
}

function DatasetCard({
  dataset,
  compact = false,
  onAnalyze,
  onViewDetails,
}: {
  dataset: FraudDatasetMetadata;
  compact?: boolean;
  onAnalyze: (datasetId: string) => void;
  onViewDetails: (datasetId: string) => void;
}) {
  const categoryConfig = DATASET_PATTERNS[dataset.datasetCategory];
  const CategoryIcon = categoryConfig.icon;
  const progress = datasetAnalysisProgress.value.get(dataset.id) || 0;

  const getStatusColor = (status: FraudDatasetMetadata["processingStatus"]) => {
    switch (status) {
      case "ready":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950";
      case "analyzing":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950";
      case "uploading":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950";
      case "error":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950";
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg bg-${categoryConfig.color}-100 dark:bg-${categoryConfig.color}-900`}
          >
            <CategoryIcon
              size={compact ? 16 : 20}
              className={`text-${categoryConfig.color}-600 dark:text-${categoryConfig.color}-400`}
            />
          </div>
          <div>
            <h4
              className={`font-semibold text-zinc-900 dark:text-white ${compact ? "text-sm" : ""}`}
            >
              {dataset.fileName}
            </h4>
            <p
              className={`text-zinc-600 dark:text-zinc-400 ${compact ? "text-xs" : "text-sm"}`}
            >
              {categoryConfig.description}
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dataset.processingStatus)}`}
        >
          {dataset.processingStatus.toUpperCase()}
        </span>
      </div>

      {/* Key Stats */}
      <div
        className={`grid gap-3 mb-4 ${compact ? "grid-cols-2" : "grid-cols-3"}`}
      >
        <div className="text-center">
          <div
            className={`font-bold ${compact ? "text-sm" : "text-lg"} text-zinc-900 dark:text-white`}
          >
            {dataset.stats.totalTransactions.toLocaleString()}
          </div>
          <div
            className={`text-zinc-500 dark:text-zinc-500 ${compact ? "text-xs" : "text-sm"}`}
          >
            Transactions
          </div>
        </div>
        <div className="text-center">
          <div
            className={`font-bold ${compact ? "text-sm" : "text-lg"} text-red-600 dark:text-red-400`}
          >
            {dataset.stats.fraudRate.toFixed(1)}%
          </div>
          <div
            className={`text-zinc-500 dark:text-zinc-500 ${compact ? "text-xs" : "text-sm"}`}
          >
            Fraud Rate
          </div>
        </div>
        {!compact && (
          <div className="text-center">
            <div
              className={`font-bold text-lg ${getQualityColor(dataset.qualityScore)}`}
            >
              {dataset.qualityScore}
            </div>
            <div className="text-zinc-500 dark:text-zinc-500 text-sm">
              Quality Score
            </div>
          </div>
        )}
      </div>

      {/* Fraud Type & Date Range */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <div className="flex items-center gap-4">
          <span
            className={`px-2 py-1 rounded text-xs ${
              dataset.fraudType === "synthetic"
                ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                : dataset.fraudType === "real"
                  ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                  : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
            }`}
          >
            {dataset.fraudType.toUpperCase()}
          </span>
          <span className="text-zinc-600 dark:text-zinc-400">
            {dataset.stats.dateRange.start.toLocaleDateString()} -{" "}
            {dataset.stats.dateRange.end.toLocaleDateString()}
          </span>
        </div>
        <span className="text-zinc-500 dark:text-zinc-500">
          {(dataset.size / (1024 * 1024)).toFixed(1)} MB
        </span>
      </div>

      {/* Readiness Indicators */}
      <div className="mb-4">
        <h5
          className={`font-medium text-zinc-900 dark:text-white mb-2 ${compact ? "text-sm" : ""}`}
        >
          Analysis Readiness
        </h5>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">
              Data Completeness
            </span>
            <span className="font-medium">
              {dataset.readinessIndicators.dataCompleteness}%
            </span>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1">
            <div
              className="h-1 rounded-full bg-green-500"
              style={{
                width: `${dataset.readinessIndicators.dataCompleteness}%`,
              }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">
              Feature Richness
            </span>
            <span className="font-medium">
              {dataset.readinessIndicators.featureRichness}%
            </span>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1">
            <div
              className="h-1 rounded-full bg-blue-500"
              style={{
                width: `${dataset.readinessIndicators.featureRichness}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Suggested Phases */}
      {!compact && (
        <div className="mb-4">
          <h5 className="font-medium text-zinc-900 dark:text-white mb-2 text-sm">
            Recommended Phases
          </h5>
          <div className="flex flex-wrap gap-1">
            {dataset.suggestedPhases.slice(0, 6).map((phase) => (
              <span
                key={phase}
                className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded text-xs"
              >
                {phase}
              </span>
            ))}
            {dataset.suggestedPhases.length > 6 && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400 px-1">
                +{dataset.suggestedPhases.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Risk Factors */}
      {dataset.riskFactors.length > 0 && (
        <div className="mb-4">
          <h5 className="font-medium text-zinc-900 dark:text-white mb-2 text-sm flex items-center gap-1">
            <AlertTriangle size={14} className="text-yellow-600" />
            Risk Factors
          </h5>
          <div className="space-y-1">
            {dataset.riskFactors
              .slice(0, compact ? 2 : 3)
              .map((risk, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-300"
                >
                  <div className="w-1 h-1 bg-yellow-500 rounded-full" />
                  <span>{risk}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Analysis Progress */}
      {dataset.processingStatus === "analyzing" && progress > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400 mb-1">
            <span>Analysis Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1 text-xs ${
              dataset.readinessIndicators.fraudLabeling
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            <CheckCircle size={12} />
            {dataset.readinessIndicators.fraudLabeling
              ? "Labeled"
              : "Unlabeled"}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            {dataset.stats.columns.length} columns
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onViewDetails(dataset.id)}
            className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            title="View details"
          >
            <Eye size={14} />
          </button>
          {dataset.processingStatus === "ready" && (
            <button
              onClick={() => onAnalyze(dataset.id)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs transition-colors"
            >
              Analyze
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface FraudDatasetManagerProps {
  compact?: boolean;
}

export function FraudDatasetManager({
  compact = false,
}: FraudDatasetManagerProps) {
  const datasets = fraudDatasets.value;
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Convert uploaded datasets to fraud datasets with analysis
  useEffect(() => {
    const standardDatasets = uploadedDatasets.value;
    const enhancedDatasets = standardDatasets.map(
      (dataset): FraudDatasetMetadata => {
        const category = categorizeDataset(dataset.fileName);
        const fraudType = detectFraudType(dataset.fileName);

        // Mock stats based on known dataset patterns
        const mockStats = generateMockStats(dataset.fileName, category);
        const qualityScore = calculateQualityScore(mockStats);

        return {
          id: dataset.id,
          fileName: dataset.fileName,
          fileUrl: dataset.fileUrl,
          uploadedAt: dataset.uploadedAt,
          size: dataset.size || 5000000, // 5MB default
          type: (dataset.type as any) || "csv",
          datasetCategory: category,
          fraudType,
          stats: mockStats,
          qualityScore,
          readinessIndicators: {
            dataCompleteness: Math.max(
              0,
              100 -
                mockStats.columns.reduce(
                  (sum: number, col: any) => sum + col.missingRate,
                  0,
                ),
            ),
            fraudLabeling: mockStats.columns.some((col: any) =>
              ["fraud", "isFraud", "Class"].includes(col.name),
            ),
            temporalConsistency: Math.random() * 20 + 80,
            featureRichness: Math.min(100, mockStats.columns.length * 10),
          },
          suggestedPhases: generateSuggestedPhases(category, mockStats),
          riskFactors: generateRiskFactors(category, mockStats),
          processingStatus: "ready",
        };
      },
    );

    fraudDatasets.value = enhancedDatasets;
  }, [uploadedDatasets.value]);

  function generateMockStats(
    fileName: string,
    category: FraudDatasetMetadata["datasetCategory"],
  ) {
    // Generate realistic stats based on known fraud datasets
    const baseStats = {
      payment_system: {
        totalTransactions: 6362620,
        fraudulentTransactions: 8213,
        fraudRate: 0.129,
        columns: [
          { name: "step", type: "numeric" as const, missingRate: 0 },
          { name: "type", type: "categorical" as const, missingRate: 0 },
          { name: "amount", type: "numeric" as const, missingRate: 0 },
          { name: "nameOrig", type: "identifier" as const, missingRate: 0 },
          { name: "oldbalanceOrg", type: "numeric" as const, missingRate: 0 },
          { name: "newbalanceOrig", type: "numeric" as const, missingRate: 0 },
          { name: "nameDest", type: "identifier" as const, missingRate: 0 },
          { name: "oldbalanceDest", type: "numeric" as const, missingRate: 0 },
          { name: "newbalanceDest", type: "numeric" as const, missingRate: 0 },
          { name: "isFraud", type: "categorical" as const, missingRate: 0 },
          {
            name: "isFlaggedFraud",
            type: "categorical" as const,
            missingRate: 0,
          },
        ],
      },
      credit_card: {
        totalTransactions: 284807,
        fraudulentTransactions: 492,
        fraudRate: 0.173,
        columns: [
          { name: "Time", type: "numeric" as const, missingRate: 0 },
          { name: "V1", type: "numeric" as const, missingRate: 0 },
          { name: "V2", type: "numeric" as const, missingRate: 0 },
          { name: "V3", type: "numeric" as const, missingRate: 0 },
          { name: "Amount", type: "numeric" as const, missingRate: 0 },
          { name: "Class", type: "categorical" as const, missingRate: 0 },
        ],
      },
      mobile_money: {
        totalTransactions: 1000000,
        fraudulentTransactions: 8500,
        fraudRate: 0.85,
        columns: [
          { name: "step", type: "numeric" as const, missingRate: 5 },
          { name: "type", type: "categorical" as const, missingRate: 0 },
          { name: "amount", type: "numeric" as const, missingRate: 2 },
          { name: "nameOrig", type: "identifier" as const, missingRate: 1 },
          { name: "isFraud", type: "categorical" as const, missingRate: 0 },
        ],
      },
      general: {
        totalTransactions: 100000,
        fraudulentTransactions: 5000,
        fraudRate: 5.0,
        columns: [
          { name: "id", type: "identifier" as const, missingRate: 0 },
          { name: "feature1", type: "numeric" as const, missingRate: 2 },
          { name: "feature2", type: "numeric" as const, missingRate: 3 },
          { name: "label", type: "categorical" as const, missingRate: 0 },
        ],
      },
    };

    const stats = baseStats[category] || baseStats.payment_system;
    return {
      ...stats,
      dateRange: {
        start: new Date(2023, 0, 1),
        end: new Date(2023, 11, 31),
      },
    };
  }

  function generateRiskFactors(
    category: FraudDatasetMetadata["datasetCategory"],
    stats: any,
  ): string[] {
    const factors = [];

    if (stats.fraudRate < 0.5)
      factors.push("Low fraud rate may lack sufficient positive samples");
    if (stats.fraudRate > 5)
      factors.push("Very high fraud rate may indicate data quality issues");

    const missingDataColumns = stats.columns.filter(
      (col: any) => col.missingRate > 10,
    );
    if (missingDataColumns.length > 0) {
      factors.push(
        `${missingDataColumns.length} columns with significant missing data`,
      );
    }

    if (
      category === "payment_system" &&
      !stats.columns.some((col: any) => col.name.includes("balance"))
    ) {
      factors.push(
        "Missing balance information may limit fraud detection accuracy",
      );
    }

    return factors;
  }

  const handleAnalyze = (datasetId: string) => {
    selectedDatasetForAnalysis.value = datasetId;

    // Simulate analysis progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        // Update dataset status
        const updatedDatasets = fraudDatasets.value.map((d) =>
          d.id === datasetId
            ? {
                ...d,
                processingStatus: "ready" as const,
                analysisResults: {
                  suspiciousPatterns: [
                    "Unusual transaction timing",
                    "High-value transfers",
                  ],
                  anomalyScore: Math.random() * 30 + 70,
                  recommendedActions: [
                    "Enable real-time monitoring",
                    "Apply enhanced KYC",
                  ],
                },
              }
            : d,
        );
        fraudDatasets.value = updatedDatasets;
      }

      datasetAnalysisProgress.value = new Map(
        datasetAnalysisProgress.value.set(datasetId, Math.min(100, progress)),
      );
    }, 1000);
  };

  const handleViewDetails = (datasetId: string) => {
    console.log("Viewing dataset details:", datasetId);
    // In real implementation, this would open a detailed view modal
  };

  const filteredDatasets = datasets.filter((dataset) => {
    if (filterCategory !== "all" && dataset.datasetCategory !== filterCategory)
      return false;
    if (filterStatus !== "all" && dataset.processingStatus !== filterStatus)
      return false;
    return true;
  });

  const stats = {
    total: datasets.length,
    ready: datasets.filter((d) => d.processingStatus === "ready").length,
    analyzing: datasets.filter((d) => d.processingStatus === "analyzing")
      .length,
    avgQuality:
      datasets.length > 0
        ? Math.round(
            datasets.reduce((sum, d) => sum + d.qualityScore, 0) /
              datasets.length,
          )
        : 0,
    totalTransactions: datasets.reduce(
      (sum, d) => sum + d.stats.totalTransactions,
      0,
    ),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3
              className={`font-bold text-zinc-900 dark:text-white ${compact ? "text-lg" : "text-xl"}`}
            >
              Fraud Dataset Manager
            </h3>
            <p
              className={`text-zinc-600 dark:text-zinc-400 ${compact ? "text-sm" : ""}`}
            >
              Specialized handling for fraud detection datasets
            </p>
          </div>
          <div
            className={`grid gap-4 ${compact ? "grid-cols-2 lg:grid-cols-5" : "grid-cols-2 md:grid-cols-5"} text-center`}
          >
            <div>
              <div
                className={`font-bold text-indigo-600 dark:text-indigo-400 ${compact ? "text-lg" : "text-2xl"}`}
              >
                {stats.total}
              </div>
              <div
                className={`text-zinc-500 dark:text-zinc-500 ${compact ? "text-xs" : "text-sm"}`}
              >
                Datasets
              </div>
            </div>
            <div>
              <div
                className={`font-bold text-green-600 dark:text-green-400 ${compact ? "text-lg" : "text-2xl"}`}
              >
                {stats.ready}
              </div>
              <div
                className={`text-zinc-500 dark:text-zinc-500 ${compact ? "text-xs" : "text-sm"}`}
              >
                Ready
              </div>
            </div>
            <div>
              <div
                className={`font-bold text-blue-600 dark:text-blue-400 ${compact ? "text-lg" : "text-2xl"}`}
              >
                {stats.analyzing}
              </div>
              <div
                className={`text-zinc-500 dark:text-zinc-500 ${compact ? "text-xs" : "text-sm"}`}
              >
                Analyzing
              </div>
            </div>
            <div>
              <div
                className={`font-bold text-purple-600 dark:text-purple-400 ${compact ? "text-lg" : "text-2xl"}`}
              >
                {stats.avgQuality}
              </div>
              <div
                className={`text-zinc-500 dark:text-zinc-500 ${compact ? "text-xs" : "text-sm"}`}
              >
                Avg Quality
              </div>
            </div>
            <div>
              <div
                className={`font-bold text-orange-600 dark:text-orange-400 ${compact ? "text-lg" : "text-2xl"}`}
              >
                {(stats.totalTransactions / 1000000).toFixed(1)}M
              </div>
              <div
                className={`text-zinc-500 dark:text-zinc-500 ${compact ? "text-xs" : "text-sm"}`}
              >
                Transactions
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label
              className={`text-zinc-700 dark:text-zinc-300 ${compact ? "text-sm" : ""}`}
            >
              Category:
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.currentTarget.value)}
              title="Filter datasets by category"
              className={`border border-zinc-300 dark:border-zinc-600 rounded px-3 py-1 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white ${compact ? "text-sm" : ""}`}
            >
              <option value="all">All Categories</option>
              <option value="payment_system">Payment System</option>
              <option value="credit_card">Credit Card</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="general">General</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label
              className={`text-zinc-700 dark:text-zinc-300 ${compact ? "text-sm" : ""}`}
            >
              Status:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.currentTarget.value)}
              title="Filter datasets by processing status"
              className={`border border-zinc-300 dark:border-zinc-600 rounded px-3 py-1 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white ${compact ? "text-sm" : ""}`}
            >
              <option value="all">All Status</option>
              <option value="ready">Ready</option>
              <option value="analyzing">Analyzing</option>
              <option value="uploading">Uploading</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dataset Grid */}
      <div
        className={`grid gap-4 ${compact ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}
      >
        {filteredDatasets.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-8 text-center">
            <Database size={48} className="mx-auto mb-4 text-zinc-400" />
            <p className="text-zinc-500 dark:text-zinc-400">
              {filterCategory !== "all" || filterStatus !== "all"
                ? "No datasets match the current filters"
                : "Upload your fraud detection datasets to get started"}
            </p>
          </div>
        ) : (
          filteredDatasets.map((dataset) => (
            <DatasetCard
              key={dataset.id}
              dataset={dataset}
              compact={compact}
              onAnalyze={handleAnalyze}
              onViewDetails={handleViewDetails}
            />
          ))
        )}
      </div>
    </div>
  );
}
