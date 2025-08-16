import React, { Suspense } from 'react';
import { useMobileDetection } from '@/hooks/use-mobile';
import { MobileProgressView } from './MobileProgressView';
import { Issue, Action, RelationshipHealth } from '@/App';
import { Partner } from './PartnerSetup';

// Lazy load desktop component for better performance
const DesktopProgressView = React.lazy(() => import('./ProgressView'));

// Use the main app's RelationshipHealth interface
type HealthScore = RelationshipHealth;

interface ResponsiveProgressViewProps {
  issues: Issue[];
  actions: Action[];
  healthScore: HealthScore;
  setHealthScore: (update: (current: HealthScore) => HealthScore) => void;
  currentPartner: Partner;
  otherPartner: Partner;
  viewingAsPartner: Partner;
}

export function ResponsiveProgressView(props: ResponsiveProgressViewProps) {
  const { isMobile } = useMobileDetection();

  if (isMobile) {
    return <MobileProgressView {...props} />;
  }

  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="h-64 bg-muted rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-48 bg-muted rounded-lg" />
            <div className="h-48 bg-muted rounded-lg" />
          </div>
        </div>
      }
    >
      <DesktopProgressView {...props} />
    </Suspense>
  );
}

export default ResponsiveProgressView;
