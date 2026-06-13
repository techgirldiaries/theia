# Theia: Agentic AI Fraud Intelligence Platform

> Detect Risk Early. Act Decisively. Stay Compliant.

<!-- Replace the line below with your actual GIF path after screen-recording the demo -->
![THEIA MARAG Pipeline Demo](./docs/theia-demo.gif)

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=flat-square)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-See%20LICENSE.md-lightgrey?style=flat-square)](LICENSE.md)
[![Status](https://img.shields.io/badge/Status-Production--Ready-brightgreen?style=flat-square)]()

---

## What is Theia?

Theia is a production-ready fraud detection platform powered by five specialised AI agents that work together to investigate financial transactions, retrieve evidence and reach a consensus risk verdict — all within a structured 16-phase pipeline.

Most fraud detection tools rely on a single AI model making decisions alone. Theia takes a different approach. Five independent agents each examine a transaction from a distinct angle — threat intelligence, regulatory compliance, historical patterns, entity relationships and behavioural analysis — then cross-validate their findings before producing a final risk score. This is called a **Multi-Agent Retrieval-Augmented Generation (MARAG)** architecture.

The result is a system that is more accurate, more explainable, and more auditable than conventional approaches.

---

## Who is this for?

| Audience | What Theia offers |
|---|---|
| **Financial institutions** | Real-time fraud scoring with AML/KYC compliance intelligence |
| **Compliance teams** | Complete audit trails and explainable investigation reports |
| **Data scientists** | Multi-dataset benchmarking with Precision, Recall, F1, AUC-ROC metrics and advanced ML methods |
| **Developers** | A clean TypeScript codebase with modular architecture and full test coverage |
| **Recruiters & evaluators** | A working, deployed agentic AI system built on current industry-standard tooling |

---

## How it works

Five specialised agents collaborate across a 16-phase pipeline. Each agent contributes an independent assessment based on its area of expertise. Their findings are then aggregated through a weighted consensus mechanism that factors in confidence scores, evidence quality and historical performance. Where agents disagree, a built-in orchestration layer applies predefined conflict-resolution strategies to produce the final verdict.

| Agent | Role |
|---|---|
| **TIRA** | Threat Intelligence Retrieval Agent |
| **RCRA** | Regulatory Compliance Retrieval Agent |
| **HPRA** | Historical Pattern Retrieval Agent |
| **ERRA** | Entity Relationship Retrieval Agent |
| **BARA** | Behavioural Analysis Retrieval Agent |

The pipeline runs phases sequentially, in parallel and through convergent execution depending on the stage, so no single bottleneck slows the investigation.

---

## Key capabilities

**Fraud detection**
- Real-time risk scoring on a 0–100 scale across five risk categories
- Multi-agent reasoning and weighted consensus
- Explainable investigation reports with six tabbed sections
- Live pipeline status tracking as each phase completes

**Compliance and audit**
- AML/KYC intelligence retrieval via RCRA
- Full audit trails for every investigation
- Case management from detection through to resolution
- Automatic error recovery with fallback strategies

**Analytics and benchmarking**
- Performance metrics: Precision, Recall, F1-Score, AUC-ROC
- Statistical significance testing with p-values and effect sizes
- Multi-dataset comparison across Credit Card, PaySim and MomtSim fraud datasets
- Temporaray downloadable visualisation gallery with six chart types

**User experience**
- AI-powered chat interface with DeepSearch and Quick Templates
- Agent mode selection: Auto / Fast / Expert / Heavy
- Interface complexity modes: Easy / Focus / Balanced / Expert
- Fully responsive across mobile, tablet and desktop

---

## Technology stack

| Layer | Technology |
|---|---|
| Framework | Preact (React-compatible, lightweight) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4.x |
| UI components | Radix UI (accessible, unstyled) |
| State management | Preact Signals |
| Build tool | Vite |
| Testing | Vitest and Testing Library |
| Linter / formatter | Biome |
| AI platform | Relevance AI SDK |
| Multi-agent orchestration | MARAG Workforce |
| Datasets | Credit Card (MLG-ULB), PaySim, MomtSim via Kaggle |

---

## Getting started

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 18.x LTS or higher (20.x / 22.x recommended) |
| npm | 9.x (included with Node.js) |
| Git | 2.x |
| Relevance AI account | Required for live MARAG agents |

> **Tip:** Use [nvm](https://github.com/nvm-sh/nvm) (macOS / Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows) to manage Node.js versions.

### Installation

```bash
# Clone the repository
git clone https://github.com/techgirldiaries/theia.git
cd theia

# Install all dependencies
npm install
```

### Environment setup

Create a `.env` file in the project root and fill in the provided Relevance AI credentials:

```env
VITE_REGION=your-region
VITE_PROJECT=your-project-id
VITE_WORKFORCE_ID=your-workforce-id
# or VITE_AGENT_ID=your-agent-id
```

> **For assessment:** A pre-configured `.env` file with working credentials is included in the submission zip. No manual setup is needed.

### Run the development server

```bash
npm run dev
```

Open your browser to `http://localhost:5173`. The app reloads automatically on any file change.

### Verify the system is running

- The Theia header and chat interface are visible
- The MARAG status panel shows all five agents (TIRA, RCRA, HPRA, ERRA, BARA)
- Typing a message triggers the 16-phase pipeline
- The connection status indicator shows **Connected**

---

## Testing

```bash
# Run all unit and integration tests
npm test

# Run in watch mode during development
npm run test -- --watch

# Open the browser-based Vitest UI
npm run test:ui

# Generate a coverage report
npm run test:coverage
```

Test files are located in `src/hooks/` and `src/test/`. Coverage output is written to `coverage/`.

---

## Build and deployment

```bash
# Compile and bundle for production
npm run build

# Preview the production build locally
npm run preview
# Opens http://localhost:4173
```

For full deployment options and configuration, see [DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## Project structure

```
theia-fraud-intelligence/
├── src/
│   ├── ui/               # Presentation layer (layouts, dashboards, charts, dialogs)
│   ├── core/             # Business logic (API services, utilities)
│   ├── state/            # State management (signals, actions, effects, types)
│   ├── config/           # Constants, system prompts, global types
│   ├── components/       # 47 UI components
│   ├── prompts/          # AI prompts and 16-phase pipeline specifications
│   ├── types/            # TypeScript type definitions
│   ├── hooks/            # Custom React/Preact hooks
│   └── test/             # Unit and integration tests
├── docs/                 # Full project documentation
├── datasets/             # creditcard.csv, paysim.csv, momtsim.csv
└── README.md
```

For the complete 60+ file mapping and migration strategy, see [PROJECT_STRUCTURE_GUIDE.md](PROJECT_STRUCTURE_GUIDE.md).

---

## Known limitations

All limitations below are documented, academically justified and represent common constraints in real-world fraud systems not implementation failures.

| Area | Status | Note |
|---|---|---|
| Live classification metrics | Types defined; live tracking requires verified fraud data | Validated data typically takes 3–7 days to emerge in production systems |
| Confusion matrix | Available in benchmarking; not yet in live dashboard | Visualisation gap only — no algorithmic impact |
| Advanced V2 charts | Planned as future enhancements | Core gallery with six chart types is fully operational |

**Critical gaps:** None  
**Major gaps:** None  
**Blockers:** None

---

## Future enhancements

- **Evidence Network Graph:** Interactive 3D agent correlation visualisation with conflict resolution indicators
- **Performance Radar Chart:** Multi-dimensional dataset comparison with overlaid metrics
- **Statistical Heatmap:** P-value significance matrix and effect size visualisation
- **Advanced MARAG Panel:** Expandable agent findings with evidence drill-down

---

## Documentation

| Document | Description |
|---|---|
| [Project Structure Guide](PROJECT_STRUCTURE_GUIDE.md) | Full directory tree |
| [PRD](docs/PRD.md) | Product requirements and technical specifications |
| [Quick Templates](docs/QUICK_TEMPLATES.md) | Ready-to-use prompts and template examples |
| [Testing Guide](docs/TESTING.md) | Testing strategies and coverage guidance |
| [Deployment Guide](docs/DEPLOYMENT.md) | Deployment options and environment configuration |

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| `npm install` fails | Node.js version too old | Upgrade to Node.js 18+ |
| Blank page on `npm run dev` | `.env` missing or misconfigured | Re-check all three `VITE_*` variables |
| Agents not responding | Invalid API key or region | Verify credentials in the Relevance AI dashboard |
| TypeScript errors | Stale `node_modules` | Delete `node_modules/` and re-run `npm install` |
| Port 5173 already in use | Another Vite server running | Run `npm run dev -- --port 5174` |
| `crypto` shim errors | Node version mismatch | Ensure Node.js 18+ and run `npx vite --force` |

---

## Acknowledgements

- **Project Supervisor:** Department of Computing & Technology, University of Bedfordshire
- **[Relevance AI](https://relevanceai.com):** Multi-agent workforce platform
- **[Preact Team](https://preactjs.com):** Lightweight React alternative
- **[Radix UI](https://www.radix-ui.com):** Accessible component primitives
- **Datasets:** Credit Card Fraud by MLG-ULB, PaySim, MomtSim (Kaggle)

---

## Repository

**GitHub:** [github.com/techgirldiaries/theia](https://github.com/techgirldiaries/theia)  
**Issues:** GitHub Issues  
**Discussions:** GitHub Discussions

---

## Licence

See [LICENSE.md](LICENSE.md) for full terms.
