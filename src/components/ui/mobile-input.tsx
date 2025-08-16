import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useMobileDetection } from '@/hooks/use-mobile';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface MobileInputProps extends React.ComponentProps<'input'> {
  label?: string;
  error?: string;
  helpText?: string;
  mobileKeyboard?: 'default' | 'numeric' | 'email' | 'tel' | 'search' | 'url';
  autoCapitalize?: 'off' | 'on' | 'words' | 'sentences';
  autoComplete?: string;
  inputMode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'search' | 'email' | 'url';
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
  hapticFeedback?: boolean;
}

const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helpText,
      mobileKeyboard = 'default',
      autoCapitalize = 'off',
      autoComplete,
      inputMode,
      enterKeyHint = 'done',
      hapticFeedback = true,
      onFocus,
      onChange,
      ...props
    },
    ref
  ) => {
    const { isMobile } = useMobileDetection();
    const { triggerSelection } = useHapticFeedback();

    // Auto-determine inputMode based on type and mobileKeyboard
    const getInputMode = () => {
      if (inputMode) return inputMode;

      switch (type) {
        case 'email':
          return 'email';
        case 'tel':
          return 'tel';
        case 'number':
          return 'numeric';
        case 'search':
          return 'search';
        case 'url':
          return 'url';
        default:
          switch (mobileKeyboard) {
            case 'numeric':
              return 'numeric';
            case 'email':
              return 'email';
            case 'tel':
              return 'tel';
            case 'search':
              return 'search';
            case 'url':
              return 'url';
            default:
              return 'text';
          }
      }
    };

    // Auto-determine autoComplete
    const getAutoComplete = () => {
      if (autoComplete) return autoComplete;

      switch (type) {
        case 'email':
          return 'email';
        case 'tel':
          return 'tel';
        case 'password':
          return 'current-password';
        case 'url':
          return 'url';
        default:
          return 'off';
      }
    };

    const handleFocus = React.useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        // Trigger haptic feedback on focus for mobile
        if (isMobile && hapticFeedback) {
          triggerSelection();
        }

        onFocus?.(event);
      },
      [isMobile, hapticFeedback, triggerSelection, onFocus]
    );

    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(event);
      },
      [onChange]
    );

    const inputId = React.useId();
    const errorId = `${inputId}-error`;
    const helpId = `${inputId}-help`;

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          data-slot="mobile-input"
          className={cn(
            // Base styles
            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',

            // Mobile-optimized height and touch targets
            isMobile ? 'h-12 text-base' : 'h-9 md:text-sm',

            // Focus states
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',

            // Error states
            error
              ? 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border-destructive'
              : '',

            // Mobile-specific optimizations
            isMobile && [
              'touch-manipulation',
              'selection:bg-primary/20', // Lighter selection for mobile
            ],

            className
          )}
          autoCapitalize={autoCapitalize}
          autoComplete={getAutoComplete()}
          inputMode={getInputMode()}
          enterKeyHint={enterKeyHint}
          aria-invalid={!!error}
          aria-describedby={
            [error && errorId, helpText && helpId].filter(Boolean).join(' ') || undefined
          }
          onFocus={handleFocus}
          onChange={handleChange}
          {...props}
        />

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

        {helpText && !error && (
          <p id={helpId} className="text-sm text-muted-foreground">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

MobileInput.displayName = 'MobileInput';

export { MobileInput };
export type { MobileInputProps };
