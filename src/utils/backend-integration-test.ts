/**
 * Backend Integration Testing Helper
 * Tests MARAG workforce output against UI expectations
 */

import type { EnhancedFraudReport } from "@/types/fraud-report";
import {
  isEnhancedFraudReport,
  parseEnhancedFraudReport,
  hasMaragData,
  hasBenchmarkingData,
} from "@/utils/parse-fraud-report";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  report?: EnhancedFraudReport;
}

/**
 * Validates workforce output JSON against expected schema
 */
export function validateWorkforceOutput(json: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const data = JSON.parse(json);

    // Required fields
    if (!data.case_id) errors.push("Missing required field: case_id");
    if (data.overall_risk_score === undefined)
      errors.push("Missing required field: overall_risk_score");
    if (!data.risk_category)
      errors.push("Missing required field: risk_category");
    if (!data.confidence_level)
      errors.push("Missing required field: confidence_level");
    if (!data.processing_metadata)
      errors.push("Missing required field: processing_metadata");

    // MARAG validation
    if (data.marag_results) {
      const marag = data.marag_results;

      if (!marag.agent_consensus) {
        errors.push("MARAG results missing agent_consensus");
      } else {
        const consensus = marag.agent_consensus;

        // Validate participating agents
        const expectedAgents = ["TIRA", "RCRA", "HPRA", "ERRA", "BARA"];
        if (
          !consensus.participating_agents ||
          consensus.participating_agents.length !== 5
        ) {
          errors.push(
            `Expected 5 MARAG agents, found ${consensus.participating_agents?.length || 0}`,
          );
        }

        // Validate confidence scores
        if (consensus.agent_confidence_scores) {
          for (const agent of expectedAgents) {
            const score = consensus.agent_confidence_scores[agent];
            if (score === undefined) {
              errors.push(`Missing confidence score for agent: ${agent}`);
            } else if (score < 0 || score > 1) {
              errors.push(
                `Invalid confidence score for ${agent}: ${score} (must be 0-1)`,
              );
            }
          }
        } else {
          errors.push("Missing agent_confidence_scores");
        }

        // Validate consensus score
        if (
          consensus.consensus_score === undefined ||
          consensus.consensus_score < 0 ||
          consensus.consensus_score > 1
        ) {
          errors.push(
            `Invalid consensus_score: ${consensus.consensus_score} (must be 0-1)`,
          );
        }
      }

      // Validate specialized findings
      if (!marag.specialized_findings) {
        warnings.push("No specialized_findings in MARAG results");
      }
    } else {
      warnings.push("No MARAG results in output");
    }

    // Benchmarking validation
    if (data.benchmarking_results) {
      const benchmark = data.benchmarking_results;

      if (!benchmark.dataset_comparison) {
        errors.push("Benchmarking results missing dataset_comparison");
      } else {
        const comparison = benchmark.dataset_comparison;

        if (
          !comparison.datasets_analyzed ||
          comparison.datasets_analyzed.length === 0
        ) {
          errors.push("No datasets_analyzed in benchmarking results");
        }

        if (!comparison.performance_metrics) {
          errors.push("Missing performance_metrics in dataset_comparison");
        } else {
          // Validate metrics structure
          for (const [dataset, metrics] of Object.entries(
            comparison.performance_metrics,
          )) {
            const m = metrics as any;
            if (!m.precision || !m.recall || !m.f1_score || !m.auc_roc) {
              errors.push(
                `Incomplete performance metrics for dataset: ${dataset}`,
              );
            }
          }
        }
      }

      if (!benchmark.best_performing_dataset) {
        warnings.push("No best_performing_dataset specified");
      }
    } else {
      warnings.push("No benchmarking results in output");
    }

    // Visualizations validation
    if (data.visualizations) {
      const viz = data.visualizations;

      const allCharts = [
        ...(viz.generated_charts || []),
        ...(viz.marag_charts || []),
        ...(viz.benchmarking_charts || []),
      ];

      if (allCharts.length === 0) {
        warnings.push("No visualizations generated");
      }

      // Validate each visualization
      for (const chart of allCharts) {
        if (!chart.chart_type) {
          warnings.push(`Visualization missing chart_type: ${chart.filename}`);
        }
        if (!chart.download_url) {
          errors.push(`Visualization missing download_url: ${chart.filename}`);
        }
        if (!chart.explanation) {
          warnings.push(`Visualization missing explanation: ${chart.filename}`);
        }
      }
    } else {
      warnings.push("No visualizations in output");
    }

    // Processing metadata validation
    if (data.processing_metadata) {
      const meta = data.processing_metadata;

      if (meta.phases_completed === undefined) {
        errors.push("Missing phases_completed in processing_metadata");
      } else if (meta.phases_completed < 16) {
        warnings.push(
          `Only ${meta.phases_completed}/16 phases completed (expected 16 for full pipeline)`,
        );
      }

      if (meta.marag_agents_deployed !== 5) {
        warnings.push(
          `Expected 5 MARAG agents, deployed: ${meta.marag_agents_deployed}`,
        );
      }

      if (meta.datasets_compared && meta.datasets_compared < 2) {
        warnings.push(
          "Less than 2 datasets compared in benchmarking (recommended: 3+)",
        );
      }
    }

    // Phase results validation
    if (data.phase_results) {
      const completedPhases = Object.values(data.phase_results).filter(
        (p: any) => p.status === "completed",
      ).length;
      const failedPhases = Object.values(data.phase_results).filter(
        (p: any) => p.status === "failed",
      ).length;

      if (failedPhases > 0) {
        errors.push(`${failedPhases} phases failed`);
      }

      if (completedPhases < 16) {
        warnings.push(`Only ${completedPhases}/16 phases completed`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      report: data as EnhancedFraudReport,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [
        `JSON parsing error: ${error instanceof Error ? error.message : String(error)}`,
      ],
      warnings: [],
    };
  }
}

/**
 * Tests workforce output with UI parser functions
 */
export function testUIIntegration(json: string): {
  validationResult: ValidationResult;
  parserTests: {
    isEnhanced: boolean;
    parsed: boolean;
    hasMarag: boolean;
    hasBenchmarking: boolean;
  };
} {
  const validationResult = validateWorkforceOutput(json);

  if (!validationResult.valid || !validationResult.report) {
    return {
      validationResult,
      parserTests: {
        isEnhanced: false,
        parsed: false,
        hasMarag: false,
        hasBenchmarking: false,
      },
    };
  }

  const report = validationResult.report;

  return {
    validationResult,
    parserTests: {
      isEnhanced: isEnhancedFraudReport(JSON.stringify(report)),
      parsed: parseEnhancedFraudReport(JSON.stringify(report)) !== null,
      hasMarag: hasMaragData(report),
      hasBenchmarking: hasBenchmarkingData(report),
    },
  };
}

/**
 * Generates a backend integration test report
 */
export function generateIntegrationReport(json: string): string {
  const result = testUIIntegration(json);
  const { validationResult, parserTests } = result;

  let report = "=== THEIA BACKEND INTEGRATION TEST REPORT ===\n\n";

  // Validation status
  report += `Status: ${validationResult.valid ? "[VALID]" : "[INVALID]"}\n\n`;

  // Errors
  if (validationResult.errors.length > 0) {
    report += "ERRORS:\n";
    for (const error of validationResult.errors) {
      report += `  [ERROR] ${error}\n`;
    }
    report += "\n";
  }

  // Warnings
  if (validationResult.warnings.length > 0) {
    report += "WARNINGS:\n";
    for (const warning of validationResult.warnings) {
      report += `  [WARNING] ${warning}\n`;
    }
    report += "\n";
  }

  // Parser tests
  report += "UI PARSER TESTS:\n";
  report += `  ${parserTests.isEnhanced ? "[OK]" : "[FAIL]"} isEnhancedFraudReport()\n`;
  report += `  ${parserTests.parsed ? "[OK]" : "[FAIL]"} parseEnhancedFraudReport()\n`;
  report += `  ${parserTests.hasMarag ? "[OK]" : "[FAIL]"} hasMaragData()\n`;
  report += `  ${parserTests.hasBenchmarking ? "[OK]" : "[FAIL]"} hasBenchmarkingData()\n`;
  report += "\n";

  // Summary
  if (validationResult.valid && validationResult.report) {
    const meta = validationResult.report.processing_metadata;
    report += "SUMMARY:\n";
    report += `  Case ID: ${validationResult.report.case_id}\n`;
    report += `  Risk Score: ${validationResult.report.overall_risk_score}\n`;
    report += `  Risk Category: ${validationResult.report.risk_category}\n`;
    report += `  Phases Completed: ${meta.phases_completed}/16\n`;
    report += `  MARAG Agents: ${meta.marag_agents_deployed || 0}/5\n`;
    report += `  Datasets Compared: ${meta.datasets_compared || 0}\n`;
    report += `  Processing Time: ${meta.total_processing_time}\n`;
    report += `  Visualizations: ${meta.visualizations_generated || 0}\n`;
  }

  return report;
}

/**
 * Example usage for testing with workforce output
 */
export function testWithWorkforceOutput() {
  // This should be called with actual workforce JSON output
  const exampleUsage = `
// Test with workforce output
import { generateIntegrationReport } from './backend-integration-test';

// Get workforce output (from API, file, etc.)
const workforceOutput = await fetch('/api/workforce/output').then(r => r.json());

// Test integration
const report = generateIntegrationReport(JSON.stringify(workforceOutput));
console.log(report);

// Or programmatically check
import { testUIIntegration } from './backend-integration-test';
const result = testUIIntegration(JSON.stringify(workforceOutput));

if (result.validationResult.valid) {
  console.log('✅ Backend output is valid and ready for UI');
} else {
  console.error('[ERROR] Validation errors:', result.validationResult.errors);
}
`;

  return exampleUsage;
}
