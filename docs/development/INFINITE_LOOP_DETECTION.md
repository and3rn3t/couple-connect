# 🔍 Infinite Re-render Loop Detection

This document explains the automated infinite re-render loop detection system implemented after the critical bug incident on August 16, 2025.

## 🚨 Background

On August 16, 2025, we experienced a critical infinite re-render loop that caused blank screens in production. The root cause was a `useEffect` with circular dependencies:

```typescript
// ❌ CAUSED INFINITE LOOP
useEffect(() => {
  if (!partnersInitialized && currentPartner && otherPartner) {
    setPartnersInitialized(true); // ← Triggers re-render
  }
  if (!partnersInitialized && (!currentPartner || !otherPartner)) {
    setCurrentPartner(defaultPartner); // ← Triggers re-render
    setOtherPartner(defaultPartner); // ← Triggers re-render
    setPartnersInitialized(true); // ← Triggers re-render
  }
}, [partnersInitialized, currentPartner, otherPartner]); // ← Circular!
```

## 🛠️ Detection Scripts

### Node.js Script: `scripts/check-infinite-loops.js`

**Usage:**

```bash
# Check for infinite loop patterns
npm run check:infinite-loops

# Run directly
node scripts/check-infinite-loops.js
```

**Features:**

- Scans all React files (`.tsx`, `.jsx`, `.ts`, `.js`)
- Detects `useEffect` with circular dependencies
- Identifies missing dependency arrays with state setters
- Warns about function dependencies that might cause re-renders
- Provides specific fix suggestions

### PowerShell Script: `scripts/check-infinite-loops.ps1`

**Usage:**

```powershell
# Check for infinite loop patterns (PowerShell)
npm run check:infinite-loops:ps

# Run directly
pwsh scripts/check-infinite-loops.ps1

# With verbose output
pwsh scripts/check-infinite-loops.ps1 -Verbose
```

**Features:**

- Cross-platform PowerShell compatibility
- Color-coded output for better readability
- Same detection patterns as Node.js script
- Windows-friendly execution

## 🔍 Detection Patterns

### Critical Issues (Block Deployment)

1. **State Setter in Dependencies**

   ```typescript
   // ❌ CRITICAL: setState in dependency array
   useEffect(() => {
     setCount(count + 1);
   }, [count, setCount]); // setCount shouldn't be in deps
   ```

2. **Missing Dependency Array with State Setters**

   ```typescript
   // ❌ CRITICAL: No dependency array with state setters
   useEffect(() => {
     setData(newData);
   }); // Missing dependency array
   ```

3. **Circular State Dependencies**

   ```typescript
   // ❌ CRITICAL: State modified in effect is in dependencies
   useEffect(() => {
     if (!isInitialized) {
       setIsInitialized(true);
     }
   }, [isInitialized]); // Circular dependency
   ```

### Warnings (Performance Issues)

1. **Function Dependencies**

   ```typescript
   // ⚠️ WARNING: Function dependency might cause re-renders
   useEffect(() => {
     handleUpdate();
   }, [handleUpdate]); // Should be wrapped in useCallback
   ```

2. **Conditional State Updates Without Dependencies**

   ```typescript
   // ⚠️ WARNING: Conditional updates without proper deps
   useEffect(() => {
     if (user && !profile) {
       setProfile(user.profile);
     }
   }); // Missing dependency array
   ```

## ✅ Recommended Patterns

### One-time Initialization

```typescript
// ✅ CORRECT: Empty dependency array for initialization
useEffect(() => {
  if (partnersInitialized) return;

  setCurrentPartner(defaultPartner);
  setOtherPartner(defaultPartner);
  setPartnersInitialized(true);
}, []); // Runs only once
```

### Reactive Updates

```typescript
// ✅ CORRECT: Only external dependencies
useEffect(() => {
  if (user && !userProfile) {
    fetchUserProfile(user.id);
  }
}, [user, userProfile]); // OK - not setting user or userProfile
```

### Function Dependencies

```typescript
// ✅ CORRECT: useCallback for function dependencies
const handleUpdate = useCallback(() => {
  // Update logic
}, [dependency]);

useEffect(() => {
  handleUpdate();
}, [handleUpdate]); // Safe with useCallback
```

## 🚀 CI/CD Integration

The infinite loop check is automatically integrated into:

### Build Process

- **`npm run build`** - Includes infinite loop check before building
- **`npm run build:safe`** - Full safety check including type-check and infinite loops
- **`npm run deploy`** - Includes infinite loop check before deployment
- **`npm run deploy:safe`** - Full safety check before deployment

### CI/CD Pipeline

- **Quality Checks**: Parallel execution with lint, type-check, and format:check
- **Build Step**: Dedicated infinite loop check before building
- **Blocks Deployment**: Critical issues prevent deployment

### GitHub Actions Integration

```yaml
- name: 🔍 Check for infinite re-render loops
  run: |
    echo "🔍 Scanning for infinite re-render loop patterns..."
    npm run check:infinite-loops
    echo "✅ No infinite loop patterns detected"
```

## 📊 Output Examples

### Clean Codebase

```typescript
🔍 Scanning for infinite re-render loop patterns...
📁 Scanning directory: src
📊 Scan Complete: 45 files scanned
============================================================
✅ No infinite re-render patterns detected!
```

### Issues Found

```typescript
🔍 Scanning for infinite re-render loop patterns...
📁 Scanning directory: src
📊 Scan Complete: 45 files scanned
============================================================

🚨 CRITICAL ISSUES FOUND: 1
These patterns are likely to cause infinite re-render loops:

1. 📁 src/App.tsx:25-35
   ❌ Potential infinite loop: setPartnersInitialized modifies state that's in dependency array
   💡 Remove the state from dependencies or use empty array [] for one-time effects

⚠️  WARNINGS: 2
These patterns might cause performance issues:

1. 📁 src/hooks/useData.ts:15-20
   ⚠️  Function dependency "fetchData" might cause re-renders
   💡 Consider wrapping in useCallback or removing from dependencies if not needed

============================================================
📊 SUMMARY:
   Files scanned: 45
   Critical issues: 1
   Warnings: 2

❌ DEPLOYMENT BLOCKED: Critical infinite loop patterns detected!
   Fix these issues before deploying to prevent blank screens.
```

## 🔧 Manual Usage

### Check Before Committing

```bash
# Quick check before commit
npm run check:infinite-loops

# Full quality check
npm run quality:check
```

### Fix Common Issues

```bash
# Check and see specific issues
npm run check:infinite-loops

# Fix ESLint issues (often related)
npm run lint:fix

# Check again after fixes
npm run check:infinite-loops
```

### Integration with IDE

Add to VS Code tasks (`.vscode/tasks.json`):

```json
{
  "label": "Check Infinite Loops",
  "type": "npm",
  "script": "check:infinite-loops",
  "group": "test",
  "presentation": {
    "echo": true,
    "reveal": "always",
    "focus": false,
    "panel": "shared"
  }
}
```

## 🎯 Exit Codes

- **0**: No critical issues found (safe to deploy)
- **1**: Critical issues found (deployment blocked)

## 📈 Benefits

1. **Prevents Production Bugs**: Catches infinite loops before deployment
2. **Early Detection**: Finds issues during development, not in production
3. **Automated Protection**: No manual checking required
4. **Educational**: Provides fix suggestions and patterns to avoid
5. **CI/CD Integration**: Seamlessly integrates into existing workflows
6. **Fast Execution**: Typical scan takes <2 seconds for most codebases

## 🔄 Maintenance

### Updating Detection Patterns

To add new patterns, edit `scripts/check-infinite-loops.js`:

1. Add pattern detection in `analyzeUseEffect()`
2. Add test cases for new patterns
3. Update documentation with examples
4. Test against known good/bad code

### Performance Optimization

- **File Filtering**: Only scans React files
- **Directory Skipping**: Ignores node_modules, dist, etc.
- **Pattern Matching**: Uses efficient regex patterns
- **Early Exit**: Stops processing when critical issues found

---

**Remember**: This system is your safety net against the August 16, 2025 infinite loop incident. Trust it, use it, and keep your deployments safe! 🛡️✨
