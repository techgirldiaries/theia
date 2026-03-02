# Theia Super-Squad Fraud Intelligence

## MARAG Financial Fraud Detection System

A real-time fraud intelligence platform powered by AI agents. Built with Preact, Vite, and Relevance AI's workforce system.

## Features

- **AI-Powered Analysis** - Multi-agent workforce for comprehensive fraud detection
- **Real-time Processing** - Instant risk assessment and intelligence gathering
- **Risk Badging** - Visual risk indicators for quick decision-making
- **Interactive Interface** - Chat-based interaction with AI agents
- **Workflow Visualization** - Track agent operations in real-time

## Getting Started

### Setup

1. Clone this repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. The `.env` file with API credentials is included for assessment purposes

### Development

- `npm run dev` - Starts a dev server at <http://localhost:5173/>

- `npm run build` - Builds for production, emitting to `dist/`

- `npm run preview` - Starts a server at <http://localhost:4173/> to test production build locally

## Technology Stack

- **Frontend:** Preact with TypeScript
- **Styling:** Tailwind CSS 4.x with Radix UI components
- **Build Tool:** Vite
- **AI/ML:** Relevance AI SDK for multi-agent workforce
- **State Management:** Preact Signals

## Project Structure

```text
src/
├── components/        # UI components
│   ├── agent-message.tsx
│   ├── agent-workflow.tsx
│   ├── risk-badge.tsx
│   └── ...
├── prompt/           # AI agent configurations
└── shims/            # Polyfills and compatibility layers
```

shims/ # Polyfills and compatibility layers
