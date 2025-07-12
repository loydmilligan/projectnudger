// Test utilities for React component testing with Firebase mocks
import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

// Mock Firebase modules
export const mockFirebase = {
  // Mock Firestore functions
  doc: vi.fn(() => ({ id: 'mock-doc-id' })),
  collection: vi.fn(() => ({ id: 'mock-collection-id' })),
  updateDoc: vi.fn(() => Promise.resolve()),
  setDoc: vi.fn(() => Promise.resolve()),
  addDoc: vi.fn(() => Promise.resolve({ id: 'mock-new-doc-id' })),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  query: vi.fn((collection) => collection),
  where: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  limit: vi.fn(() => ({})),
  increment: vi.fn((value) => value),
  arrayUnion: vi.fn((value) => [value]),
  
  // Mock database
  db: { id: 'mock-db' },
  basePath: 'test-users/test-user'
};

// Mock BLE Service
export const mockM5DialBLEService = {
  connected: false,
  sendCommand: vi.fn(() => Promise.resolve()),
  connect: vi.fn(() => Promise.resolve()),
  disconnect: vi.fn(() => Promise.resolve())
};

// Custom render function that provides common context/providers
export function renderWithProviders(ui, options = {}) {
  const { ...renderOptions } = options;

  function Wrapper({ children }) {
    return <div data-testid="test-wrapper">{children}</div>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Factory functions for creating mock data
export function createMockTask(overrides = {}) {
  return {
    id: 'task-1',
    title: 'Test Task',
    detail: 'Test task detail',
    projectId: 'project-1',
    isComplete: false,
    status: 'idle',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    tags: ['test'],
    dueDate: null,
    sessions: [],
    ...overrides
  };
}

export function createMockProject(overrides = {}) {
  return {
    id: 'project-1',
    name: 'Test Project',
    category: 'test',
    owner: 'test-user',
    status: 'active',
    createdAt: new Date('2024-01-01T09:00:00Z'),
    ...overrides
  };
}

export function createMockActiveSession(overrides = {}) {
  return {
    taskId: 'task-1',
    startTime: new Date(),
    duration: 1500, // 25 minutes in seconds
    isDouble: false,
    active: true,
    type: 'work',
    ...overrides
  };
}

// Mock handlers for common task operations
export function createMockHandlers() {
  return {
    onToggle: vi.fn(),
    onOpenDetail: vi.fn(),
    onStartTask: vi.fn(),
    onCompleteTask: vi.fn(),
    onEditTask: vi.fn()
  };
}

// Helper to mock console methods and capture calls
export function mockConsole() {
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalLog = console.log;
  
  const warnSpy = vi.fn();
  const errorSpy = vi.fn();
  const logSpy = vi.fn();
  
  console.warn = warnSpy;
  console.error = errorSpy;
  console.log = logSpy;
  
  return {
    warn: warnSpy,
    error: errorSpy,
    log: logSpy,
    restore: () => {
      console.warn = originalWarn;
      console.error = originalError;
      console.log = originalLog;
    }
  };
}

// Helper to set development/production mode for testing
export function setNodeEnv(env) {
  // Ensure process.env exists in test environment
  if (typeof process === 'undefined') {
    globalThis.process = { env: { NODE_ENV: 'test' } };
  }
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = env;
  return () => {
    process.env.NODE_ENV = originalEnv;
  };
}

// Helper to create mock DOM events
export function createMockEvent(type = 'click', eventInit = {}) {
  return {
    type,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    target: { value: '' },
    currentTarget: { value: '' },
    ...eventInit
  };
}