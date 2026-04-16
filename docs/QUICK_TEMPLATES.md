# Quick Templates Guide for THEIA

This guide provides all the prompts that trigger real-time analysis and live dashboard visualisation in THEIA. Use these templates to quickly start powerful fraud detection analyses.

## Quick Templates (Built-in)

These are pre-configured prompts available in the UI that trigger full analysis pipelines with real-time visualisation.

### 1. Analyse for Anomalies

**Purpose:** Triggers anomaly detection and risk assessment visualisation

**Prompt:**

```text
Please analyse the uploaded dataset for anomalies, unusual patterns and potential fraud indicators. Provide a detailed risk assessment.
```

**Visualisations Generated:**

- Risk distribution charts
- Anomaly heatmaps
- Pattern identification graphs
- Risk score breakdowns

---

### 2. Generate Fraud Report

**Purpose:** Generates comprehensive reports with phase-by-phase breakdown

**Prompt:**

```text
Generate a comprehensive fraud report based on the data, including risk scores, fraud patterns and recommendations.
```

**Visualisations Generated:**

- Phase-by-phase pipeline visualisation
- Detailed fraud report with 6 tabbed sections
- Agent reasoning and evidence attribution
- Risk categorisation breakdown

---

### 3. Risk Assessment

**Purpose:** Shows real-time risk categorization (low/medium/high)

**Prompt:**

```text
Perform a risk assessment on the transactions and categorize them by risk level (low, medium, high).
```

**Visualisations Generated:**

- Risk level distribution chart
- Transaction categorisation by risk
- Real-time progress tracker
- Risk score statistics

---

### 4. Deep Investigation

**Purpose:** Activates network and transaction pattern visualisation

**Prompt:**

```text
Conduct a deep investigation into suspicious activities, trace transaction patterns and identify potential fraud networks.
```

**Visualisations Generated:**

- Network graphs showing fraud rings
- Transaction pattern analysis
- Entity relationship maps
- Suspicious activity timelines

---

### 5. Evaluate Performance

**Purpose:** Displays analytics dashboard with ROC curves and confusion matrices

**Prompt:**

```text
Evaluate the fraud detection performance metrics including accuracy, false positives, false negatives and provide optimization recommendations.
```

**Visualisations Generated:**

- ROC curves
- Confusion matrices
- Performance metrics dashboard
- Precision/Recall/F1-Score charts
- AUC-ROC analysis

---

### 6. Identify Trends

**Purpose:** Shows temporal visualisations and emerging patterns

**Prompt:**

```text
Analyse temporal trends in the fraud data, identify seasonal patterns, emerging fraud types and predict future risks.
```

**Visualisations Generated:**

- Temporal trend charts
- Seasonal pattern analysis
- Emerging fraud type detection
- Time-series visualisations
- Predictive risk indicators

---

## Custom Prompts for Advanced Testing

Try these custom prompts to test specific dashboard features and capabilities:

### For Real-Time Phase Tracking

**Prompt:**

```text
Run a complete 16-phase fraud analysis on the dataset and show me live progress through each phase
```

**Expected Output:**

- 16-phase pipeline with live status updates
- Real-time phase completion indicators
- Throughput metrics (phases/minute)
- Average phase duration tracking
- Phase-by-phase performance metrics

---

### For Multi-Agent Consensus

**Prompt:**

```text
Analyze this transaction using all 5 specialist agents (TIRA, RCRA, HPRA, ERRA, BARA) and show consensus scoring
```

**Expected Output:**

- Individual agent analysis results
- Weighted consensus scoring (0-100)
- Agent agreement rates
- Confidence intervals
- Evidence triangulation visualisation
- Conflict resolution results

---

### For Comprehensive visualisations

**Prompt:**

```text
Generate comprehensive fraud detection visualisations including ROC curves, confusion matrices and heatmaps
```

**Expected Output:**

- ROC curves with AUC-ROC scores
- Confusion matrices for classification accuracy
- Heatmaps showing fraud pattern distributions
- Risk distribution charts
- Performance metrics dashboard
- Multiple chart types from visualisation gallery

---

## How to Trigger Live Dashboard Visualisation

### Step 1: Upload a Dataset

1. Navigate to **Dataset Management** in the left sidebar
2. Upload a fraud dataset (CSV, JSON, or XLSX format)
3. Wait for data quality metrics to populate
4. Verify the dataset shows as "Ready" status

### Step 2: Select a Quick Template

1. In the main chat area, look for the **Quick Templates** section
2. Click any template button at the top of the empty state:
   - "Analyse for Anomalies"
   - "Generate Fraud Report"
   - "Risk Assessment"
   - "Deep Investigation"
   - "Evaluate Performance"
   - "Identify Trends"

Or type a custom prompt in the message input field.

### Step 3: Monitor Real-Time Progress

The **Workflow Dashboard** will automatically activate with:

- **16-Phase Pipeline visualisation** - Sequential, parallel and convergent phases
- **Real-Time Status Tracker** - Live metrics showing:
  - Current phase status
  - Average phase duration
  - Throughput (phases/minute)
  - Phase completion progress
  - Live phase updates

- **Multi-Agent Progress visualisation** - Shows Theia MARAG agents (TIRA, RCRA, HPRA, ERRA, BARA):
  - Individual agent status
  - Consensus convergence
  - Agreement rates
  - Weighted scoring

- **Analytics Dashboard** - Charts and metrics:
  - Risk distribution (low/medium/high)
  - Performance metrics
  - Response time analysis
  - Success rate tracking

- **Visualisation Gallery** - AI-generated charts:
  - ROC curves
  - Confusion matrices
  - Statistical distributions
  - Performance comparisons

---

## Understanding Dashboard Components

### Real-Time Status Tracker

Shows live fraud analysis progression:

- **Phase Status**: Completed → In Progress → Pending
- **Performance Metrics**: Average phase time, throughput, error rates
- **Controls**: Play/Pause, Reset, Progress adjustment

### Multi-Agent Consensus Panel

Displays MARAG agent collaboration:

- **Agent Status**: Each agent's current state
- **Consensus Score**: 0-100 agreement level
- **Evidence**: Source attribution and reasoning
- **Confidence Intervals**: Uncertainty quantification

### Analytics Dashboard

Performance monitoring dashboard showing:

- Total cases analysed
- High/Medium/Low risk breakdown
- Average response time
- Success rate percentage
- Chat session count
- Datasets uploaded

### Visualisation Gallery

Collection of analysis charts with explanations:

- Chart type indicators
- Phase attribution
- Key insights preview
- Download functionality
- Phase-specific visualisations

---

## Tips for Best Results

**Do:**

- Start with sample datasets to learn the interface
- Use quick templates before creating custom prompts
- Be specific with dataset descriptions
- Allow full analysis completion before requesting new analyses
- Review generated visualisations for insights

**Avoid:**

- Interrupting analysis mid-process
- Using extremely large datasets initially
- Vague or overly generic prompts
- Running multiple analyses simultaneously
- Clearing browser data before exporting results

---

## Keyboard Shortcuts for Quick Analysis

| Shortcut           | Action               |
| ------------------ | -------------------- |
| `Ctrl/Cmd + Enter` | Submit analysis      |
| `Ctrl/Cmd + K`     | Focus analysis input |
| `Ctrl/Cmd + /`     | Toggle templates     |
| `Ctrl/Cmd + N`     | Start new session    |
| `?`                | Show all shortcuts   |

---

## Troubleshooting

### No visualisations Appearing

- Ensure analysis completed successfully (check status tracker)
- Verify dataset contains valid fraud data
- Try the "Evaluate Performance" template
- Check browser console for errors (F12)

### Dashboard Not Updating

- Refresh the page (F5)
- Clear browser cache
- Check network connection
- Verify dataset is uploaded

### Slow Performance

- Use compact view mode (Settings)
- Close unused browser tabs
- Try with a smaller dataset
- Clear localStorage

---

## Component Reference

All prompts trigger these core components:

- **[RealTimeStatusTracker](../src/components/real-time-status-tracker.tsx)** - Live phase progression and metrics
- **[WorkflowDashboard](../src/components/workflow-dashboard.tsx)** - Main orchestration panel
- **[MultiAgentProgressVisualisation](../src/components/multi-agent-progress-visualisation.tsx)** - MARAG agent collaboration
- **[AnalyticsDashboard](../src/components/analytics-dashboard.tsx)** - Performance metrics
- **[VisualisationGallery](../src/components/visualisation-gallery.tsx)** - Chart collection
- **[EnhancedFraudReportDisplay](../src/components/enhanced-fraud-report-display.tsx)** - Detailed case analysis

---

**Ready to analyse?** Start with a quick template and watch your fraud detection in action!
