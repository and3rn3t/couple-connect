import { useState, useEffect, Suspense, lazy } from 'react';
import './App.css';
import { useKV } from './hooks/useKV';
import {
  useCurrentUser,
  useCurrentCouple,
  useIssues,
  useActions,
} from './hooks/useDatabaseOptimized';
import { initializeDatabase } from './services/initializeData';
import { migrateLocalStorageData, shouldMigrate } from './utils/migrateLocalStorageData';
import { updateDatabaseConfig } from './services/databaseConfig';
import { performanceMonitor } from './utils/performanceMonitor';
import './utils/performanceDemo'; // Initialize performance utilities
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EssentialIcons } from '@/components/LazyIcons';
import { LazyProgressView } from '@/components/LazyRoutes';
import { ResponsivePartnerProfile } from '@/components/ResponsivePartnerProfile';
import { ResponsiveActionDashboard } from '@/components/ResponsiveActionDashboard';
import { ResponsiveProgressView } from '@/components/ResponsiveProgressView';
import { Toaster } from '@/components/ui/sonner';
import { MobileTabBar, MobileNavBar } from '@/components/ui/mobile-navigation';
import { useMobileDetection } from '@/hooks/use-mobile';
import { useServiceWorker, useResourceCaching } from '@/hooks/useServiceWorker';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Lazy load heavy components to reduce initial bundle size
const LazyMindmapView = lazy(() => import('@/components/MindmapView'));
const LazyMobileActionDashboard = lazy(() => import('@/components/MobileActionDashboardOptimized'));
const LazyOfflineNotification = lazy(() =>
  import('@/components/OfflineNotification').then((m) => ({ default: m.OfflineNotification }))
);
const LazyPartnerProfile = ResponsivePartnerProfile; // Use responsive component
const LazyNotificationCenter = lazy(() => import('@/components/NotificationCenter'));
const LazyNotificationSummary = lazy(() => import('@/components/NotificationSummary'));
const LazyGamificationCenter = lazy(() => import('@/components/GamificationCenter'));
const LazyRewardSystem = lazy(() => import('@/components/RewardSystem'));
const LazyDailyChallenges = lazy(() => import('@/components/DailyChallenges'));
const LazyPerformanceDashboard = lazy(() =>
  import('@/components/PerformanceDashboard').then((m) => ({ default: m.PerformanceDashboard }))
);

// Component loading fallbacks
const ComponentSkeleton = () => (
  <div className="space-y-4 p-4">
    <div className="h-8 bg-muted animate-pulse rounded" />
    <div className="h-32 bg-muted animate-pulse rounded" />
    <div className="h-16 bg-muted animate-pulse rounded" />
  </div>
);

// Optimized loading component for lazy components
const ComponentLoader = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="space-y-4 text-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);

// App configuration constants
const APP_CONFIG = {
  // Database configuration
  DATABASE_CACHE_TIMEOUT: 10 * 60 * 1000, // 10 minutes for relationship data
  DATABASE_MAX_CACHE_SIZE: 200, // More cache for better performance
  DATABASE_DEBOUNCE_MS: 300, // Debounce rapid updates
  DATABASE_RETRY_ATTEMPTS: 3,

  // Performance monitoring
  PERFORMANCE_REPORT_DELAY: 2000, // Give app time to load

  // Default values
  DEFAULT_WEEKLY_GOAL: 50,
} as const;

// Icon sizes for consistent UI
const ICON_SIZES = {
  SMALL: 16,
  LARGE: 32,
} as const;

// Types imported separately to avoid bundling heavy components
import type { Partner } from '@/components/PartnerSetup';
import type { GamificationState } from '@/components/GamificationCenter';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category:
    | 'communication'
    | 'intimacy'
    | 'finance'
    | 'time'
    | 'family'
    | 'personal-growth'
    | 'other';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  position: { x: number; y: number };
  connections: string[];
}

export interface Action {
  id: string;
  issueId: string;
  title: string;
  description: string;
  assignedTo: 'partner1' | 'partner2' | 'both';
  assignedToId?: string; // Partner ID for more specific assignment
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  createdBy: string; // Partner ID who created the action
  completedAt?: string;
  completedBy?: string; // Partner ID who completed the action
  notes: string[];
}

export interface RelationshipHealth {
  overallScore: number;
  categories: {
    communication: number;
    intimacy: number;
    finance: number;
    time: number;
    family: number;
    personalGrowth: number;
  };
  lastUpdated: string;
}

function App() {
  const { isMobile } = useMobileDetection();

  // Initialize service worker and offline capabilities
  const { status: swStatus } = useServiceWorker();
  const { preloadCriticalResources } = useResourceCaching();

  // Initialize database on app start
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Configure database for optimal performance
        updateDatabaseConfig({
          enableCaching: true,
          cacheTimeout: APP_CONFIG.DATABASE_CACHE_TIMEOUT,
          maxCacheSize: APP_CONFIG.DATABASE_MAX_CACHE_SIZE,
          enableOptimisticUpdates: true, // Instant UI feedback
          retryAttempts: APP_CONFIG.DATABASE_RETRY_ATTEMPTS,
          debounceMs: APP_CONFIG.DATABASE_DEBOUNCE_MS,
        });

        await initializeDatabase();

        // Check if we need to migrate localStorage data
        if (shouldMigrate()) {
          console.warn('Migrating existing localStorage data to database...');
          const result = await migrateLocalStorageData();
          if (result.success) {
            console.warn('Migration completed successfully');
          } else {
            console.error('Migration failed:', result.message);
          }
        }

        // Preload critical resources for offline use
        if (swStatus.active) {
          await preloadCriticalResources();
        }

        // Log initial performance metrics in development
        if (window.location.hostname === 'localhost') {
          setTimeout(() => {
            console.warn('=== Initial Database Performance ===');
            performanceMonitor.logPerformanceReport();
          }, APP_CONFIG.PERFORMANCE_REPORT_DELAY);
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, [swStatus.active, preloadCriticalResources]); // Database hooks with enhanced performance
  const { user: currentUser, error: _userError } = useCurrentUser();
  const { couple, error: _coupleError } = useCurrentCouple();
  const {
    issues: dbIssues,
    createIssue: _dbCreateIssue,
    updateIssue: _dbUpdateIssue,
    deleteIssue: _dbDeleteIssue,
    loading: _issuesLoading,
    error: _issuesError,
  } = useIssues();
  const {
    actions: dbActions,
    createAction: dbCreateAction,
    updateAction: dbUpdateAction,
    deleteAction: _dbDeleteAction,
    loading: _actionsLoading,
    error: _actionsError,
  } = useActions();

  // Convert database types to legacy component types
  const issues: Issue[] = dbIssues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description || '',
    category: 'other' as Issue['category'], // Default category since DB uses category_id
    priority: issue.priority === 'urgent' ? 'high' : (issue.priority as Issue['priority']),
    createdAt: issue.created_at,
    position: { x: issue.position_x, y: issue.position_y },
    connections: [], // Default empty connections, would need to fetch from IssueConnection table
  }));

  const actions: Action[] = dbActions.map((action) => ({
    id: action.id,
    issueId: action.issue_id || '',
    title: action.title,
    description: action.description || '',
    assignedTo: mapAssignedTo(action.assigned_to),
    assignedToId: action.assigned_to,
    dueDate: action.due_date || '',
    status: mapActionStatus(action.status),
    createdAt: action.created_at,
    createdBy: action.created_by || '',
    completedAt: action.completed_at || undefined,
    completedBy: undefined, // Not tracked in new schema
    notes: action.notes ? [action.notes] : [],
  }));

  // Helper functions to map between old and new formats
  function mapAssignedTo(assigned_to: string): 'partner1' | 'partner2' | 'both' {
    if (assigned_to === 'both') return 'both';
    if (assigned_to === 'user1') return 'partner1';
    if (assigned_to === 'user2') return 'partner2';
    return 'both'; // Default fallback
  }

  function mapActionStatus(status: string): 'pending' | 'in-progress' | 'completed' {
    if (status === 'in_progress') return 'in-progress';
    if (status === 'completed') return 'completed';
    return 'pending'; // Default fallback
  }

  // Partner identification state (keeping localStorage for UI state)
  const [currentPartner, setCurrentPartner] = useKV<Partner | null>('current-partner', null);
  const [otherPartner, setOtherPartner] = useKV<Partner | null>('other-partner', null);
  const [viewingAsPartner, setViewingAsPartner] = useState<string | null>(null); // For switching perspectives

  // Legacy state for components that haven't been migrated yet
  const [healthScore, setHealthScore] = useKV<RelationshipHealth>('relationship-health', {
    overallScore: 7,
    categories: {
      communication: 7,
      intimacy: 7,
      finance: 8,
      time: 6,
      family: 7,
      personalGrowth: 6,
    },
    lastUpdated: new Date().toISOString(),
  });

  // Gamification state
  const [gamificationState, setGamificationState] = useKV<GamificationState>('gamification-state', {
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    achievements: [],
    weeklyGoal: 7,
    weeklyProgress: 0,
    partnerStats: {},
  });

  // Wrapper functions for components that still expect setters (temporary until components are updated)
  const setIssuesWrapper = async (update: (current: Issue[]) => Issue[]) => {
    console.warn(
      'setIssuesWrapper called - components should be updated to use database hooks directly'
    );
    const updatedIssues = update(issues);
    // For now, just log the changes - components should be updated to use database hooks directly
    console.log('Issues would be updated to:', updatedIssues);
  };

  const setActionsWrapper = async (update: (current: Action[]) => Action[]) => {
    console.warn(
      'setActionsWrapper called - components should be updated to use database hooks directly'
    );
    const updatedActions = update(actions);
    // For now, just log the changes - components should be updated to use database hooks directly
    console.log('Actions would be updated to:', updatedActions);
  };

  const setHealthScoreWrapper = (update: (current: RelationshipHealth) => RelationshipHealth) => {
    setHealthScore((prev) =>
      update(
        prev || {
          overallScore: 0,
          categories: {
            communication: 0,
            intimacy: 0,
            finance: 0,
            time: 0,
            family: 0,
            personalGrowth: 0,
          },
          lastUpdated: new Date().toISOString(),
        }
      )
    );
  };

  const [activeTab, setActiveTab] = useState('mindmap');
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);

  // Add a loading state for partner setup
  const [partnersInitialized, setPartnersInitialized] = useState(false);

  console.warn('🏁 App function running, partners:', {
    currentPartner: currentPartner?.name,
    otherPartner: otherPartner?.name,
    partnersInitialized,
  });

  // Debug logging for partner state
  useEffect(() => {
    console.warn('🔍 Partner state changed:', {
      currentPartner: currentPartner?.name,
      otherPartner: otherPartner?.name,
      partnersInitialized,
    });
  }, [currentPartner, otherPartner, partnersInitialized]);

  // Initialize default partners if none are set up
  useEffect(() => {
    // Only run this effect once
    if (partnersInitialized) return;

    console.warn('🚀 Initializing partners...', {
      currentPartner: currentPartner?.name,
      otherPartner: otherPartner?.name,
    });

    // Set a timeout to ensure this doesn't hang indefinitely
    const initTimeout = setTimeout(() => {
      console.warn('⚠️ Partner initialization timeout, forcing initialization');
      if (!partnersInitialized) {
        const defaultCurrentPartner: Partner = {
          id: 'partner-1',
          name: 'You',
          email: 'you@example.com',
          isCurrentUser: true,
        };
        const defaultOtherPartner: Partner = {
          id: 'partner-2',
          name: 'Your Partner',
          email: 'partner@example.com',
          isCurrentUser: false,
        };

        setCurrentPartner(defaultCurrentPartner);
        setOtherPartner(defaultOtherPartner);
        setPartnersInitialized(true);
        console.warn('✅ Forced partner initialization complete');
      }
    }, 2000); // Force initialization after 2 seconds max

    // If partners already exist, just mark as initialized
    if (currentPartner && otherPartner) {
      console.warn('✅ Partners already exist, marking as initialized');
      setPartnersInitialized(true);
      clearTimeout(initTimeout);
      return;
    }

    // Create default partners if none exist
    try {
      const defaultCurrentPartner: Partner = {
        id: 'partner-1',
        name: 'You',
        email: 'you@example.com',
        isCurrentUser: true,
      };
      const defaultOtherPartner: Partner = {
        id: 'partner-2',
        name: 'Your Partner',
        email: 'partner@example.com',
        isCurrentUser: false,
      };

      // Set partners and mark as initialized
      setCurrentPartner(defaultCurrentPartner);
      setOtherPartner(defaultOtherPartner);
      setPartnersInitialized(true);
      console.warn('✅ Default partners created successfully');
      clearTimeout(initTimeout);
    } catch (error) {
      console.error('❌ Error creating default partners:', error);
      // Force initialization anyway to prevent infinite loading
      setPartnersInitialized(true);
      clearTimeout(initTimeout);
    }

    return () => clearTimeout(initTimeout);
  }, []); // Empty dependency array - only run once on mount

  // Show loading screen while partners are being initialized or don't exist
  if (!partnersInitialized || !currentPartner || !otherPartner) {
    console.warn('🔄 Showing loading screen', {
      partnersInitialized,
      currentPartner: currentPartner?.name,
      otherPartner: otherPartner?.name,
    });
    return (
      <div style={{ 
        padding: '32px', 
        backgroundColor: '#f0f0f0', 
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          maxWidth: '500px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#333' }}>
            🚀 Couple Connect Loading...
          </h2>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            Setting up your relationship dashboard. This should only take a moment.
          </p>
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '3px solid #e3e3e3',
              borderTop: '3px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }} />
          </div>
          <div style={{ 
            marginTop: '16px', 
            fontSize: '12px', 
            color: '#999',
            backgroundColor: '#f8f8f8',
            padding: '8px',
            borderRadius: '4px'
          }}>
            Debug Info:<br/>
            • partnersInitialized: {partnersInitialized.toString()}<br/>
            • currentPartner: {currentPartner?.name || 'null'}<br/>
            • otherPartner: {otherPartner?.name || 'null'}
          </div>
        </div>
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `
        }} />
      </div>
    );
  }

  console.warn('✅ Partners initialized, rendering main app...', {
    currentPartner: currentPartner?.name,
    otherPartner: otherPartner?.name,
    activeTab,
    isMobile,
  });

  // Determine which partner's perspective we're viewing
  const activePartner = viewingAsPartner
    ? viewingAsPartner === currentPartner.id
      ? currentPartner
      : otherPartner
    : currentPartner;

  const isViewingOwnPerspective = activePartner.id === currentPartner.id;

  // Filter actions based on current view
  const getPersonalizedActions = () => {
    const actionList = actions || [];
    if (isViewingOwnPerspective) {
      // Show actions assigned to current user or both
      return actionList.filter(
        (action) =>
          action.assignedToId === currentPartner.id ||
          action.assignedTo === 'both' ||
          action.createdBy === currentPartner.id
      );
    } else {
      // Show actions from partner's perspective
      return actionList.filter(
        (action) =>
          action.assignedToId === otherPartner.id ||
          action.assignedTo === 'both' ||
          action.createdBy === otherPartner.id
      );
    }
  };

  const handleSwitchView = () => {
    setViewingAsPartner(
      viewingAsPartner === currentPartner.id ? otherPartner.id : currentPartner.id
    );
  };

  const handleSignOut = () => {
    setCurrentPartner(null);
    setOtherPartner(null);
    setViewingAsPartner(null);
  };

  const handleActionUpdate = async (actionId: string, updates: Partial<Action>) => {
    try {
      await dbUpdateAction(actionId, {
        title: updates.title,
        description: updates.description,
        status: updates.status === 'in-progress' ? 'in_progress' : updates.status,
        due_date: updates.dueDate,
        notes: updates.notes?.join('\n'),
        completed_at: updates.completedAt,
      });
    } catch (error) {
      console.error('Failed to update action:', error);
    }
  };

  const handleCreateAction = async (newAction: Omit<Action, 'id' | 'createdAt'>) => {
    if (!couple) return;
    try {
      await dbCreateAction({
        title: newAction.title,
        description: newAction.description,
        assigned_to:
          newAction.assignedTo === 'partner1'
            ? 'user1'
            : newAction.assignedTo === 'partner2'
              ? 'user2'
              : 'both',
        status:
          newAction.status === 'in-progress'
            ? 'in_progress'
            : (newAction.status as 'pending' | 'completed'),
        priority: 'medium',
        due_date: newAction.dueDate,
        notes: newAction.notes.join('\n'),
        created_by: currentUser?.id,
      });
    } catch (error) {
      console.error('Failed to create action:', error);
    }
  };

  return (
    <div id="spark-app" className={`min-h-screen ${isMobile ? 'pb-safe-area-bottom' : ''}`}>
      {/* Offline notification */}
      <Suspense fallback={<ComponentLoader message="Loading notification..." />}>
        <LazyOfflineNotification />
      </Suspense>

      {/* Mobile Navigation */}
      {isMobile && (
        <MobileNavBar
          title="Together"
          rightAction={
            <Suspense fallback={<ComponentLoader message="Loading profile..." />}>
              <LazyPartnerProfile
                currentPartner={currentPartner}
                otherPartner={otherPartner}
                onSwitchView={handleSwitchView}
                onSignOut={handleSignOut}
              />
            </Suspense>
          }
        />
      )}

      {isMobile ? (
        /* Mobile Layout */
        <div className="pt-16 pb-20">
          {/* Mobile Tab Content */}
          {activeTab === 'mindmap' && (
            <div className="px-0">
              <ErrorBoundary
                fallback={
                  <div className="p-4 text-center text-red-600">
                    Failed to load mindmap. Please try refreshing.
                  </div>
                }
              >
                <Suspense fallback={<ComponentLoader message="Loading mindmap..." />}>
                  <LazyMindmapView
                    issues={issues || []}
                    setIssues={setIssuesWrapper}
                    actions={actions || []}
                    setActions={setActionsWrapper}
                    currentPartner={currentPartner}
                    otherPartner={otherPartner}
                    viewingAsPartner={activePartner}
                  />
                </Suspense>
              </ErrorBoundary>
            </div>
          )}

          {activeTab === 'actions' && (
            <ErrorBoundary
              fallback={
                <div className="p-4 text-center text-red-600">
                  Failed to load actions. Please try refreshing.
                </div>
              }
            >
              <Suspense fallback={<ComponentLoader message="Loading dashboard..." />}>
                <LazyMobileActionDashboard
                  issues={issues || []}
                  actions={getPersonalizedActions()}
                  setActions={setActionsWrapper}
                  currentPartner={currentPartner}
                  otherPartner={otherPartner}
                  viewingAsPartner={activePartner}
                />
              </Suspense>
            </ErrorBoundary>
          )}

          {activeTab === 'progress' && (
            <div className="px-4">
              <Suspense fallback={<ComponentSkeleton />}>
                <LazyProgressView
                  issues={issues || []}
                  actions={actions || []}
                  healthScore={
                    healthScore || {
                      overallScore: 0,
                      categories: {
                        communication: 0,
                        intimacy: 0,
                        finance: 0,
                        time: 0,
                        family: 0,
                        personalGrowth: 0,
                      },
                      lastUpdated: new Date().toISOString(),
                    }
                  }
                  setHealthScore={setHealthScoreWrapper}
                  currentPartner={currentPartner}
                  otherPartner={otherPartner}
                  viewingAsPartner={activePartner}
                />
              </Suspense>
            </div>
          )}

          {/* Mobile Tab Bar */}
          <MobileTabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      ) : (
        /* Desktop Layout */
        <div className="container mx-auto p-6">
          <header className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <EssentialIcons.Heart
                  className="text-accent"
                  size={ICON_SIZES.LARGE}
                  weight="fill"
                />
                <div>
                  <h1 className="text-3xl font-medium text-fg">Together</h1>
                  <p className="text-fg-secondary">
                    {isViewingOwnPerspective
                      ? 'Your personal accountability view'
                      : `Viewing ${activePartner.name}'s perspective`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Suspense fallback={<ComponentLoader message="Loading gamification..." />}>
                  <LazyGamificationCenter
                    actions={actions || []}
                    issues={issues || []}
                    currentPartner={currentPartner}
                    otherPartner={otherPartner}
                    gamificationState={
                      gamificationState || {
                        totalPoints: 0,
                        currentStreak: 0,
                        longestStreak: 0,
                        achievements: [],
                        weeklyGoal: 50,
                        weeklyProgress: 0,
                        partnerStats: {},
                      }
                    }
                    onUpdateGamification={setGamificationState}
                  />
                </Suspense>
                <Suspense fallback={<ComponentLoader message="Loading rewards..." />}>
                  <LazyRewardSystem
                    currentPartner={currentPartner}
                    _otherPartner={otherPartner}
                    gamificationState={
                      gamificationState || {
                        totalPoints: 0,
                        currentStreak: 0,
                        longestStreak: 0,
                        achievements: [],
                        weeklyGoal: 50,
                        weeklyProgress: 0,
                        partnerStats: {},
                      }
                    }
                    onUpdateGamification={setGamificationState}
                  />
                </Suspense>
                <Suspense fallback={<ComponentLoader message="Loading notifications..." />}>
                  <LazyNotificationCenter
                    actions={actions || []}
                    issues={issues || []}
                    currentPartner={currentPartner}
                    otherPartner={otherPartner}
                    onActionUpdate={handleActionUpdate}
                    isOpen={notificationCenterOpen}
                    onOpenChange={setNotificationCenterOpen}
                  />
                </Suspense>
                <Suspense fallback={<ComponentLoader message="Loading profile..." />}>
                  <LazyPartnerProfile
                    currentPartner={currentPartner}
                    otherPartner={otherPartner}
                    onSwitchView={handleSwitchView}
                    onSignOut={handleSignOut}
                  />
                </Suspense>
              </div>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground text-lg">
                Building stronger relationships through accountability and growth
              </p>
            </div>
          </header>

          <Suspense fallback={<ComponentLoader message="Loading dashboard..." />}>
            <LazyPerformanceDashboard />
          </Suspense>

          <Suspense fallback={<ComponentLoader message="Loading notifications..." />}>
            <LazyNotificationSummary
              actions={actions || []}
              issues={issues || []}
              currentPartner={currentPartner}
              otherPartner={otherPartner}
              onViewAll={() => setNotificationCenterOpen(true)}
            />
          </Suspense>
          <Suspense fallback={<ComponentLoader message="Loading challenges..." />}>
            <LazyDailyChallenges
              actions={actions || []}
              issues={issues || []}
              currentPartner={currentPartner}
              otherPartner={otherPartner}
              gamificationState={
                gamificationState || {
                  totalPoints: 0,
                  currentStreak: 0,
                  longestStreak: 0,
                  achievements: [],
                  weeklyGoal: APP_CONFIG.DEFAULT_WEEKLY_GOAL,
                  weeklyProgress: 0,
                  partnerStats: {},
                }
              }
              onUpdateGamification={setGamificationState}
              onCreateAction={handleCreateAction}
            />
          </Suspense>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="mindmap" className="flex items-center gap-2">
                <EssentialIcons.Heart size={ICON_SIZES.SMALL} />
                Issues Map
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center gap-2">
                <EssentialIcons.Target size={ICON_SIZES.SMALL} />
                Action Plans
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <EssentialIcons.ChartBar size={ICON_SIZES.SMALL} />
                Progress
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mindmap" className="space-y-6">
              <Suspense fallback={<ComponentLoader message="Loading mindmap..." />}>
                <LazyMindmapView
                  issues={issues || []}
                  setIssues={setIssuesWrapper}
                  actions={actions || []}
                  setActions={setActionsWrapper}
                  currentPartner={currentPartner}
                  otherPartner={otherPartner}
                  viewingAsPartner={activePartner}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="actions" className="space-y-6">
              <ResponsiveActionDashboard
                issues={issues || []}
                actions={getPersonalizedActions()}
                setActions={setActionsWrapper}
                currentPartner={currentPartner}
                otherPartner={otherPartner}
                viewingAsPartner={activePartner}
              />
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <ResponsiveProgressView
                issues={issues || []}
                actions={actions || []}
                healthScore={
                  healthScore || {
                    overallScore: 0,
                    categories: {
                      communication: 0,
                      intimacy: 0,
                      finance: 0,
                      time: 0,
                      family: 0,
                      personalGrowth: 0,
                    },
                    lastUpdated: new Date().toISOString(),
                  }
                }
                setHealthScore={setHealthScoreWrapper}
                currentPartner={currentPartner}
                otherPartner={otherPartner}
                viewingAsPartner={activePartner}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
      <Toaster />
    </div>
  );
}

export default App;
