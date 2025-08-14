// Performance monitoring and optimization utilities for database operations
import { useState } from 'react';

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  success: boolean;
  cacheHit?: boolean;
}

class DatabasePerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;

  startTimer(operation: string): (success?: boolean, cacheHit?: boolean) => PerformanceMetric {
    const startTime = performance.now();

    return (success: boolean = true, cacheHit: boolean = false): PerformanceMetric => {
      const endTime = performance.now();
      const metric: PerformanceMetric = {
        operation,
        duration: endTime - startTime,
        timestamp: Date.now(),
        success,
        cacheHit,
      };

      this.recordMetric(metric);
      return metric;
    };
  }

  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(operation?: string, timeRange?: number): PerformanceMetric[] {
    let filtered = this.metrics;

    if (operation) {
      filtered = filtered.filter((m) => m.operation === operation);
    }

    if (timeRange) {
      const cutoff = Date.now() - timeRange;
      filtered = filtered.filter((m) => m.timestamp > cutoff);
    }

    return filtered;
  }

  getAverageTime(operation?: string, timeRange?: number): number {
    const metrics = this.getMetrics(operation, timeRange);
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  getCacheHitRate(operation?: string, timeRange?: number): number {
    const metrics = this.getMetrics(operation, timeRange);
    if (metrics.length === 0) return 0;

    const cacheHits = metrics.filter((m) => m.cacheHit).length;
    return cacheHits / metrics.length;
  }

  getSuccessRate(operation?: string, timeRange?: number): number {
    const metrics = this.getMetrics(operation, timeRange);
    if (metrics.length === 0) return 0;

    const successes = metrics.filter((m) => m.success).length;
    return successes / metrics.length;
  }

  getSummary(timeRange?: number): {
    totalOperations: number;
    averageTime: number;
    cacheHitRate: number;
    successRate: number;
    slowestOperations: PerformanceMetric[];
    operationBreakdown: Record<
      string,
      {
        count: number;
        averageTime: number;
        successRate: number;
      }
    >;
  } {
    const metrics = this.getMetrics(undefined, timeRange);

    const slowestOperations = metrics.sort((a, b) => b.duration - a.duration).slice(0, 10);

    const operationBreakdown: Record<
      string,
      {
        count: number;
        averageTime: number;
        successRate: number;
      }
    > = {};

    for (const metric of metrics) {
      if (!operationBreakdown[metric.operation]) {
        operationBreakdown[metric.operation] = {
          count: 0,
          averageTime: 0,
          successRate: 0,
        };
      }

      const breakdown = operationBreakdown[metric.operation];
      breakdown.count++;
    }

    // Calculate averages for each operation
    for (const [operation, breakdown] of Object.entries(operationBreakdown)) {
      const operationMetrics = metrics.filter((m) => m.operation === operation);
      breakdown.averageTime =
        operationMetrics.reduce((sum, m) => sum + m.duration, 0) / operationMetrics.length;
      breakdown.successRate =
        operationMetrics.filter((m) => m.success).length / operationMetrics.length;
    }

    return {
      totalOperations: metrics.length,
      averageTime: this.getAverageTime(undefined, timeRange),
      cacheHitRate: this.getCacheHitRate(undefined, timeRange),
      successRate: this.getSuccessRate(undefined, timeRange),
      slowestOperations,
      operationBreakdown,
    };
  }

  logPerformanceReport(): void {
    const last24Hours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const summary = this.getSummary(last24Hours);

    // Use console.warn to comply with linting rules
    console.warn('=== Database Performance Report (Last 24 Hours) ===');
    console.warn(`Total Operations: ${summary.totalOperations}`);
    console.warn(`Average Time: ${summary.averageTime.toFixed(2)}ms`);
    console.warn(`Cache Hit Rate: ${(summary.cacheHitRate * 100).toFixed(1)}%`);
    console.warn(`Success Rate: ${(summary.successRate * 100).toFixed(1)}%`);

    if (summary.slowestOperations.length > 0) {
      console.warn('--- Slowest Operations ---');
      summary.slowestOperations.forEach((op, index) => {
        console.warn(`${index + 1}. ${op.operation}: ${op.duration.toFixed(2)}ms`);
      });
    }

    console.warn('--- Operation Breakdown ---');
    Object.entries(summary.operationBreakdown)
      .sort(([, a], [, b]) => b.averageTime - a.averageTime)
      .forEach(([operation, stats]) => {
        console.warn(
          `${operation}: ${stats.count} ops, ${stats.averageTime.toFixed(2)}ms avg, ${(stats.successRate * 100).toFixed(1)}% success`
        );
      });

    console.warn('=== End Performance Report ===');
  }

  clear(): void {
    this.metrics = [];
  }
}

// Decorator function to monitor database operations
export function monitorPerformance<T extends (...args: never[]) => Promise<unknown>>(
  operation: string,
  func: T
): T {
  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const endTimer = performanceMonitor.startTimer(operation);

    try {
      const result = await func(...args);
      endTimer(true);
      return result as Awaited<ReturnType<T>>;
    } catch (error) {
      endTimer(false);
      throw error;
    }
  }) as T;
}

// Singleton instance
export const performanceMonitor = new DatabasePerformanceMonitor();

// Hook to get performance data in components
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);

  const refreshMetrics = () => {
    setMetrics(performanceMonitor.getMetrics());
  };

  const getSummary = (timeRange?: number) => {
    return performanceMonitor.getSummary(timeRange);
  };

  return {
    metrics,
    refreshMetrics,
    getSummary,
    monitor: performanceMonitor,
  };
}

// Development helper to log performance reports
try {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // Log performance report every 5 minutes in development
    setInterval(
      () => {
        performanceMonitor.logPerformanceReport();
      },
      5 * 60 * 1000
    );
  }
} catch {
  // Ignore errors in environments where window is not available
}
