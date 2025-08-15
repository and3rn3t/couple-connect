import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Heart, Target, ChartBar, User, Gear } from '@phosphor-icons/react';
import { useMobileDetection } from '@/hooks/use-mobile';
import { HAPTIC_DURATIONS } from '@/constants/mobile';

interface MobileTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

interface TabItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const tabs: TabItem[] = [
  {
    id: 'mindmap',
    label: 'Issues',
    icon: Heart,
  },
  {
    id: 'actions',
    label: 'Actions',
    icon: Target,
  },
  {
    id: 'progress',
    label: 'Progress',
    icon: ChartBar,
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Gear,
  },
];

export function MobileTabBar({ activeTab, onTabChange, className }: MobileTabBarProps) {
  const { isMobile } = useMobileDetection();

  if (!isMobile) {
    return null;
  }

  const handleTabPress = (tabId: string) => {
    // Simulate haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(HAPTIC_DURATIONS.SELECTION);
    }
    onTabChange(tabId);
  };

  return (
    <div
      className={cn(
        'ios-tab-bar fixed bottom-0 left-0 right-0 z-50',
        'flex items-center justify-around',
        'px-safe-area-left pr-safe-area-right',
        className
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <Button
            key={tab.id}
            variant="ghost"
            size="sm"
            onClick={() => handleTabPress(tab.id)}
            className={cn(
              'ios-touch-feedback flex flex-col items-center justify-center',
              'touch-target-44 min-w-0 flex-1 h-12 p-1',
              'border-0 rounded-none bg-transparent hover:bg-transparent',
              'transition-colors duration-150',
              isActive
                ? 'text-primary'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            )}
            aria-label={tab.label}
            aria-selected={isActive}
            role="tab"
          >
            <Icon size={20} weight={isActive ? 'fill' : 'regular'} className="mb-1" />
            <span className="text-xs font-medium leading-none">{tab.label}</span>
            {tab.badge && tab.badge > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                {tab.badge > 99 ? '99+' : tab.badge}
              </div>
            )}
          </Button>
        );
      })}
    </div>
  );
}

interface MobileNavBarProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
}

export function MobileNavBar({ title, onBack, rightAction, className }: MobileNavBarProps) {
  const { isMobile } = useMobileDetection();

  if (!isMobile) {
    return null;
  }

  return (
    <div
      className={cn(
        'ios-nav-bar fixed top-0 left-0 right-0 z-40',
        'flex items-center justify-between px-4',
        'pl-safe-area-left pr-safe-area-right',
        className
      )}
    >
      <div className="flex items-center justify-start w-20">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="ios-touch-feedback touch-target-44 p-2 -ml-2"
            aria-label="Back"
          >
            <span className="text-primary text-base font-medium">‹ Back</span>
          </Button>
        )}
      </div>

      <div className="flex-1 text-center">
        <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
      </div>

      <div className="flex items-center justify-end w-20">{rightAction}</div>
    </div>
  );
}

interface MobileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function MobileSheet({ isOpen, onClose, title, children, className }: MobileSheetProps) {
  const { isMobile } = useMobileDetection();

  if (!isMobile || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="ios-sheet-backdrop absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Sheet Content */}
      <div
        className={cn(
          'ios-sheet absolute bottom-0 left-0 right-0',
          'max-h-[90vh] bg-background',
          'pb-safe-area-bottom pl-safe-area-left pr-safe-area-right',
          className
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-lg font-semibold">{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="touch-target-44 p-2"
              aria-label="Close"
            >
              <span className="text-primary text-base font-medium">Done</span>
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4">{children}</div>
      </div>
    </div>
  );
}

export default MobileTabBar;
