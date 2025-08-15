# Testing Guide for Couple Connect

This document provides a comprehensive guide to the testing setup and practices for the Couple Connect application.

## Testing Stack

### Unit & Integration Testing

- **Vitest**: Modern test runner with excellent Vite integration
- **React Testing Library**: Component testing utilities focused on user behavior
- **Happy DOM**: Lightweight DOM implementation for faster tests
- **@testing-library/user-event**: Utilities for simulating user interactions

### End-to-End Testing

- **Playwright**: Cross-browser testing framework
- **Multiple browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari

### Coverage

- **v8**: Fast and accurate code coverage
- **HTML reports**: Visual coverage reports
- **Thresholds**: Minimum 70% coverage required

## Project Structure

```
src/
├── test/
│   ├── setup.ts              # Test environment setup
│   ├── mocks.ts               # Mock data and utilities
│   └── test-utils.tsx         # React testing utilities
├── components/
│   └── __tests__/             # Component tests
├── hooks/
│   └── __tests__/             # Hook tests
├── utils/
│   └── __tests__/             # Utility function tests
└── services/
    └── __tests__/             # Service tests
e2e/
├── app.spec.ts                # Basic app functionality
└── features.spec.ts           # Feature-specific tests
```

## Running Tests

### Unit Tests

```bash
# Run tests in watch mode (development)
npm test

# Run tests once with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

# Run specific test file
npm test -- useKV.test.ts
```

### End-to-End Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug

# Run E2E tests for specific browser
npx playwright test --project=chromium
```

### All Tests

```bash
# Run all tests (unit + E2E)
npm run test:all

# Run CI pipeline locally
npm run test:ci
```

## Writing Tests

### Unit Tests

#### Testing Utilities

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import { createTestUser, mockDb } from '../../test/mocks';

describe('MyComponent', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

#### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react';
import { useKV } from '../useKV';

describe('useKV', () => {
  it('should store and retrieve values', () => {
    const { result } = renderHook(() => useKV('test-key', 'default'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
  });
});
```

#### Testing Components with Providers

```typescript
import { render } from '../../test/test-utils'; // Already includes providers

describe('ComponentWithQueries', () => {
  it('should handle loading states', () => {
    render(<ComponentWithQueries />);
    // Test will have access to QueryClient and ThemeProvider
  });
});
```

### E2E Tests

#### Basic Page Testing

```typescript
import { test, expect } from '@playwright/test';

test('should load homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Couple Connect/);
});
```

#### Testing User Interactions

```typescript
test('should create new issue', async ({ page }) => {
  await page.goto('/');

  // Fill form
  await page.fill('input[name="title"]', 'Test Issue');
  await page.click('button:has-text("Save")');

  // Verify result
  await expect(page.locator('text=Test Issue')).toBeVisible();
});
```

#### Mobile Testing

```typescript
test('should work on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  // Mobile-specific tests
});
```

## Test Data & Mocking

### Mock Database

```typescript
import { mockDb, createTestUser } from '../../test/mocks';

// Use factory functions for consistent test data
const user = createTestUser({ name: 'Alice' });

// Mock database operations
mockDb.createUser.mockResolvedValue(user);
```

### LocalStorage Mocking

```typescript
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('test-key', JSON.stringify(testData));
});
```

### Service Worker Mocking

```typescript
vi.mock('../hooks/useServiceWorker', () => ({
  useServiceWorker: () => ({
    isOffline: false,
    updateAvailable: false,
    // ... other properties
  }),
}));
```

## Best Practices

### Unit Tests

1. **Test behavior, not implementation** - Focus on what the component does, not how
2. **Use descriptive test names** - `should display error when API fails`
3. **Keep tests isolated** - Each test should be independent
4. **Mock external dependencies** - Database, APIs, localStorage
5. **Test edge cases** - Empty states, error conditions, loading states

### E2E Tests

1. **Test critical user journeys** - Main app workflows
2. **Use data-testid for reliability** - Avoid brittle CSS selectors
3. **Test on multiple browsers** - Ensure cross-browser compatibility
4. **Keep tests independent** - Clean state between tests
5. **Test responsive behavior** - Desktop and mobile viewports

### Performance

1. **Use vi.mock() for heavy dependencies** - Speed up test execution
2. **Avoid testing implementation details** - Focus on user-visible behavior
3. **Use parallel execution** - Tests run in parallel by default
4. **Clean up after tests** - Prevent memory leaks

## Coverage Goals

- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

## Continuous Integration

The CI pipeline runs:

1. **Linting** - ESLint with zero warnings policy
2. **Type checking** - TypeScript compilation
3. **Unit tests** - With coverage reporting
4. **E2E tests** - Cross-browser testing
5. **Build verification** - Ensure app builds successfully

## Debugging Tests

### Unit Tests

```bash
# Run specific test in debug mode
npm test -- --reporter=verbose useKV.test.ts

# Open Vitest UI for interactive debugging
npm run test:ui
```

### E2E Tests

```bash
# Run in headed mode to see browser
npx playwright test --headed

# Debug specific test
npx playwright test --debug features.spec.ts

# Record new tests
npx playwright codegen localhost:5173
```

## Common Patterns

### Testing Async Operations

```typescript
it('should handle async operations', async () => {
  render(<AsyncComponent />);

  // Wait for loading to finish
  await waitFor(() => {
    expect(screen.queryByText('Loading')).not.toBeInTheDocument();
  });

  expect(screen.getByText('Data loaded')).toBeInTheDocument();
});
```

### Testing Error Boundaries

```typescript
it('should display error fallback', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
});
```

### Testing Forms

```typescript
it('should validate form inputs', async () => {
  render(<ContactForm />);

  const emailInput = screen.getByLabelText(/email/i);
  const submitButton = screen.getByRole('button', { name: /submit/i });

  // Test validation
  await user.type(emailInput, 'invalid-email');
  await user.click(submitButton);

  expect(screen.getByText(/valid email required/i)).toBeInTheDocument();
});
```

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Check for unresolved promises
   - Increase timeout in test config
   - Mock slow operations

2. **Mock not working**
   - Ensure mock is defined before import
   - Check mock path is correct
   - Use `vi.clearAllMocks()` in beforeEach

3. **E2E tests flaky**
   - Add proper waits (`page.waitForSelector`)
   - Use data-testid attributes
   - Avoid hard-coded delays

4. **Coverage not updating**
   - Check file patterns in vitest.config.ts
   - Ensure files are actually being tested
   - Clear cache: `rm -rf node_modules/.vite`

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
