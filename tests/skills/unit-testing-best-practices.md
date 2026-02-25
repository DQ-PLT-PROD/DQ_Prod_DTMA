# Unit Testing Best Practices

A reusable guide for writing effective, maintainable unit tests across all features.

---

## 1. Test Naming Conventions

Use descriptive names that clearly indicate what is being tested:

```
[functionName] should [expected behavior] when [condition]
```

**Examples:**
- `should return null when Supabase is not configured`
- `should clamp progress between 0 and 100`
- `should sync only completed lessons`

**Vitest Pattern:**
```typescript
describe('functionName', () => {
  it('should do X when Y', () => { ... });
});
```

---

## 2. Arrange-Act-Assert (AAA) Pattern

Structure every test in three clear phases:

```typescript
it('should calculate progress correctly', () => {
  // ARRANGE: Set up test data and mocks
  const userId = 'user-123';
  const courseSlug = 'intro-course';
  mockChain.single.mockResolvedValue({ data: { id: 'enroll-1' } });
  
  // ACT: Execute the function under test
  const result = await getActualProgressStats(userId, courseSlug);
  
  // ASSERT: Verify the expected outcome
  expect(result.progressPct).toBe(30);
});
```

---

## 3. Mocking & Stubbing (Vitest)

### Setup Mocks Before Imports
```typescript
vi.mock('../path/to/module', () => ({
  functionName: vi.fn(),
}));
```

### Create Chainable Mocks for Supabase
```typescript
const mockChain = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
};
mockSupabase.from.mockReturnValue(mockChain);
```

### Clear Mocks Between Tests
```typescript
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

---

## 4. Determinism & Isolation

- **One assertion focus per test** - Test a single behavior
- **No shared state** - Each test should be independent
- **Mock external dependencies** - Databases, APIs, file systems
- **Use fixed test data** - Avoid random values or `Date.now()`
- **Reset state in beforeEach** - Clean setup for every test

---

## 5. What to Test vs What Not to Test

### ✅ DO Test
- Public function behavior
- Edge cases (null, empty, max values)
- Error handling paths
- Business logic
- Return values and side effects

### ❌ DON'T Test
- Private implementation details
- Third-party library internals
- Simple getters/setters
- Framework-provided functionality

---

## 6. Coverage Strategy

| Target | Guideline |
|--------|-----------|
| Line Coverage | 70-80% minimum |
| Branch Coverage | Cover all if/else paths |
| Function Coverage | 100% of public functions |

**Don't game coverage:**
- Quality over quantity
- Focus on critical paths first
- Edge cases matter more than trivial lines

---

## 7. Test Data Management

### Use Factories/Helpers
```typescript
const createMockEnrollment = (overrides = {}) => ({
  id: 'enroll-1',
  user_id: 'user-123',
  course_slug: 'test-course',
  progress_pct: 0,
  ...overrides
});
```

### Keep Test Data Close to Tests
- Define in the test file or a shared `__fixtures__` folder
- Avoid large external data files

---

## 8. CI Alignment

| Principle | Implementation |
|-----------|----------------|
| Fast tests | Target < 10s for unit suite |
| Clear failures | Descriptive test names + error messages |
| Isolated runs | No dependency on order |
| Parallel safe | No shared global state |

### CI Commands
```bash
npm run test:run      # Single execution
npm run test:coverage # With coverage report
```

---

## 9. Reporting Standards

Every test report must include:

| Field | Required |
|-------|----------|
| Date/Time | ✅ |
| Branch/Commit | ✅ |
| Environment | ✅ |
| Pass/Fail counts | ✅ |
| Failure details | ✅ |
| Reproduction steps | ✅ |
| Evidence links | ✅ |

---

## 10. Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| Flaky tests | Avoid timing dependencies, mock everything external |
| Test interdependence | Use beforeEach to reset state |
| Over-mocking | Mock boundaries, not internals |
| Testing implementation | Test behavior, not how it's done |
| Ignoring edge cases | Cover nulls, empties, and limits |

---

## Quick Reference

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock setup BEFORE imports
vi.mock('../dependency', () => ({
  myFunction: vi.fn(),
}));

import { myFunction } from '../dependency';
import { functionUnderTest } from './myService';

describe('myService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle the happy path', async () => {
    // Arrange
    vi.mocked(myFunction).mockReturnValue('expected');
    
    // Act
    const result = await functionUnderTest();
    
    // Assert
    expect(result).toBe('expected');
    expect(myFunction).toHaveBeenCalledOnce();
  });
});
```
