import React from 'react';

// CSS-based animations that replace framer-motion for better bundle size
// These use Tailwind's built-in animation utilities

export const FadeIn = ({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <div className={`animate-in fade-in duration-300 ${className}`} data-delay={delay}>
    {children}
  </div>
);

export const SlideIn = ({
  children,
  className = '',
  direction = 'up',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
}) => {
  const directionClass = {
    up: 'slide-in-from-bottom',
    down: 'slide-in-from-top',
    left: 'slide-in-from-right',
    right: 'slide-in-from-left',
  };

  return (
    <div
      className={`animate-in ${directionClass[direction]} duration-300 ${className}`}
      data-delay={delay}
    >
      {children}
    </div>
  );
};

export const ScaleIn = ({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <div className={`animate-in zoom-in-95 duration-300 ${className}`} data-delay={delay}>
    {children}
  </div>
);

// Touch feedback without framer-motion
export const TouchFeedback = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`active:scale-95 transition-transform duration-150 ${className}`}>{children}</div>
);

// Simple stagger animation using CSS
export const StaggerContainer = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`space-y-1 ${className}`}>
    {React.Children.map(children, (child, index) => (
      <div
        key={index}
        className="animate-in fade-in slide-in-from-left duration-300"
        data-delay={index * 100}
      >
        {child}
      </div>
    ))}
  </div>
);

// Hover effects without framer-motion
export const HoverCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`hover:scale-105 transition-transform duration-200 ${className}`}>{children}</div>
);
