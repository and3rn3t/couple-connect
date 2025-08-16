# 🤖 GitHub Copilot Instructions for Couple Connect

This file provides specific guidance for GitHub Copilot to assist with the Couple Connect project development.

## 🎯 Project Context

**Project**: Couple Connect - A React-based relationship management application
**Tech Stack**: React 19, TypeScript, Vite, Tailwind CSS, Radix UI
**Focus**: Mobile-first design with performance optimization
**Current Priority**: Bundle size reduction and lazy loading implementation

## 📱 Mobile Optimization Priority

### Current Status

- **Bundle Size**: 6.43 MB (Target: 1.5 MB) - ❌ CRITICAL ISSUE
- **JavaScript**: 6.02 MB (Target: 800 KB) - ❌ Major chunk issue
- **CSS**: 414 KB (Target: 250 KB) - ❌ Close to target
- **Mobile Components**: 22% (Target: 80%) - ❌ Needs improvement

### Key Issues to Address

1. **Large JavaScript chunk (5.62 MB)** - investigate bundling configuration
2. **Lazy loading not working effectively** - debug dynamic imports
3. **Limited mobile component coverage** - convert more components

## 🔧 Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled, avoid `any` types
- **React**: Functional components with hooks, React 19 patterns
- **CSS**: Tailwind CSS with mobile-first approach
- **Performance**: Lazy loading for heavy dependencies

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

- **Problem**: 5.62 MB JavaScript chunk
- **Focus**: Vite configuration, manual chunks
- **Files**: `vite.config.ts`, bundle analyzer output

### 2. Lazy Loading Debug (Priority: P0)

- **Problem**: Dynamic imports not working effectively
- **Focus**: Suspense boundaries, import statements
- **Files**: `LazyRoutes.tsx`, `LazyCharts.tsx`, `App.tsx`

### 3. Mobile Component Conversion (Priority: P1)

- **Problem**: Only 22% mobile component coverage
- **Focus**: Convert existing components to mobile-optimized versions
- **Target**: 80% mobile component coverage

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

### Mobile Optimization

- `src/hooks/use-mobile.ts` - Mobile detection logic
- `src/components/ui/mobile-*` - Mobile-specific UI components
- `tailwind.config.js` - Mobile-first CSS configuration

### Monitoring & Scripts

- `scripts/optimize-css-aggressive.js` - CSS bundle optimization
- `scripts/implement-lazy-loading.js` - Lazy loading setup
- `scripts/analyze-bundle.js` - Bundle analysis tools

---

**Last Updated**: 2025-08-15
**Priority**: Bundle size reduction and mobile optimization
**Next Steps**: Debug large JavaScript chunk, improve lazy loading effectiveness
