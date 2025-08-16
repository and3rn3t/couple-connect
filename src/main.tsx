import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';

import App from './App.tsx';
import { ErrorFallback } from './ErrorFallback.tsx';

import './main.css';
import './styles/theme.css';
import './index.css';

// Enhanced fix for React 19 scheduler issue with Vite
// @ts-expect-error - globalThis.scheduler might not exist
if (typeof globalThis.scheduler === 'undefined' || !globalThis.scheduler) {
  // @ts-expect-error - Adding missing scheduler polyfill
  globalThis.scheduler = {
    unstable_now: () => performance.now(),
    unstable_scheduleCallback: (priority: any, callback: any) => setTimeout(callback, 0),
    unstable_cancelCallback: (id: any) => clearTimeout(id),
    unstable_shouldYield: () => false,
    unstable_requestPaint: () => {
      // No-op
    },
  };
}

// Also ensure window.scheduler exists for React
// @ts-expect-error - window.scheduler might not exist
if (typeof window !== 'undefined' && !window.scheduler) {
  // @ts-expect-error - Adding scheduler to window
  window.scheduler = globalThis.scheduler;
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
  </ErrorBoundary>
);
