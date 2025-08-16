import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMobileDetection } from '@/hooks/use-mobile';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { Check, X } from '@/components/ui/InlineIcons';

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'ios';
}

/**
 * Mobile-optimized input component with iOS-style design
 */
export function MobileInput({
  label,
  error,
  helpText,
  leftIcon,
  rightIcon,
  variant = 'ios',
  className,
  ...props
}: MobileInputProps) {
  const { isMobile } = useMobileDetection();

  const inputClasses = {
    default: 'border border-border bg-background',
    ios: 'border-0 bg-muted/50 backdrop-blur-sm',
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-foreground block">{label}</label>}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}

        <input
          className={cn(
            'w-full rounded-xl px-4 py-3.5 text-base transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'placeholder:text-muted-foreground',
            isMobile && 'touch-target-48 text-base', // Prevent zoom on iOS
            leftIcon && 'pl-12',
            rightIcon && 'pr-12',
            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            inputClasses[variant],
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive flex items-center gap-1"
        >
          <X size={14} />
          {error}
        </motion.p>
      )}

      {helpText && !error && <p className="text-sm text-muted-foreground">{helpText}</p>}
    </div>
  );
}

interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
  variant?: 'default' | 'ios';
  autoResize?: boolean;
}

/**
 * Mobile-optimized textarea component
 */
export function MobileTextarea({
  label,
  error,
  helpText,
  variant = 'ios',
  autoResize = true,
  className,
  ...props
}: MobileTextareaProps) {
  const { isMobile } = useMobileDetection();

  const textareaClasses = {
    default: 'border border-border bg-background',
    ios: 'border-0 bg-muted/50 backdrop-blur-sm',
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-foreground block">{label}</label>}

      <textarea
        className={cn(
          'w-full rounded-xl px-4 py-3.5 text-base transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
          'placeholder:text-muted-foreground resize-none',
          isMobile && 'touch-target-48 text-base min-h-[120px]',
          autoResize && 'resize-y',
          error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
          textareaClasses[variant],
          className
        )}
        {...props}
      />

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive flex items-center gap-1"
        >
          <X size={14} />
          {error}
        </motion.p>
      )}

      {helpText && !error && <p className="text-sm text-muted-foreground">{helpText}</p>}
    </div>
  );
}

interface MobileCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Mobile-optimized checkbox with large touch target
 */
export function MobileCheckbox({
  label,
  checked,
  onChange,
  disabled = false,
  className,
  size = 'md',
}: MobileCheckboxProps) {
  const { triggerSelection } = useHapticFeedback();

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  const handleChange = () => {
    if (!disabled) {
      triggerSelection();
      onChange(!checked);
    }
  };

  return (
    <label
      className={cn(
        'flex items-center gap-3 cursor-pointer touch-target-44 py-2',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <div className="relative">
        <motion.div
          className={cn(
            'rounded-lg border-2 border-border bg-background',
            'flex items-center justify-center transition-all duration-200',
            checked && 'bg-primary border-primary',
            sizeClasses[size]
          )}
          whileTap={{ scale: 0.9 }}
          onClick={handleChange}
        >
          <motion.div
            initial={false}
            animate={{
              scale: checked ? 1 : 0,
              opacity: checked ? 1 : 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
          >
            <Check
              size={size === 'sm' ? 12 : size === 'md' ? 14 : 16}
              className="text-primary-foreground"
              weight="bold"
            />
          </motion.div>
        </motion.div>
      </div>

      <span className="text-base text-foreground select-none flex-1">{label}</span>
    </label>
  );
}

interface MobileSelectProps {
  label?: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Mobile-optimized select component
 */
export function MobileSelect({
  label,
  options,
  value,
  onValueChange,
  placeholder = 'Select an option',
  error,
  disabled = false,
  className,
}: MobileSelectProps) {
  const { isMobile } = useMobileDetection();
  const { triggerSelection } = useHapticFeedback();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    triggerSelection();
    onValueChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-foreground block">{label}</label>}

      <div className="relative">
        <select
          value={value}
          onChange={handleChange}
          disabled={disabled}
          aria-label={label || placeholder}
          className={cn(
            'w-full rounded-xl px-4 py-3.5 text-base appearance-none bg-muted/50',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'border-0 backdrop-blur-sm transition-all duration-200',
            isMobile && 'touch-target-48',
            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-5 h-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive flex items-center gap-1"
        >
          <X size={14} />
          {error}
        </motion.p>
      )}
    </div>
  );
}
