import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, SignOut, Gear } from '@/components/ui/InlineIcons';
import { Partner } from './PartnerSetup';
import { useMobileDetection } from '@/hooks/use-mobile';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { TouchButton } from '@/components/ui/touch-feedback';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MobilePartnerProfileProps {
  currentPartner: Partner;
  otherPartner: Partner;
  onSwitchView: () => void;
  onSignOut: () => void;
}

export function MobilePartnerProfile({
  currentPartner,
  otherPartner,
  onSwitchView,
  onSignOut,
}: MobilePartnerProfileProps) {
  const { isMobile } = useMobileDetection();
  const { triggerHaptic } = useHapticFeedback();

  if (!isMobile) {
    return null; // Fallback to desktop version
  }

  const handleSwitchView = () => {
    triggerHaptic('selection');
    onSwitchView();
  };

  const handleSignOut = () => {
    triggerHaptic('medium');
    onSignOut();
  };

  return (
    <div className="flex items-center justify-between w-full p-4 safe-area-top">
      {/* Current Partner Info */}
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 touch-target-44">
          <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
            {currentPartner.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-base font-semibold text-foreground">{currentPartner.name}</span>
          <Badge variant="secondary" className="text-xs w-fit mt-1">
            Your View
          </Badge>
        </div>
      </div>

      {/* Mobile Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <TouchButton
            variant="ghost"
            className="h-12 w-12 rounded-full touch-target-44"
            hapticType="light"
          >
            <User size={20} />
          </TouchButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 mt-2">
          <div className="flex flex-col space-y-1 p-3">
            <div className="flex items-center gap-3 pb-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-muted text-sm">
                  {currentPartner.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{currentPartner.name}</span>
                <span className="text-xs text-muted-foreground">Currently viewing</span>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleSwitchView}
            className="flex items-center gap-3 p-4 touch-target-44"
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-accent text-xs">
                {otherPartner.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Switch to {otherPartner.name}</span>
              <span className="text-xs text-muted-foreground">View from partner's perspective</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="flex items-center gap-3 p-4 touch-target-44">
            <Gear size={16} className="text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Settings</span>
              <span className="text-xs text-muted-foreground">Preferences and configuration</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleSignOut}
            className="flex items-center gap-3 p-4 text-destructive focus:text-destructive touch-target-44"
          >
            <SignOut size={16} />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Sign Out</span>
              <span className="text-xs text-muted-foreground">End current session</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Compact mobile profile for navigation bars
export function MobilePartnerProfileCompact({
  currentPartner,
  onSwitchView,
}: Pick<MobilePartnerProfileProps, 'currentPartner' | 'onSwitchView'>) {
  const { triggerHaptic } = useHapticFeedback();

  const handlePress = () => {
    triggerHaptic('selection');
    onSwitchView();
  };

  return (
    <TouchButton
      onPress={handlePress}
      className="flex items-center gap-2 p-2 rounded-lg touch-target-44"
      variant="ghost"
      hapticType="selection"
    >
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
          {currentPartner.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-start">
        <span className="text-sm font-medium truncate max-w-24">{currentPartner.name}</span>
        <Badge variant="secondary" className="text-xs">
          Switch
        </Badge>
      </div>
    </TouchButton>
  );
}

export default MobilePartnerProfile;
