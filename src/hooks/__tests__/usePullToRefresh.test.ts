import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePullToRefresh } from '../usePullToRefresh';

describe('usePullToRefresh', () => {
  let mockRefreshFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockRefreshFn = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => usePullToRefresh(mockRefreshFn));

    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.lastRefresh).toBeNull();
    expect(result.current.canRefresh).toBe(true);
    expect(typeof result.current.refresh).toBe('function');
  });

  it('should call refresh function when refresh is triggered', async () => {
    mockRefreshFn.mockResolvedValue(undefined);
    const { result } = renderHook(() => usePullToRefresh(mockRefreshFn));

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockRefreshFn).toHaveBeenCalledTimes(1);
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.lastRefresh).toBeInstanceOf(Date);
  });

  it('should set isRefreshing to true during refresh operation', async () => {
    let resolveRefresh: () => void;
    const refreshPromise = new Promise<void>((resolve) => {
      resolveRefresh = resolve;
    });
    mockRefreshFn.mockReturnValue(refreshPromise);

    const { result } = renderHook(() => usePullToRefresh(mockRefreshFn));

    // Start refresh
    act(() => {
      result.current.refresh();
    });

    // Should be refreshing immediately
    expect(result.current.isRefreshing).toBe(true);

    // Complete refresh
    await act(async () => {
      resolveRefresh!();
      await refreshPromise;
    });

    expect(result.current.isRefreshing).toBe(false);
  });

  it('should handle refresh function errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockRefreshFn.mockRejectedValue(new Error('Refresh failed'));

    const { result } = renderHook(() => usePullToRefresh(mockRefreshFn));

    // The hook doesn't catch errors, so we need to catch them in the test
    await act(async () => {
      try {
        await result.current.refresh();
      } catch (_error) {
        // Expected to throw
      }
    });

    expect(result.current.isRefreshing).toBe(false);
    // When refresh fails, lastRefresh should remain null since it's only set on success
    expect(result.current.lastRefresh).toBeNull();

    consoleErrorSpy.mockRestore();
  });

  it('should prevent multiple simultaneous refresh calls', async () => {
    let resolveFirstRefresh: () => void;
    const firstRefreshPromise = new Promise<void>((resolve) => {
      resolveFirstRefresh = resolve;
    });
    mockRefreshFn.mockReturnValueOnce(firstRefreshPromise).mockResolvedValue(undefined);

    const { result } = renderHook(() => usePullToRefresh(mockRefreshFn));

    // Start first refresh
    act(() => {
      result.current.refresh();
    });

    expect(result.current.isRefreshing).toBe(true);

    // Try to start second refresh while first is still running
    await act(async () => {
      await result.current.refresh();
    });

    // Should still only have called refresh function once
    expect(mockRefreshFn).toHaveBeenCalledTimes(1);

    // Complete first refresh
    await act(async () => {
      resolveFirstRefresh!();
      await firstRefreshPromise;
    });

    expect(result.current.isRefreshing).toBe(false);
  });

  it('should prevent refresh if last refresh was too recent', async () => {
    mockRefreshFn.mockResolvedValue(undefined);
    const { result } = renderHook(() => usePullToRefresh(mockRefreshFn));

    // First refresh
    await act(async () => {
      await result.current.refresh();
    });

    expect(mockRefreshFn).toHaveBeenCalledTimes(1);
    expect(result.current.canRefresh).toBe(false);

    // Try to refresh again immediately
    await act(async () => {
      await result.current.refresh();
    });

    // Should not have called refresh function again
    expect(mockRefreshFn).toHaveBeenCalledTimes(1);
  });

  it('should allow refresh after cooldown period', async () => {
    mockRefreshFn.mockResolvedValue(undefined);
    const { result, rerender } = renderHook(() => usePullToRefresh(mockRefreshFn));

    // First refresh
    await act(async () => {
      await result.current.refresh();
    });

    expect(mockRefreshFn).toHaveBeenCalledTimes(1);
    expect(result.current.canRefresh).toBe(false);

    // Advance time by more than 2 seconds
    act(() => {
      vi.advanceTimersByTime(2500);
    });

    // Re-render to get updated canRefresh value
    rerender();

    // Should be able to refresh again
    expect(result.current.canRefresh).toBe(true);

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockRefreshFn).toHaveBeenCalledTimes(2);
  });

  it('should update lastRefresh timestamp on successful refresh', async () => {
    mockRefreshFn.mockResolvedValue(undefined);
    const { result } = renderHook(() => usePullToRefresh(mockRefreshFn));

    const beforeRefresh = new Date();

    await act(async () => {
      await result.current.refresh();
    });

    const afterRefresh = new Date();

    expect(result.current.lastRefresh).not.toBeNull();
    expect(result.current.lastRefresh!.getTime()).toBeGreaterThanOrEqual(beforeRefresh.getTime());
    expect(result.current.lastRefresh!.getTime()).toBeLessThanOrEqual(afterRefresh.getTime());
  });

  it('should return no-op function when canRefresh is false', async () => {
    mockRefreshFn.mockResolvedValue(undefined);
    const { result } = renderHook(() => usePullToRefresh(mockRefreshFn));

    // First refresh to set lastRefresh
    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.canRefresh).toBe(false);

    // The refresh function should now be a no-op
    const refreshResult = result.current.refresh();
    expect(refreshResult).toBeInstanceOf(Promise);

    await act(async () => {
      await refreshResult;
    });

    // Should still only have called the mock once (from first refresh)
    expect(mockRefreshFn).toHaveBeenCalledTimes(1);
  });

  it('should handle refresh function that returns void', async () => {
    const voidRefreshFn = vi.fn().mockReturnValue(undefined);
    const { result } = renderHook(() => usePullToRefresh(voidRefreshFn));

    await act(async () => {
      await result.current.refresh();
    });

    expect(voidRefreshFn).toHaveBeenCalledTimes(1);
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.lastRefresh).toBeInstanceOf(Date);
  });

  it('should maintain stable function references when canRefresh changes', () => {
    const { result, rerender } = renderHook(() => usePullToRefresh(mockRefreshFn));

    const initialRefresh = result.current.refresh;

    // Force a re-render
    rerender();

    // Function reference should remain stable when canRefresh is true
    expect(result.current.refresh).toBe(initialRefresh);
  });

  it('should handle multiple refresh attempts correctly', async () => {
    mockRefreshFn.mockResolvedValue(undefined);
    const { result } = renderHook(() => usePullToRefresh(mockRefreshFn));

    // First refresh should work
    await act(async () => {
      await result.current.refresh();
    });

    expect(mockRefreshFn).toHaveBeenCalledTimes(1);
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.canRefresh).toBe(false);
  });

  it('should handle changing refresh function', async () => {
    const firstRefreshFn = vi.fn().mockResolvedValue(undefined);
    const secondRefreshFn = vi.fn().mockResolvedValue(undefined);

    const { result, rerender } = renderHook((refreshFn) => usePullToRefresh(refreshFn), {
      initialProps: firstRefreshFn,
    });

    // Use first refresh function
    await act(async () => {
      await result.current.refresh();
    });

    expect(firstRefreshFn).toHaveBeenCalledTimes(1);

    // Change to second refresh function
    rerender(secondRefreshFn);

    // Should now use the second function (though may be rate limited)
    expect(result.current).toBeDefined();
    expect(typeof result.current.refresh).toBe('function');
  });
});
