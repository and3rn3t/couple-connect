import { describe, it, expect } from 'vitest';

describe('Basic functionality', () => {
  it('should perform basic math operations', () => {
    expect(1 + 1).toBe(2);
    expect(2 * 3).toBe(6);
    expect(10 / 2).toBe(5);
  });

  it('should handle string operations', () => {
    expect('hello'.toUpperCase()).toBe('HELLO');
    expect('world'.length).toBe(5);
    expect('test'.includes('es')).toBe(true);
  });

  it('should handle array operations', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr.includes(2)).toBe(true);
    expect(arr.map((x) => x * 2)).toEqual([2, 4, 6]);
  });
});
