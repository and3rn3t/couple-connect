import React, { Suspense } from 'react';
import { useMobileDetection } from '@/hooks/use-mobile';
import { MobilePartnerProfile } from './MobilePartnerProfile';
import { Partner } from './PartnerSetup';

// Lazy load desktop component for better performance
const DesktopPartnerProfile = React.lazy(() => import('./PartnerProfile'));

interface ResponsivePartnerProfileProps {
  currentPartner: Partner;
  otherPartner: Partner;
  onSwitchView: () => void;
  onSignOut: () => void;
}

export function ResponsivePartnerProfile(props: ResponsivePartnerProfileProps) {
  const { isMobile } = useMobileDetection();

  if (isMobile) {
    return <MobilePartnerProfile {...props} />;
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-3 animate-pulse">
          <div className="h-8 w-8 bg-muted rounded-full" />
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-8 w-8 bg-muted rounded" />
        </div>
      }
    >
      <DesktopPartnerProfile {...props} />
    </Suspense>
  );
}

export default ResponsivePartnerProfile;
