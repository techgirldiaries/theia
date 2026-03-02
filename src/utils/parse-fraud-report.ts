/**
 * Utility functions to parse workforce outputs into structured data
 * for display in the FraudReport component
 */

interface ParsedFraudReport {
  datasetId?: string;
  transactionId?: string;
  overallRiskScore: number;
  riskCategory: string;
  modality?: string;
  modalityConfidence?: string;
  agentContributions: Array<{
    agent: string;
    score?: number;
    status: string;
    findings: string;
  }>;
  keyAssessments?: {
    modalityAnalysis?: string;
    decisionRationale?: string;
    fraudTypology?: string;
    merchantVerification?: string;
  };
  recommendedActions?: string[];
  timestamp?: Date;
}

/**
 * Extract risk score from message text
 * Looks for patterns like "Risk Score: 85/100" or "Overall Risk Score: 85"
 */
export function extractRiskScore(text: string): number | null {
  const patterns = [
    /(?:Overall\s+)?Risk\s+Score:\s*(\d+)(?:\/100)?/i,
    /Risk:\s*(\d+)\/100/i,
    /Score:\s*(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const score = parseInt(match[1], 10);
      if (score >= 0 && score <= 100) {
        return score;
      }
    }
  }

  return null;
}

/**
 * Extract risk category from text
 */
export function extractRiskCategory(text: string): string {
  const categories = ["CRITICAL", "HIGH", "MEDIUM-HIGH", "MEDIUM-LOW", "LOW"];

  for (const category of categories) {
    if (text.toUpperCase().includes(category)) {
      return category;
    }
  }

  // Fallback based on risk score if mentioned
  const score = extractRiskScore(text);
  if (score !== null) {
    if (score >= 86) return "CRITICAL";
    if (score >= 71) return "HIGH";
    if (score >= 46) return "MEDIUM-HIGH";
    if (score >= 26) return "MEDIUM-LOW";
    return "LOW";
  }

  return "UNKNOWN";
}

/**
 * Extract modality classification (REAL, SYNTHETIC, ANONYMISED, etc.)
 */
export function extractModality(text: string): {
  type?: string;
  confidence?: string;
} {
  const modalityPattern =
    /Modality:\s*(REAL|SYNTHETIC|ANONYMISED|SIMULATED|UNKNOWN)(?:\s*\(Confidence:\s*(\w+)\))?/i;
  const match = text.match(modalityPattern);

  if (match) {
    return {
      type: match[1].toUpperCase(),
      confidence: match[2] || undefined,
    };
  }

  return {};
}

/**
 * Extract agent contributions from structured report
 */
export function extractAgentContributions(text: string) {
  const contributions: Array<{
    agent: string;
    score?: number;
    status: string;
    findings: string;
  }> = [];

  // Pattern for agent sections: "1. INGESTION Agent: Status - Findings"
  const agentPattern =
    /(\d+)\.\s*(\w+(?:\s+\w+)*)\s*Agent?:?\s*(?:(\d+)\/100\s*-\s*)?(.+?)(?=\n\d+\.|$)/gis;
  const matches = text.matchAll(agentPattern);

  for (const match of matches) {
    contributions.push({
      agent: match[2].trim(),
      score: match[3] ? parseInt(match[3], 10) : undefined,
      status: "Analyzed",
      findings: match[4].trim(),
    });
  }

  return contributions;
}

/**
 * Extract recommended actions from text
 */
export function extractRecommendedActions(text: string): string[] {
  const actions: string[] = [];

  // Look for "Recommended Actions:" section
  const actionsPattern = /Recommended\s+Actions?:(.+?)(?=\n\n|===|$)/is;
  const match = text.match(actionsPattern);

  if (match) {
    const actionsList = match[1];
    // Split by line breaks and extract bullet points or numbered items
    const lines = actionsList.split("\n");

    for (const line of lines) {
      const cleaned = line.trim().replace(/^[•\-\*\d\.]+\s*/, "");
      if (cleaned && cleaned.length > 5) {
        actions.push(cleaned);
      }
    }
  }

  return actions;
}

/**
 * Extract key assessments from structured sections
 */
export function extractKeyAssessments(text: string) {
  const assessments: {
    modalityAnalysis?: string;
    decisionRationale?: string;
    fraudTypology?: string;
    merchantVerification?: string;
  } = {};

  // Modality Analysis
  const modalityMatch = text.match(
    /Modality\s+Analysis:(.+?)(?=\n\w+:|===|$)/is,
  );
  if (modalityMatch) {
    assessments.modalityAnalysis = modalityMatch[1].trim();
  }

  // Decision Rationale
  const rationaleMatch = text.match(
    /Decision\s+Rationale:(.+?)(?=\n\w+:|===|$)/is,
  );
  if (rationaleMatch) {
    assessments.decisionRationale = rationaleMatch[1].trim();
  }

  // Fraud Typology
  const typologyMatch = text.match(/Fraud\s+Typology:(.+?)(?=\n\w+:|===|$)/is);
  if (typologyMatch) {
    assessments.fraudTypology = typologyMatch[1].trim();
  }

  // Merchant Verification
  const merchantMatch = text.match(
    /Merchant\s+Verification:(.+?)(?=\n\w+:|===|$)/is,
  );
  if (merchantMatch) {
    assessments.merchantVerification = merchantMatch[1].trim();
  }

  return assessments;
}

/**
 * Parse complete fraud detection report from workforce message
 */
export function parseFraudReport(
  messageText: string,
): ParsedFraudReport | null {
  // Extract dataset/transaction IDs
  const datasetIdMatch = messageText.match(/Dataset\s+ID:\s*([A-Z0-9\-]+)/i);
  const transactionIdMatch = messageText.match(
    /Transaction\s+ID:\s*([A-Z0-9\-]+)/i,
  );

  // Extract risk score and category
  const riskScore = extractRiskScore(messageText);
  if (riskScore === null) {
    return null; // Not a fraud report if no risk score found
  }

  const riskCategory = extractRiskCategory(messageText);
  const modality = extractModality(messageText);
  const agentContributions = extractAgentContributions(messageText);
  const keyAssessments = extractKeyAssessments(messageText);
  const recommendedActions = extractRecommendedActions(messageText);

  return {
    datasetId: datasetIdMatch ? datasetIdMatch[1] : undefined,
    transactionId: transactionIdMatch ? transactionIdMatch[1] : undefined,
    overallRiskScore: riskScore,
    riskCategory,
    modality: modality.type,
    modalityConfidence: modality.confidence,
    agentContributions:
      agentContributions.length > 0
        ? agentContributions
        : [
            {
              agent: "Analysis Complete",
              status: "Completed",
              findings:
                "Fraud detection analysis completed. Review risk score above.",
            },
          ],
    keyAssessments:
      Object.keys(keyAssessments).length > 0 ? keyAssessments : undefined,
    recommendedActions:
      recommendedActions.length > 0 ? recommendedActions : undefined,
    timestamp: new Date(),
  };
}

/**
 * Check if a message contains a fraud report
 */
export function isFraudReport(messageText: string): boolean {
  return (
    messageText.includes("THEIA FRAUD DETECTION REPORT") ||
    (messageText.includes("Risk Score") &&
      (messageText.includes("AGENT") || messageText.includes("Agent")))
  );
}
