# Product Requirements Document: THEIA/Theia Fraud Intelligence Platform

## Product Overview

Theia Fraud Intelligence is an agentic AI framework built for adaptive financial fraud detection. The system is built on a Multi-Agent Retrieval-Augmented Generation (MARAG) architecture, which processes transactions through a 16-phase pipeline covering everything from initial data acquisition through to final human oversight. Machine learning, generative AI, regulatory compliance and human decision-making are unified into a single cohesive system. False positive rates are reduced through weighted multi-agent consensus, while missed detections are minimised through parallel evidence retrieval across five specialist agents.

**Target users:** Fraud analysts, compliance officers, security teams and enterprise risk managers.

**Business objectives:** The platform is designed to execute comprehensive fraud detection through a unified 16-phase pipeline orchestrated across five specialist MARAG agents (TIRA, RCRA, HPRA, ERRA and BARA). False positive rates are reduced through weighted multi-agent consensus with evidence triangulation. Machine learning, generative AI, regulatory compliance and human oversight are integrated into a single workflow. The system targets a fraud detection accuracy above 95%, a false positive rate below 5% and a case processing time of under five minutes.

These objectives are delivered through the core features described in the section below.

---

## Core Features

| Feature | Priority | Description |
|---|---|---|
| **16-Phase Pipeline** | Must-have | Sequential phases 0 to 3 cover data acquisition, ingestion, monitoring and pattern analysis. Parallel phases 4 to 6 handle intelligence, threat and entity retrieval. Convergent phases 7 to 9 address behavioural analysis, KYC screening and merchant verification. Decision phases 10 to 15 cover classification, verification, compliance, monitoring, case management and oversight. |
| **5 Specialist MARAG Agents** | Must-have | TIRA (Threat Intelligence), RCRA (Regulatory Compliance), HPRA (Historical Patterns), ERRA (Entity Relationships) and BARA (Behavioural Analysis) operate with distributed retrieval, agent-to-agent communication and weighted consensus. |
| **Weighted Multi-Agent Consensus** | Must-have | Evidence triangulation, conflict resolution and confidence scoring on a scale of 0 to 100 are applied alongside uncertainty quantification with confidence intervals and cross-agent correlation analysis. |
| **Fraud Report Analysis** | Must-have | Cases are created using the format FRAUD-YYYYMMDD-Type-Priority. Automated multi-phase report generation, comprehensive agent reasoning, severity scoring and typology classification are all included. |
| **Interactive Dashboards** | Must-have | Phase-by-phase progress visualisation, agent performance metrics, consensus accuracy tracking, ROC curves, confusion matrices, evidence heatmaps and network graphs are available. |
| **Dataset Management** | Should-have | Fraud datasets can be uploaded and managed. Multi-dataset benchmarking, comparative performance analysis, data preprocessing, version control and phase tracking are all supported. |
| **Audit Logging** | Should-have | A complete pipeline audit trail is maintained, covering agent decision logging, phase-level activity tracking, compliance documentation (SAR-ready, GDPR and DORA) and evidence attribution. |
| **Real-time Monitoring** | Should-have | Live case progression through all 16 phases is visible alongside agent health monitoring, consensus convergence metrics, performance benchmarking and system optimisation. |

The features above are accessed through the key user flows described in the next section.

---

## Key User Flows

**16-Phase Case Processing**

Transaction data is uploaded and passed through the pipeline in sequence. Phases 0 to 3 handle data acquisition, ingestion, monitoring and pattern analysis. In phases 4 to 6, TIRA, RCRA and ERRA retrieve intelligence, compliance data and entity analysis in parallel. Phases 7 to 9 carry out convergent behavioural analysis, KYC and sanctions screening, and merchant verification. The final phases, 10 to 15, cover risk classification, evidence verification, compliance documentation, performance monitoring, case management and final oversight. Multi-agent agreement scoring is applied throughout, leading to risk-based escalation and report generation.

**Multi-Agent MARAG Analysis**

A case is submitted and all five specialist agents (TIRA, RCRA, HPRA, ERRA and BARA) activate in parallel. Distributed knowledge retrieval is carried out across their respective domains and evidence is shared between agents. Conflicts are resolved through weighted voting and evidence is triangulated and correlated before a consensus score between 0 and 100 is generated with confidence intervals. Uncertainty is quantified and a collaborative risk assessment is produced.

**Real-time Monitoring and Analytics**

The dashboard provides a live view of all 16 phases alongside performance metrics for each of the five agents. Multi-agent consensus convergence is tracked in real time and phase-by-phase throughput and agent agreement rates are visible. Comparative benchmarking across datasets is available, and phase-specific insights can be exported.

The technical requirements that support these flows are described in the section below.

---

## Technical Requirements

**Architecture**

The system is built on an agentic AI framework with 16-phase orchestration, five specialist MARAG agents, a distributed retrieval mechanism, agent-to-agent communication and a weighted consensus engine.

**MARAG System**

Each agent is responsible for a distinct retrieval domain. TIRA retrieves threat intelligence from sources including CISA, FBI, CVE and threat actor profiles. RCRA covers regulatory compliance across OFAC, UN, EU and HMT sanctions as well as GDPR, DORA and FinCEN requirements. HPRA handles historical pattern matching across fraud typologies, case studies and pattern evolution data. ERRA analyses entity relationships through network graphs, fraud rings and synthetic identity detection. BARA focuses on behavioural analysis using biometrics, device fingerprints and account takeover indicators.

**Consensus Engine**

Weighted voting is applied with confidence scoring, evidence triangulation, uncertainty quantification through confidence intervals, cross-agent correlation and conflict resolution.

**Frontend**

The interface is built with Preact and supports real-time streaming. Phase progression visualisation, agent status panels and consensus radar charts are included.

**Performance**

Load time is targeted at under two seconds. Case processing through all 16 phases is targeted at under five minutes, with sub-second phase transitions. The system is designed to support over 100 concurrent cases.

**Accessibility and Security**

WCAG 2.1 AA compliance is required. Authentication is enforced, data transmission is encrypted, agent decisions are logged in an audit trail, compliance logging is maintained and audit records are immutable.

**Browser Support**

Chrome, Firefox and Safari are supported across their two most recent versions.

The success metrics used to evaluate these requirements are outlined in the section below.

---

## Success Metrics

**Detection performance**

Fraud detection accuracy is targeted above 95% with a false positive rate below 5%. Precision is targeted above 90%, recall above 88% and AUC-ROC above 0.93.

**Processing efficiency**

Average case processing time is targeted at under five minutes across the full 16-phase pipeline. Phase transitions are expected to be sub-second, with support for over 100 concurrent cases.

**Multi-agent consensus**

Weighted consensus accuracy is tracked per specialist agent. Agent agreement rates are targeted above 85%, and consensus confidence intervals are expected to remain within plus or minus 5%.

**Phase performance**

Phase-by-phase throughput is optimised with a target of under 60 seconds per phase. All 16 phases are completed for every case.

**Evidence quality**

Evidence triangulation success is targeted above 90% and conflict resolution accuracy above 92%. Source attribution completeness is expected at 100% and full compliance with the "No Citation, No Verdict" principle is required.

**Compliance validation**

Compliance documentation is targeted at a pass rate above 99%. All reports are SAR-ready, GDPR explanation quality is targeted above 90% and regulatory audit pass rate is expected at 100%.

**System reliability**

System uptime is targeted above 99.5%, error recovery success above 95% and audit trail integrity at 100%.

**User experience**

User satisfaction is targeted above 4 out of 5. Analyst decision accuracy is expected to improve by over 20% and time-to-insight to reduce by over 40%.

**Benchmarking**

Multi-dataset performance comparison is conducted with statistical significance testing. Dataset performance variance is targeted below 10% and model stability across conditions above 90%.
