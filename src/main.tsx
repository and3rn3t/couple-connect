import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';

import App from './App.tsx';
import { ErrorFallback } from './ErrorFallback.tsx';

import './main.css';
import './styles/theme.css';
import './index.css';

// Fix for React 19 scheduler issue with Vite
// @ts-expect-error - globalThis.scheduler might not exist
if (typeof globalThis.scheduler === 'undefined') {
  // @ts-expect-error - Adding missing scheduler polyfill
  globalThis.scheduler = {
    unstable_now: () => performance.now(),
  };
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
  </ErrorBoundary>
);
