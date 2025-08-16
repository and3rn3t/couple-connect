# 🤖 GitHub Copilot Instructions for Couple Connect

This file provides specific guidance for GitHub Copilot to assist with the Couple Connect project development.

## 🎯 Project Context

**Project**: Couple Connect - A React-based relationship management application
**Tech Stack**: React 19, TypeScript, Vite, Tailwind CSS, Radix UI
**Focus**: Mobile-first design with performance optimization
**Current Priority**: Bundle optimization and mobile component coverage

## 📱 Current Performance Status (Updated: Aug 16, 2025)

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

## 📚 Key Files to Understand

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

### Immediate Goals (Next Sprint)

1. **Bundle Optimization**
   - Investigate and split the 606 KB JavaScript chunk
   - Implement vendor library separation
   - Add build-time bundle monitoring

2. **Mobile Component Coverage**
   - Convert high-priority components to mobile-optimized versions
   - Target: Increase from 23% to 50% coverage
   - Focus on ActionDashboard, ProgressView, and navigation components

3. **CSS Optimization**
   - Implement aggressive Tailwind purging
   - Extract critical CSS for above-the-fold content
   - Reduce CSS bundle from 415 KB to under 300 KB

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
