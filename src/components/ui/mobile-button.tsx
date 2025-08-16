import React, { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useMobileDetection } from '@/hooks/use-mobile';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

// Mobile-optimized button variants with larger touch targets
const mobileButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive touch-manipulation active:scale-95 select-none",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 active:bg-primary/95',
        destructive:
          'bg-destructive text-white shadow-lg hover:bg-destructive/90 active:bg-destructive/95 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border-2 bg-background shadow-lg hover:bg-accent hover:text-accent-foreground active:bg-accent/80 dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground shadow-lg hover:bg-secondary/80 active:bg-secondary/90',
        ghost:
          'hover:bg-accent hover:text-accent-foreground active:bg-accent/80 dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline active:text-primary/80',
        floating:
          'bg-primary text-primary-foreground shadow-2xl rounded-full hover:bg-primary/90 active:bg-primary/95 hover:shadow-xl transition-shadow',
      },
      size: {
        // Mobile-first sizes with minimum 44px touch targets
        default: 'h-11 px-4 py-2 has-[>svg]:px-3 min-w-[44px]',
        sm: 'h-10 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 min-w-[40px]',
        lg: 'h-12 rounded-md px-6 has-[>svg]:px-4 min-w-[48px]',
        xl: 'h-14 rounded-lg px-8 has-[>svg]:px-6 text-base min-w-[56px]',
        icon: 'size-11 min-w-[44px] min-h-[44px]',
        'icon-sm': 'size-10 min-w-[40px] min-h-[40px]',
        'icon-lg': 'size-12 min-w-[48px] min-h-[48px]',
        fab: 'size-14 rounded-full min-w-[56px] min-h-[56px]', // Floating Action Button
      },
      haptic: {
        none: '',
        light: '',
        medium: '',
        heavy: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      haptic: 'light',
    },
  }
);

interface MobileButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof mobileButtonVariants> {
  asChild?: boolean;
  onLongPress?: () => void;
  longPressDelay?: number;
  hapticType?: 'light' | 'medium' | 'heavy' | 'none';
}

const MobileButton = forwardRef<HTMLButtonElement, MobileButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      onClick,
      onLongPress,
      longPressDelay = 500,
      hapticType = 'light',
      ...props
    },
    ref
  ) => {
    const { isMobile } = useMobileDetection();
    const { triggerHaptic } = useHapticFeedback();

    const [isPressed, setIsPressed] = React.useState(false);
    const longPressTimerRef = React.useRef<NodeJS.Timeout | null>(null);

    const Comp = asChild ? Slot : 'button';

    const handleTouchStart = React.useCallback(() => {
      setIsPressed(true);

      // Trigger haptic feedback on touch start
      if (isMobile && hapticType !== 'none') {
        triggerHaptic();
      }

      // Set up long press timer
      if (onLongPress && longPressDelay > 0) {
        longPressTimerRef.current = setTimeout(() => {
          onLongPress();
          if (isMobile) {
            triggerHaptic(); // Strong feedback for long press
          }
        }, longPressDelay);
      }
    }, [isMobile, hapticType, onLongPress, longPressDelay, triggerHaptic]);

    const handleTouchEnd = React.useCallback(() => {
      setIsPressed(false);

      // Clear long press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }, []);

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        // Trigger haptic feedback for regular clicks (if not already triggered by touch)
        if (!isMobile && hapticType !== 'none') {
          triggerHaptic();
        }

        onClick?.(event);
      },
      [isMobile, hapticType, onClick, triggerHaptic]
    );

    // Clean up timer on unmount
    React.useEffect(() => {
      return () => {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
        }
      };
    }, []);

    return (
      <Comp
        ref={ref}
        data-slot="mobile-button"
        className={cn(
          mobileButtonVariants({ variant, size, className }),
          // Add pressed state styling
          isPressed && 'brightness-95 scale-95',
          // Extra mobile optimizations
          isMobile && 'cursor-pointer'
        )}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        {...props}
      />
    );
  }
);

MobileButton.displayName = 'MobileButton';

export { MobileButton, mobileButtonVariants };
export type { MobileButtonProps };
