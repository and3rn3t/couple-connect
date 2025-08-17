# Rollup Dependencies Fix

## Issue

GitHub Actions CI/CD pipeline was failing with the following error:

```bash
Error: Cannot find module @rollup/rollup-linux-x64-gnu. npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828). Please try `npm i` again after removing both package-lock.json and node_modules directory.
```

## Root Cause

This is a known issue with npm's handling of optional dependencies for platform-specific native binaries. Rollup requires platform-specific native binaries, and in CI environments (especially Linux), the correct binary might not be installed automatically.

## Solution Implemented

### 1. Fixed Script Extensions

- Renamed `scripts/fix-rollup-deps.js` → `scripts/fix-rollup-deps.cjs`
- Renamed `scripts/fix-rollup-quick.js` → `scripts/fix-rollup-quick.cjs`
- **Reason**: Project uses ES modules (`"type": "module"`), but these utility scripts use CommonJS

### 2. Added Pretest Hooks

Added automatic Rollup fix to all vitest-related commands:

```json
{
  "pretest": "node scripts/fix-rollup-quick.cjs",
  "pretest:unit": "node scripts/fix-rollup-quick.cjs",
  "pretest:integration": "node scripts/fix-rollup-quick.cjs",
  "pretest:run": "node scripts/fix-rollup-quick.cjs",
  "pretest:ui": "node scripts/fix-rollup-quick.cjs",
  "pretest:watch": "node scripts/fix-rollup-quick.cjs",
  "pretest:coverage": "node scripts/fix-rollup-quick.cjs"
}
```

### 3. How the Fix Works

#### Quick Fix (`fix-rollup-quick.cjs`)

1. Attempts to install `@rollup/rollup-linux-x64-gnu` directly
2. If that fails, clears npm cache and retries
3. Provides graceful fallback if installation fails

#### Comprehensive Fix (`fix-rollup-deps.cjs`)

1. Detects platform (`linux-x64`, `darwin-arm64`, etc.)
2. Maps to appropriate Rollup native package
3. Installs platform-specific binary
4. Falls back to full dependency reinstall if needed

## Commands Affected

All test-related commands now automatically run the fix:

- `npm test`
- `npm run test:unit`
- `npm run test:integration`
- `npm run test:run`
- `npm run test:coverage`
- `npm run test:ui`
- `npm run test:watch`

## Manual Fix Commands

If you need to run the fix manually:

- `npm run test:fix-deps` - Comprehensive fix
- `node scripts/fix-rollup-quick.cjs` - Quick fix

## CI/CD Impact

- Tests in GitHub Actions should now pass consistently
- No changes needed to workflow files
- Fix runs automatically before any vitest command

## References

- [npm optional dependencies bug](https://github.com/npm/cli/issues/4828)
- [Rollup native binaries documentation](https://rollupjs.org/)
