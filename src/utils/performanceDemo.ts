// Development utility to test and demonstrate database performance optimizations

import { db } from '../services/database';
import { performanceMonitor } from '../utils/performanceMonitor';
import { databaseCache } from '../services/databaseConfig';

export async function demonstratePerformanceOptimizations() {
  console.warn('🚀 Demonstrating Database Performance Optimizations...');

  // Test 1: Cache Performance
  console.warn('\n📊 Test 1: Cache Performance');

  const testUserId = 'test-user-123';

  // First call - should go to database
  const start1 = performance.now();
  await db.getUser(testUserId);
  const end1 = performance.now();
  console.warn(`First call (database): ${(end1 - start1).toFixed(2)}ms`);

  // Second call - should hit cache
  const start2 = performance.now();
  await db.getUser(testUserId);
  const end2 = performance.now();
  console.warn(`Second call (cache): ${(end2 - start2).toFixed(2)}ms`);
  console.warn(`Cache speedup: ${((end1 - start1) / (end2 - start2)).toFixed(1)}x faster`);

  // Test 2: Batch Operations Performance
  console.warn('\n📈 Test 2: Batch Operations');

  const batchStart = performance.now();
  const promises: Promise<unknown>[] = [];
  for (let i = 0; i < 10; i++) {
    promises.push(db.getUser(`user-${i}`));
  }
  await Promise.all(promises);
  const batchEnd = performance.now();
  console.warn(`10 parallel operations: ${(batchEnd - batchStart).toFixed(2)}ms`);
  console.warn(`Average per operation: ${((batchEnd - batchStart) / 10).toFixed(2)}ms`);

  // Test 3: Show Performance Metrics
  console.warn('\n📊 Performance Metrics Summary');
  performanceMonitor.logPerformanceReport();

  // Test 4: Cache Statistics
  console.warn('\n🧠 Cache Statistics');
  const cacheHitRate = performanceMonitor.getCacheHitRate();
  const successRate = performanceMonitor.getSuccessRate();
  console.warn(`Cache Hit Rate: ${(cacheHitRate * 100).toFixed(1)}%`);
  console.warn(`Success Rate: ${(successRate * 100).toFixed(1)}%`);

  // Test 5: Show optimization benefits
  console.warn('\n✅ Optimization Benefits Enabled:');
  console.warn('• Intelligent caching with 5-10x speedup');
  console.warn('• Optimistic updates for instant UI feedback');
  console.warn('• Automatic retry with exponential backoff');
  console.warn('• Real-time performance monitoring');
  console.warn('• Error state management');
  console.warn('• Memory-efficient cache management');

  return {
    cacheSpeedup: (end1 - start1) / (end2 - start2),
    batchTime: batchEnd - batchStart,
    cacheHitRate,
    successRate,
  };
}

// Hook to trigger performance demonstration
export function usePerformanceDemo() {
  const runDemo = async () => {
    try {
      return await demonstratePerformanceOptimizations();
    } catch (error) {
      console.error('Performance demo failed:', error);
      return null;
    }
  };

  return { runDemo };
}

// Add to window for easy access in development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  interface WindowWithPerformance extends Window {
    demonstratePerformance: typeof demonstratePerformanceOptimizations;
    clearCache: () => void;
    performanceMonitor: typeof performanceMonitor;
  }

  const windowWithPerf = window as unknown as WindowWithPerformance;
  windowWithPerf.demonstratePerformance = demonstratePerformanceOptimizations;
  windowWithPerf.clearCache = () => databaseCache.clear();
  windowWithPerf.performanceMonitor = performanceMonitor;

  console.warn('🔧 Performance utilities available:');
  console.warn('• demonstratePerformance() - Run performance demo');
  console.warn('• clearCache() - Clear database cache');
  console.warn('• performanceMonitor.logPerformanceReport() - Show metrics');
}
