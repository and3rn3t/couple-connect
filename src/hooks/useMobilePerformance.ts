import { useEffect, useState, useCallback } from 'react';
import { useMobileDetection } from './use-mobile';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  isSlowDevice: boolean;
  connectionSpeed: 'slow' | 'medium' | 'fast';
}

interface OptimizationSettings {
  reduceAnimations: boolean;
  limitImageQuality: boolean;
  enableVirtualization: boolean;
  prefetchImages: boolean;
  lazyLoadImages: boolean;
}

/**
 * Hook for mobile performance optimization
 * Adapts app behavior based on device capabilities and connection speed
 */
export function useMobilePerformance() {
  const { isMobile, screenSize } = useMobileDetection();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    isSlowDevice: false,
    connectionSpeed: 'medium',
  });
  const [optimizations, setOptimizations] = useState<OptimizationSettings>({
    reduceAnimations: false,
    limitImageQuality: false,
    enableVirtualization: false,
    prefetchImages: true,
    lazyLoadImages: true,
  });

  // Detect device performance capabilities
  const detectDevicePerformance = useCallback(() => {
    const navigator = window.navigator as Navigator & {
      hardwareConcurrency?: number;
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
    };

    // Check hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 4;

    // Check memory (if available)
    const memory = navigator.deviceMemory;

    // Check connection speed
    const connection =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    let connectionSpeed: 'slow' | 'medium' | 'fast' = 'medium';

    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        connectionSpeed = 'slow';
      } else if (effectiveType === '3g') {
        connectionSpeed = 'medium';
      } else if (effectiveType === '4g') {
        connectionSpeed = 'fast';
      }
    }

    // Determine if device is slow
    const isSlowDevice = cores < 4 || (memory && memory < 4) || connectionSpeed === 'slow';

    return {
      cores,
      memory,
      connectionSpeed,
      isSlowDevice,
    };
  }, []);

  // Measure performance metrics
  const measurePerformance = useCallback(() => {
    const paintEntries = performance.getEntriesByType('paint');
    const navigationEntries = performance.getEntriesByType('navigation');

    let loadTime = 0;
    let renderTime = 0;

    if (navigationEntries.length > 0) {
      const navEntry = navigationEntries[0] as PerformanceNavigationTiming;
      loadTime = navEntry.loadEventEnd - navEntry.fetchStart;
    }

    const fcp = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
    if (fcp) {
      renderTime = fcp.startTime;
    }

    return { loadTime, renderTime };
  }, []);

  // Update optimization settings based on device capabilities
  const updateOptimizations = useCallback(
    (deviceInfo: ReturnType<typeof detectDevicePerformance>) => {
      const newOptimizations: OptimizationSettings = {
        reduceAnimations: deviceInfo.isSlowDevice || deviceInfo.connectionSpeed === 'slow',
        limitImageQuality:
          deviceInfo.connectionSpeed === 'slow' || !!(deviceInfo.memory && deviceInfo.memory < 2),
        enableVirtualization: deviceInfo.isSlowDevice,
        prefetchImages: deviceInfo.connectionSpeed === 'fast' && !deviceInfo.isSlowDevice,
        lazyLoadImages: true, // Always enable for mobile
      };

      setOptimizations(newOptimizations);
    },
    []
  );

  // Initialize performance monitoring
  useEffect(() => {
    if (!isMobile) return;

    const deviceInfo = detectDevicePerformance();
    const performanceMetrics = measurePerformance();

    setMetrics({
      ...performanceMetrics,
      memoryUsage: deviceInfo.memory,
      isSlowDevice: deviceInfo.isSlowDevice,
      connectionSpeed: deviceInfo.connectionSpeed,
    });

    updateOptimizations(deviceInfo);

    // Monitor performance changes
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      // Update metrics based on new performance entries
      // Performance monitoring in production
      if (process.env.NODE_ENV === 'development') {
        console.warn('Performance entries:', entries);
      }
    });

    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input'] });

    return () => observer.disconnect();
  }, [isMobile, detectDevicePerformance, measurePerformance, updateOptimizations]);

  // Optimize image loading
  const getOptimizedImageProps = useCallback(
    (src: string, alt: string = '') => {
      const props: Record<string, string> = {
        src,
        alt,
        loading: optimizations.lazyLoadImages ? 'lazy' : 'eager',
      };

      if (optimizations.limitImageQuality) {
        // Add quality parameters for supported image formats
        if (src.includes('?')) {
          props.src = `${src}&quality=70&format=webp`;
        } else {
          props.src = `${src}?quality=70&format=webp`;
        }
      }

      return props;
    },
    [optimizations.lazyLoadImages, optimizations.limitImageQuality]
  );

  // Get animation preferences
  const getAnimationProps = useCallback(() => {
    if (optimizations.reduceAnimations) {
      return {
        initial: false,
        animate: false,
        transition: { duration: 0 },
      };
    }

    return {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3, ease: 'easeOut' },
    };
  }, [optimizations.reduceAnimations]);

  // Debounce function for performance-critical operations
  const createDebouncedCallback = useCallback(
    <T extends unknown[]>(callback: (...args: T) => void, delay: number = 300) => {
      let timeoutId: NodeJS.Timeout;

      return (...args: T) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => callback(...args), delay);
      };
    },
    []
  );

  // Throttle function for high-frequency events
  const createThrottledCallback = useCallback(
    <T extends unknown[]>(callback: (...args: T) => void, limit: number = 100) => {
      let inThrottle: boolean;

      return (...args: T) => {
        if (!inThrottle) {
          callback(...args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    },
    []
  );

  // Memory cleanup helper
  const cleanup = useCallback(() => {
    // Clear performance observer
    if (window.performance && window.performance.clearMarks) {
      window.performance.clearMarks();
      window.performance.clearMeasures();
    }

    // Clear timers and intervals - Note: this is a simplified approach
    // In a real app, you'd track your own timers
    if (process.env.NODE_ENV === 'development') {
      console.warn('Cleanup called - implement specific timer cleanup for your app');
    }
  }, []);

  return {
    metrics,
    optimizations,
    isMobile,
    screenSize,
    getOptimizedImageProps,
    getAnimationProps,
    createDebouncedCallback,
    createThrottledCallback,
    cleanup,
  };
}

/**
 * Hook for managing mobile-specific localStorage with size limits
 */
export function useMobileStorage<T>(key: string, maxSize: number = 5 * 1024 * 1024) {
  // 5MB default
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check storage size
  const getStorageSize = useCallback(() => {
    let total = 0;
    for (const storageKey in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, storageKey)) {
        total += localStorage.getItem(storageKey)?.length || 0;
      }
    }
    return total;
  }, []);

  // Load data from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setData(JSON.parse(stored));
      }
      setIsLoading(false);
    } catch (_error) {
      setError('Failed to load data from storage');
      setIsLoading(false);
    }
  }, [key]);

  // Save data to localStorage
  const save = useCallback(
    (newData: T) => {
      try {
        const serialized = JSON.stringify(newData);

        // Check if adding this data would exceed storage limit
        const currentSize = getStorageSize();
        const newDataSize = serialized.length;

        if (currentSize + newDataSize > maxSize) {
          // Clean up old data to make space
          const keys = Object.keys(localStorage);
          for (const oldKey of keys) {
            if (oldKey !== key && getStorageSize() + newDataSize > maxSize) {
              localStorage.removeItem(oldKey);
            }
          }
        }

        localStorage.setItem(key, serialized);
        setData(newData);
        setError(null);
      } catch (_error) {
        setError('Failed to save data to storage');
      }
    },
    [key, maxSize, getStorageSize]
  );

  // Remove data from localStorage
  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setData(null);
      setError(null);
    } catch (_error) {
      setError('Failed to remove data from storage');
    }
  }, [key]);

  return {
    data,
    save,
    remove,
    isLoading,
    error,
    storageSize: getStorageSize(),
  };
}
