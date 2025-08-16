import { lazy, Suspense, forwardRef } from 'react';
import type { ComponentProps } from 'react';

// Lazy load framer-motion components individually
const LazyMotionDiv = lazy(() =>
  import('framer-motion').then((module) => ({
    default: module.motion.div,
  }))
);

const LazyMotionSpan = lazy(() =>
  import('framer-motion').then((module) => ({
    default: module.motion.span,
  }))
);

const LazyMotionH2 = lazy(() =>
  import('framer-motion').then((module) => ({
    default: module.motion.h2,
  }))
);

const LazyMotionP = lazy(() =>
  import('framer-motion').then((module) => ({
    default: module.motion.p,
  }))
);

const LazyMotionButton = lazy(() =>
  import('framer-motion').then((module) => ({
    default: module.motion.button,
  }))
);

const LazyAnimatePresenceComponent = lazy(() =>
  import('framer-motion').then((module) => ({
    default: module.AnimatePresence,
  }))
);

// Generic motion props type
type MotionProps = {
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  whileHover?: any;
  whileTap?: any;
  layout?: boolean;
  layoutId?: string;
  drag?: boolean | 'x' | 'y';
  onDragStart?: (event: any, info: any) => void;
  variants?: any;
  dragConstraints?: any;
  onDragEnd?: (event: any, info: any) => void;
  onDrag?: any;
  style?: any;
  [key: string]: any;
};

// Motion div props
type MotionDivProps = Omit<ComponentProps<'div'>, 'onDragStart'> & MotionProps;
type MotionSpanProps = Omit<ComponentProps<'span'>, 'onDragStart'> & MotionProps;
type MotionH2Props = Omit<ComponentProps<'h2'>, 'onDragStart'> & MotionProps;
type MotionPProps = Omit<ComponentProps<'p'>, 'onDragStart'> & MotionProps;
type MotionButtonProps = Omit<ComponentProps<'button'>, 'onDragStart'> & MotionProps;

// Fallback components while motion loads
const MotionDivFallback = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, className, style, ...props }, ref) => (
    <div ref={ref} className={className} style={style} {...props}>
      {children}
    </div>
  )
);

const MotionSpanFallback = forwardRef<HTMLSpanElement, MotionSpanProps>(
  ({ children, className, style, ...props }, ref) => (
    <span ref={ref} className={className} style={style} {...props}>
      {children}
    </span>
  )
);

const MotionH2Fallback = forwardRef<HTMLHeadingElement, MotionH2Props>(
  ({ children, className, style, ...props }, ref) => (
    <h2 ref={ref} className={className} style={style} {...props}>
      {children}
    </h2>
  )
);

const MotionPFallback = forwardRef<HTMLParagraphElement, MotionPProps>(
  ({ children, className, style, ...props }, ref) => (
    <p ref={ref} className={className} style={style} {...props}>
      {children}
    </p>
  )
);

const MotionButtonFallback = forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ children, className, style, ...props }, ref) => (
    <button ref={ref} className={className} style={style} {...props}>
      {children}
    </button>
  )
);

// Set display names
MotionDivFallback.displayName = 'MotionDivFallback';
MotionSpanFallback.displayName = 'MotionSpanFallback';
MotionH2Fallback.displayName = 'MotionH2Fallback';
MotionPFallback.displayName = 'MotionPFallback';
MotionButtonFallback.displayName = 'MotionButtonFallback';

// Lazy motion components with fallbacks
export const MotionDiv = forwardRef<HTMLDivElement, MotionDivProps>((props, ref) => (
  <Suspense fallback={<MotionDivFallback {...props} ref={ref} />}>
    <LazyMotionDiv {...props} ref={ref} />
  </Suspense>
));

export const MotionSpan = forwardRef<HTMLSpanElement, MotionSpanProps>((props, ref) => (
  <Suspense fallback={<MotionSpanFallback {...props} ref={ref} />}>
    <LazyMotionSpan {...props} ref={ref} />
  </Suspense>
));

export const MotionH2 = forwardRef<HTMLHeadingElement, MotionH2Props>((props, ref) => (
  <Suspense fallback={<MotionH2Fallback {...props} ref={ref} />}>
    <LazyMotionH2 {...props} ref={ref} />
  </Suspense>
));

export const MotionP = forwardRef<HTMLParagraphElement, MotionPProps>((props, ref) => (
  <Suspense fallback={<MotionPFallback {...props} ref={ref} />}>
    <LazyMotionP {...props} ref={ref} />
  </Suspense>
));

export const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>((props, ref) => (
  <Suspense fallback={<MotionButtonFallback {...props} ref={ref} />}>
    <LazyMotionButton {...props} ref={ref} />
  </Suspense>
));

// Set display names for lazy components
MotionDiv.displayName = 'MotionDiv';
MotionSpan.displayName = 'MotionSpan';
MotionH2.displayName = 'MotionH2';
MotionP.displayName = 'MotionP';
MotionButton.displayName = 'MotionButton';

// Lazy AnimatePresence
export const LazyAnimatePresence = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
  initial?: boolean;
}) => (
  <Suspense fallback={<>{children}</>}>
    <LazyAnimatePresenceComponent {...props}>{children}</LazyAnimatePresenceComponent>
  </Suspense>
);

// Create a motion object for easier replacement
export const motion = {
  div: MotionDiv,
  span: MotionSpan,
  h2: MotionH2,
  p: MotionP,
  button: MotionButton,
};
