// Re-exports everything so all existing imports across the codebase work unchanged.
export * from "./signals/types";
export * from "./signals/state";
export * from "./signals/actions";
// Import effects module for its side effects (connection, persistence, etc.)
import "./signals/effects";