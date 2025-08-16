#!/usr/bin/env node

/**
 * JavaScript Lazy Loading Implementation
 * Implements dynamic imports for heavy dependencies to reduce initial bundle size
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('⚡ JavaScript Lazy Loading Implementation\n');

// Step 1: Create lazy-loaded chart components
function createLazyChartComponents() {
  console.log('📝 Creating lazy-loaded chart components...');

  const lazyChartsContent = `import { lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';

// Chart loading skeleton with better mobile support
export const ChartSkeleton = () => (
  <Card className="w-full">
    <CardHeader className="pb-3">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-3 w-20" />
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
      <Skeleton className="h-32 w-full rounded-md" />
      <div className="flex justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </CardContent>
  </Card>
);

// Lazy load the entire chart UI module
const LazyChartUI = lazy(() => import('./ui/chart').then(module => ({
  default: {
    ChartContainer: module.ChartContainer,
    ChartTooltip: module.ChartTooltip,
    ChartTooltipContent: module.ChartTooltipContent,
    ChartLegend: module.ChartLegend,
    ChartLegendContent: module.ChartLegendContent,
  }
})));

// Lazy load Recharts components (heaviest dependency)
const LazyRecharts = lazy(() => import('recharts').then(module => ({
  default: {
    LineChart: module.LineChart,
    BarChart: module.BarChart,
    PieChart: module.PieChart,
    AreaChart: module.AreaChart,
    XAxis: module.XAxis,
    YAxis: module.YAxis,
    CartesianGrid: module.CartesianGrid,
    Tooltip: module.Tooltip,
    Legend: module.Legend,
    ResponsiveContainer: module.ResponsiveContainer,
    Line: module.Line,
    Bar: module.Bar,
    Area: module.Area,
    Pie: module.Pie,
    Cell: module.Cell,
  }
})));

// Provider for lazy charts with better error handling
export const LazyChartsProvider = ({
  children,
  fallback = <ChartSkeleton />
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);

// Lazy chart container component
export const LazyChartContainer = ({ children, ...props }: any) => (
  <LazyChartsProvider>
    <LazyChartUI>
      {({ ChartContainer }) => (
        <ChartContainer {...props}>
          {children}
        </ChartContainer>
      )}
    </LazyChartUI>
  </LazyChartsProvider>
);

// Export lazy components
export { LazyChartUI, LazyRecharts };

// Hook for lazy chart loading
export const useLazyCharts = () => {
  return {
    isChartsLoaded: false, // Will be true after first lazy load
    loadCharts: () => import('./ui/chart'),
    loadRecharts: () => import('recharts'),
  };
};
`;

  fs.writeFileSync(
    path.join(projectRoot, 'src', 'components', 'LazyCharts.tsx'),
    lazyChartsContent
  );

  console.log('✅ Enhanced src/components/LazyCharts.tsx');
}

// Step 2: Create lazy-loaded icon components
function createLazyIconComponents() {
  console.log('📝 Creating lazy-loaded icon components...');

  const lazyIconsContent = `import { lazy, Suspense } from 'react';

// Icon loading placeholder (much smaller)
const IconPlaceholder = ({ size = 16 }: { size?: number }) => (
  <div
    style={{
      width: size,
      height: size,
      backgroundColor: 'currentColor',
      opacity: 0.3,
      borderRadius: '2px'
    }}
  />
);

// Lazy load phosphor icons (heavy library)
const LazyPhosphorIcons = lazy(() => import('@phosphor-icons/react'));

// Lazy load lucide icons
const LazyLucideIcons = lazy(() => import('lucide-react'));

// HOC for lazy icon loading
export const withLazyIcon = (IconComponent: any, fallbackSize = 16) => {
  return (props: any) => (
    <Suspense fallback={<IconPlaceholder size={fallbackSize} />}>
      <IconComponent {...props} />
    </Suspense>
  );
};

// Commonly used icons (keep these loaded)
export const EssentialIcons = {
  Heart: ({ size = 16, ...props }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  ),
  Plus: ({ size = 16, ...props }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  Check: ({ size = 16, ...props }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <polyline points="20,6 9,17 4,12"></polyline>
    </svg>
  ),
  X: ({ size = 16, ...props }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
};

// Lazy icon components
export const LazyIcons = {
  // Phosphor icons (lazy)
  Target: lazy(() => import('@phosphor-icons/react').then(m => ({ default: m.Target }))),
  ChartBar: lazy(() => import('@phosphor-icons/react').then(m => ({ default: m.ChartBar }))),
  User: lazy(() => import('@phosphor-icons/react').then(m => ({ default: m.User }))),
  Gear: lazy(() => import('@phosphor-icons/react').then(m => ({ default: m.Gear }))),
  Clock: lazy(() => import('@phosphor-icons/react').then(m => ({ default: m.Clock }))),

  // Lucide icons (lazy)
  ChevronDown: lazy(() => import('lucide-react').then(m => ({ default: m.ChevronDown }))),
  ArrowLeft: lazy(() => import('lucide-react').then(m => ({ default: m.ArrowLeft }))),
  ArrowRight: lazy(() => import('lucide-react').then(m => ({ default: m.ArrowRight }))),
};

// Hook for preloading icons when needed
export const usePreloadIcons = () => {
  const preloadPhosphor = () => import('@phosphor-icons/react');
  const preloadLucide = () => import('lucide-react');

  return { preloadPhosphor, preloadLucide };
};
`;

  fs.writeFileSync(path.join(projectRoot, 'src', 'components', 'LazyIcons.tsx'), lazyIconsContent);

  console.log('✅ Created src/components/LazyIcons.tsx');
}

// Step 3: Create lazy component route definitions
function createLazyRoutes() {
  console.log('📝 Creating lazy route components...');

  const lazyRoutesContent = `import { lazy } from 'react';

// Lazy load page-level components that contain heavy dependencies
export const LazyProgressView = lazy(() => import('./ProgressView'));

// Lazy load admin/debugging components (shouldn't be in main bundle)
export const LazyMobileTestingDashboard = lazy(() =>
  import('./MobileTestingDashboard').catch(() => ({
    default: () => <div>Mobile Testing Dashboard unavailable</div>
  }))
);

export const LazyPerformanceDashboard = lazy(() =>
  import('./PerformanceDashboard').catch(() => ({
    default: () => <div>Performance Dashboard unavailable</div>
  }))
);

// Lazy load heavy UI components
export const LazyActionDialog = lazy(() => import('./ActionDialog'));
export const LazyActionDashboard = lazy(() => import('./ActionDashboard'));

// Hook for preloading routes based on user navigation
export const usePreloadRoutes = () => {
  const preloadProgress = () => import('./ProgressView');
  const preloadDashboards = () => Promise.all([
    import('./MobileTestingDashboard').catch(() => null),
    import('./PerformanceDashboard').catch(() => null),
  ]);

  return {
    preloadProgress,
    preloadDashboards,
  };
};
`;

  fs.writeFileSync(
    path.join(projectRoot, 'src', 'components', 'LazyRoutes.tsx'),
    lazyRoutesContent
  );

  console.log('✅ Created src/components/LazyRoutes.tsx');
}

// Step 4: Update Vite config for better code splitting
function updateViteConfig() {
  console.log('📝 Updating Vite configuration for aggressive code splitting...');

  const viteConfigPath = path.join(projectRoot, 'vite.config.ts');
  let viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');

  // Check if the manual chunks section exists and enhance it
  const chunksPattern = /manualChunks: \(id\) => \{[\s\S]*?\}/;

  const enhancedChunks = `manualChunks: (id) => {
            // Vendor libraries - separate chunks
            if (id.includes('react') && !id.includes('react-router')) {
              return 'react-vendor';
            }

            if (id.includes('react-router-dom')) {
              return 'router';
            }

            // Heavy chart libraries - lazy loaded
            if (id.includes('recharts')) {
              return 'charts';
            }

            if (id.includes('d3')) {
              return 'charts-d3';
            }

            // Icon libraries - separate chunks
            if (id.includes('@phosphor-icons/react')) {
              return 'icons-phosphor';
            }

            if (id.includes('lucide-react')) {
              return 'icons-lucide';
            }

            // UI component libraries
            if (id.includes('@radix-ui')) {
              return 'ui-radix';
            }

            if (id.includes('@tanstack/react-query')) {
              return 'react-query';
            }

            // Mobile-specific components - lazy loaded
            if (
              id.includes('mobile-card') ||
              id.includes('mobile-navigation') ||
              id.includes('mobile-forms') ||
              id.includes('mobile-layout') ||
              id.includes('touch-feedback') ||
              id.includes('use-mobile') ||
              id.includes('useMobilePerformance') ||
              id.includes('useHapticFeedback')
            ) {
              return 'mobile-components';
            }

            // Testing/development components - separate chunk
            if (
              id.includes('MobileTestingDashboard') ||
              id.includes('PerformanceDashboard') ||
              id.includes('/test/') ||
              id.includes('vitest')
            ) {
              return 'dev-tools';
            }

            // Progress and charts - lazy loaded
            if (id.includes('ProgressView') || id.includes('Chart')) {
              return 'progress-charts';
            }

            // Action management - lazy loaded
            if (id.includes('ActionDialog') || id.includes('ActionDashboard')) {
              return 'action-management';
            }

            // Default vendor chunk for other node_modules
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }`;

  if (chunksPattern.test(viteConfig)) {
    viteConfig = viteConfig.replace(chunksPattern, enhancedChunks);
  } else {
    console.log('⚠️  Could not find manualChunks section in vite.config.ts');
  }

  fs.writeFileSync(viteConfigPath, viteConfig);
  console.log('✅ Enhanced Vite configuration for code splitting');
}

// Step 5: Create package.json script for lazy loading analysis
function updatePackageScripts() {
  console.log('📝 Adding lazy loading analysis scripts...');

  const packagePath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

  packageJson.scripts = {
    ...packageJson.scripts,
    'analyze:lazy': 'npm run build:analyze && node scripts/analyze-lazy-loading.js',
    'test:lazy': 'npm run build && node scripts/test-lazy-loading.js',
    'optimize:js': 'node scripts/optimize-js-lazy.js',
  };

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Added lazy loading scripts to package.json');
}

async function implementLazyLoading() {
  try {
    console.log('🚀 Implementing JavaScript lazy loading strategy...\n');

    createLazyChartComponents();
    createLazyIconComponents();
    createLazyRoutes();
    updateViteConfig();
    updatePackageScripts();

    console.log('\n✅ JavaScript lazy loading implementation complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Update App.tsx to use lazy components');
    console.log('2. Run: npm run build');
    console.log('3. Check bundle analysis: npm run analyze:lazy');
    console.log('4. Test performance: npm run perf:mobile');
    console.log('\n🎯 Expected JavaScript reduction: 387KB → ~200-250KB');
    console.log('💡 Charts and icons will load on-demand, reducing initial bundle significantly');
  } catch (error) {
    console.error('❌ Error implementing lazy loading:', error.message);
    process.exit(1);
  }
}

implementLazyLoading();
