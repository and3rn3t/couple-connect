#!/usr/bin/env node

/**
 * Replace framer-motion imports with lazy-loaded versions
 * This moves framer-motion out of the main bundle to reduce initial load time
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

console.log('🎭 Implementing lazy loading for framer-motion...');

const LAZY_MOTION_IMPORT = `import { MotionDiv, AnimatePresence } from '@/components/ui/lazy-motion';`;

async function implementLazyMotion() {
  // First, create a proper lazy motion implementation
  const lazyMotionContent = `import { lazy, Suspense, forwardRef } from 'react';
import type { ComponentProps } from 'react';

// Lazy load framer-motion components
const LazyMotionDiv = lazy(() =>
  import('framer-motion').then(module => ({
    default: module.motion.div
  }))
);

const LazyAnimatePresence = lazy(() =>
  import('framer-motion').then(module => ({
    default: module.AnimatePresence
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
export const MotionDiv = forwardRef<HTMLDivElement, MotionDivProps>(
  (props, ref) => (
    <Suspense fallback={<MotionFallback {...props} ref={ref} />}>
      <LazyMotionDiv {...props} ref={ref} />
    </Suspense>
  )
);

MotionDiv.displayName = 'MotionDiv';

// Lazy AnimatePresence
export const AnimatePresence = ({ children, ...props }: {
  children: React.ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
  initial?: boolean;
}) => (
  <Suspense fallback={<>{children}</>}>
    <LazyAnimatePresence {...props}>
      {children}
    </LazyAnimatePresence>
  </Suspense>
);`;

  // Update the lazy-motion.tsx file
  writeFileSync('src/components/ui/lazy-motion.tsx', lazyMotionContent);
  console.log('✅ Updated lazy-motion.tsx');

  // Find all files that use framer-motion
  const files = await glob('src/**/*.{ts,tsx}', {
    ignore: ['node_modules/**', 'src/components/ui/lazy-motion.tsx'],
  });

  let replacedFiles = 0;
  let totalReplacements = 0;

  for (const file of files) {
    let content = readFileSync(file, 'utf-8');

    // Skip files that don't use framer-motion
    if (!content.includes('framer-motion')) {
      continue;
    }

    console.log(`📝 Processing: ${file}`);

    let modified = false;
    let fileReplacements = 0;

    // Replace the import statement
    const oldImport = content.match(/import.*from ['"]framer-motion['"];?/);
    if (oldImport) {
      // Extract what's being imported
      const importMatch = oldImport[0].match(/import\s*{([^}]+)}\s*from/);
      if (importMatch) {
        const imports = importMatch[1].split(',').map((s) => s.trim());

        const needsMotion = imports.some((imp) => imp.includes('motion') || imp === 'motion');
        const needsAnimatePresence = imports.includes('AnimatePresence');

        if (needsMotion || needsAnimatePresence) {
          content = content.replace(oldImport[0], LAZY_MOTION_IMPORT);
          modified = true;
          fileReplacements++;
        }
      }
    }

    // Replace motion.div with MotionDiv
    content = content.replace(/motion\\.div/g, 'MotionDiv');
    if (content !== readFileSync(file, 'utf-8')) {
      modified = true;
      fileReplacements++;
    }

    if (modified) {
      writeFileSync(file, content);
      console.log(`✅ Updated: ${file} (${fileReplacements} replacements)`);
      replacedFiles++;
      totalReplacements += fileReplacements;
    }
  }

  console.log(`\\n📊 Lazy Loading Implementation Complete:`);
  console.log(`- Files processed: ${files.length}`);
  console.log(`- Files modified: ${replacedFiles}`);
  console.log(`- Total replacements: ${totalReplacements}`);

  console.log(`\\n💡 Bundle Impact:`);
  console.log(`- framer-motion moved to separate lazy-loaded chunk`);
  console.log(`- Estimated main bundle reduction: ~100KB`);
  console.log(`- Components load progressively as needed`);

  console.log(`\\n🚀 Next steps:`);
  console.log(`1. Build and test the application`);
  console.log(`2. Verify animations still work correctly`);
  console.log(`3. Check bundle analysis for size reduction`);
}

// Run the implementation
implementLazyMotion().catch(console.error);
