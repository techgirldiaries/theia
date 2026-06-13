# Testing Guide

**See also:** [PROJECT_STRUCTURE_GUIDE.md](../PROJECT_STRUCTURE_GUIDE.md) for test file organisation and [CODEBASE_QUALITY.md](../CODEBASE_QUALITY.md) for quality standards.

This guide describes how tests are structured, how they are run, and what each category of test is responsible for. It is intended to be read top to bottom, though each section can also be used as a standalone reference.

---

## Test Structure

Tests are organised into two directories: `src/test/` and `src/hooks/`. The Vitest framework is used throughout. Test files follow the naming convention `*.test.ts` or `*.test.tsx`, and the test environment is configured in `src/test/setup.ts`.

With the structure understood, the following section covers how tests are executed.

---

## Running Tests

The commands below are used to run the test suite in different modes.

```bash
# Run all tests
npm test

# Run a specific test file
npm test useMediaQuery.test.ts

# Run with coverage reporting
npm test -- --coverage

# Run in watch mode during development
npm test -- --watch
```

Each command produces output in the terminal. Coverage reports are written to the `coverage/` directory when the `--coverage` flag is used. To view coverage as an HTML report, the command below is used instead.

```bash
npm test -- --coverage --reporter=html
```

Where a test needs to be debugged individually, the following command attaches a debugger to the specified file.

```bash
npm test -- --inspect-brk useMediaQuery.test.ts
```

With the test suite running, the types of tests included are described in the section below.

---

## Test Types

### Unit Tests

Unit tests are located in `src/test/` and `src/hooks/`. They cover component logic, custom hooks and utility functions. Examples of existing unit test files include `useMediaQuery.test.ts` and `footer-security.test.tsx`.

### Integration Tests

Integration tests cover interactions between components, data flow across the application and signal-based state management. The main areas of focus are authentication flows, fraud report analysis, and dashboard update behaviour.

### End-to-End Tests (Planned)

End-to-end testing is planned for a future release. The intended framework is Playwright or Cypress. Scenarios to be covered include user registration, fraud case creation and report generation as a complete user journey.

The following section describes what each test area verifies in more detail.

---

## Key Test Areas

### Components

Component tests verify that each component renders without errors, accepts its required properties, and handles edge cases such as empty data, error states and loading states. Responsive behaviour across breakpoints and accessibility compliance are also validated at the component level.

### Hooks

Hook tests verify that state is updated correctly, that dependencies are tracked as expected and that memory is cleaned up on component unmount. The `useMediaQuery` hook, which handles responsive breakpoint detection, is an example of a hook covered by this test category.

### Signal State Management

Signal state tests verify that state mutations are applied correctly through `signals/actions.ts`, that state persistence works as expected via `signals/storage.ts`, and that signal effects are triggered at the right time.

### Security

Security tests verify that authentication gates are enforced, that sensitive data is not exposed in the DOM and that CSRF protection is active. The file `footer-security.test.tsx` is an example of a test in this category.

### Responsive Layout

Responsive layout tests verify that breakpoint detection is accurate, that the layout adapts correctly at each breakpoint and that the mobile-first approach is maintained throughout the application. The file `responsive-layout.test.tsx` covers this area.

These test areas are supported by a set of shared mock data, described in the section below.

---

## Test Data

Mock data is located at `src/test-data/enhanced-fraud-report-sample.json`. This file is used for three purposes: testing the fraud report data structure, validating dashboard component rendering, and verifying analytics calculations. No real transaction data is used in the test suite.

---

## Performance Testing

Performance is monitored across four areas: component render times, signal update latency, streaming data handling and real-time update responsiveness. These measures are tracked to identify regressions before they reach production.

---

## Coverage Goals

The following coverage targets are set for the test suite.

| Area | Target |
|---|---|
| Critical paths (minimum) | 80% |
| Security-related code | 90% or above |
| Priority areas | Authentication, fraud analysis, reporting |

Coverage is not treated as the sole measure of quality. Tests that exercise the most consequential paths in the system are given higher priority than tests that simply increase the coverage percentage.

---

## CI/CD Integration

Tests are run automatically as part of the CI/CD pipeline in three situations: when code is pushed to a feature branch, when a pull request is opened against the main or nala branch and as part of pre-deployment validation. A failed test at any of these stages blocks the pipeline until the issue is resolved.
