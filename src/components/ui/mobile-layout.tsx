import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMobileDetection, useIOSDetection } from '@/hooks/use-mobile';
import { MobileNavBar } from './mobile-navigation';
import { X } from '@phosphor-icons/react';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  backButton?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
  noGutters?: boolean;
  backgroundColor?: 'default' | 'muted' | 'transparent';
}

/**
 * Mobile-optimized layout component with safe area support
 */
export function MobileLayout({
  children,
  title,
  backButton = false,
  onBack,
  rightAction,
  className,
  fullHeight = true,
  noGutters = false,
  backgroundColor = 'default',
}: MobileLayoutProps) {
  const { isMobile } = useMobileDetection();
  const { hasSafeArea } = useIOSDetection();

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  const backgroundClasses = {
    default: 'bg-background',
    muted: 'bg-muted',
    transparent: 'bg-transparent',
  };

  return (
    <div
      className={cn(
        'flex flex-col',
        fullHeight && 'min-h-screen',
        backgroundClasses[backgroundColor],
        hasSafeArea && 'ios-safe-area',
        className
      )}
    >
      {/* Navigation Bar */}
      {title && (
        <MobileNavBar
          title={title}
          onBack={backButton ? onBack : undefined}
          rightAction={rightAction}
        />
      )}

      {/* Main Content */}
      <main className={cn('flex-1 flex flex-col', !noGutters && 'px-4', title && 'pt-2')}>
        {children}
      </main>
    </div>
  );
}

interface MobilePageProps {
  children: React.ReactNode;
  title: string;
  className?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Full-page mobile layout with header and optional footer
 */
export function MobilePage({
  children,
  title,
  className,
  showBackButton = false,
  onBack,
  headerAction,
  footer,
}: MobilePageProps) {
  return (
    <MobileLayout
      title={title}
      backButton={showBackButton}
      onBack={onBack}
      rightAction={headerAction}
      className={className}
      fullHeight
    >
      <div className="flex-1 flex flex-col">{children}</div>
      {footer && <footer className="mt-auto pt-4 pb-safe-area-bottom">{footer}</footer>}
    </MobileLayout>
  );
}

interface MobileModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
  className?: string;
}

/**
 * Mobile-optimized modal with iOS-style presentation
 */
export function MobileModal({
  children,
  isOpen,
  onClose,
  title,
  size = 'md',
  showCloseButton = true,
  className,
}: MobileModalProps) {
  const { isMobile } = useMobileDetection();

  const sizeClasses = {
    sm: 'max-h-[50vh]',
    md: 'max-h-[75vh]',
    lg: 'max-h-[90vh]',
    full: 'h-full',
  };

  if (!isMobile) {
    // Fallback to regular modal for desktop
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50',
              'bg-background rounded-t-3xl shadow-2xl',
              'border-t border-border',
              sizeClasses[size],
              className
            )}
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 pb-4">
                {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
                    aria-label="Close modal"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="px-6 pb-safe-area-bottom overflow-y-auto flex-1">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface MobileStackProps {
  children: React.ReactNode;
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  align?: 'start' | 'center' | 'end' | 'stretch';
}

/**
 * Mobile-optimized vertical stack component
 */
export function MobileStack({
  children,
  spacing = 'md',
  className,
  align = 'stretch',
}: MobileStackProps) {
  const spacingClasses = {
    none: 'space-y-0',
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  return (
    <div className={cn('flex flex-col', spacingClasses[spacing], alignClasses[align], className)}>
      {children}
    </div>
  );
}

interface MobileGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Mobile-optimized grid component
 */
export function MobileGrid({ children, columns = 2, gap = 'md', className }: MobileGridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  const gapClasses = {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div className={cn('grid', columnClasses[columns], gapClasses[gap], className)}>{children}</div>
  );
}
