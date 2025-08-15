import { useEffect, useRef, useState } from 'react';

// Extended Navigator interface for mobile-specific APIs
interface ExtendedNavigator extends Navigator {
  deviceMemory?: number;
  connection?: {
    effectiveType?: string;
  };
  mozConnection?: {
    effectiveType?: string;
  };
  webkitConnection?: {
    effectiveType?: string;
  };
}

// Layout Shift Entry interface
interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface PerformanceMetrics {
  // Core Web Vitals
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift

  // Mobile-specific metrics
  loadTime: number | null;
  domContentLoaded: number | null;
  firstByte: number | null;

  // Resource metrics
  bundleSize: number | null;
  imageCount: number;
  scriptCount: number;

  // Device metrics
  deviceMemory: number | null;
  connectionType: string | null;

  // User interaction metrics
  touchDelay: number | null;
  scrollPerformance: number | null;
}

interface PerformanceReport {
  metrics: PerformanceMetrics;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  recommendations: string[];
  timestamp: number;
}

/**
 * Mobile Performance Monitoring Hook
 * Tracks Core Web Vitals and mobile-specific performance metrics
 */
export function useMobilePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    loadTime: null,
    domContentLoaded: null,
    firstByte: null,
    bundleSize: null,
    imageCount: 0,
    scriptCount: 0,
    deviceMemory: null,
    connectionType: null,
    touchDelay: null,
    scrollPerformance: null,
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const performanceObserver = useRef<PerformanceObserver | null>(null);
  const clsValue = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsMonitoring(true);
    collectBasicMetrics();
    setupPerformanceObserver();
    setupCoreWebVitals();
    collectDeviceMetrics();

    return () => {
      if (performanceObserver.current) {
        performanceObserver.current.disconnect();
      }
      setIsMonitoring(false);
    };
  }, []);

  /**
   * Collect basic performance metrics
   */
  const collectBasicMetrics = () => {
    if (!window.performance) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navigation) {
      setMetrics((prev) => ({
        ...prev,
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstByte: navigation.responseStart - navigation.requestStart,
      }));
    }

    // Count resources
    const resources = performance.getEntriesByType('resource');
    const images = resources.filter((r) => r.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i));
    const scripts = resources.filter((r) => r.name.match(/\.js$/i));

    setMetrics((prev) => ({
      ...prev,
      imageCount: images.length,
      scriptCount: scripts.length,
    }));
  };

  /**
   * Setup Performance Observer for detailed metrics
   */
  const setupPerformanceObserver = () => {
    if (!window.PerformanceObserver) return;

    try {
      performanceObserver.current = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint') {
            if (entry.name === 'first-contentful-paint') {
              setMetrics((prev) => ({ ...prev, fcp: entry.startTime }));
            }
          }

          if (entry.entryType === 'largest-contentful-paint') {
            setMetrics((prev) => ({ ...prev, lcp: entry.startTime }));
          }

          if (entry.entryType === 'first-input') {
            const fidEntry = entry as PerformanceEventTiming;
            setMetrics((prev) => ({ ...prev, fid: fidEntry.processingStart - fidEntry.startTime }));
          }

          if (entry.entryType === 'layout-shift') {
            const clsEntry = entry as LayoutShiftEntry;
            if (!clsEntry.hadRecentInput) {
              clsValue.current += clsEntry.value;
              setMetrics((prev) => ({ ...prev, cls: clsValue.current }));
            }
          }
        }
      });

      // Observe different entry types
      const entryTypes = ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'];

      entryTypes.forEach((type) => {
        try {
          performanceObserver.current?.observe({ type, buffered: true });
        } catch (_e) {
          // Some entry types might not be supported
          // Silent fail for unsupported performance observer types
        }
      });
    } catch (error) {
      // Performance Observer not supported - fail silently
      console.error('Performance Observer initialization failed:', error);
    }
  };

  /**
   * Setup Core Web Vitals measurement
   */
  const setupCoreWebVitals = () => {
    // Measure touch delay for mobile
    let touchStartTime = 0;

    const handleTouchStart = () => {
      touchStartTime = performance.now();
    };

    const handleTouchEnd = () => {
      if (touchStartTime) {
        const touchDelay = performance.now() - touchStartTime;
        setMetrics((prev) => ({ ...prev, touchDelay }));
      }
    };

    // Measure scroll performance
    let scrollStartTime = 0;
    let frameCount = 0;

    const handleScrollStart = () => {
      scrollStartTime = performance.now();
      frameCount = 0;
    };

    const handleScrollEnd = () => {
      if (scrollStartTime) {
        const scrollDuration = performance.now() - scrollStartTime;
        const fps = frameCount / (scrollDuration / 1000);
        setMetrics((prev) => ({ ...prev, scrollPerformance: fps }));
      }
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('scroll', handleScrollStart, { passive: true, once: true });
    document.addEventListener('scrollend', handleScrollEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('scroll', handleScrollStart);
      document.removeEventListener('scrollend', handleScrollEnd);
    };
  };

  /**
   * Collect device-specific metrics
   */
  const collectDeviceMetrics = () => {
    // Device memory
    const extendedNavigator = navigator as ExtendedNavigator;
    const deviceMemory = extendedNavigator.deviceMemory || null;

    // Connection type
    const connection =
      extendedNavigator.connection ||
      extendedNavigator.mozConnection ||
      extendedNavigator.webkitConnection;
    const connectionType = connection?.effectiveType || null;

    setMetrics((prev) => ({
      ...prev,
      deviceMemory,
      connectionType,
    }));
  };

  /**
   * Generate performance report with grade and recommendations
   */
  const generateReport = (): PerformanceReport => {
    const recommendations: string[] = [];
    let score = 100;

    // Core Web Vitals scoring
    if (metrics.fcp && metrics.fcp > 2500) {
      score -= 20;
      recommendations.push('Improve First Contentful Paint (target: <2.5s)');
    }

    if (metrics.lcp && metrics.lcp > 2500) {
      score -= 25;
      recommendations.push('Optimize Largest Contentful Paint (target: <2.5s)');
    }

    if (metrics.fid && metrics.fid > 100) {
      score -= 20;
      recommendations.push('Reduce First Input Delay (target: <100ms)');
    }

    if (metrics.cls && metrics.cls > 0.1) {
      score -= 15;
      recommendations.push('Minimize Cumulative Layout Shift (target: <0.1)');
    }

    // Mobile-specific scoring
    if (metrics.touchDelay && metrics.touchDelay > 50) {
      score -= 10;
      recommendations.push('Optimize touch responsiveness (target: <50ms)');
    }

    if (metrics.imageCount > 20) {
      score -= 5;
      recommendations.push('Consider lazy loading or reducing image count');
    }

    if (metrics.scriptCount > 10) {
      score -= 5;
      recommendations.push('Bundle and minimize JavaScript files');
    }

    // Device-specific recommendations
    if (metrics.deviceMemory && metrics.deviceMemory < 4) {
      recommendations.push('Optimize for low-memory devices');
    }

    if (metrics.connectionType === 'slow-2g' || metrics.connectionType === '2g') {
      recommendations.push('Optimize for slow network connections');
    }

    // Determine grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';

    return {
      metrics,
      grade,
      recommendations,
      timestamp: Date.now(),
    };
  };

  /**
   * Export metrics to console or analytics
   */
  const exportMetrics = (format: 'console' | 'json' = 'console') => {
    const report = generateReport();

    if (format === 'console') {
      // Use console.warn for development visibility (allowed by ESLint)
      console.warn('📊 Mobile Performance Report');
      console.warn('Grade:', report.grade);
      console.warn('Metrics:', report.metrics);
      console.warn('Recommendations:', report.recommendations);
    }

    return report;
  };

  /**
   * Check if performance is acceptable for mobile
   */
  const isPerformanceGood = (): boolean => {
    const report = generateReport();
    return report.grade === 'A' || report.grade === 'B';
  };

  return {
    metrics,
    isMonitoring,
    generateReport,
    exportMetrics,
    isPerformanceGood,
  };
}
