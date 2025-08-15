import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMobileDetection } from '@/hooks/use-mobile';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  pressable?: boolean;
  elevated?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'bordered' | 'filled';
}

/**
 * Mobile-optimized card component with iOS-style interactions
 * Includes press feedback, swipe gestures, and proper touch targets
 */
export function MobileCard({
  children,
  className,
  onClick,
  onSwipeLeft,
  onSwipeRight,
  pressable = !!onClick,
  elevated = true,
  padding = 'md',
  variant = 'default',
}: MobileCardProps) {
  const { isMobile } = useMobileDetection();
  const { triggerSelection } = useHapticFeedback();

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const variantClasses = {
    default: 'bg-card border border-border',
    bordered: 'bg-transparent border-2 border-border',
    filled: 'bg-muted border-0',
  };

  const handlePress = () => {
    if (onClick && isMobile) {
      triggerSelection();
      onClick();
    } else if (onClick) {
      onClick();
    }
  };

  const cardContent = (
    <div
      className={cn(
        'rounded-xl transition-all duration-200',
        variantClasses[variant],
        paddingClasses[padding],
        elevated && 'shadow-sm',
        pressable && [
          'cursor-pointer',
          'active:scale-[0.98]',
          'active:opacity-90',
          'touch-manipulation',
          'select-none',
        ],
        isMobile && ['touch-target-44', 'ios-touch-feedback'],
        className
      )}
      onClick={handlePress}
      role={pressable ? 'button' : undefined}
      tabIndex={pressable ? 0 : undefined}
      onKeyDown={
        pressable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handlePress();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );

  // Add swipe gestures for mobile
  if (isMobile && (onSwipeLeft || onSwipeRight)) {
    return (
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(event, info) => {
          const threshold = 100;
          if (info.offset.x > threshold && onSwipeRight) {
            triggerSelection();
            onSwipeRight();
          } else if (info.offset.x < -threshold && onSwipeLeft) {
            triggerSelection();
            onSwipeLeft();
          }
        }}
        whileTap={pressable ? { scale: 0.98 } : undefined}
      >
        {cardContent}
      </motion.div>
    );
  }

  // Add press animation for mobile
  if (isMobile && pressable) {
    return (
      <motion.div whileTap={{ scale: 0.98 }} transition={{ duration: 0.1 }}>
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
}

/**
 * Mobile-optimized list item card
 * Designed for list views with consistent spacing and touch targets
 */
export function MobileListCard({
  children,
  className,
  onClick,
  leftAction,
  rightAction,
  ...props
}: MobileCardProps & {
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
}) {
  return (
    <MobileCard
      className={cn(
        'flex items-center gap-3 min-h-[60px]',
        'border-b border-border last:border-b-0',
        'rounded-none first:rounded-t-xl last:rounded-b-xl',
        className
      )}
      onClick={onClick}
      padding="md"
      variant="default"
      {...props}
    >
      {leftAction && <div className="flex-shrink-0">{leftAction}</div>}
      <div className="flex-1 min-w-0">{children}</div>
      {rightAction && <div className="flex-shrink-0">{rightAction}</div>}
    </MobileCard>
  );
}

/**
 * Mobile-optimized action card
 * Includes clear call-to-action styling and proper touch feedback
 */
export function MobileActionCard({
  children,
  className,
  icon,
  title,
  description,
  badge,
  ...props
}: MobileCardProps & {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  badge?: React.ReactNode;
}) {
  return (
    <MobileCard className={cn('relative overflow-hidden', className)} elevated pressable {...props}>
      <div className="flex items-start gap-4">
        {icon && (
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="font-semibold text-foreground text-base leading-tight mb-1">{title}</h3>
          )}
          {description && (
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
          )}
          {children && <div className="mt-3">{children}</div>}
        </div>
        {badge && <div className="absolute top-3 right-3">{badge}</div>}
      </div>
    </MobileCard>
  );
}
