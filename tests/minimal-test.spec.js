// Minimal test to verify setup
import { describe, it, expect } from 'vitest';

describe('Minimal Test', () => {
  it('should pass basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle objects', () => {
    const obj = { test: true };
    expect(obj.test).toBe(true);
  });
});