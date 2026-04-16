# Product Requirements Document: THEIA Fraud Intelligence Platform

## Product Overview

**Vision:** Theia Fraud Intelligence is an agentic AI framework for adaptive financial fraud detection. Built on Multi-Agent Retrieval-Augmented Generation (MARAG), it processes transactions through a 16-phase pipeline from data acquisition to final oversight, unifying machine learning, generative AI, regulatory compliance and human decision-making into a single cohesive system. Weighted multi-agent consensus reduces false positive rates while parallel evidence retrieval across 5 specialist agents minimises missed detections.

**Target Users:** Fraud analysts, compliance officers, security teams, enterprise risk managers

**Business Objectives:** Execute comprehensive fraud detection through a unified 16-phase pipeline orchestrated across 5 specialist MARAG agents (TIRA, RCRA, HPRA, ERRA, BARA); reduce false positive rates through weighted multi-agent consensus with evidence triangulation; integrate machine learning, generative AI, regulatory compliance and human oversight; achieve >95% detection accuracy while maintaining <5% false positive rate; accelerate case processing to <5 minutes

## Core Features

| Feature                            | Priority    | Description                                                                                                                                                                                                                |
| ---------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ------ | --- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **16-Phase Pipeline**              | Must-have   | Sequential (0-3: Data Acq→Ingestion→Monitoring→Pattern) → Parallel (4-6: Intelligence                                                                                                                                      |     | Threat |     | Entity) → Convergent (7-9: Behavioural→KYC→Merchant) → Decision (10-15: Classification→Verification→Compliance→Monitoring→Case Management→Oversight) |
| **5 Specialist MARAG Agents**      | Must-have   | TIRA (Threat Intelligence), RCRA (Regulatory Compliance), HPRA (Historical Patterns), ERRA (Entity Relationships), BARA (Behavioural Analysis) with distributed retrieval, agent-to-agent communication, weighted consensus |
| **Weighted Multi-Agent Consensus** | Must-have   | Evidence triangulation, conflict resolution, confidence scoring (0-100), uncertainty quantification with confidence intervals, cross-agent correlation analysis                                                            |
| **Fraud Report Analysis**          | Must-have   | Case creation (FRAUD-YYYYMMDD-Type-Priority), automated multi-phase report generation, comprehensive agent reasoning, severity scoring, typology classification                                                            |
| **Interactive Dashboards**         | Must-have   | Phase-by-phase progress visualisation, agent performance metrics, consensus accuracy tracking, ROC curves, confusion matrices, evidence heatmaps, network graphs                                                           |
| **Dataset Management**             | Should-have | Upload/manage fraud datasets, multi-dataset benchmarking, comparative performance analysis, data preprocessing, version control, phase tracking                                                                            |
| **Audit Logging**                  | Should-have | Complete pipeline audit trail, agent decision logging, phase-level activity tracking, compliance documentation (SAR-ready, GDPR, DORA), evidence attribution                                                               |
| **Real-time Monitoring**           | Should-have | Live case progression through 16 phases, agent health monitoring, consensus convergence metrics, performance benchmarking, system optimisation                                                                             |

## Key User Flows

1. **16-Phase Case Processing:** Upload transaction data → Phase 0-3: Sequential data acquisition, ingestion, monitoring, pattern analysis → Phase 4-6: Parallel intelligence retrieval (TIRA threat intel || RCRA compliance || ERRA entity analysis) → Phase 7-9: Convergent behavioural analysis, KYC/sanctions screening, merchant verification → Phase 10-15: Risk classification, evidence verification, compliance documentation, performance monitoring, case management, final oversight → Multi-agent agreement scoring → Risk-based escalation → Report generation

2. **Multi-Agent MARAG Analysis:** Submit case → 5 specialist agents activate in parallel (TIRA, RCRA, HPRA, ERRA, BARA) → Distributed knowledge retrieval across domains → Agent-to-agent evidence sharing → Conflict resolution through weighted voting → Evidence triangulation and correlation → Consensus score generation (0-100) with confidence intervals → Uncertainty quantification → Collaborative risk assessment

3. **Real-time Monitoring & Analytics:** Dashboard access → View all 16 phases with live status → Monitor 5 agent performance metrics → Track multi-agent consensus convergence → Phase-by-phase throughput analysis → Agent agreement rates → Comparative benchmarking across datasets → Export phase-specific insights

## Technical Requirements

- **Architecture:** Agentic AI framework with 16-phase orchestration, 5 specialist MARAG agents, distributed retrieval mechanism, agent-to-agent communication, weighted consensus engine
- **MARAG System:**
  - **TIRA:** Threat Intelligence retrieval (CISA, FBI, CVE, threat actor profiles)
  - **RCRA:** Regulatory Compliance (OFAC, UN, EU, HMT sanctions; GDPR, DORA, FinCEN)
  - **HPRA:** Historical Pattern matching (fraud typologies, case studies, pattern evolution)
  - **ERRA:** Entity Relationship analysis (network graphs, fraud rings, synthetic identities)
  - **BARA:** Behavioural Analysis (biometrics, device fingerprints, ATO indicators)
- **Consensus Engine:** Weighted voting with confidence scoring, evidence triangulation, uncertainty quantification (confidence intervals), cross-agent correlation, conflict resolution
- **Frontend:** Preact/React with real-time streaming, phase progression visualisation, agent status panels, consensus radar charts
- **Performance:** <2s load time, <5 min case processing through 16 phases, sub-second phase transitions, support 100+ concurrent cases
- **Accessibility:** WCAG 2.1 AA compliance
- **Security:** Authentication required, encrypted data transmission, agent decision audit trails, regulatory compliance logging, immutable audit records
- **Browser Support:** Chrome, Firefox, Safari (latest 2 versions)

## Success Metrics

- **Detection Performance:** Fraud detection accuracy >95% with false positive rate <5%; precision >90%, recall >88%, AUC-ROC >0.93
- **Processing Efficiency:** Average case processing time <5 minutes through 16-phase pipeline; sub-second phase transitions; support 100+ concurrent cases
- **Multi-Agent Consensus:** Weighted consensus accuracy tracking per specialist agent (TIRA, RCRA, HPRA, ERRA, BARA); agent agreement rates >85%; consensus confidence intervals within ±5%
- **Phase Performance:** Phase-by-phase throughput optimisation; <60 seconds per phase; all 16 phases completed per case
- **Evidence Quality:** Evidence triangulation success >90%; conflict resolution accuracy >92%; source attribution completeness 100%; "No Citation → No Verdict" compliance
- **Compliance Validation:** Compliance documentation pass rate >99%; SAR-ready reports 100%; GDPR explanation quality score >90%; regulatory audit pass rate 100%
- **System Reliability:** System uptime >99.5%; error recovery success rate >95%; audit trail integrity 100%
- **User Experience:** User satisfaction score >4/5; analyst decision accuracy improvement >20%; time-to-insight reduction >40%
- **Benchmarking:** Multi-dataset performance comparison with statistical significance testing; dataset performance variance <10%; model stability across conditions >90%
