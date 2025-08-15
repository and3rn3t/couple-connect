# 🔧 Linting and Code Quality Configuration

## 📋 Unified Configuration Overview

This document ensures that the GitHub Actions CI/CD pipeline and local IDE environment use **identical** linting, formatting, and type-checking configurations.

## 🎯 Commands for Different Environments

### Development (Local IDE)

```bash
# Regular development linting (allows warnings)
npm run lint                # ESLint with max 50 warnings
npm run lint:fix            # Auto-fix ESLint issues
npm run format              # Auto-format with Prettier
npm run type-check          # TypeScript type checking
```

### CI/CD Pipeline (GitHub Actions)

```bash
# Strict CI linting (no warnings allowed)
npm run lint:ci             # ESLint with 0 warnings, stylish format
npm run type-check:ci       # TypeScript with detailed output
npm run format:check        # Prettier validation (no changes)
npm run quality:check       # All CI checks combined
```

### Pre-commit Validation

```bash
npm run test:ci             # Full quality check before commit
npm run precommit           # Quick pre-commit validation
```

## ⚙️ Configuration Files

### ESLint Configuration (`eslint.config.js`)

- **Extends**: TypeScript ESLint recommended + Prettier integration
- **Files**: `src/**/*.{ts,tsx}`, `*.{ts,tsx}`, `scripts/**/*.js`
- **Max Warnings**: 50 (dev) / 0 (CI)
- **Format**: Default (dev) / Stylish (CI)

### TypeScript Configuration (`tsconfig.json`)

- **Target**: ES2020
- **Module**: ESNext
- **Strict Mode**: Enabled
- **Include**: `src`, `vite.config.ts`, `scripts/**/*.js`
- **Types**: `node`, `vite/client`

### Prettier Configuration (`.prettierrc`)

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### VS Code Settings (`.vscode/settings.json`)

- **Default Formatter**: Prettier
- **Format on Save**: Enabled
- **ESLint Auto-fix**: On save
- **Flat Config**: Enabled for ESLint 9+

## 🔄 GitHub Actions Integration

The CI pipeline runs these exact commands:

```yaml
# Quality checks matrix (parallel execution)
- lint:ci # ESLint with zero warnings
- type-check:ci # TypeScript with file listing
- format:check # Prettier validation
```

## 🛠️ Key Differences: Dev vs CI

| Aspect                | Development      | CI/CD                   |
| --------------------- | ---------------- | ----------------------- |
| **ESLint Warnings**   | Max 50           | Max 0 (strict)          |
| **TypeScript Output** | Pretty format    | Detailed with file list |
| **Prettier**          | Auto-fix on save | Validation only         |
| **Error Tolerance**   | Warnings allowed | Fail on any warning     |

## ✅ Validation Commands

Test that your local environment matches CI:

```bash
# Run the exact same checks as CI
npm run quality:check

# Individual CI checks
npm run lint:ci
npm run type-check:ci
npm run format:check
```

## 🎯 Consistency Guarantees

1. **Same ESLint Rules**: Both environments use `eslint.config.js`
2. **Same TypeScript Config**: Both use `tsconfig.json` settings
3. **Same Prettier Rules**: Both use `.prettierrc` configuration
4. **Same File Scope**: Both lint the same file patterns
5. **Same Dependencies**: Both use identical package versions

## 🔧 Troubleshooting

If you see differences between local and CI:

1. **Run CI commands locally**:

   ```bash
   npm run quality:check
   ```

2. **Check for configuration drift**:

   ```bash
   npm run lint:ci          # Should match CI results
   npm run type-check:ci    # Should match CI results
   ```

3. **Verify dependencies are in sync**:

   ```bash
   npm ci --prefer-offline
   ```

4. **Restart TypeScript/ESLint language servers** in your IDE

## 📊 Current Quality Status

Run `npm run quality:check` to see the current status:

- ESLint issues will be reported with zero tolerance
- TypeScript errors will be shown with full context
- Prettier formatting issues will be identified

This ensures **100% consistency** between your local development environment and the CI/CD pipeline! 🎉
