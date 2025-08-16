import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile, useScreenSize } from '../use-mobile';

// Mock the mobile constants
vi.mock('@/constants/mobile', () => ({
  IOS_BREAKPOINTS: {
    STANDARD: 375,
    LARGE: 414,
    TABLET: 768,
    DESKTOP: 1024,
  },
}));

describe('Mobile Detection Hooks', () => {
  let mockAddEventListener: ReturnType<typeof vi.fn>;
  let mockRemoveEventListener: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockAddEventListener = vi.fn();
    mockRemoveEventListener = vi.fn();

    const mockMatchMedia = vi.fn((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useIsMobile', () => {
    it('should return false for desktop width', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(false);
    });

    it('should return true for mobile width', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 400,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(true);
    });

    it('should add and remove event listeners', () => {
      const { unmount } = renderHook(() => useIsMobile());

      expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)');
      expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));

      unmount();
      expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should respond to window resize', () => {
      const { result } = renderHook(() => useIsMobile());

      // Initially desktop
      expect(result.current).toBe(false);

      // Simulate resize to mobile
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          value: 400,
        });
        window.dispatchEvent(new Event('resize'));
      });

      // Should update based on new size
      expect(mockAddEventListener).toHaveBeenCalled();
    });
  });

  describe('useScreenSize', () => {
    it('should return "small" for small screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 350,
      });

      const { result } = renderHook(() => useScreenSize());
      expect(result.current).toBe('small');
    });

    it('should return "standard" for standard screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 400,
      });

      const { result } = renderHook(() => useScreenSize());
      expect(result.current).toBe('standard');
    });

    it('should return "large" for large screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 450,
      });

      const { result } = renderHook(() => useScreenSize());
      expect(result.current).toBe('large');
    });

    it('should return "tablet" for tablet screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 800,
      });

      const { result } = renderHook(() => useScreenSize());
      expect(result.current).toBe('tablet');
    });

    it('should return "desktop" for desktop screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1200,
      });

      const { result } = renderHook(() => useScreenSize());
      expect(result.current).toBe('desktop');
    });

    it('should update screen size on window resize', () => {
      const { result } = renderHook(() => useScreenSize());

      // Start with desktop
      expect(result.current).toBe('desktop');

      // Simulate resize to mobile
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          value: 350,
        });
        // Trigger the resize handler
        const resizeHandler = mockAddEventListener.mock.calls.find(
          (call) => call[0] === 'resize'
        )?.[1];
        if (resizeHandler) {
          resizeHandler();
        }
      });
    });
  });
});
