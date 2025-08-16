import React, { useState } from 'react';
import { MotionDiv, LazyAnimatePresence } from '@/components/ui/lazy-motion';
import { cn } from '@/lib/utils';
import { useMobileDetection } from '@/hooks/use-mobile';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface TouchFeedbackProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  className?: string;
  disabled?: boolean;
  hapticType?: 'light' | 'medium' | 'heavy' | 'selection';
  pressScale?: number;
  rippleColor?: string;
  longPressDelay?: number;
}

/**
 * Enhanced touch feedback component for mobile interfaces
 * Provides visual and haptic feedback for touch interactions
 */
export function TouchFeedback({
  children,
  onPress,
  onLongPress,
  className,
  disabled = false,
  hapticType = 'selection',
  pressScale = 0.95,
  rippleColor = 'rgba(59, 130, 246, 0.3)',
  longPressDelay = 500,
}: TouchFeedbackProps) {
  const { isMobile } = useMobileDetection();
  const { triggerHaptic } = useHapticFeedback();
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  let longPressTimer: NodeJS.Timeout | null = null;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;

    setIsPressed(true);

    // Trigger haptic feedback
    if (isMobile) {
      triggerHaptic(hapticType);
    }

    // Create ripple effect
    if (e.target instanceof HTMLElement) {
      const rect = e.currentTarget.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      const newRipple = {
        id: Date.now(),
        x,
        y,
      };

      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    }

    // Start long press timer
    if (onLongPress) {
      longPressTimer = setTimeout(() => {
        if (isMobile) {
          triggerHaptic('medium');
        }
        onLongPress();
        setIsPressed(false);
      }, longPressDelay);
    }
  };

  const handleTouchEnd = () => {
    if (disabled) return;

    setIsPressed(false);

    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    // Trigger press callback
    if (onPress) {
      onPress();
    }
  };

  const handleTouchCancel = () => {
    setIsPressed(false);

    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  };

  // Mouse events for desktop fallback
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || isMobile) return;

    setIsPressed(true);

    // Create ripple effect
    if (e.target instanceof HTMLElement) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newRipple = {
        id: Date.now(),
        x,
        y,
      };

      setRipples((prev) => [...prev, newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    }
  };

  const handleMouseUp = () => {
    if (disabled || isMobile) return;

    setIsPressed(false);

    if (onPress) {
      onPress();
    }
  };

  const handleMouseLeave = () => {
    if (disabled || isMobile) return;
    setIsPressed(false);
  };

  return (
    <MotionDiv
      className={cn(
        'relative overflow-hidden touch-manipulation select-none',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      animate={{
        scale: isPressed ? pressScale : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
        duration: 0.1,
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {/* Ripple effects */}
      <LazyAnimatePresence>
        {ripples.map((ripple) => (
          <MotionDiv
            key={ripple.id}
            className="absolute pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              background: rippleColor,
            }}
            initial={{
              width: 0,
              height: 0,
              opacity: 0.8,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              width: 120,
              height: 120,
              opacity: 0,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
            }}
          />
        ))}
      </LazyAnimatePresence>
    </MotionDiv>
  );
}

/**
 * Button wrapper with enhanced touch feedback
 */
export function TouchButton({
  children,
  variant = 'default',
  size = 'md',
  className,
  ...props
}: TouchFeedbackProps & {
  variant?: 'default' | 'primary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}) {
  const variantClasses = {
    default: 'bg-background border border-border text-foreground hover:bg-muted',
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ghost: 'text-foreground hover:bg-muted',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm touch-target-44',
    md: 'px-4 py-3 text-base touch-target-48',
    lg: 'px-6 py-4 text-lg touch-target-56',
  };

  return (
    <TouchFeedback
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      pressScale={0.96}
      {...props}
    >
      {children}
    </TouchFeedback>
  );
}
