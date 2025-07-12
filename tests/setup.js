// Test setup for Vitest
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.speechSynthesis
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    speak: vi.fn(),
  }
});

// Mock window.Notification
Object.defineProperty(window, 'Notification', {
  writable: true,
  value: {
    permission: 'granted',
    constructor: vi.fn()
  }
});

// Mock fetch for ntfy notifications
global.fetch = vi.fn();

// Suppress console warnings in tests unless explicitly testing them
const originalWarn = console.warn;
console.warn = (...args) => {
  // Allow console warnings through for testing purposes
  if (process.env.NODE_ENV === 'test') {
    originalWarn(...args);
  }
};