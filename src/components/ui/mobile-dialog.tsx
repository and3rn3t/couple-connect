import React, { forwardRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { useMobileDetection } from '@/hooks/use-mobile';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

interface MobileDialogProps extends React.ComponentProps<typeof DialogPrimitive.Root> {
  variant?: 'modal' | 'sheet' | 'fullscreen';
}

function MobileDialog({ variant: _variant = 'sheet', ...props }: MobileDialogProps) {
  return <DialogPrimitive.Root data-slot="mobile-dialog" {...props} />;
}

function MobileDialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="mobile-dialog-trigger" {...props} />;
}

function MobileDialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="mobile-dialog-portal" {...props} />;
}

function MobileDialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  const { triggerSelection } = useHapticFeedback();
  const { isMobile } = useMobileDetection();
  const { onClick, ...otherProps } = props;

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isMobile) {
        triggerSelection();
      }
      onClick?.(event);
    },
    [isMobile, triggerSelection, onClick]
  );

  return (
    <DialogPrimitive.Close data-slot="mobile-dialog-close" {...otherProps} onClick={handleClick} />
  );
}

interface MobileDialogOverlayProps extends React.ComponentProps<typeof DialogPrimitive.Overlay> {
  variant?: 'modal' | 'sheet' | 'fullscreen';
}

const MobileDialogOverlay = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  MobileDialogOverlayProps
>(({ className, variant = 'sheet', ...props }, ref) => {
  const { isMobile } = useMobileDetection();

  return (
    <DialogPrimitive.Overlay
      ref={ref}
      data-slot="mobile-dialog-overlay"
      className={cn(
        'fixed inset-0 z-50 transition-all duration-200',
        // Different overlay styles for different variants
        variant === 'fullscreen' ? 'bg-background' : 'bg-black/50 backdrop-blur-sm',
        // Mobile-specific animations
        isMobile
          ? [
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              variant === 'sheet' &&
                'data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
            ]
          : [
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            ],
        className
      )}
      {...props}
    />
  );
});

MobileDialogOverlay.displayName = 'MobileDialogOverlay';

interface MobileDialogContentProps extends React.ComponentProps<typeof DialogPrimitive.Content> {
  variant?: 'modal' | 'sheet' | 'fullscreen';
  hideCloseButton?: boolean;
}

const MobileDialogContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  MobileDialogContentProps
>(({ className, children, variant = 'sheet', hideCloseButton = false, ...props }, ref) => {
  const { isMobile } = useMobileDetection();

  return (
    <MobileDialogPortal>
      <MobileDialogOverlay variant={variant} />
      <DialogPrimitive.Content
        ref={ref}
        data-slot="mobile-dialog-content"
        className={cn(
          'fixed z-50 gap-4 bg-background p-6 shadow-lg transition-all duration-200',

          // Variant-specific positioning and styling
          variant === 'fullscreen' && [
            'inset-0 w-full h-full rounded-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          ],

          variant === 'sheet' && [
            isMobile
              ? [
                  // Mobile sheet from bottom
                  'bottom-0 left-0 right-0 max-h-[85vh] rounded-t-xl',
                  'data-[state=open]:animate-in data-[state=closed]:animate-out',
                  'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
                  // Safe area padding for mobile
                  'pb-[env(safe-area-inset-bottom)]',
                ]
              : [
                  // Desktop modal
                  'left-[50%] top-[50%] max-w-lg w-full translate-x-[-50%] translate-y-[-50%] rounded-lg border',
                  'data-[state=open]:animate-in data-[state=closed]:animate-out',
                  'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                  'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                  'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
                  'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
                ],
          ],

          variant === 'modal' && [
            'left-[50%] top-[50%] max-w-lg w-full translate-x-[-50%] translate-y-[-50%] rounded-lg border',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          ],

          // Mobile-specific optimizations
          isMobile && [
            'touch-manipulation',
            // Add handle for sheet variant
            variant === 'sheet' && 'relative',
          ],

          className
        )}
        {...props}
      >
        {/* Sheet handle for mobile */}
        {isMobile && variant === 'sheet' && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
            <div className="w-8 h-1 bg-muted-foreground/30 rounded-full" />
          </div>
        )}

        {children}

        {/* Close button */}
        {!hideCloseButton && (
          <MobileDialogClose
            className={cn(
              'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground',
              // Mobile-optimized close button
              isMobile && 'h-8 w-8 p-2'
            )}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </MobileDialogClose>
        )}
      </DialogPrimitive.Content>
    </MobileDialogPortal>
  );
});

MobileDialogContent.displayName = 'MobileDialogContent';

const MobileDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { isMobile } = useMobileDetection();

  return (
    <div
      className={cn(
        'flex flex-col space-y-1.5 text-center sm:text-left',
        // Extra padding for mobile sheet handle
        isMobile && 'pt-4',
        className
      )}
      {...props}
    />
  );
};

MobileDialogHeader.displayName = 'MobileDialogHeader';

const MobileDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { isMobile } = useMobileDetection();

  return (
    <div
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
        // Mobile-optimized footer spacing
        isMobile && 'space-y-2 space-y-reverse',
        className
      )}
      {...props}
    />
  );
};

MobileDialogFooter.displayName = 'MobileDialogFooter';

const MobileDialogTitle = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentProps<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    data-slot="mobile-dialog-title"
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));

MobileDialogTitle.displayName = 'MobileDialogTitle';

const MobileDialogDescription = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentProps<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    data-slot="mobile-dialog-description"
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));

MobileDialogDescription.displayName = 'MobileDialogDescription';

export {
  MobileDialog,
  MobileDialogPortal,
  MobileDialogOverlay,
  MobileDialogClose,
  MobileDialogTrigger,
  MobileDialogContent,
  MobileDialogHeader,
  MobileDialogFooter,
  MobileDialogTitle,
  MobileDialogDescription,
};

export type { MobileDialogProps, MobileDialogContentProps };
