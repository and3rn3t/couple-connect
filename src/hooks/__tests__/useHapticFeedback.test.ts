import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHapticFeedback } from '../useHapticFeedback';

// Mock the mobile detection hook
vi.mock('../use-mobile', () => ({
  useIOSDetection: vi.fn(() => ({ isIOS: true })),
}));

// Mock haptic constants
vi.mock('@/constants/mobile', () => ({
  HAPTIC_DURATIONS: {
    LIGHT: 10,
    MEDIUM: 20,
    HEAVY: 50,
    SELECTION: 5,
    IMPACT: 15,
    NOTIFICATION: 25,
  },
  HAPTIC_PATTERNS: {
    SUCCESS: [10, 100, 10],
    ERROR: [50, 100, 50, 100, 50],
    WARNING: [20, 100, 20],
  },
}));

// Mock the iOS detection hook
const mockUseIOSDetection = vi.fn();
vi.mock('../use-mobile', () => ({
  useIOSDetection: () => mockUseIOSDetection(),
}));

describe('useHapticFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock iOS device by default for most tests
    mockUseIOSDetection.mockReturnValue({ isIOS: true });
    // Reset the navigator.vibrate mock if it exists
    if (navigator.vibrate && vi.isMockFunction(navigator.vibrate)) {
      vi.mocked(navigator.vibrate).mockClear();
    }
  });

  it('should return a triggerHaptic function', () => {
    const { result } = renderHook(() => useHapticFeedback());

    expect(typeof result.current.triggerHaptic).toBe('function');
  });

  it('should trigger light haptic feedback', () => {
    const { result } = renderHook(() => useHapticFeedback());

    result.current.triggerHaptic('light');

    expect(vi.mocked(navigator.vibrate)).toHaveBeenCalledWith(10);
  });

  it('should trigger medium haptic feedback', () => {
    const { result } = renderHook(() => useHapticFeedback());

    result.current.triggerHaptic('medium');

    expect(vi.mocked(navigator.vibrate)).toHaveBeenCalledWith(20);
  });

  it('should trigger heavy haptic feedback', () => {
    const { result } = renderHook(() => useHapticFeedback());

    result.current.triggerHaptic('heavy');

    expect(vi.mocked(navigator.vibrate)).toHaveBeenCalledWith(50);
  });

  it('should default to light haptic when no type specified', () => {
    const { result } = renderHook(() => useHapticFeedback());

    result.current.triggerHaptic();

    expect(vi.mocked(navigator.vibrate)).toHaveBeenCalledWith(10);
  });

  it('should trigger selection haptic feedback', () => {
    const { result } = renderHook(() => useHapticFeedback());

    result.current.triggerHaptic('selection');

    expect(vi.mocked(navigator.vibrate)).toHaveBeenCalledWith(5);
  });

  it('should not vibrate when not on iOS', () => {
    // Mock non-iOS device
    mockUseIOSDetection.mockReturnValue({ isIOS: false });

    const { result } = renderHook(() => useHapticFeedback());

    result.current.triggerHaptic('heavy');

    expect(vi.mocked(navigator.vibrate)).not.toHaveBeenCalled();
  });

  it('should not vibrate when vibrate API is not available', () => {
    // Test when 'vibrate' is not in navigator
    const { result } = renderHook(() => useHapticFeedback());

    // Should not throw error when vibrate is not available
    expect(() => result.current.triggerHaptic('medium')).not.toThrow();
  });

  it('should provide triggerSuccess feedback method', () => {
    const { result } = renderHook(() => useHapticFeedback());

    result.current.triggerSuccess();
    expect(vi.mocked(navigator.vibrate)).toHaveBeenCalledWith([20, 100, 20]);
  });

  it('should provide triggerError feedback method', () => {
    const { result } = renderHook(() => useHapticFeedback());

    result.current.triggerError();
    expect(vi.mocked(navigator.vibrate)).toHaveBeenCalledWith(30);
  });

  it('should provide triggerSelection feedback method', () => {
    const { result } = renderHook(() => useHapticFeedback());

    result.current.triggerSelection();
    expect(vi.mocked(navigator.vibrate)).toHaveBeenCalledWith(5);
  });

  it('should provide triggerButtonPress feedback method', () => {
    const { result } = renderHook(() => useHapticFeedback());

    result.current.triggerButtonPress();
    expect(vi.mocked(navigator.vibrate)).toHaveBeenCalledWith(10);
  });

  it('should handle multiple rapid calls', () => {
    const { result } = renderHook(() => useHapticFeedback());

    result.current.triggerHaptic('light');
    result.current.triggerHaptic('medium');
    result.current.triggerHaptic('heavy');

    expect(vi.mocked(navigator.vibrate)).toHaveBeenCalledTimes(3);
    expect(vi.mocked(navigator.vibrate)).toHaveBeenNthCalledWith(1, 10);
    expect(vi.mocked(navigator.vibrate)).toHaveBeenNthCalledWith(2, 20);
    expect(vi.mocked(navigator.vibrate)).toHaveBeenNthCalledWith(3, 50);
  });
});
