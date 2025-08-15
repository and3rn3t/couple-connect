#!/usr/bin/env node

/**
 * Replace simple framer-motion usage with CSS-based alternatives
 * This reduces bundle size by avoiding the large framer-motion library for simple animations
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

console.log('🎭 Analyzing framer-motion usage for optimization opportunities...');

async function analyzeFramerMotionUsage() {
  // Find all TypeScript/React files that use framer-motion
  const files = await glob('src/**/*.{ts,tsx}', {
    ignore: ['node_modules/**'],
  });

  const framerFiles = [];
  const analysisResults = [];

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    if (content.includes('framer-motion')) {
      framerFiles.push(file);

      // Analyze what framer-motion features are being used
      const analysis = {
        file,
        hasMotionDiv: content.includes('motion.div'),
        hasAnimatePresence: content.includes('AnimatePresence'),
        hasComplexAnimations:
          content.includes('variants') ||
          content.includes('spring') ||
          content.includes('keyframes'),
        hasGestures: content.includes('whileDrag') || content.includes('drag'),
        hasLayoutAnimations: content.includes('layout') || content.includes('layoutId'),
        canUseCSS: false,
        recommendations: [],
      };

      // Determine if this can use CSS animations instead
      if (
        analysis.hasMotionDiv &&
        !analysis.hasComplexAnimations &&
        !analysis.hasGestures &&
        !analysis.hasLayoutAnimations
      ) {
        analysis.canUseCSS = true;
        analysis.recommendations.push('✅ Can replace with CSS animations');
      }

      if (analysis.hasAnimatePresence && !analysis.hasComplexAnimations) {
        analysis.recommendations.push('✅ Can replace AnimatePresence with CSS transitions');
      }

      if (analysis.hasComplexAnimations) {
        analysis.recommendations.push('⚠️ Keep framer-motion but make it lazy-loaded');
      }

      if (analysis.hasGestures || analysis.hasLayoutAnimations) {
        analysis.recommendations.push('⚠️ Requires framer-motion features, consider lazy loading');
      }

      if (analysis.recommendations.length === 0) {
        analysis.recommendations.push('🔍 Manual review needed');
      }

      analysisResults.push(analysis);
    }
  }

  console.log(`\\n📊 Framer Motion Analysis Results:`);
  console.log(`Total files using framer-motion: ${framerFiles.length}`);

  let canOptimize = 0;
  let needsLazyLoading = 0;
  let needsManualReview = 0;

  for (const analysis of analysisResults) {
    console.log(`\\n📄 ${analysis.file}:`);

    const features = [];
    if (analysis.hasMotionDiv) features.push('motion.div');
    if (analysis.hasAnimatePresence) features.push('AnimatePresence');
    if (analysis.hasComplexAnimations) features.push('complex animations');
    if (analysis.hasGestures) features.push('gestures');
    if (analysis.hasLayoutAnimations) features.push('layout animations');

    console.log(`   Features: ${features.join(', ')}`);

    for (const rec of analysis.recommendations) {
      console.log(`   ${rec}`);
      if (rec.includes('CSS')) canOptimize++;
      else if (rec.includes('lazy')) needsLazyLoading++;
      else if (rec.includes('review')) needsManualReview++;
    }
  }

  console.log(`\\n🎯 Optimization Summary:`);
  console.log(`- Can optimize with CSS: ${canOptimize} files`);
  console.log(`- Need lazy loading: ${needsLazyLoading} files`);
  console.log(`- Need manual review: ${needsManualReview} files`);

  console.log(`\\n💡 Bundle Size Impact:`);
  console.log(`- framer-motion is ~100KB+ when imported directly`);
  console.log(`- CSS animations add ~0KB to bundle`);
  console.log(`- Lazy loading reduces initial bundle by ~100KB`);

  console.log(`\\n📋 Action Items:`);
  console.log(`1. Replace simple animations with @/components/ui/motion components`);
  console.log(`2. For complex animations, implement lazy loading`);
  console.log(`3. Test animations work correctly after replacement`);

  return analysisResults;
}

// Run the analysis
analyzeFramerMotionUsage().catch(console.error);
