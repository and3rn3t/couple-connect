#!/usr/bin/env node

/**
 * Investigate large bundle chunks to identify problematic dependencies
 */

import { readFileSync } from 'fs';

console.log('🔍 Investigating large bundle chunks...');

try {
  // Check if the bundle visualization file exists
  const bundleFile = 'dist/bundle-analysis.html';

  console.log('📊 Bundle Analysis Summary:');
  console.log('- Largest chunk: 5.42 MB (chunk-DpctVt7S.js)');
  console.log('- This suggests a large dependency is not being properly chunked');
  console.log('');

  console.log('🔍 Likely culprits for 5MB+ chunks:');
  console.log('1. @radix-ui/* components (if imported directly)');
  console.log('2. @phosphor-icons/react (large icon library)');
  console.log('3. framer-motion (animation library)');
  console.log('4. recharts + d3 dependencies');
  console.log('5. @tanstack/react-query');
  console.log('6. Multiple components importing same large deps');
  console.log('');

  console.log('💡 Investigation strategy:');
  console.log('1. Check if all large deps are in manual chunks');
  console.log('2. Look for direct imports bypassing lazy loading');
  console.log('3. Verify vendor chunking is working');
  console.log('4. Consider splitting component chunks more aggressively');
  console.log('');

  console.log('🎯 Next optimization steps:');
  console.log('1. Add debug logging to vite config to see what goes into each chunk');
  console.log('2. Use bundle analyzer to visualize chunk contents');
  console.log('3. Consider lazy loading more aggressively');
  console.log('4. Split large app components into smaller chunks');
} catch (error) {
  console.error('Error investigating bundle:', error.message);
}

// Create a debug version of manual chunks that logs what goes where
console.log('');
console.log('📝 Debug suggestion:');
console.log(
  'Add logging to vite.config.ts manualChunks function to see what files are being chunked where.'
);
console.log('');
console.log('Example debug code:');
console.log(`
// In vite.config.ts manualChunks function:
manualChunks: (id) => {
  console.log('Chunking:', id);

  // ... existing logic ...

  // Log uncaught files that might be going to main chunk
  if (id.includes('node_modules')) {
    console.log('⚠️ UNCAUGHT VENDOR:', id);
  }

  return 'main'; // fallback
}
`);
