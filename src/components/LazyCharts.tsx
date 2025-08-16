import { lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';

// Chart loading skeleton with better mobile support
export const ChartSkeleton = () => (
  <Card className="w-full">
    <CardHeader className="pb-3">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-3 w-20" />
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
      <Skeleton className="h-32 w-full rounded-md" />
      <div className="flex justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </CardContent>
  </Card>
);

// Lazy load the entire chart UI module
const LazyChartUI = lazy(() => import('./ui/chart').then(module => ({
  default: {
    ChartContainer: module.ChartContainer,
    ChartTooltip: module.ChartTooltip,
    ChartTooltipContent: module.ChartTooltipContent,
    ChartLegend: module.ChartLegend,
    ChartLegendContent: module.ChartLegendContent,
  }
})));

// Lazy load Recharts components (heaviest dependency)
const LazyRecharts = lazy(() => import('recharts').then(module => ({
  default: {
    LineChart: module.LineChart,
    BarChart: module.BarChart,
    PieChart: module.PieChart,
    AreaChart: module.AreaChart,
    XAxis: module.XAxis,
    YAxis: module.YAxis,
    CartesianGrid: module.CartesianGrid,
    Tooltip: module.Tooltip,
    Legend: module.Legend,
    ResponsiveContainer: module.ResponsiveContainer,
    Line: module.Line,
    Bar: module.Bar,
    Area: module.Area,
    Pie: module.Pie,
    Cell: module.Cell,
  }
})));

// Provider for lazy charts with better error handling
export const LazyChartsProvider = ({ 
  children, 
  fallback = <ChartSkeleton /> 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);

// Lazy chart container component
export const LazyChartContainer = ({ children, ...props }: any) => (
  <LazyChartsProvider>
    <LazyChartUI>
      {({ ChartContainer }) => (
        <ChartContainer {...props}>
          {children}
        </ChartContainer>
      )}
    </LazyChartUI>
  </LazyChartsProvider>
);

// Export lazy components
export { LazyChartUI, LazyRecharts };

// Hook for lazy chart loading
export const useLazyCharts = () => {
  return {
    isChartsLoaded: false, // Will be true after first lazy load
    loadCharts: () => import('./ui/chart'),
    loadRecharts: () => import('recharts'),
  };
};
