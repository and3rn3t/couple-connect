import { lazy, Suspense } from 'react';
import type { ComponentType, SVGProps } from 'react';

// Type definitions for icon props
interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  weight?: string;
}

// Icon loading placeholder component (avoiding inline styles)
export const IconPlaceholder = ({ size = 16 }: { size?: number }) => {
  // Create a simple placeholder that uses Tailwind classes
  const sizeClass = size <= 16 ? 'w-4 h-4' : size <= 24 ? 'w-6 h-6' : 'w-8 h-8';

  return (
    <div
      className={`inline-block bg-current opacity-30 rounded-sm ${sizeClass}`}
      data-size={size}
      aria-hidden="true"
    />
  );
};

// HOC for lazy icon loading
export const withLazyIcon = (IconComponent: ComponentType<IconProps>, fallbackSize = 16) => {
  const LazyIconWrapper = (props: IconProps) => (
    <Suspense fallback={<IconPlaceholder size={fallbackSize} />}>
      <IconComponent {...props} />
    </Suspense>
  );

  LazyIconWrapper.displayName = `LazyIcon(${IconComponent.displayName || IconComponent.name || 'Component'})`;

  return LazyIconWrapper;
};

// Commonly used icons (keep these loaded)
export const EssentialIcons = {
  Heart: ({ size = 16, ...props }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  Target: ({ size = 16, ...props }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="6"></circle>
      <circle cx="12" cy="12" r="2"></circle>
    </svg>
  ),
  ChartBar: ({ size = 16, ...props }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <line x1="12" y1="20" x2="12" y2="10"></line>
      <line x1="18" y1="20" x2="18" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="16"></line>
    </svg>
  ),
  Plus: ({ size = 16, ...props }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  Check: ({ size = 16, ...props }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <polyline points="20,6 9,17 4,12"></polyline>
    </svg>
  ),
  X: ({ size = 16, ...props }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
};

// Lazy icon components for heavy icon libraries
export const LazyIcons = {
  // Phosphor icons (lazy) - only load when specifically needed
  Target: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Target }))),
  ChartBar: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.ChartBar }))),
  User: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.User }))),
  Gear: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Gear }))),
  Clock: lazy(() => import('@phosphor-icons/react').then((m) => ({ default: m.Clock }))),

  // Lucide icons (lazy) - only load when specifically needed
  ChevronDown: lazy(() => import('lucide-react').then((m) => ({ default: m.ChevronDown }))),
  ArrowLeft: lazy(() => import('lucide-react').then((m) => ({ default: m.ArrowLeft }))),
  ArrowRight: lazy(() => import('lucide-react').then((m) => ({ default: m.ArrowRight }))),
};

// Hook for preloading icons when needed
export const usePreloadIcons = () => {
  const preloadPhosphor = () => import('@phosphor-icons/react');
  const preloadLucide = () => import('lucide-react');

  return { preloadPhosphor, preloadLucide };
};
