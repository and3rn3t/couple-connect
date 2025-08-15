import { lazy, Suspense } from 'react';

// Lazy load the entire framer-motion library
const LazyFramerMotion = lazy(() => import('framer-motion'));

// Create a proper motion component that's lazy loaded
export const createLazyMotion = () => {
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

  return {
    MotionDiv: (props: any) => (
      <Suspense fallback={<div {...props} />}>
        <LazyMotionDiv {...props} />
      </Suspense>
    ),
    AnimatePresence: (props: any) => (
      <Suspense fallback={<>{props.children}</>}>
        <LazyAnimatePresence {...props} />
      </Suspense>
    ),
  };
};

// Export the lazy motion components
const { MotionDiv, AnimatePresence } = createLazyMotion();
export { MotionDiv, AnimatePresence };
