# 🤖 GitHub Copilot Instructions for Couple Connect

This file provides specific guidance for GitHub Copilot to assist with the Couple Connect project development.

## 🎯 Project Context

**Project**: Couple Connect - A React-based relationship management application
**Tech Stack**## 📱 Current Performance Status (Updated: Aug 16, 2025 - Post-Cleanup)

### Performance Metrics

- **Bundle Size**: 1.7 MB (Target: 1.5 MB) - ❌ 113% of target (+0.1MB increase)
- **JavaScript**: 1.24 MB (Target: 800 KB) - ❌ 155% of target (stable)
- **CSS**: 455.3 KB (Target: 250 KB) - ❌ 182% of target (+40KB increase)
- **Mobile Components**: 39% (Target: 80%) - 🎯 Improved from 23%
- **Infinite Loop Issues**: 0 critical, 78 warnings - ✅ Safe to deploy

### Critical Issues to Address

1. **Large JavaScript chunk (606.65 KB)** - chunk-BYlyF5jk.js (unchanged, needs investigation)
2. **CSS bundle growth (+40KB)** - 455.3KB, implement aggressive purging and critical CSS
3. **Mobile component coverage (39%)** - convert remaining components to mobile-optimized versions
4. **Bundle configuration** - improve vendor library chunking (0 vendor chunks detected)
5. **Code quality warnings** - 78 performance-related warnings to addresseScript, Vite, Tailwind CSS, Radix UI
   **Focus**: Mobile-first design with performance optimization
   **Current Priority**: Bundle optimization and mobile component coverage

## � Critical Bug Fixes & Lessons Learned

### 💥 Infinite Re-render Loop Fix (August 16, 2025)

**⚠️ NEVER FORGET THIS LESSON!** We had a critical infinite re-render loop that caused blank screens:

#### 🐛 The Problem

```typescript
// ❌ THIS CAUSES INFINITE LOOPS - DO NOT DO THIS!
useEffect(() => {
  if (!partnersInitialized && currentPartner && otherPartner) {
    setPartnersInitialized(true); // ← This triggers the effect again!
  }
  if (!partnersInitialized && (!currentPartner || !otherPartner)) {
    setCurrentPartner(defaultPartner); // ← This triggers the effect again!
    setOtherPartner(defaultPartner); // ← This triggers the effect again!
    setPartnersInitialized(true); // ← This triggers the effect again!
  }
}, [partnersInitialized, currentPartner, otherPartner]); // ← Circular dependency!
```

#### ✅ The Solution

```typescript
// ✅ CORRECT - Empty dependency array for one-time initialization
useEffect(() => {
  // Only run this effect once
  if (partnersInitialized) return;

  // Handle initialization logic...
  setCurrentPartner(defaultPartner);
  setOtherPartner(defaultPartner);
  setPartnersInitialized(true);
}, []); // ← Empty array = runs only once on mount
```

#### 🔍 How to Spot This Bug

- **Symptoms**: Blank screen, app never loads, infinite console logs
- **Cause**: useEffect dependencies include state that the effect modifies
- **Detection**: Look for useEffect that sets state included in its dependency array

#### 🛡️ Prevention Rules

1. **Initialization effects should usually have empty dependency arrays** `[]`
2. **Never include state in dependencies that the effect modifies** (unless you want infinite loops!)
3. **Use separate effects** for initialization vs. reactive updates
4. **Add early returns** to prevent unnecessary state updates
5. **Test thoroughly** after any useEffect dependency changes

#### 🎯 When to Use Different Dependency Patterns

```typescript
// ✅ One-time initialization
useEffect(() => {
  initializeApp();
}, []); // Empty array

// ✅ Reactive to external changes only
useEffect(() => {
  updateUI();
}, [externalProp]); // Only external dependencies

// ✅ Derived state updates
useEffect(() => {
  if (user && !userProfile) {
    fetchUserProfile(user.id);
  }
}, [user, userProfile]); // OK if we're not setting user or userProfile in this effect
```

**This bug cost us debugging time and could have been prevented with proper useEffect patterns! 🚨💔**

### 🤖 Automated Infinite Loop Detection System

**We now have automated protection!** After the August 16 incident, we implemented a comprehensive detection system:

#### 🔍 Detection Scripts

```bash
# Check for infinite loop patterns before deployment
npm run check:infinite-loops        # Strict mode - blocks deployment
npm run check:infinite-loops:warn   # Warning mode - continues with awareness
npm run build:safe                  # Full safety check before building
npm run deploy:safe                 # Complete safety validation before deployment
```

#### 🛡️ Automated Protection Features

- **Real-time Detection**: Scans all React files for dangerous patterns
- **CI/CD Integration**: Prevents bad code from reaching production
- **Specific Guidance**: Provides exact file locations and fix suggestions
- **Educational Feedback**: Teaches developers what patterns to avoid
- **Exit Code Protection**: Blocks deployment when critical issues found

#### 📊 What It Detects

1. **Missing dependency arrays** with state setters
2. **State setters in dependency arrays** (exact August 16 pattern)
3. **Circular state dependencies**
4. **Function dependencies** that might cause re-renders
5. **useState outside component functions**

#### 🎯 Development Workflow Integration

- **Development builds**: Use warning mode for faster iteration
- **Production deploys**: Use strict mode for maximum safety
- **CI/CD pipeline**: Automatically runs on every push/PR
- **Pre-commit hooks**: Can be added for early detection

**The detection system found 32 critical issues in our codebase that could have caused infinite loops! 🚨**

### 🧹 Post-Cleanup Analysis (August 16, 2025)

**Great news!** After running comprehensive cleanup and detection:

- **✅ Zero critical infinite loop issues** - All dangerous patterns eliminated
- **⚠️ 78 performance warnings remain** - These are optimization opportunities, not blockers
- **🎯 Mobile component coverage improved** - From 23% to 39% (16% increase!)
- **📊 Bundle analysis reveals** - CSS bundle grew by 40KB, needs aggressive purging
- **🔍 Code quality scan** - 166 files scanned, no deployment-blocking issues

#### 🎯 Key Cleanup Achievements

1. **Safety First**: All critical infinite loop patterns eliminated
2. **Mobile Progress**: Significant improvement in mobile component coverage
3. **Code Quality**: Comprehensive scan shows healthy codebase structure
4. **Documentation**: Updated all status files with current metrics

#### ⚠️ New Concerns Identified

1. **CSS Bundle Growth**: +40KB increase to 455.3KB (was 415KB)
2. **No Vendor Chunks**: Bundle analysis shows 0 vendor chunks (optimization opportunity)
3. **Large Chunk Persistence**: 606.65KB chunk unchanged despite cleanup
4. **Warning Backlog**: 78 performance warnings need systematic addressing

#### 📝 Lessons Learned from Cleanup

- **Regular cleanup is essential** - Prevents accumulation of technical debt
- **Automated detection works** - Infinite loop detection caught potential issues
- **Bundle monitoring needed** - CSS growth went unnoticed without regular checks
- **Mobile progress tracking** - Component coverage metrics show real improvement

### 🧠 How to Avoid Infinite Loops When Writing Code

#### 🎯 Mental Model: "What triggers this effect?"

Before writing any `useEffect`, ask yourself:

1. **When should this run?** (Once? On specific changes? Every render?)
2. **What data does it depend on?** (Props? State? External values?)
3. **What does it modify?** (State? External systems? Nothing?)
4. **Could what it modifies trigger it again?** (This is the danger zone!)

#### ✅ Safe Patterns to Use

```typescript
// ✅ PATTERN 1: One-time initialization
useEffect(() => {
  // Setup that should happen once
  initializeApp();
  setupEventListeners();
}, []); // Empty array = once on mount

// ✅ PATTERN 2: Reactive to props/external state only
useEffect(() => {
  if (userId) {
    fetchUserData(userId);
  }
}, [userId]); // Only depends on external prop

// ✅ PATTERN 3: Derived state with proper conditions
useEffect(() => {
  if (data && !processedData) {
    setProcessedData(processData(data));
  }
}, [data, processedData]); // Safe because we check !processedData

// ✅ PATTERN 4: Cleanup effects
useEffect(() => {
  const subscription = subscribeTo(something);
  return () => subscription.unsubscribe();
}, [something]); // Cleanup prevents leaks
```

#### ❌ Dangerous Patterns to Avoid

```typescript
// ❌ NEVER: State setter in dependencies
useEffect(() => {
  if (condition) {
    setCount(count + 1);
  }
}, [count, setCount]); // setCount triggers re-run!

// ❌ NEVER: Modifying state that's in dependencies
useEffect(() => {
  if (!initialized) {
    setInitialized(true);
  }
}, [initialized]); // Circular dependency!

// ❌ NEVER: Missing dependencies with state setters
useEffect(() => {
  setData(computeData());
}); // Runs on every render!

// ❌ NEVER: Complex state updates without thinking
useEffect(() => {
  setA(valueA);
  setB(valueB);
  setC(valueC);
}, [valueA, valueB, valueC]); // Potential cascade
```

#### 🧪 Quick Self-Test Questions

Before writing any `useEffect`, ask:

1. **"Am I setting state that's also in my dependency array?"** → ❌ Don't do this
2. **"Do I want this to run on every render?"** → If no, add `[]` or specific deps
3. **"Could this effect trigger itself?"** → If yes, redesign it
4. **"Am I initializing something?"** → Use `[]` dependencies
5. **"Am I responding to external changes?"** → Only include external deps

#### 🎯 Development Habits to Build

```typescript
// ✅ HABIT 1: Start with empty dependencies for initialization
useEffect(() => {
  // Think: "This should run once"
  doInitialization();
}, []); // Start here, add deps only if needed

// ✅ HABIT 2: Use early returns to prevent unnecessary updates
useEffect(() => {
  if (alreadyProcessed) return; // Exit early

  // Do the work
  setProcessed(true);
}, [dependency]);

// ✅ HABIT 3: Separate concerns into different effects
useEffect(() => {
  // Initialization only
}, []);

useEffect(() => {
  // Reactive updates only
}, [externalDep]);

// ✅ HABIT 4: Use useCallback for function dependencies
const handleUpdate = useCallback(() => {
  // Update logic
}, [dependency]);

useEffect(() => {
  handleUpdate();
}, [handleUpdate]); // Safe with useCallback
```

#### 🔄 Refactoring Anti-Patterns

```typescript
// ❌ BEFORE: Dangerous pattern
useEffect(() => {
  if (!data && shouldFetch) {
    fetchData().then((result) => {
      setData(result);
      setShouldFetch(false);
    });
  }
}, [data, shouldFetch]); // Modifies shouldFetch!

// ✅ AFTER: Safe pattern
useEffect(() => {
  if (!data && shouldFetch) {
    fetchData().then((result) => {
      setData(result);
      // Don't modify shouldFetch here
    });
  }
}, [shouldFetch]); // Only external trigger

// Separate effect for cleanup
useEffect(() => {
  if (data && shouldFetch) {
    setShouldFetch(false);
  }
}, [data, shouldFetch]); // Safe because it doesn't cause fetch
```

#### 🎓 Learning Resources

- **ESLint Rule**: `react-hooks/exhaustive-deps` helps catch some issues
- **React DevTools**: Shows effect dependencies and when they fire
- **Detection Script**: `npm run check:infinite-loops` catches patterns
- **Mental Model**: Think "what triggers this?" before writing effects

**Remember: The goal is to write effects that are predictable and don't surprise you! 🎯**

## �📱 Current Performance Status (Updated: Aug 16, 2025)

### Performance Metrics

- **Bundle Size**: 1.6 MB (Target: 1.5 MB) - ❌ 107% of target
- **JavaScript**: 1.18 MB (Target: 800 KB) - ❌ 148% of target
- **CSS**: 415 KB (Target: 250 KB) - ❌ 166% of target
- **Mobile Components**: 23% (Target: 80%) - ❌ Major improvement needed

### Critical Issues to Address

1. **Large JavaScript chunk (606 KB)** - chunk-zxUleISs.js needs investigation
2. **CSS bundle size (415 KB)** - implement aggressive purging and critical CSS
3. **Mobile component coverage (23%)** - convert existing components to mobile-optimized versions
4. **Bundle configuration** - improve vendor library chunking

## 🔧 Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled, avoid `any` types
- **React**: Functional components with hooks, React 19 patterns
  - ⚠️ **CRITICAL**: Always check useEffect dependencies for circular loops! See infinite re-render fix above.
  - Use empty dependency arrays `[]` for one-time initialization effects
  - Never include state in dependencies that the effect modifies
- **CSS**: Tailwind CSS with mobile-first approach
- **Performance**: Lazy loading for heavy dependencies, code splitting optimization

### File Naming Conventions

- **Components**: PascalCase (`ActionDashboard.tsx`)
- **Mobile Components**: Add `.mobile.tsx` suffix
- **Lazy Components**: Use `Lazy` prefix (`LazyProgressView.tsx`)
- **Hooks**: Start with `use` (`useMobileDetection.ts`)
- **Utilities**: camelCase (`performanceMonitor.ts`)

### Import Patterns

```typescript
// Prefer lazy loading for heavy dependencies
const LazyCharts = lazy(() => import('./charts/ChartComponents'));

// Use essential icons inline, lazy load heavy icon libraries
import { EssentialIcons } from '@/components/LazyIcons';

// Mobile-specific imports
import { useMobileDetection } from '@/hooks/use-mobile';
```

## 🧩 Component Architecture

### Lazy Loading Pattern

```typescript
// 1. Create lazy component
export const LazyComponent = lazy(() => import('./HeavyComponent'));

// 2. Wrap with Suspense and fallback
<Suspense fallback={<ComponentSkeleton />}>
  <LazyComponent {...props} />
</Suspense>

// 3. Add to lazy routes if needed
export const LazyRoutes = {
  Component: lazy(() => import('./Component'))
};
```

### Mobile Component Pattern

```typescript
// Mobile-optimized component structure
interface MobileComponentProps {
  // Touch-friendly props
  onTouchStart?: () => void;
  // Mobile-specific sizing
  size?: 'mobile' | 'tablet' | 'desktop';
}

export const MobileComponent = ({ size = 'mobile', ...props }: MobileComponentProps) => {
  const { isMobile } = useMobileDetection();

  return (
    <div className={cn(
      // Base styles
      "touch-manipulation",
      // Mobile-first responsive
      "p-4 md:p-6",
      // Touch targets
      "min-h-[44px]" // 44px minimum touch target
    )}>
      {/* Mobile-optimized content */}
    </div>
  );
};
```

import { EssentialIcons } from '@/components/LazyIcons';

// Mobile-specific imports
import { useMobileDetection } from '@/hooks/use-mobile';

````

## 🧩 Component Architecture

### Lazy Loading Pattern

```typescript
// 1. Create lazy component
export const LazyComponent = lazy(() => import('./HeavyComponent'));

// 2. Wrap with Suspense and fallback
<Suspense fallback={<ComponentSkeleton />}>
  <LazyComponent {...props} />
</Suspense>

// 3. Add to lazy routes if needed
export const LazyRoutes = {
  Component: lazy(() => import('./Component'))
};
````

### Mobile Component Pattern

```typescript
// Mobile-optimized component structure
interface MobileComponentProps {
  // Touch-friendly props
  onTouchStart?: () => void;
  // Mobile-specific sizing
  size?: 'mobile' | 'tablet' | 'desktop';
}

export const MobileComponent = ({ size = 'mobile', ...props }: MobileComponentProps) => {
  const { isMobile } = useMobileDetection();

  return (
    <div className={cn(
      // Base styles
      "touch-manipulation",
      // Mobile-first responsive
      "p-4 md:p-6",
      // Touch targets
      "min-h-[44px]" // 44px minimum touch target
    )}>
      {/* Mobile-optimized content */}
    </div>
  );
};
```

## 🎨 CSS Guidelines

### Tailwind CSS Optimization

- **Use mobile-first**: Start with mobile styles, add `md:` and `lg:` breakpoints
- **Avoid large utilities**: Don't use spacing > 20, grid-cols > 6 on mobile
- **Essential colors only**: Stick to project color palette
- **Touch targets**: Minimum 44px for interactive elements

### CSS Classes to Avoid (Bundle Size)

```css
/* ❌ Avoid these for mobile */
.backdrop-*      /* Heavy backdrop utilities */
.xl:*, .2xl:*   /* Large breakpoint variants */
.p-24, .m-32    /* Large spacing utilities */
.grid-cols-12   /* Complex grid systems */
.filter-*       /* Complex filter effects */

/* ✅ Use these instead */
.p-4, .p-6      /* Reasonable spacing */
.grid-cols-2    /* Simple grids */
.bg-opacity-*   /* Simple opacity */
```

## 📦 Bundle Optimization

### Vite Configuration Guidelines

- **Manual chunks**: Separate vendor libraries logically
- **Lazy loading**: Use dynamic imports for heavy components
- **Tree shaking**: Import only what you need

### Performance Monitoring

```bash
# Always check bundle size after changes
npm run perf:mobile

# Analyze bundle composition
npm run build:analyze

# Test lazy loading effectiveness
npm run analyze:lazy
```

## 🧪 Testing Guidelines

### Mobile Testing Priority

- **Touch interactions**: Test tap targets, gestures
- **Viewport sizes**: Test on 320px, 375px, 414px widths
- **Performance**: Monitor bundle size impact
- **Loading states**: Test lazy loading fallbacks

### Test Patterns

```typescript
// Mobile-specific tests
describe('Mobile Component', () => {
  it('should have touch-friendly targets', () => {
    // Test minimum 44px touch targets
  });

  it('should lazy load heavy dependencies', () => {
    // Test lazy loading works
  });
});
```

## 🚨 Critical Areas Needing Attention

### 1. Bundle Investigation (Priority: P0)

- **Problem**: 606 KB JavaScript chunk (chunk-zxUleISs.js)
- **Focus**: Vite configuration, manual chunks, vendor library separation
- **Files**: `vite.config.ts`, bundle analyzer output
- **Action**: Investigate what's included in the large chunk and split appropriately

### 2. Mobile Component Conversion (Priority: P1)

- **Problem**: Only 23% mobile component coverage
- **Focus**: Convert existing components to mobile-optimized versions
- **Target**: 80% mobile component coverage
- **Strategy**: Prioritize high-usage components first

### 3. CSS Bundle Optimization (Priority: P1)

- **Problem**: 415 KB CSS bundle exceeds 250 KB target
- **Focus**: Tailwind CSS purging, critical CSS extraction
- **Files**: `tailwind.config.js`, PostCSS configurations
- **Action**: Implement aggressive utility removal and critical CSS loading

### 4. Performance Monitoring (Priority: P2)

- **Problem**: Need continuous performance tracking
- **Focus**: Automated bundle size monitoring in CI/CD
- **Files**: GitHub Actions workflows, performance scripts
- **Action**: Set up bundle size regression detection

## 💡 Copilot Suggestions

### When suggesting code:

1. **Always consider mobile-first** - Start with mobile styles
2. **Check bundle impact** - Avoid heavy dependencies in suggestions
3. **Use lazy loading** - Suggest dynamic imports for heavy components
4. **Performance-conscious** - Consider bundle size in all suggestions
5. **TypeScript strict** - Avoid `any` types, use proper interfaces

### When suggesting improvements:

1. **Bundle size reduction** - Prioritize bundle optimization suggestions
2. **Mobile UX** - Focus on touch-friendly, responsive improvements
3. **Performance** - Suggest lazy loading, code splitting opportunities
4. **Accessibility** - Ensure mobile accessibility in suggestions

### When debugging:

1. **Check bundle analyzer** - Always suggest checking bundle composition
2. **Mobile testing** - Suggest mobile-specific testing approaches
3. **Performance metrics** - Include performance impact in debugging steps
4. **Infinite loop detection** - Run `npm run check:infinite-loops` if experiencing blank screens or re-render issues

### When encountering blank screens or performance issues:

1. **Run infinite loop check first**: `npm run check:infinite-loops`
2. **Check useEffect patterns**: Look for circular dependencies in state setters
3. **Verify dependency arrays**: Ensure useEffect deps don't include state being modified
4. **Use browser dev tools**: Check for infinite console logs or component re-renders
5. **Test with React DevTools**: Monitor component update cycles and effect firing

## 📚 Key Files to Understand

### Critical Safety Files

- `scripts/check-infinite-loops.js` - Infinite loop detection system
- `scripts/check-infinite-loops.ps1` - PowerShell version for cross-platform
- `docs/development/INFINITE_LOOP_DETECTION.md` - Detection system documentation
- `docs/INFINITE_LOOP_SCAN_RESULTS.md` - Current scan results and issues

### Performance Critical

- `vite.config.ts` - Bundle configuration and chunking
- `src/components/LazyIcons.tsx` - Icon lazy loading implementation
- `src/components/LazyRoutes.tsx` - Component lazy loading setup
- `scripts/mobile-performance.js` - Performance monitoring
- `scripts/analyze-bundle.js` - Bundle analysis tools

### Mobile Optimization

- `src/hooks/use-mobile.ts` - Mobile detection logic
- `src/components/ui/mobile-*` - Mobile-specific UI components
- `tailwind.config.js` - Mobile-first CSS configuration
- `tailwind.mobile-optimized.config.js` - Mobile-specific Tailwind config

### Project Organization

- `PROJECT_STATUS.md` - Current project status and metrics
- `README.md` - Project overview and setup instructions
- `scripts/project-cleanup-comprehensive.js` - Project maintenance
- `docs/` - Comprehensive project documentation

## 🛠️ Essential Commands

### Development & Testing

```bash
npm run dev                 # Start development server
npm run build              # Production build
npm run test               # Run all tests
npm run test:mobile        # Mobile-specific tests
npm run type-check         # TypeScript validation
```

### Infinite Loop Detection & Safety

```bash
npm run check:infinite-loops        # Strict check - blocks on critical issues
npm run check:infinite-loops:warn   # Warning mode - continues with awareness
npm run build:safe                  # Full safety check before building
npm run deploy:safe                 # Complete safety validation before deployment
```

### Performance Analysis

```bash
npm run perf:mobile        # Mobile performance metrics
npm run build:analyze      # Bundle composition analysis
npm run lighthouse:mobile  # Lighthouse mobile audit
```

### Project Maintenance

```bash
node scripts/project-cleanup-comprehensive.js  # Project cleanup
npm run docs:check         # Documentation validation
npm run lint:fix           # Fix linting issues
```

## 🎯 Current Development Focus

### Immediate Goals (Next Sprint) - Post-Cleanup Priorities

1. **Critical Bundle Investigation**
   - Investigate unchanged 606.65KB chunk-BYlyF5jk.js for splitting opportunities
   - Implement vendor library separation (currently 0 vendor chunks)
   - Set up bundle size regression detection in CI/CD

2. **CSS Bundle Optimization (Priority 1)**
   - Address +40KB CSS growth (455.3KB → 250KB target)
   - Implement aggressive Tailwind purging for unused classes
   - Extract critical CSS for above-the-fold content
   - Investigate what caused the recent 40KB increase

3. **Performance Warning Resolution**
   - Systematically address 78 performance warnings from detection system
   - Focus on useState placement and useCallback optimizations
   - Prioritize high-usage hooks (useKV, useDatabase) for fixes

4. **Mobile Component Expansion**
   - Continue progress from 39% → 60% mobile component coverage
   - Focus on ActionDashboard, ProgressView, and navigation components
   - Leverage improved mobile infrastructure for faster conversions

### Medium-term Goals (Next Month)

1. **Performance Automation**
   - Set up continuous bundle size monitoring
   - Implement performance regression detection
   - Add automated Lighthouse CI

2. **Mobile-First Completion**
   - Reach 80% mobile component coverage
   - Implement progressive enhancement patterns
   - Optimize touch interactions

3. **Production Readiness**
   - Achieve all performance targets (<1.5 MB total bundle)
   - Complete PWA implementation
   - Finalize deployment automation

## 📋 Code Review Checklist

When reviewing code changes, ensure:

- [ ] **Infinite loop check passed** (run `npm run check:infinite-loops`)
- [ ] **useEffect patterns verified** (no circular dependencies in state setters)
- [ ] Bundle size impact assessed (run `npm run perf:mobile`)
- [ ] Mobile responsiveness tested on actual devices
- [ ] TypeScript strict mode compliance
- [ ] Lazy loading implemented for heavy dependencies
- [ ] CSS utilities optimized (no unused classes)
- [ ] Touch-friendly interaction design (44px+ targets)
- [ ] Performance monitoring updated if needed

## 🚀 Deployment & CI/CD

### Build Process

1. TypeScript compilation and type checking
2. ESLint validation with max 50 warnings
3. Bundle size analysis and optimization
4. Mobile performance testing
5. Lighthouse audit for performance metrics

### Performance Thresholds

- Total bundle size: <1.5 MB (currently 1.6 MB)
- JavaScript bundle: <800 KB (currently 1.18 MB)
- CSS bundle: <250 KB (currently 415 KB)
- Mobile component coverage: >80% (currently 23%)

---

**Last Updated**: August 16, 2025
**Next Review**: Focus on bundle optimization and mobile component conversion
**Critical Path**: Investigate chunk-zxUleISs.js (606 KB) for immediate optimization wins
