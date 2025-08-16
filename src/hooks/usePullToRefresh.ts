import { useState, useCallback } from 'react';

/**
 * Hook for managing pull-to-refresh state
 */
export function usePullToRefresh(refreshFn: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await refreshFn();
      setLastRefresh(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshFn, isRefreshing]);

  const canRefresh = useCallback(() => {
    if (!lastRefresh) return true;

    // Prevent too frequent refreshes (minimum 2 seconds)
    const timeSinceLastRefresh = Date.now() - lastRefresh.getTime();
    return timeSinceLastRefresh > 2000;
  }, [lastRefresh]);

  return {
    refresh: canRefresh() ? refresh : async () => {},
    isRefreshing,
    lastRefresh,
    canRefresh: canRefresh(),
  };
}
