# Testing Guide for THEIA

## Test Structure

Tests are organised in the `src/test/` and `src/hooks/` directories using Vitest framework.

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test useMediaQuery.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Test Types

### Unit Tests

- **Location:** `src/test/` and `src/hooks/`
- **Coverage:** Component logic, hooks, utilities
- **Files:** `*.test.ts`, `*.test.tsx`
- Examples: `useMediaQuery.test.ts`, `footer-security.test.tsx`

### Integration Tests

- **Coverage:** Component interactions, data flow, signal state management
- **Focus:** Authentication flows, fraud report analysis, dashboard updates

### E2E Tests (Future)

- **Framework:** Playwright/Cypress
- **Scenarios:** User registration → fraud case creation → report generation

## Key Test Areas

### 1. Components

- Render without errors
- Accept required props
- Handle edge cases (empty data, errors, loading states)
- Responsive behaviour across breakpoints
- Accessibility compliance

### 2. Hooks

- State updates correctly
- Dependencies tracked properly
- Memory cleanup on unmount
- Example: `useMediaQuery` responsive detection

### 3. Signal State Management

- State mutations through `signals/actions.ts`
- Persistence via `signals/storage.ts`
- Signal effects trigger correctly

### 4. Security

- Authentication gates work
- Sensitive data not exposed in DOM
- CSRF protection active
- Example: `footer-security.test.tsx`

### 5. Responsive Layout

- Breakpoint detection accurate
- Layout adapts at each breakpoint
- Mobile-first approach validated
- Example: `responsive-layout.test.tsx`

## Test Data

Mock data located in `src/test-data/enhanced-fraud-report-sample.json` for:

- Fraud report structure testing
- Dashboard component validation
- Analytics calculation verification

## Performance Testing

- Monitor component render times
- Track signal update latency
- Validate streaming data handling performance
- Real-time update responsiveness

## Coverage Goals

- **Minimum:** 80% coverage for critical paths
- **Target:** 90%+ for security-related code
- **Priority:** Authentication, fraud analysis, reporting

## CI/CD Integration

Tests run automatically on:

- Push to feature branches
- Pull requests to main/nala
- Pre-deployment validation

## Debugging Tests

```bash
# Debug specific test
npm test -- --inspect-brk useMediaQuery.test.ts

# Generate coverage report
npm test -- --coverage --reporter=html
```

See `src/test/setup.ts` for test environment configuration.
