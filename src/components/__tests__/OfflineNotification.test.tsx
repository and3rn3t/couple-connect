import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/test-utils';
import { OfflineNotification } from '../OfflineNotification';

// Mock the useServiceWorker hook
const mockUseServiceWorker = vi.fn();
vi.mock('../../hooks/useServiceWorker', () => ({
  useServiceWorker: () => mockUseServiceWorker(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('OfflineNotification', () => {
  const defaultServiceWorkerState = {
    isOffline: false,
    offlineQueue: [],
    updateAvailable: false,
    applyUpdate: vi.fn(),
    triggerSync: vi.fn(),
    status: {
      supported: true,
      registered: true,
      activated: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseServiceWorker.mockReturnValue(defaultServiceWorkerState);
  });

  it('should not render when service worker is not supported', () => {
    mockUseServiceWorker.mockReturnValue({
      ...defaultServiceWorkerState,
      status: { supported: false },
    });

    render(<OfflineNotification />);

    // Should not render the offline notification div
    expect(screen.queryByTestId('offline-notification')).not.toBeInTheDocument();
  });

  it('should render offline indicator when offline', () => {
    mockUseServiceWorker.mockReturnValue({
      ...defaultServiceWorkerState,
      isOffline: true,
    });

    render(<OfflineNotification />);

    expect(screen.getByText('Offline')).toBeInTheDocument();
    expect(screen.getByTestId('wifi-slash-icon')).toBeInTheDocument();
  });

  it('should show update available notification', () => {
    mockUseServiceWorker.mockReturnValue({
      ...defaultServiceWorkerState,
      updateAvailable: true,
    });

    render(<OfflineNotification />);

    expect(screen.getByText('Update Available')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
  });

  it('should handle update application', async () => {
    const mockApplyUpdate = vi.fn().mockResolvedValue(undefined);

    mockUseServiceWorker.mockReturnValue({
      ...defaultServiceWorkerState,
      updateAvailable: true,
      applyUpdate: mockApplyUpdate,
    });

    render(<OfflineNotification />);

    const updateButton = screen.getByRole('button', { name: /update/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockApplyUpdate).toHaveBeenCalled();
    });
  });

  it('should show offline queue when there are pending actions', () => {
    const offlineQueue = [
      { id: '1', action: 'create', type: 'issue', data: { title: 'Test Issue' } },
      { id: '2', action: 'update', type: 'action', data: { status: 'completed' } },
    ];

    mockUseServiceWorker.mockReturnValue({
      ...defaultServiceWorkerState,
      isOffline: true,
      offlineQueue,
    });

    render(<OfflineNotification />);

    expect(screen.getByText('2 pending changes')).toBeInTheDocument();

    // Check that queue toggle works
    const queueButton = screen.getByText('2 pending changes');
    fireEvent.click(queueButton);

    expect(screen.getByText('Offline Changes Queue')).toBeInTheDocument();
  });

  it('should trigger sync when sync button is clicked', async () => {
    const mockTriggerSync = vi.fn().mockResolvedValue(undefined);

    mockUseServiceWorker.mockReturnValue({
      ...defaultServiceWorkerState,
      isOffline: true,
      offlineQueue: [{ id: '1', action: 'create', type: 'issue', data: {} }],
      triggerSync: mockTriggerSync,
    });

    render(<OfflineNotification />);

    // Open queue
    fireEvent.click(screen.getByText('1 pending changes'));

    // Click sync button
    const syncButton = screen.getByRole('button', { name: /sync now/i });
    fireEvent.click(syncButton);

    await waitFor(() => {
      expect(mockTriggerSync).toHaveBeenCalled();
    });
  });

  it('should handle custom className', () => {
    render(<OfflineNotification className="custom-class" />);

    const notification = screen.getByTestId('offline-notification');
    expect(notification).toHaveClass('custom-class');
  });

  it('should show online status when back online', () => {
    mockUseServiceWorker.mockReturnValue({
      ...defaultServiceWorkerState,
      isOffline: false,
    });

    render(<OfflineNotification />);

    // Should not show offline indicator
    expect(screen.queryByText('Offline')).not.toBeInTheDocument();
  });
});
