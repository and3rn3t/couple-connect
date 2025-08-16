import React, { forwardRef } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { useMobileDetection } from '@/hooks/use-mobile';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface MobileSelectProps extends React.ComponentProps<typeof SelectPrimitive.Root> {
  useNativePicker?: boolean;
  label?: string;
  error?: string;
  placeholder?: string;
}

interface MobileSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface MobileSelectNativeProps
  extends Omit<React.ComponentProps<'select'>, 'value' | 'onChange'> {
  options: MobileSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
}

// Native select for better mobile experience
const MobileSelectNative = forwardRef<HTMLSelectElement, MobileSelectNativeProps>(
  (
    {
      options,
      value,
      onValueChange,
      placeholder = 'Select an option...',
      label,
      error,
      className,
      ...props
    },
    ref
  ) => {
    const { triggerSelection } = useHapticFeedback();

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = event.target.value;
        triggerSelection(); // Haptic feedback on selection
        onValueChange?.(newValue);
      },
      [onValueChange, triggerSelection]
    );

    const selectId = React.useId();
    const errorId = `${selectId}-error`;

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            value={value || ''}
            onChange={handleChange}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              // Base styles similar to input
              'flex h-12 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-base shadow-xs transition-colors',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',

              // Mobile optimizations
              'touch-manipulation appearance-none cursor-pointer',

              // Error states
              error && 'border-destructive focus-visible:ring-destructive',

              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom dropdown arrow */}
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 pointer-events-none" />
        </div>

        {error && (
          <p id={errorId} className="text-sm text-destructive flex items-center gap-1" role="alert">
            <svg
              className="h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

MobileSelectNative.displayName = 'MobileSelectNative';

// Enhanced Radix Select for desktop and when native picker is disabled
function MobileSelect({ useNativePicker = true, ...props }: MobileSelectProps) {
  const { isMobile } = useMobileDetection();

  // Use native picker on mobile by default for better UX
  if (isMobile && useNativePicker) {
    // This would need to be handled by parent component passing options
    // For now, fall back to Radix Select
  }

  return <SelectPrimitive.Root data-slot="mobile-select" {...props} />;
}

function MobileSelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="mobile-select-group" {...props} />;
}

function MobileSelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="mobile-select-value" {...props} />;
}

interface MobileSelectTriggerProps extends React.ComponentProps<typeof SelectPrimitive.Trigger> {
  size?: 'sm' | 'default' | 'lg';
}

const MobileSelectTrigger = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  MobileSelectTriggerProps
>(({ className, size = 'default', children, ...props }, ref) => {
  const { isMobile } = useMobileDetection();
  const { triggerSelection } = useHapticFeedback();

  const handleClick = React.useCallback(() => {
    if (isMobile) {
      triggerSelection();
    }
  }, [isMobile, triggerSelection]);

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      data-slot="mobile-select-trigger"
      data-size={size}
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs ring-offset-background transition-colors',
        'placeholder:text-muted-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        '[&>span]:line-clamp-1',

        // Size variants with mobile optimization
        {
          sm: isMobile ? 'h-10 text-sm' : 'h-8 text-xs',
          default: isMobile ? 'h-12 text-base' : 'h-9 text-sm',
          lg: isMobile ? 'h-14 text-lg' : 'h-10 text-base',
        }[size],

        // Mobile optimizations
        isMobile && [
          'touch-manipulation',
          'active:scale-98',
          'min-h-[44px]', // Ensure minimum touch target
        ],

        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});

MobileSelectTrigger.displayName = 'MobileSelectTrigger';

const MobileSelectScrollUpButton = forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    data-slot="mobile-select-scroll-up-button"
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4 rotate-180" />
  </SelectPrimitive.ScrollUpButton>
));

MobileSelectScrollUpButton.displayName = 'MobileSelectScrollUpButton';

const MobileSelectScrollDownButton = forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    data-slot="mobile-select-scroll-down-button"
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));

MobileSelectScrollDownButton.displayName = 'MobileSelectScrollDownButton';

const MobileSelectContent = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentProps<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => {
  const { isMobile } = useMobileDetection();

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        data-slot="mobile-select-content"
        className={cn(
          'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',

          // Mobile-specific positioning and styling
          isMobile
            ? [
                // Sheet-like behavior on mobile
                'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
                'w-full max-w-none rounded-t-lg border-t-0',
                position === 'popper' &&
                  'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
              ]
            : [
                // Desktop behavior
                position === 'popper' &&
                  'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
              ],

          className
        )}
        position={position}
        {...props}
      >
        <MobileSelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-1',
            position === 'popper' &&
              'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <MobileSelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});

MobileSelectContent.displayName = 'MobileSelectContent';

const MobileSelectLabel = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentProps<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    data-slot="mobile-select-label"
    className={cn('px-2 py-1.5 text-sm font-semibold', className)}
    {...props}
  />
));

MobileSelectLabel.displayName = 'MobileSelectLabel';

const MobileSelectItem = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentProps<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  const { isMobile } = useMobileDetection();
  const { triggerSelection } = useHapticFeedback();

  const handleSelect = React.useCallback(() => {
    if (isMobile) {
      triggerSelection();
    }
  }, [isMobile, triggerSelection]);

  return (
    <SelectPrimitive.Item
      ref={ref}
      data-slot="mobile-select-item"
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none',
        'focus:bg-accent focus:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',

        // Mobile optimizations
        isMobile && [
          'min-h-[44px] py-3', // Larger touch targets
          'touch-manipulation',
        ],

        className
      )}
      onSelect={handleSelect}
      {...props}
    >
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});

MobileSelectItem.displayName = 'MobileSelectItem';

const MobileSelectSeparator = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentProps<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    data-slot="mobile-select-separator"
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
));

MobileSelectSeparator.displayName = 'MobileSelectSeparator';

export {
  MobileSelect,
  MobileSelectNative,
  MobileSelectGroup,
  MobileSelectValue,
  MobileSelectTrigger,
  MobileSelectContent,
  MobileSelectLabel,
  MobileSelectItem,
  MobileSelectSeparator,
  MobileSelectScrollUpButton,
  MobileSelectScrollDownButton,
};

export type { MobileSelectProps, MobileSelectNativeProps, MobileSelectOption };
