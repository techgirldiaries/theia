# Quick Templates Guide

This guide covers all the prompts that trigger real-time analysis and live dashboard visualisation in Theia. Each template is designed to activate a specific part of the fraud detection pipeline, so the right template for the task at hand can be selected quickly. Custom prompts for more advanced testing are also included, along with a step-by-step walkthrough of how the dashboard is used.

---

## Built-in Quick Templates

Six templates are pre-configured in the interface. Each one triggers a full analysis pipeline and generates a set of visualisations automatically.

---

### 1. Analyse for Anomalies

**Purpose:** Triggers anomaly detection and risk assessment visualisation.

```text
Please analyse the uploaded dataset for anomalies, unusual patterns and potential fraud indicators. Provide a detailed risk assessment.
```

**Visualisations generated:**
- Risk distribution charts
- Anomaly heatmaps
- Pattern identification graphs
- Risk score breakdowns

---

### 2. Generate Fraud Report

**Purpose:** Generates a comprehensive report with a phase-by-phase breakdown.

```text
Generate a comprehensive fraud report based on the data, including risk scores, fraud patterns and recommendations.
```

**Visualisations generated:**
- Phase-by-phase pipeline visualisation
- Detailed fraud report with six tabbed sections
- Agent reasoning and evidence attribution
- Risk categorisation breakdown

---

### 3. Risk Assessment

**Purpose:** Displays real-time risk categorisation across low, medium and high levels.

```text
Perform a risk assessment on the transactions and categorize them by risk level (low, medium, high).
```

**Visualisations generated:**
- Risk level distribution chart
- Transaction categorisation by risk
- Real-time progress tracker
- Risk score statistics

---

### 4. Deep Investigation

**Purpose:** Activates network and transaction pattern visualisation.

```text
Conduct a deep investigation into suspicious activities, trace transaction patterns and identify potential fraud networks.
```

**Visualisations generated:**
- Network graphs showing fraud rings
- Transaction pattern analysis
- Entity relationship maps
- Suspicious activity timelines

---

### 5. Evaluate Performance

**Purpose:** Displays the analytics dashboard with ROC curves and confusion matrices.

```text
Evaluate the fraud detection performance metrics including accuracy, false positives, false negatives and provide optimization recommendations.
```

**Visualisations generated:**
- ROC curves
- Confusion matrices
- Performance metrics dashboard
- Precision, Recall and F1-Score charts
- AUC-ROC analysis
- AUC-PR analysis

---

### 6. Identify Trends

**Purpose:** Displays temporal visualisations and emerging fraud patterns.

```text
Analyse temporal trends in the fraud data, identify seasonal patterns, emerging fraud types and predict future risks.
```

**Visualisations generated:**
- Temporal trend charts
- Seasonal pattern analysis
- Emerging fraud type detection
- Time-series visualisations
- Predictive risk indicators

Beyond these built-in templates, custom prompts can be used to test specific dashboard features in more depth.

---

## Custom Prompts for Advanced Testing

The prompts below are designed to test particular capabilities of the dashboard directly.

---

### Real-Time Phase Tracking

```text
Run a complete 16-phase fraud analysis on the dataset and show me live progress through each phase
```

**Expected output:**
- 16-phase pipeline with live status updates
- Real-time phase completion indicators
- Throughput metrics (phases per minute)
- Average phase duration tracking
- Phase-by-phase performance metrics

---

### Multi-Agent Consensus

```text
Analyze this transaction using all 5 specialist agents (TIRA, RCRA, HPRA, ERRA, BARA) and show consensus scoring
```

**Expected output:**
- Individual agent analysis results
- Weighted consensus scoring (0 to 100)
- Agent agreement rates
- Confidence intervals
- Evidence triangulation visualisation
- Conflict resolution results

---

### Comprehensive Visualisations

```text
Generate comprehensive fraud detection visualisations including ROC curves, confusion matrices and heatmaps
```

**Expected output:**
- ROC curves with AUC-ROC scores
- Confusion matrices for classification accuracy
- Heatmaps showing fraud pattern distributions
- Risk distribution charts
- Performance metrics dashboard
- Multiple chart types from the visualisation gallery

With the prompts understood, the section below explains how the dashboard is used from start to finish.

---

## How to Trigger Live Dashboard Visualisation

### Step 1: Upload a Dataset

Navigate to **Dataset Management** in the left sidebar. A fraud dataset is uploaded in CSV, JSON or XLSX format. Once the upload is complete, data quality metrics are populated and the dataset status changes to **Ready**.

### Step 2: Select a Quick Template

In the main chat area, the **Quick Templates** section appears at the top of the empty state. Any of the six templates can be selected by clicking its button, or a custom prompt can be typed directly into the message input field.

### Step 3: Monitor Real-Time Progress

The **Workflow Dashboard** activates automatically and displays the following components.

**16-Phase Pipeline Visualisation** shows sequential, parallel and convergent phases as they are processed.

**Real-Time Status Tracker** displays live metrics including the current phase status, average phase duration, throughput in phases per minute and phase completion progress.

**Multi-Agent Progress Visualisation** shows the status of each MARAG agent (TIRA, RCRA, HPRA, ERRA and BARA), including consensus convergence, agreement rates and weighted scoring.

**Analytics Dashboard** displays risk distribution across low, medium and high categories alongside performance metrics, response time analysis and success rate tracking.

**Visualisation Gallery** presents AI-generated charts including ROC curves, confusion matrices, statistical distributions and performance comparisons.

Each of these components is described in more detail below.

---

## Understanding Dashboard Components

### Real-Time Status Tracker

Live fraud analysis progression is displayed here. Phase status moves through Completed, In Progress and Pending states. Performance metrics include average phase time, throughput and error rates. Control icons for Play, Pause and Reset are available alongside a progress adjustment slider.

### Multi-Agent Consensus Panel

The MARAG agent collaboration is displayed in this panel. Each agent's current state is shown alongside the consensus score (0 to 100), source attribution and reasoning and confidence intervals for uncertainty quantification.

### Analytics Dashboard

This panel provides a performance overview of the full session. Metrics displayed include total cases analysed, risk breakdown across high, medium and low categories, average response time, success rate, chat session count and the number of datasets uploaded.

### Visualisation Gallery

Charts generated during analysis are collected here. Each chart includes a type indicator, phase attribution, a key insights preview and a download option. Phase-specific visualisations are grouped together for easy reference.

---

## Tips for Best Results

**Do:**
- Start with sample datasets to become familiar with the interface
- Use the built-in quick templates before writing custom prompts
- Include specific details in dataset descriptions
- Allow the full analysis to complete before starting a new one
- Review the generated visualisations for actionable insights

**Avoid:**
- Interrupting the analysis mid-process
- Using very large datasets on the first run
- Writing vague or overly generic prompts
- Running multiple analyses at the same time
- Clearing browser data before exporting results

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + Enter` | Submit analysis |
| `Ctrl/Cmd + K` | Focus analysis input |
| `Ctrl/Cmd + /` | Toggle templates |
| `Ctrl/Cmd + N` | Start new session |
| `?` | Show all shortcuts |

---

## Troubleshooting

**No visualisations appearing**

The status tracker is checked first to confirm whether the analysis completed successfully. If the dataset does not contain valid fraud data, the Evaluate Performance template is a reliable way to test the pipeline. Browser console errors can be viewed by pressing F12.

**Dashboard not updating**

The page is refreshed with F5 and the browser cache is cleared. Network connectivity is verified and the dataset upload status is confirmed.

**Slow performance**

Compact view mode is enabled through the Settings panel. Unused browser tabs are closed and a smaller dataset is used for initial testing.

---

## Component Reference

All prompts activate the following core components.

| Component | Description |
|---|---|
| [RealTimeStatusTracker](../src/components/real-time-status-tracker.tsx) | Live phase progression and metrics |
| [WorkflowDashboard](../src/components/workflow-dashboard.tsx) | Main orchestration panel |
| [MultiAgentProgressVisualisation](../src/components/multi-agent-progress-visualisation.tsx) | MARAG agent collaboration |
| [AnalyticsDashboard](../src/components/analytics-dashboard.tsx) | Performance metrics |
| [VisualisationGallery](../src/components/visualisation-gallery.tsx) | Chart collection |
| [EnhancedFraudReportDisplay](../src/components/enhanced-fraud-report-display.tsx) | Detailed case analysis |
