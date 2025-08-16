import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowClockwise, CheckCircle } from '@/components/ui/InlineIcons';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  refreshThreshold?: number;
  disabled?: boolean;
}

/**
 * Pull-to-refresh component for mobile interfaces
 * Provides native-like pull-to-refresh functionality
 */
export function PullToRefresh({
  onRefresh,
  children,
  className,
  refreshThreshold = 80,
  disabled = false,
}: PullToRefreshProps) {
  const { triggerSelection, triggerSuccess } = useHapticFeedback();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTriggered, setRefreshTriggered] = useState(false);

  const startY = useRef(0);
  const scrollElement = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || isRefreshing) return;

      const scrollTop = scrollElement.current?.scrollTop || 0;
      if (scrollTop > 0) return; // Only allow pull-to-refresh at top

      startY.current = e.touches[0].clientY;
      isDragging.current = true;
    },
    [disabled, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging.current || disabled || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      if (diff < 0) {
        isDragging.current = false;
        setPullDistance(0);
        return;
      }

      // Apply resistance to the pull
      const resistance = 0.5;
      const adjustedDiff = Math.min(diff * resistance, refreshThreshold * 1.5);

      setPullDistance(adjustedDiff);

      // Trigger haptic feedback when threshold is reached
      if (adjustedDiff >= refreshThreshold && !refreshTriggered) {
        triggerSelection();
        setRefreshTriggered(true);
      } else if (adjustedDiff < refreshThreshold && refreshTriggered) {
        setRefreshTriggered(false);
      }

      // Prevent scrolling when pulling
      if (diff > 10) {
        e.preventDefault();
      }
    },
    [disabled, isRefreshing, refreshThreshold, refreshTriggered, triggerSelection]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isDragging.current || disabled || isRefreshing) return;

    isDragging.current = false;

    if (pullDistance >= refreshThreshold) {
      setIsRefreshing(true);
      triggerSuccess();

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setRefreshTriggered(false);

        // Smooth reset animation
        setTimeout(() => {
          setPullDistance(0);
        }, 300);
      }
    } else {
      setPullDistance(0);
      setRefreshTriggered(false);
    }
  }, [disabled, isRefreshing, pullDistance, refreshThreshold, onRefresh, triggerSuccess]);

  const getRefreshState = () => {
    if (isRefreshing) return 'refreshing';
    if (pullDistance >= refreshThreshold) return 'ready';
    if (pullDistance > 0) return 'pulling';
    return 'idle';
  };

  const getRefreshIcon = () => {
    const state = getRefreshState();
    const iconClass = 'h-5 w-5 transition-all duration-200';

    switch (state) {
      case 'refreshing':
        return <ArrowClockwise className={cn(iconClass, 'animate-spin text-blue-500')} />;
      case 'ready':
        return <CheckCircle className={cn(iconClass, 'text-green-500')} />;
      case 'pulling':
        return <ArrowClockwise className={cn(iconClass, 'text-gray-400')} />;
      default:
        return null;
    }
  };

  const getRefreshText = () => {
    const state = getRefreshState();

    switch (state) {
      case 'refreshing':
        return 'Refreshing...';
      case 'ready':
        return 'Release to refresh';
      case 'pulling':
        return 'Pull to refresh';
      default:
        return '';
    }
  };

  const refreshProgress = Math.min((pullDistance / refreshThreshold) * 100, 100);

  return (
    <div className={cn('relative overflow-hidden', className)} ref={scrollElement}>
      {/* Pull-to-refresh indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-10 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm border-b"
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: pullDistance > 0 ? Math.min(pullDistance, refreshThreshold) : 0,
          opacity: pullDistance > 0 ? 1 : 0,
        }}
        transition={{
          duration: isRefreshing ? 0.3 : 0.1,
          ease: 'easeOut',
        }}
      >
        <div className="flex flex-col items-center gap-2 py-2">
          {/* Refresh icon */}
          <div className="relative">
            {getRefreshIcon()}

            {/* Progress ring */}
            {pullDistance > 0 && !isRefreshing && (
              <svg className="absolute inset-0 h-5 w-5 -rotate-90" viewBox="0 0 20 20">
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeOpacity="0.2"
                />
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={`${2 * Math.PI * 8}`}
                  strokeDashoffset={`${2 * Math.PI * 8 * (1 - refreshProgress / 100)}`}
                  className="transition-all duration-100 text-blue-500"
                />
              </svg>
            )}
          </div>

          {/* Refresh text */}
          <motion.span
            className="text-xs text-muted-foreground font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: pullDistance > 20 ? 1 : 0 }}
            transition={{ duration: 0.1 }}
          >
            {getRefreshText()}
          </motion.span>
        </div>
      </motion.div>

      {/* Content area */}
      <motion.div
        className="relative"
        animate={{
          y: isRefreshing ? refreshThreshold : pullDistance,
        }}
        transition={{
          duration: isRefreshing ? 0.3 : 0.1,
          ease: 'easeOut',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: pullDistance > 10 ? 'none' : 'auto' }}
      >
        {children}
      </motion.div>
    </div>
  );
}
