# Theia Fraud Intelligence - Project Structure Guide

## Executive Summary

This document provides a comprehensive guide to the Theia Fraud Intelligence System architecture. The project has been reorganised into logical, feature-based directories to improve maintainability and clarity.

---

## File Mappings: Current Location → Recommended Location

### UI Layer - Layouts

| Current File           | Recommended Location              | Purpose                    |
| ---------------------- | --------------------------------- | -------------------------- |
| `app.tsx`              | `ui/layouts/app.tsx`              | Main application container |
| `header.tsx`           | `ui/layouts/header.tsx`           | Application header         |
| `footer.tsx`           | `ui/layouts/footer.tsx`           | Application footer         |
| `left-sidebar.tsx`     | `ui/layouts/sidebar-left.tsx`     | Left navigation sidebar    |
| `right-action-bar.tsx` | `ui/layouts/action-bar-right.tsx` | Right action toolbar       |

### UI Layer - Dashboards

| Current File                | Recommended Location                      | Purpose                       |
| --------------------------- | ----------------------------------------- | ----------------------------- |
| `analytics-dashboard.tsx`   | `ui/dashboards/analytics-dashboard.tsx`   | Analytics and statistics view |
| `evaluation-dashboard.tsx`  | `ui/dashboards/evaluation-dashboard.tsx`  | Model evaluation dashboard    |
| `performance-dashboard.tsx` | `ui/dashboards/performance-dashboard.tsx` | System performance metrics    |
| `workflow-dashboard.tsx`    | `ui/dashboards/workflow-dashboard.tsx`    | Pipeline execution workflow   |

### UI Layer - Visualisations
| Current File                          | Recommended Location                             | Purpose                             |
| ------------------------------------- | ------------------------------------------------ | ----------------------------------- |
| `bar-chart.tsx`                       | `ui/visualisations/bar-chart.tsx`                | Bar chart component                 |
| `line-chart.tsx`                      | `ui/visualisations/line-chart.tsx`               | Line chart component                |
| `heatmap.tsx`                         | `ui/visualisations/heatmap.tsx`                  | Heatmap component                   |
| `confusion-matrix.tsx`                | `ui/visualisations/confusion-matrix.tsx`         | Confusion matrix display            |
| `roc-curve.tsx`                       | `ui/visualisations/roc-curve.tsx`                | ROC curve chart                     |
| `seasonal-decomposition.tsx`          | `ui/visualisations/seasonal-decomposition.tsx`   | Seasonal trend analysis             |
| `predictive-line-chart.tsx`           | `ui/visualisations/predictive-line-chart.tsx`    | Predictive forecasting chart        |
| `statistical-distribution.tsx`        | `ui/visualisations/statistical-distribution.tsx` | Distribution analysis               |
| `statistical-significance-matrix.tsx` | `ui/visualisations/significance-matrix.tsx`      | Statistical test results            |
| `marag-consensus-radar.tsx`           | `ui/visualisations/marag-consensus-radar.tsx`    | Multi-agent consensus visualisation |

### UI Layer - Analysis

| Current File                        | Recommended Location                             | Purpose                        |
| ----------------------------------- | ------------------------------------------------ | ------------------------------ |
| `fraud-report.tsx`                  | `ui/analysis/fraud-report.tsx`                   | Fraud detection report         |
| `fraud-reports-viewer.tsx`          | `ui/analysis/fraud-reports-viewer.tsx`           | Report browsing interface      |
| `enhanced-fraud-report-display.tsx` | `ui/analysis/enhanced-fraud-report-display.tsx`  | Advanced report display        |
| `enhanced-case-management.tsx`      | `ui/analysis/case-management.tsx`                | Case tracking and management   |
| `evaluation-results-dashboard.tsx`  | `ui/analysis/evaluation-results.tsx`             | Evaluation metrics display     |
| `evaluation-visualization-demo.tsx` | `ui/analysis/evaluation-visualisations-demo.tsx` | Evaluation examples            |
| `benchmark-comparison.tsx`          | `ui/analysis/benchmark-comparison.tsx`           | Dataset performance comparison |
| `dataset-fp-comparison.tsx`         | `ui/analysis/dataset-fp-comparison.tsx`          | False positive analysis        |
| `dataset-imbalance-comparison.tsx`  | `ui/analysis/dataset-imbalance-comparison.tsx`   | Class imbalance analysis       |
| `emerging-fraud-detector.tsx`       | `ui/analysis/emerging-fraud-detector.tsx`        | New fraud pattern detection    |

### UI Layer - Common Components

| Current File                             | Recommended Location                     | Purpose                        |
| ---------------------------------------- | ---------------------------------------- | ------------------------------ |
| `stats-card.tsx`                         | `ui/common/stats-card.tsx`               | Metric card component          |
| `risk-badge.tsx`                         | `ui/common/risk-badge.tsx`               | Risk level indicator           |
| `loading-skeleton.tsx`                   | `ui/common/loading-skeleton.tsx`         | Loading placeholder            |
| `empty-state.tsx`                        | `ui/common/empty-state.tsx`              | Empty state display            |
| `toast.tsx`                              | `ui/common/toast.tsx`                    | Notification toast             |
| `connection-status.tsx`                  | `ui/common/connection-status.tsx`        | API connection indicator       |
| `scroll-to-bottom.tsx`                   | `ui/common/scroll-to-bottom.tsx`         | Auto-scroll utility            |
| `task-status-indicator.tsx`              | `ui/common/task-status-indicator.tsx`    | Task progress indicator        |
| `phase-pipeline.tsx`                     | `ui/common/phase-pipeline.tsx`           | Pipeline stage display         |
| `real-time-status-tracker.tsx`           | `ui/common/real-time-status-tracker.tsx` | Live status updates            |
| `multi-agent-progress-visualisation.tsx` | `ui/common/multi-agent-progress.tsx`     | Multi-agent execution progress |

### UI Layer - Dialogs & Modals

| Current File             | Recommended Location                | Purpose              |
| ------------------------ | ----------------------------------- | -------------------- |
| `keyboard-shortcuts.tsx` | `ui/dialogs/keyboard-shortcuts.tsx` | Keyboard help modal  |
| `settings.tsx`           | `ui/dialogs/settings.tsx`           | Application settings |
| `quick-templates.tsx`    | `ui/dialogs/quick-templates.tsx`    | Template selection   |

### UI Layer - Specialised Components

| Current File                     | Recommended Location                         | Purpose                         |
| -------------------------------- | -------------------------------------------- | ------------------------------- |
| `agent-message.tsx`              | `ui/common/agent-message.tsx`                | AI assistant message display    |
| `user-message.tsx`               | `ui/common/user-message.tsx`                 | User message display            |
| `agent-typing.tsx`               | `ui/common/agent-typing.tsx`                 | Typing indicator animation      |
| `agent-workflow.tsx`             | `ui/analysis/agent-workflow.tsx`             | Agent execution workflow        |
| `audit-log-viewer.tsx`           | `ui/analysis/audit-log-viewer.tsx`           | Audit trail display             |
| `mode-selector.tsx`              | `ui/common/mode-selector.tsx`                | View mode switcher              |
| `interface-mode-switcher.tsx`    | `ui/common/interface-mode-switcher.tsx`      | Interface theme switcher        |
| `tab-navigator.tsx`              | `ui/common/tab-navigator.tsx`                | Tab navigation                  |
| `qualitative-assessment.tsx`     | `ui/analysis/qualitative-assessment.tsx`     | Qualitative evaluation          |
| `kfold-metrics-chart.tsx`        | `ui/visualisations/kfold-metrics-chart.tsx`  | K-fold cross-validation metrics |
| `mann-whitney-results-table.tsx` | `ui/visualisations/mann-whitney-results.tsx` | Statistical test results        |
| `marag-status-panel.tsx`         | `ui/common/marag-status-panel.tsx`           | Multi-agent status display      |
| `visualisation-validator.tsx`    | `ui/analysis/visualisation-validator.tsx`    | Visualisation quality checker   |

### Core Layer - Services

| Current File                  | Recommended Location                   | Purpose                 |
| ----------------------------- | -------------------------------------- | ----------------------- |
| `backend-integration-test.ts` | `core/services/backend-integration.ts` | Backend API integration |
| `parse-fraud-report.ts`       | `core/services/fraud-report-parser.ts` | Report parsing logic    |
| `ground-truth-evaluator.ts`   | `core/services/evaluation-service.ts`  | Model evaluation        |

### Core Layer - Utilities

| Current File                        | Recommended Location                 | Purpose                  |
| ----------------------------------- | ------------------------------------ | ------------------------ |
| `statistical-analysis.ts`           | `core/utils/statistical-analysis.ts` | Statistical calculations |
| `visualization-components.guide.ts` | `core/utils/visualisation-guide.ts`  | Component documentation  |

### State Management

| Current File         | Recommended Location | Purpose                    |
| -------------------- | -------------------- | -------------------------- |
| `signals/actions.ts` | `state/actions.ts`   | State mutations            |
| `signals/effects.ts` | `state/effects.ts`   | Side effects and listeners |
| `signals/state.ts`   | `state/state.ts`     | Signal definitions         |
| `signals/types.ts`   | `state/types.ts`     | State type definitions     |

### Configuration

| Current File                | Recommended Location       | Purpose               |
| --------------------------- | -------------------------- | --------------------- |
| `prompts/system-prompts.ts` | `config/system-prompts.ts` | AI system prompts     |
| `constant.ts`               | `config/constants.ts`      | Application constants |
| `types/*.ts`                | `config/types.ts`          | Configuration types   |

### Data Access Layer

| Current File                | Recommended Location                     | Purpose                   |
| --------------------------- | ---------------------------------------- | ------------------------- |
| `datasets-manager.tsx`      | `core/services/dataset-manager.ts`       | Dataset handling          |
| `fraud-dataset-manager.tsx` | `core/services/fraud-dataset-manager.ts` | Fraud data management     |
| `data-management.tsx`       | `ui/analysis/data-management.tsx`        | UI for data management    |
| `attachment-menu.tsx`       | `ui/common/attachment-menu.tsx`          | File attachment interface |
| `file-manager.tsx`          | `ui/dialogs/file-manager.tsx`            | File selection dialog     |

---

## Key Improvements

### 1. **Clear Separation of Concerns**

- **UI**: All presentation logic
- **Core**: Business logic and services
- **State**: Centralised state management
- **Config**: Application configuration and prompts

### 2. **Feature-Based Organization**

- Dashboards grouped by type (analytics, performance, evaluation)
- Visualisations grouped by chart type
- Analysis components grouped by fraud detection phase

---

## Type Definitions Organisation

### Current Structure

- `types/benchmarking.ts` - Benchmarking types
- `types/compliance.ts` - Compliance types
- `types/evaluation.ts` - Evaluation types
- `types/fraud-report.ts` - Fraud report types
- `types/marag.ts` - MARAG framework types

### Recommended Consolidation

Group related types in `config/types.ts` or create feature-specific type files:

```text
config/
  ├── types/
  │   ├── fraud.ts
  │   ├── evaluation.ts
  │   ├── compliance.ts
  │   └── marag.ts
  └── constants.ts
```

---

## Import Path Configuration (tsconfig.json)

Ensure path aliases are configured to support the new structure:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@ui/*": ["./src/ui/*"],
      "@core/*": ["./src/core/*"],
      "@state/*": ["./src/state/*"],
      "@config/*": ["./src/config/*"]
    }
  }
}
```

---

## Next Steps

1. **Review this structure** with project stakeholders
2. **Create migration plan** for incremental file movement
3. **Update tests** to reference new file locations
4. **Update documentation** (README, developer guides)
5. **Update CI/CD pipelines** if they reference specific paths
6. **Conduct code review** of migration changes

---

## File Statistics

- **Total Components**: 60+ UI components
- **Service Files**: 5+ service/utility files
- **Type Definitions**: 5 type files
- **State Management**: 4 state files
- **Configuration Files**: 3 config files

---

## Naming Convention Guide

### Component Naming

- Dashboard components: `*-dashboard.tsx`
- Chart/visualisation components: descriptive names (e.g., `bar-chart.tsx`)
- Feature components: feature-focused (e.g., `fraud-report.tsx`)

### Service Naming

- API services: `*-service.ts`
- Utility functions: descriptive names
- Helpers: `*-helper.ts` or `*-utils.ts`

### Type Naming

- Domain types: `domain.ts`
- Feature-specific: `feature-types.ts`

---

## Maintenance Guidelines

- **Add new UI components** to appropriate `ui/` subdirectory
- **Add new services** to `core/services/`
- **Add new utilities** to `core/utils/`
- **New types** go to `config/types.ts` or feature-specific location
- **New state logic** goes to appropriate `state/` file

This structure supports both current development needs and future scalability.
