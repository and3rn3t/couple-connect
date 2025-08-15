import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKV } from '../useKV';

// Create a proper localStorage mock
const createLocalStorageMock = () => {
  const store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
};

describe('useKV', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    vi.clearAllMocks();
  });

  it('should return default value when localStorage is empty', () => {
    const { result } = renderHook(() => useKV('test-key', 'default'));

    expect(result.current[0]).toBe('default');
  });

  it('should return stored value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'));

    const { result } = renderHook(() => useKV('test-key', 'default'));

    expect(result.current[0]).toBe('stored-value');
  });

  it('should store values in localStorage', () => {
    const { result } = renderHook(() => useKV('test-key', 'default'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(localStorage.getItem('test-key')).toBe('"new-value"');
  });

  it('should remove item from localStorage when value is undefined', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'));

    const { result } = renderHook(() => useKV('test-key'));

    act(() => {
      result.current[1](undefined);
    });

    expect(result.current[0]).toBeUndefined();
    expect(localStorage.getItem('test-key')).toBeNull();
  });

  it('should handle function updates', () => {
    const { result } = renderHook(() => useKV('test-key', 10));

    act(() => {
      result.current[1]((prev) => (prev || 0) + 5);
    });

    expect(result.current[0]).toBe(15);
  });

  it('should handle JSON parse errors gracefully', () => {
    localStorage.setItem('test-key', 'invalid-json');

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useKV('test-key', 'default'));

    expect(result.current[0]).toBe('default');
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error reading localStorage key "test-key"'),
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('should handle complex objects', () => {
    const complexObject = { name: 'Alice', age: 30, hobbies: ['reading', 'gaming'] };

    const { result } = renderHook(() => useKV('test-key', {}));

    act(() => {
      result.current[1](complexObject);
    });

    expect(result.current[0]).toEqual(complexObject);
    expect(JSON.parse(localStorage.getItem('test-key') || '{}')).toEqual(complexObject);
  });

  it('should sync across multiple instances', () => {
    const { result: result1 } = renderHook(() => useKV('shared-key', 'initial'));
    const { result: result2 } = renderHook(() => useKV('shared-key', 'initial'));

    act(() => {
      result1.current[1]('updated-by-first');
    });

    // Simulate storage event (this would normally happen across tabs)
    act(() => {
      const event = new Event('storage');
      Object.defineProperty(event, 'key', { value: 'shared-key' });
      Object.defineProperty(event, 'newValue', { value: '"updated-by-first"' });
      Object.defineProperty(event, 'storageArea', { value: localStorage });
      window.dispatchEvent(event);
    });

    expect(result2.current[0]).toBe('updated-by-first');
  });
});
