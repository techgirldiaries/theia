# Getting Started with THEIA Fraud Intelligence

Welcome to THEIA, an agentic AI framework for adaptive financial fraud detection. This guide will help you get up and running quickly.

## Prerequisites

- Node.js 18+ and npm
- A Relevance AI account with credentials
- A modern web browser (Chrome, Firefox, Safari)

## Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd theia-fraud-intelligence
   ```

2. **Install dependencies** (use `--legacy-peer-deps` due to Preact/React peer dependencies):

   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory with:

   ```env
   VITE_REGION=<your-region>
   VITE_PROJECT=<your-project-id>
   VITE_WORKFORCE_ID=<your-workforce-id>
   # Optional: VITE_AGENT_ID=<your-agent-id>
   # Optional: VITE_ACCESS_PASSPHRASE=<passphrase-for-auth-gate>
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

   Open `http://localhost:5173` in your browser.

## Quick Start: Running Your First Analysis

### Step 1: Access the App

Once the app loads, you'll see the empty state interface with options to get started.

### Step 2: Upload a Dataset

- Click **"Dataset Management"** in the left sidebar
- Upload a fraud dataset (CSV, JSON, or XLSX format)
- The app will automatically generate quality metrics and readiness indicators

### Step 3: Run an Analysis

Use one of the **Quick Templates** to trigger analysis:

- **"Analyse for Anomalies"** - Best for detecting unusual patterns
- **"Generate Fraud Report"** - Comprehensive fraud analysis
- **"Risk Assessment"** - Categorize transactions by risk level
- **"Deep Investigation"** - Uncover fraud networks
- **"Evaluate Performance"** - View detection metrics

Or type a custom prompt describing what you want to analyse.

### Step 4: Monitor Real-Time Progress

The **Workflow Dashboard** will display:

- 16-phase pipeline progression
- Live phase status (Completed → In Progress → Pending)
- Multi-agent consensus scoring
- Performance metrics and throughput

### Step 5: Review Results

Once analysis completes, you'll see:

- **Visual Analytics Gallery** - ROC curves, confusion matrices, heatmaps
- **Fraud Reports** - Detailed case analysis with risk scores
- **Performance Dashboard** - System performance metrics
- **Audit Log** - Complete activity trail

## Key Features

### 1. 16-Phase Pipeline

THEIA processes fraud cases through a sophisticated 16-phase workflow:

- **Phases 0-3:** Sequential (Data Acquisition → Ingestion → Monitoring → Pattern Analysis)
- **Phases 4-6:** Parallel Intelligence Retrieval
- **Phases 7-9:** Convergent Analysis (Behavioral → KYC → Merchant)
- **Phases 10-15:** Decision Making (Classification → Verification → Compliance → Case Management → Oversight)

### 2. 5 Specialist MARAG Agents

- **TIRA** - Threat Intelligence Retrieval
- **RCRA** - Regulatory Compliance Analysis
- **HPRA** - Historical Pattern Recognition
- **ERRA** - Entity Relationship Analysis
- **BARA** - Behavioral Analysis

### 3. Interactive Dashboards

- **Workflow Dashboard** - 16-phase progress visualization
- **Real-Time Status Tracker** - Live metrics and throughput
- **Analytics Dashboard** - Charts, distributions, risk breakdowns
- **Visualization Gallery** - AI-generated insights visualizations

### 4. Dataset Management

- Upload and manage multiple fraud datasets
- View data quality scores and readiness indicators
- Compare performance across datasets
- Track analysis history

### 5. Audit Logging

- Complete pipeline audit trail
- Agent decision logging
- Compliance documentation (SAR-ready, GDPR)
- Export audit records for regulatory review

## Common Tasks

### Analyse Multiple Datasets

1. Upload datasets in **Dataset Management**
2. Select **"Compare Datasets"** template
3. View comparative performance metrics and fraud pattern differences

### Check System Performance

1. Open **Performance Dashboard** from the right sidebar
2. Monitor metrics: response times, success rates, risk distribution
3. Track agent agreement rates and consensus accuracy

### Review Case History

1. Click **History** in the left sidebar
2. Search or filter previous cases
3. Click a case to view detailed analysis

### Export Reports

1. Complete an analysis
2. In **Fraud Reports**, click export button
3. Choose format (PDF, JSON) for compliance documentation

### Toggle Dark Mode

- Click the **Theme Toggle** in the header
- Preference is saved automatically

## Interface Modes

Choose the complexity level that suits you:

- **Easy** - Simplified view, core features only
- **Focus** - Essential features, minimal distractions
- **Balanced** (default) - Full feature set, organized layout
- **Expert** - All advanced features, detailed controls

Switch modes in **Settings** (gear icon, top right).

## Keyboard Shortcuts

- `Ctrl/Cmd + Enter` - Submit analysis
- `Ctrl/Cmd + K` - Focus analysis input
- `Ctrl/Cmd + /` - Toggle templates
- `Ctrl/Cmd + N` - Start new session
- `?` - Show all keyboard shortcuts

## Troubleshooting

### Black Screen on Load

1. Open browser console (F12)
2. Check for error messages
3. Verify `.env` credentials are correct
4. Ensure internet connection is stable

### Analysis Not Starting

- Verify dataset is uploaded and ready
- Check network connection
- Review browser console for errors
- Try a different prompt or template

### No Visualizations Generated

- Ensure analysis completed successfully
- Check that fraud data is present in dataset
- Try the "Evaluate Performance" template
- Review logs in audit panel

### Performance Issues

- Clear browser cache and localStorage
- Try compact view mode (Settings)
- Close unused browser tabs
- Restart the app

## Documentation

- [Product Requirements Document](PRD.md) - Full feature specification
- [Testing Guide](TESTING.md) - Unit and integration testing
- [Deployment Guide](DEPLOYMENT.md) - Production deployment
- [Updates & Changelog](UPDATES.md) - Version history

## Getting Help

1. Check the keyboard shortcuts (`?` key)
2. Review the Audit Log for error details
3. Check browser console (F12) for JavaScript errors
4. Refer to the PRD for technical architecture details

## Best Practices

✅ **Do:**

- Start with sample datasets to learn the interface
- Use quick templates before writing custom prompts
- Review audit logs for compliance documentation
- Export reports regularly for record-keeping
- Use specific, detailed prompts for better analysis

❌ **Avoid:**

- Uploading very large datasets (>1GB) initially
- Rapid consecutive analyses (wait for completion)
- Leaving sensitive data in browser localStorage
- Sharing access without authentication (set VITE_ACCESS_PASSPHRASE)

## Security Notes

- The `.env` file contains sensitive credentials — never commit to git
- Use `VITE_ACCESS_PASSPHRASE` to add authentication gate for shared deployments
- All analysis data is encrypted in localStorage
- Audit logs provide complete compliance trail

---

**Ready to analyze fraud?** Start by uploading your first dataset and selecting an analysis template! 🚀
