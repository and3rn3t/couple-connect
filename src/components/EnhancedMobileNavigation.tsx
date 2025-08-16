import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Target, ChartBar, User, Gear, X } from '@/components/ui/InlineIcons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSwipeGesture } from '@/hooks/useGestures';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface EnhancedMobileTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

interface TabItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  disabled?: boolean;
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
];

/**
 * Enhanced mobile tab bar with swipe navigation and haptic feedback
 */
export function EnhancedMobileTabBar({
  activeTab,
  onTabChange,
  className,
}: EnhancedMobileTabBarProps) {
  const { triggerSelection } = useHapticFeedback();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

  const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (direction === 'left' && activeIndex < tabs.length - 1) {
      // Swipe left to go to next tab
      triggerSelection();
      onTabChange(tabs[activeIndex + 1].id);
    } else if (direction === 'right' && activeIndex > 0) {
      // Swipe right to go to previous tab
      triggerSelection();
      onTabChange(tabs[activeIndex - 1].id);
    } else if (direction === 'up') {
      // Swipe up to show more menu
      triggerSelection();
      setShowMoreMenu(true);
    }
  };

  const swipeRef = useSwipeGesture(handleSwipe, {
    swipeThreshold: 30,
    preventDefault: false,
  });

  const handleTabPress = (tabId: string) => {
    triggerSelection();
    onTabChange(tabId);
  };

  return (
    <>
      <motion.div
        ref={swipeRef}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-background/95 backdrop-blur-md border-t border-border',
          'pb-safe-area-bottom',
          'touch-manipulation',
          className
        )}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Swipe indicator */}
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-muted-foreground/20 rounded-full" />

        <div className="flex items-center justify-around px-2 py-3">
          {tabs.map((tab, _index) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;

            return (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                disabled={tab.disabled}
                onClick={() => handleTabPress(tab.id)}
                className={cn(
                  'flex flex-col items-center gap-1 h-auto py-2 px-3',
                  'touch-target-44 min-w-[44px]',
                  'transition-all duration-200',
                  isActive && 'bg-primary/10'
                )}
              >
                <div className="relative">
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      color: isActive ? 'rgb(var(--primary))' : 'rgb(var(--muted-foreground))',
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.div>

                  {/* Badge */}
                  {tab.badge && tab.badge > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1"
                    >
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </motion.div>
                  )}
                </div>

                <motion.span
                  className={cn(
                    'text-[10px] font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                  animate={{
                    opacity: isActive ? 1 : 0.7,
                  }}
                >
                  {tab.label}
                </motion.span>

                {/* Active indicator */}
                <motion.div
                  className="absolute bottom-0 left-1/2 w-1 h-1 bg-primary rounded-full"
                  initial={{ scale: 0, x: '-50%' }}
                  animate={{ scale: isActive ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                />
              </Button>
            );
          })}

          {/* More menu trigger */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              triggerSelection();
              setShowMoreMenu(true);
            }}
            className={cn(
              'flex flex-col items-center gap-1 h-auto py-2 px-3',
              'touch-target-44 min-w-[44px]',
              'transition-all duration-200'
            )}
          >
            <Gear className="h-5 w-5 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">More</span>
          </Button>
        </div>

        {/* Navigation dots */}
        <div className="flex justify-center gap-1 pb-2">
          {tabs.map((_, index) => (
            <motion.div
              key={index}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-all duration-200',
                index === activeIndex ? 'bg-primary' : 'bg-muted-foreground/30'
              )}
              animate={{
                scale: index === activeIndex ? 1.2 : 1,
                opacity: index === activeIndex ? 1 : 0.5,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* More menu overlay */}
      <AnimatePresence>
        {showMoreMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowMoreMenu(false)}
            />

            {/* More menu */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl border-t border-border"
            >
              <div className="p-4">
                {/* Handle */}
                <div className="w-8 h-1 bg-muted-foreground/20 rounded-full mx-auto mb-4" />

                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Menu</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMoreMenu(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-12"
                    onClick={() => {
                      triggerSelection();
                      onTabChange('settings');
                      setShowMoreMenu(false);
                    }}
                  >
                    <Gear className="h-5 w-5 mr-3" />
                    Settings
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start h-12"
                    onClick={() => {
                      triggerSelection();
                      onTabChange('notifications');
                      setShowMoreMenu(false);
                    }}
                  >
                    <Heart className="h-5 w-5 mr-3" />
                    Notifications
                  </Button>
                </div>

                <div className="mt-6 pb-safe-area-bottom">
                  <p className="text-xs text-muted-foreground text-center">
                    Swipe left/right to navigate • Swipe up for menu
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Floating action button with gesture support
 */
interface FloatingActionButtonProps {
  onAction: () => void;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function FloatingActionButton({
  onAction,
  icon = <Target className="h-6 w-6" />,
  label = 'New Action',
  className,
  disabled = false,
}: FloatingActionButtonProps) {
  const { triggerButtonPress } = useHapticFeedback();
  const [showLabel, setShowLabel] = useState(false);

  const handlePress = () => {
    if (disabled) return;
    triggerButtonPress();
    onAction();
  };

  const handleLongPress = () => {
    if (disabled) return;
    triggerButtonPress();
    setShowLabel(true);
    setTimeout(() => setShowLabel(false), 2000);
  };

  const longPressRef = useSwipeGesture(() => {}, {
    longPressThreshold: 300,
  });

  return (
    <motion.div
      className={cn('fixed bottom-20 right-4 z-40', 'pb-safe-area-bottom', className)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="relative">
        {/* Label tooltip */}
        <AnimatePresence>
          {showLabel && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              className="absolute right-16 top-1/2 -translate-y-1/2 bg-background border border-border rounded-lg px-3 py-2 shadow-lg"
            >
              <span className="text-sm font-medium whitespace-nowrap">{label}</span>
              <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-border border-y-4 border-y-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB button */}
        <motion.div ref={longPressRef}>
          <motion.button
            onClick={handlePress}
            onTouchStart={handleLongPress}
            disabled={disabled}
            className={cn(
              'w-14 h-14 bg-primary text-primary-foreground',
              'rounded-full shadow-lg',
              'flex items-center justify-center',
              'touch-target-44',
              'transition-all duration-200',
              'hover:scale-105 active:scale-95',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {icon}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
