/**
 * Compliance Layer Type Definitions
 * Theia Fraud Intelligence - Regulatory Compliance Architecture
 *
 * This module defines the compliance verification framework, including
 * compliance checks, regulatory status, and evidence tracking for
 * regulatory reporting and audit purposes.
 */

/**
 * Result of a single compliance check against a regulatory requirement
 */
export interface ComplianceCheckResult {
  /** Unique identifier for this compliance check */
  check_id: string;

  /** Type of compliance check performed */
  check_type:
    | "sanctions_screening"
    | "kyc_verification"
    | "aml_check"
    | "gdpr_compliance"
    | "dora_resilience"
    | "sar_readiness"
    | "pep_screening"
    | "adverse_media";

  /** Regulatory framework this check relates to */
  framework:
    | "OFAC"
    | "GDPR"
    | "DORA"
    | "FinCEN"
    | "AMLD5"
    | "EU_AML"
    | "UK_FCA";

  /** Whether the compliance check passed */
  passed: boolean;

  /** Risk level if check failed or flagged issues */
  risk_level?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

  /** Confidence score for this compliance determination (0-100) */
  confidence_score: number;

  /** Findings from the compliance check */
  findings: string[];

  /** Evidence sources used to reach this determination */
  evidence_sources: string[];

  /** Audit log entry ID linking to detailed audit trail */
  audit_trail_reference?: string;

  /** Timestamp when compliance check was performed */
  checked_at: string;

  /** Metadata for regulatory reporting */
  metadata?: {
    jurisdiction?: string;
    reporting_deadline?: string;
    escalation_required?: boolean;
    reviewer_notes?: string;
  };
}

/**
 * Comprehensive compliance status for a fraud case
 * Aggregates all compliance checks performed during investigation
 */
export interface ComplianceVerification {
  /** Unique case identifier */
  case_id: string;

  /** Overall compliance status */
  overall_status: "COMPLIANT" | "FLAGGED" | "NON_COMPLIANT" | "UNKNOWN";

  /** Individual compliance checks performed */
  checks: ComplianceCheckResult[];

  /** Whether case is ready for SAR (Suspicious Activity Report) filing */
  sar_ready: boolean;

  /** GDPR compliance determination */
  gdpr_compliant?: boolean;

  /** DORA (Digital Operational Resilience Act) compliance */
  dora_compliant?: boolean;

  /** Applicable jurisdictions for this case */
  jurisdictions: string[];

  /** Regulatory reporting requirements identified */
  reporting_requirements: {
    requires_sar?: boolean;
    requires_str?: boolean;
    requires_gdpr_report?: boolean;
    requires_dora_report?: boolean;
    other?: string[];
  };

  /** Reference to audit trail containing compliance evidence */
  audit_trail_ids: string[];

  /** Overall compliance verification timestamp */
  verified_at: string;

  /** Human reviewer assigned to compliance verification */
  reviewer_id?: string;

  /** Recommended actions based on compliance findings */
  recommended_actions: string[];
}

/**
 * Compliance Orchestration Pattern:
 *
 * This type supports the multi-phase compliance verification workflow:
 *
 * 1. PHASE 8 (KYC & Sanctions Screening):
 *    - RCRA agent performs initial regulatory screening
 *    - Generates ComplianceCheckResult for sanctions/KYC
 *    - Logs findings in audit trail
 *
 * 2. PHASE 12 (Compliance Documentation):
 *    - Aggregates all compliance checks into ComplianceVerification
 *    - Determines SAR/STR readiness
 *    - Generates regulatory-compliant documentation
 *
 * 3. AUDIT LAYER (Evidence Trail):
 *    - audit-log-viewer.tsx displays all compliance checks
 *    - AuditLogEntry references link to ComplianceCheckResult
 *    - Case management tracks compliance verification chain
 *    - Complete traceability for regulatory review
 */
