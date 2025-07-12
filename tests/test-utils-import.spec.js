// Test to verify test-utils imports work
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  createMockTask, 
  createMockProject, 
  createMockHandlers
} from './test-utils.jsx';

describe('Test Utils Import Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create mock task', () => {
    const task = createMockTask();
    expect(task).toBeDefined();
    expect(task.id).toBe('task-1');
    expect(task.title).toBe('Test Task');
  });

  it('should create mock handlers', () => {
    const handlers = createMockHandlers();
    expect(handlers.onToggle).toBeDefined();
    expect(typeof handlers.onToggle).toBe('function');
  });
});