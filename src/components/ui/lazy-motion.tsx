import { lazy, Suspense, forwardRef } from 'react';
import type { ComponentProps } from 'react';

// Lazy load framer-motion components
const LazyMotionDiv = lazy(() =>
  import('framer-motion').then((module) => ({
    default: module.motion.div,
  }))
);

const LazyAnimatePresence = lazy(() =>
  import('framer-motion').then((module) => ({
    default: module.AnimatePresence,
  }))
);

// Props type for motion.div
type MotionDivProps = ComponentProps<'div'> & {
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  whileHover?: any;
  whileTap?: any;
  variants?: any;
  layout?: boolean;
  layoutId?: string;
  drag?: boolean | 'x' | 'y';
  dragConstraints?: any;
  onDragEnd?: any;
  onDrag?: any;
  style?: any;
};

// Fallback component while motion loads
const MotionFallback = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, className, style, ...props }, ref) => (
    <div ref={ref} className={className} style={style} {...props}>
      {children}
    </div>
  )
);

MotionFallback.displayName = 'MotionFallback';

// Lazy motion div with fallback
export const MotionDiv = forwardRef<HTMLDivElement, MotionDivProps>((props, ref) => (
  <Suspense fallback={<MotionFallback {...props} ref={ref} />}>
    <LazyMotionDiv {...props} ref={ref} />
  </Suspense>
));

MotionDiv.displayName = 'MotionDiv';

// Lazy AnimatePresence
export const AnimatePresence = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
  initial?: boolean;
}) => (
  <Suspense fallback={<>{children}</>}>
    <LazyAnimatePresence {...props}>{children}</LazyAnimatePresence>
  </Suspense>
);
