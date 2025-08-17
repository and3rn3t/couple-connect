import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';

import App from './App.tsx';
import { ErrorFallback } from './ErrorFallback.tsx';

import './main.css';
import './styles/theme.css';
import './index.css';

// Type definitions for scheduler
interface Scheduler {
  unstable_now: () => number;
  unstable_scheduleCallback: (priority: unknown, callback: () => void) => unknown;
  unstable_cancelCallback: (id: unknown) => void;
  unstable_shouldYield: () => boolean;
  unstable_requestPaint: () => void;
  unstable_getCurrentPriorityLevel?: () => number;
  unstable_runWithPriority?: (priority: unknown, callback: () => void) => void;
}

// Extend global types
declare global {
  interface Window {
    scheduler?: Scheduler;
  }
}

console.warn('🚀 main.tsx: Starting React app initialization...');

// Enhanced fix for React 19 scheduler issue with Vite
// Create a robust scheduler polyfill that works in all environments
const createSchedulerPolyfill = (): Scheduler => {
  console.warn('📦 Creating scheduler polyfill...');
  return {
    unstable_now: () => {
      if (typeof performance !== 'undefined' && performance.now) {
        return performance.now();
      }
      return Date.now();
    },
    unstable_scheduleCallback: (priority: unknown, callback: () => void) => {
      return setTimeout(callback, 0);
    },
    unstable_cancelCallback: (id: unknown) => {
      if (typeof id === 'number') {
        clearTimeout(id);
      }
    },
    unstable_shouldYield: () => false,
    unstable_requestPaint: () => {
      // No-op
    },
    unstable_getCurrentPriorityLevel: () => 0,
    unstable_runWithPriority: (priority: unknown, callback: () => void) => {
      return callback();
    },
  };
};

// Ensure globalThis has scheduler
if (typeof globalThis !== 'undefined') {
  const globalScheduler = (globalThis as { scheduler?: Scheduler }).scheduler;
  if (!globalScheduler) {
    console.warn('🌐 Setting up globalThis.scheduler...');
    (globalThis as { scheduler?: Scheduler }).scheduler = createSchedulerPolyfill();
  }
}

// Ensure window has scheduler (for browser environments)
if (typeof window !== 'undefined') {
  if (!window.scheduler) {
    console.warn('🪟 Setting up window.scheduler...');
    const globalScheduler = (globalThis as { scheduler?: Scheduler }).scheduler;
    window.scheduler = globalScheduler || createSchedulerPolyfill();
  }
}

console.warn('🎯 main.tsx: About to render App...');

try {
  const root = document.getElementById('root');
  if (!root) {
    console.error('❌ Root element not found!');
    throw new Error('Root element not found');
  }

  console.warn('✅ Root element found, creating React root...');

  createRoot(root).render(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  );

  console.warn('🎉 React app rendered successfully!');
} catch (error) {
  console.error('💥 Error rendering React app:', error);
}
