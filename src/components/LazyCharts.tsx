import React, { lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';

// Chart loading skeleton with better mobile support
export const ChartSkeleton = () => (
  <Card className="w-full">
    <CardHeader className="pb-3">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-3 w-20" />
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
      <Skeleton className="h-40 w-full rounded-lg" />
    </CardContent>
  </Card>
);

// Simple chart provider
export const LazyChartsProvider = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<ChartSkeleton />}>{children}</Suspense>
);

// Lazy load chart components individually with proper typing
export const LazyLineChart = lazy(() =>
  import('recharts').then((module) => ({
    default: module.LineChart as React.ComponentType<any>,
  }))
);

export const LazyBarChart = lazy(() =>
  import('recharts').then((module) => ({
    default: module.BarChart as React.ComponentType<any>,
  }))
);

export const LazyPieChart = lazy(() =>
  import('recharts').then((module) => ({
    default: module.PieChart as React.ComponentType<any>,
  }))
);

export const LazyXAxis = lazy(() =>
  import('recharts').then((module) => ({
    default: module.XAxis as React.ComponentType<any>,
  }))
);

export const LazyYAxis = lazy(() =>
  import('recharts').then((module) => ({
    default: module.YAxis as React.ComponentType<any>,
  }))
);

export const LazyCartesianGrid = lazy(() =>
  import('recharts').then((module) => ({
    default: module.CartesianGrid as React.ComponentType<any>,
  }))
);

export const LazyTooltip = lazy(() =>
  import('recharts').then((module) => ({
    default: module.Tooltip as React.ComponentType<any>,
  }))
);

export const LazyLegend = lazy(() =>
  import('recharts').then((module) => ({
    default: module.Legend as React.ComponentType<any>,
  }))
);

export const LazyResponsiveContainer = lazy(() =>
  import('recharts').then((module) => ({
    default: module.ResponsiveContainer as React.ComponentType<any>,
  }))
);

export const LazyLine = lazy(() =>
  import('recharts').then((module) => ({
    default: module.Line as React.ComponentType<any>,
  }))
);

export const LazyBar = lazy(() =>
  import('recharts').then((module) => ({
    default: module.Bar as unknown as React.ComponentType<any>,
  }))
);

export const LazyArea = lazy(() =>
  import('recharts').then((module) => ({
    default: module.Area as unknown as React.ComponentType<any>,
  }))
);
export const LazyCellComponent = lazy(() =>
  import('recharts').then((module) => ({
    default: module.Cell as React.ComponentType<any>,
  }))
);

// Lazy chart container component
export const LazyChartContainer = ({ children }: { children: React.ReactNode }) => (
  <LazyChartsProvider>
    <Suspense fallback={<div>Loading chart container...</div>}>{children}</Suspense>
  </LazyChartsProvider>
);
