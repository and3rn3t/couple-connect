import React, { Suspense } from 'react';
import { useMobileDetection } from '@/hooks/use-mobile';
import { MobileActionDashboard } from './MobileActionDashboardOptimized';
import { Issue, Action } from '@/App';
import { Partner } from './PartnerSetup';

// Lazy load desktop component for better performance
const DesktopActionDashboard = React.lazy(() => import('./ActionDashboard'));

interface ResponsiveActionDashboardProps {
  issues: Issue[];
  actions: Action[];
  setActions: (update: (current: Action[]) => Action[]) => void;
  currentPartner: Partner;
  otherPartner: Partner;
  viewingAsPartner: Partner;
}

export function ResponsiveActionDashboard(props: ResponsiveActionDashboardProps) {
  const { isMobile } = useMobileDetection();

  if (isMobile) {
    return <MobileActionDashboard {...props} />;
  }

  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-10 w-32 bg-muted rounded" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 w-24 bg-muted rounded" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-20 bg-muted rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <DesktopActionDashboard {...props} />
    </Suspense>
  );
}

export default ResponsiveActionDashboard;
