# Task File: Feature 01 - Learner Progress Unit Tests

## Execution Runbook

### Prerequisites

| Requirement | Value |
|-------------|-------|
| Node.js | v18+ recommended |
| Package Manager | npm |
| Environment | `.env` file configured with Supabase credentials |
| Working Directory | Project root |

### Environment Setup

```powershell
# Verify Node version
node --version

# Install dependencies (if needed)
npm install

# Verify test framework is available
npx vitest --version
```

---

## Execution Steps

### Step 1: Run Targeted Tests (Learner Progress Only)

```powershell
npm run test:run -- --testPathPattern="progressService"
```

**Expected Output:**
- All tests in `progressService.test.ts` should pass
- 7 test suites covering all progressService functions
- ~25 individual test cases

**Log Location:** Console output (capture to file if needed with `> output.log 2>&1`)

### Step 2: Run Full Test Suite

```powershell
npm run test:run
```

**Expected Output:**
- All project tests pass
- No regressions introduced

### Step 3: Run Tests with Coverage (Optional)

```powershell
npm run test:coverage
```

**Expected Output:**
- Coverage report generated
- `progressService.ts` should have high line/branch coverage

---

## Evidence Capture

### Capturing Test Output

```powershell
# Run tests and capture output
npm run test:run -- --testPathPattern="progressService" 2>&1 | Tee-Object -FilePath test-output.txt
```

### Capturing Screenshots
- Use Windows Snipping Tool or `Win + Shift + S`
- Save to `tests/reports/evidence/` folder

---

## Verification Steps

### ✅ Step 4: Lint Check (Required)

```powershell
npm run lint
```

**Expected:** No errors (warnings acceptable per repo config)

**Evidence:** Record output in test report

### ✅ Step 5: Build Check (Required)

```powershell
npm run build
```

**Expected:** Build succeeds with exit code 0

**Evidence:** Record output in test report

---

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| Tests hang | Check Supabase mock is properly configured |
| Import errors | Run `npm install` to ensure dependencies |
| Vitest not found | Run `npm install vitest` |
| Mock failures | Verify `vi.mock()` calls precede imports |

---

## Completion Checklist

- [ ] Targeted tests executed and passed
- [ ] Full test suite executed (no regressions)
- [ ] Lint check completed
- [ ] Build check completed
- [ ] Evidence captured for report
- [ ] Failures documented with reproduction steps
