import React from 'react';
import { usePerformanceMetrics } from '../utils/performanceMonitor';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export function PerformanceDashboard() {
  const { getSummary, refreshMetrics } = usePerformanceMetrics();

  // Only show in development
  if (window.location.hostname !== 'localhost') {
    return null;
  }

  const last5Minutes = 5 * 60 * 1000;
  const summary = getSummary(last5Minutes);

  return (
    <Card className="mb-4 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
          Database Performance (Last 5 Minutes)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-yellow-600 dark:text-yellow-400 font-medium">Operations</div>
            <div className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
              {summary.totalOperations}
            </div>
          </div>

          <div>
            <div className="text-yellow-600 dark:text-yellow-400 font-medium">Avg Time</div>
            <div className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
              {summary.averageTime.toFixed(1)}ms
            </div>
          </div>

          <div>
            <div className="text-yellow-600 dark:text-yellow-400 font-medium">Cache Rate</div>
            <div className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
              {(summary.cacheHitRate * 100).toFixed(1)}%
            </div>
          </div>

          <div>
            <div className="text-yellow-600 dark:text-yellow-400 font-medium">Success Rate</div>
            <div className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
              {(summary.successRate * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {summary.totalOperations > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(summary.operationBreakdown)
              .sort(([, a], [, b]) => b.count - a.count)
              .slice(0, 5)
              .map(([operation, stats]) => (
                <Badge
                  key={operation}
                  variant="secondary"
                  className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                >
                  {operation}: {stats.count} ops ({stats.averageTime.toFixed(1)}ms)
                </Badge>
              ))}
          </div>
        )}

        <button
          onClick={refreshMetrics}
          className="mt-3 text-xs text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200 underline"
        >
          Refresh Metrics
        </button>
      </CardContent>
    </Card>
  );
}

export default PerformanceDashboard;
