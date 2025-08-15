import { lazy } from 'react';

// Partner and relationship components - lazy loaded
export const LazyPartnerSetup = lazy(() =>
  import('@/components/PartnerSetup').then((module) => ({ default: module.default }))
);

export const LazyPartnerProfile = lazy(() => import('@/components/PartnerProfile'));

// Notification system - lazy loaded
export const LazyNotificationCenter = lazy(() => import('@/components/NotificationCenter'));

export const LazyNotificationSummary = lazy(() => import('@/components/NotificationSummary'));

// Gamification and rewards - lazy loaded (heavy features)
export const LazyGamificationCenter = lazy(() =>
  import('@/components/GamificationCenter').then((module) => ({ default: module.default }))
);

export const LazyRewardSystem = lazy(() => import('@/components/RewardSystem'));

export const LazyDailyChallenges = lazy(() => import('@/components/DailyChallenges'));

// Development and analytics - lazy loaded
export const LazyPerformanceDashboard = lazy(() =>
  import('@/components/PerformanceDashboard').then((module) => ({
    default: module.PerformanceDashboard,
  }))
);

// Mindmap view - lazy loaded (likely uses D3 or similar heavy library)
export const LazyMindmapView = lazy(() => import('@/components/MindmapView'));

// Mobile components - lazy loaded for better mobile performance
export const LazyMobileActionDashboard = lazy(
  () => import('@/components/MobileActionDashboardOptimized')
);

// Offline notification - can be lazy loaded as it's not always needed
export const LazyOfflineNotification = lazy(() =>
  import('@/components/OfflineNotification').then((module) => ({
    default: module.OfflineNotification,
  }))
);

// Loading fallback component for consistent UX
export const ComponentLoader = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="space-y-4 text-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);

// Export types for Partner component
export type { Partner } from '@/components/PartnerSetup';
export type { GamificationState } from '@/components/GamificationCenter';
