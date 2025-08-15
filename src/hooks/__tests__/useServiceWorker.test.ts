import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ServiceWorkerStatus } from '@/services/serviceWorkerManager';

// Mock the service worker manager - must be at top level for hoisting
vi.mock('@/services/serviceWorkerManager', () => ({
  swManager: {
    getStatus: vi.fn(),
    isOffline: vi.fn(),
    getOfflineQueue: vi.fn(),
    onStatusChange: vi.fn(),
    onUpdateAvailable: vi.fn(),
    applyUpdate: vi.fn(),
    addToOfflineQueue: vi.fn(),
    triggerBackgroundSync: vi.fn(),
    cacheUrls: vi.fn(),
    getVersion: vi.fn(),
  },
}));

// Import after mocking
const { useServiceWorker, useOfflineFirst, useResourceCaching } = await import(
  '../useServiceWorker'
);
const { swManager } = await import('@/services/serviceWorkerManager');

// Mock navigator.onLine
Object.defineProperty(global.navigator, 'onLine', {
  writable: true,
  value: true,
});

// Mock window.location.reload
const mockReload = vi.fn();
Object.defineProperty(window, 'location', {
  value: {
    reload: mockReload,
  },
  writable: true,
});

describe('useServiceWorker', () => {
  const mockStatus: ServiceWorkerStatus = {
    supported: true,
    registered: true,
    installing: false,
    waiting: false,
    active: true,
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Set default mock implementations
    vi.mocked(swManager.getStatus).mockReturnValue(mockStatus);
    vi.mocked(swManager.isOffline).mockReturnValue(false);
    vi.mocked(swManager.getOfflineQueue).mockReturnValue([]);
    vi.mocked(swManager.onStatusChange).mockReturnValue(() => {});
    vi.mocked(swManager.onUpdateAvailable).mockReturnValue(() => {});
    vi.mocked(swManager.applyUpdate).mockResolvedValue(undefined);
    vi.mocked(swManager.addToOfflineQueue).mockReturnValue('test-id');
    vi.mocked(swManager.triggerBackgroundSync).mockResolvedValue(undefined);
    vi.mocked(swManager.cacheUrls).mockResolvedValue(undefined);
    vi.mocked(swManager.getVersion).mockResolvedValue('1.0.0');

    // Mock window events
    global.addEventListener = vi.fn();
    global.removeEventListener = vi.fn();
  });

  it('should initialize with service worker status', () => {
    const { result } = renderHook(() => useServiceWorker());

    expect(result.current.status).toEqual(mockStatus);
    expect(result.current.isOffline).toBe(false);
    expect(result.current.updateAvailable).toBe(false);
    expect(result.current.offlineQueue).toEqual([]);
  });

  it('should handle offline state changes', () => {
    vi.mocked(swManager.isOffline).mockReturnValue(true);

    const { result } = renderHook(() => useServiceWorker());

    expect(result.current.isOffline).toBe(true);
  });

  it('should handle update available state', () => {
    let updateCallback: ((registration: ServiceWorkerRegistration) => void) | undefined;
    vi.mocked(swManager.onUpdateAvailable).mockImplementation(
      (callback: (registration: ServiceWorkerRegistration) => void) => {
        updateCallback = callback;
        return () => {};
      }
    );

    const { result } = renderHook(() => useServiceWorker());

    expect(result.current.updateAvailable).toBe(false);

    // Trigger update available
    act(() => {
      updateCallback?.({} as ServiceWorkerRegistration);
    });

    expect(result.current.updateAvailable).toBe(true);
  });

  it('should apply updates and reload', async () => {
    const { result } = renderHook(() => useServiceWorker());

    await act(async () => {
      await result.current.applyUpdate();
    });

    expect(swManager.applyUpdate).toHaveBeenCalled();
    expect(mockReload).toHaveBeenCalled();
  });

  it('should handle offline queue operations', async () => {
    const { result } = renderHook(() => useServiceWorker());

    const queueData = {
      title: 'Test Action',
      partnerId: 'partner-1',
    };

    let queueId: string;
    await act(async () => {
      queueId = result.current.addToOfflineQueue('action', queueData);
    });

    expect(swManager.addToOfflineQueue).toHaveBeenCalledWith('action', queueData);
    expect(queueId!).toBe('test-id');
  });

  it('should trigger background sync', async () => {
    const { result } = renderHook(() => useServiceWorker());

    await act(async () => {
      await result.current.triggerSync();
    });

    expect(swManager.triggerBackgroundSync).toHaveBeenCalled();
  });

  it('should subscribe to status changes on mount', () => {
    renderHook(() => useServiceWorker());

    expect(swManager.onStatusChange).toHaveBeenCalled();
    expect(swManager.onUpdateAvailable).toHaveBeenCalled();
  });

  it('should cache URLs', async () => {
    const { result } = renderHook(() => useServiceWorker());
    const urls = ['/api/data', '/images/icon.png'];

    await act(async () => {
      await result.current.cacheUrls(urls);
    });

    expect(swManager.cacheUrls).toHaveBeenCalledWith(urls);
  });

  it('should get service worker version', async () => {
    const { result } = renderHook(() => useServiceWorker());

    let version: string;
    await act(async () => {
      version = await result.current.getVersion();
    });

    expect(swManager.getVersion).toHaveBeenCalled();
    expect(version!).toBe('1.0.0');
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Update failed');
    vi.mocked(swManager.applyUpdate).mockRejectedValue(error);

    const { result } = renderHook(() => useServiceWorker());

    await expect(result.current.applyUpdate()).rejects.toThrow('Update failed');
  });
});

describe('useOfflineFirst', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(swManager.getStatus).mockReturnValue({
      supported: true,
      registered: true,
      installing: false,
      waiting: false,
      active: true,
    });
    vi.mocked(swManager.isOffline).mockReturnValue(false);
    vi.mocked(swManager.getOfflineQueue).mockReturnValue([]);
    vi.mocked(swManager.onStatusChange).mockReturnValue(() => {});
    vi.mocked(swManager.onUpdateAvailable).mockReturnValue(() => {});
    vi.mocked(swManager.addToOfflineQueue).mockReturnValue('test-id');
    vi.mocked(swManager.triggerBackgroundSync).mockResolvedValue(undefined);
  });

  it('should execute operations normally when online', async () => {
    vi.mocked(swManager.isOffline).mockReturnValue(false);

    const { result } = renderHook(() => useOfflineFirst());
    const mockOperation = vi.fn().mockResolvedValue('success');

    let operationResult: string;
    await act(async () => {
      operationResult = await result.current.executeWithOfflineSupport(mockOperation, 'fallback');
    });

    expect(mockOperation).toHaveBeenCalled();
    expect(operationResult!).toBe('success');
  });

  it('should return fallback data when offline', async () => {
    vi.mocked(swManager.isOffline).mockReturnValue(true);

    const { result } = renderHook(() => useOfflineFirst());
    const mockOperation = vi.fn().mockResolvedValue('success');

    let operationResult: string;
    await act(async () => {
      operationResult = await result.current.executeWithOfflineSupport(
        mockOperation,
        'fallback',
        'action',
        { title: 'Test', partnerId: 'partner-1' }
      );
    });

    expect(mockOperation).not.toHaveBeenCalled();
    expect(operationResult!).toBe('fallback');
    expect(swManager.addToOfflineQueue).toHaveBeenCalledWith('action', {
      title: 'Test',
      partnerId: 'partner-1',
    });
  });

  it('should handle operation errors and queue when appropriate', async () => {
    vi.mocked(swManager.isOffline).mockReturnValue(false);
    Object.defineProperty(global.navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => useOfflineFirst());
    const mockOperation = vi.fn().mockRejectedValue(new Error('Network error'));

    let operationResult: string;
    await act(async () => {
      operationResult = await result.current.executeWithOfflineSupport(
        mockOperation,
        'fallback',
        'action',
        { title: 'Test', partnerId: 'partner-1' }
      );
    });

    expect(mockOperation).toHaveBeenCalled();
    expect(operationResult!).toBe('fallback');
    expect(swManager.addToOfflineQueue).toHaveBeenCalled();
  });
});

describe('useResourceCaching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(swManager.getStatus).mockReturnValue({
      supported: true,
      registered: true,
      installing: false,
      waiting: false,
      active: true,
    });
    vi.mocked(swManager.isOffline).mockReturnValue(false);
    vi.mocked(swManager.getOfflineQueue).mockReturnValue([]);
    vi.mocked(swManager.onStatusChange).mockReturnValue(() => {});
    vi.mocked(swManager.onUpdateAvailable).mockReturnValue(() => {});
    vi.mocked(swManager.cacheUrls).mockResolvedValue(undefined);
  });

  it('should cache resources when service worker is active', async () => {
    const { result } = renderHook(() => useResourceCaching());
    const urls = ['/api/data', '/images/icon.png'];

    await act(async () => {
      await result.current.cacheImportantResources(urls);
    });

    expect(swManager.cacheUrls).toHaveBeenCalledWith(urls);
  });

  it('should not cache when service worker is not active', async () => {
    vi.mocked(swManager.getStatus).mockReturnValue({
      supported: true,
      registered: true,
      installing: false,
      waiting: false,
      active: false,
    });

    const { result } = renderHook(() => useResourceCaching());
    const urls = ['/api/data'];

    await act(async () => {
      await result.current.cacheImportantResources(urls);
    });

    expect(swManager.cacheUrls).not.toHaveBeenCalled();
  });

  it('should preload critical resources', async () => {
    const { result } = renderHook(() => useResourceCaching());

    await act(async () => {
      await result.current.preloadCriticalResources();
    });

    expect(swManager.cacheUrls).toHaveBeenCalledWith(['/', '/manifest.json']);
  });

  it('should indicate caching capability', () => {
    const { result } = renderHook(() => useResourceCaching());

    expect(result.current.canCache).toBe(true);
  });
});
