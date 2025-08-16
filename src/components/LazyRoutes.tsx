import { lazy } from 'react';

// Lazy load page-level components that contain heavy dependencies
export const LazyProgressView = lazy(() => import('./ProgressView'));

// Lazy load admin/debugging components (shouldn't be in main bundle)
export const LazyMobileTestingDashboard = lazy(() =>
  import('./MobileTestingDashboard')
    .then((module) => ({ default: module.default || module.MobileTestingDashboard }))
    .catch(() => ({
      default: () => <div>Mobile Testing Dashboard unavailable</div>,
    }))
);

export const LazyPerformanceDashboard = lazy(() =>
  import('./PerformanceDashboard')
    .then((module) => ({ default: module.default || module.PerformanceDashboard }))
    .catch(() => ({
      default: () => <div>Performance Dashboard unavailable</div>,
    }))
);

// Lazy load heavy UI components
export const LazyActionDialog = lazy(() => import('./ActionDialog'));
export const LazyActionDashboard = lazy(() => import('./ActionDashboard'));

// Hook for preloading routes based on user navigation
export const usePreloadRoutes = () => {
  const preloadProgress = () => import('./ProgressView');
  const preloadDashboards = () =>
    Promise.all([
      import('./MobileTestingDashboard').catch(() => null),
      import('./PerformanceDashboard').catch(() => null),
    ]);

  return {
    preloadProgress,
    preloadDashboards,
  };
};
