import { capitalise } from '.';

describe('capitalise', () => {
  test('should capitalise the first letter of a lowercase string', () => {
    expect(capitalise('hello')).toBe('Hello');
  });

  test('should not modify a string that is already capitalised', () => {
    expect(capitalise('World')).toBe('World');
  });

  test('should return an empty string for an empty input', () => {
    expect(capitalise('')).toBe('');
  });

  test('should capitalise a single character string', () => {
    expect(capitalise('a')).toBe('A');
  });

  test('should handle strings that start with a number or symbol', () => {
    expect(capitalise('1test')).toBe('1test');
    expect(capitalise('!hello')).toBe('!hello');
  });

  test('should return non-string inputs as they are', () => {
    expect(capitalise(null as any)).toBe(null);
    expect(capitalise(undefined as any)).toBe(undefined);
    expect(capitalise(123 as any)).toBe(123);
    expect(capitalise([] as any)).toEqual([]);
    expect(capitalise({} as any)).toEqual({});
  });
});
