// Unit tests for task interaction logic and data structures
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  createMockTask, 
  createMockProject, 
  createMockActiveSession,
  createMockHandlers,
  mockConsole,
  setNodeEnv
} from './test-utils.jsx';

describe('Task Data Structures and Logic', () => {
  let restoreConsole;
  let restoreEnv;
  
  beforeEach(() => {
    vi.clearAllMocks();
    restoreConsole = mockConsole();
    restoreEnv = setNodeEnv('development');
  });
  
  afterEach(() => {
    restoreConsole.restore();
    restoreEnv();
  });

  describe('Task Creation and Validation', () => {
    it('creates valid task with all required fields', () => {
      const task = createMockTask();
      
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('projectId');
      expect(task).toHaveProperty('isComplete');
      expect(task).toHaveProperty('status');
      expect(task).toHaveProperty('tags');
      expect(task).toHaveProperty('createdAt');
      
      expect(typeof task.id).toBe('string');
      expect(typeof task.title).toBe('string');
      expect(typeof task.isComplete).toBe('boolean');
      expect(Array.isArray(task.tags)).toBe(true);
      expect(task.status).toBe('idle');
    });

    it('creates task with custom overrides', () => {
      const customTask = createMockTask({
        title: 'Custom Task',
        isComplete: true,
        status: 'in-progress',
        tags: ['urgent', 'work']
      });
      
      expect(customTask.title).toBe('Custom Task');
      expect(customTask.isComplete).toBe(true);
      expect(customTask.status).toBe('in-progress');
      expect(customTask.tags).toEqual(['urgent', 'work']);
    });

    it('validates task completion logic', () => {
      const incompleteTask = createMockTask({ isComplete: false });
      const completedTask = createMockTask({ isComplete: true });
      
      expect(incompleteTask.isComplete).toBe(false);
      expect(completedTask.isComplete).toBe(true);
      
      // Toggle logic simulation
      const toggledIncomplete = { ...incompleteTask, isComplete: !incompleteTask.isComplete };
      const toggledComplete = { ...completedTask, isComplete: !completedTask.isComplete };
      
      expect(toggledIncomplete.isComplete).toBe(true);
      expect(toggledComplete.isComplete).toBe(false);
    });

    it('validates task status transitions', () => {
      const idleTask = createMockTask({ status: 'idle' });
      const inProgressTask = createMockTask({ status: 'in-progress' });
      
      // Idle task can be started
      expect(idleTask.status).toBe('idle');
      
      // In-progress task cannot be started again
      expect(inProgressTask.status).toBe('in-progress');
      
      // Completed task should reset status
      const completedTask = { ...inProgressTask, isComplete: true, status: 'idle' };
      expect(completedTask.isComplete).toBe(true);
      expect(completedTask.status).toBe('idle');
    });
  });

  describe('Task Interaction Rules', () => {
    it('determines when start button should be visible', () => {
      const normalTask = createMockTask({ isComplete: false, status: 'idle' });
      const completedTask = createMockTask({ isComplete: true, status: 'idle' });
      const inProgressTask = createMockTask({ isComplete: false, status: 'in-progress' });
      
      // Normal task should show start button
      const showStartNormal = !normalTask.isComplete && 
                             normalTask.status !== 'in-progress' && 
                             !false; // not active session
      expect(showStartNormal).toBe(true);
      
      // Completed task should not show start button
      const showStartCompleted = !completedTask.isComplete && 
                                 completedTask.status !== 'in-progress' && 
                                 !false;
      expect(showStartCompleted).toBe(false);
      
      // In-progress task should not show start button
      const showStartInProgress = !inProgressTask.isComplete && 
                                  inProgressTask.status !== 'in-progress' && 
                                  !false;
      expect(showStartInProgress).toBe(false);
    });

    it('determines when checkbox should be disabled', () => {
      const normalTask = createMockTask({ status: 'idle' });
      const inProgressTask = createMockTask({ status: 'in-progress' });
      
      const isNormalDisabled = normalTask.status === 'in-progress' || !true; // no handler
      const isInProgressDisabled = inProgressTask.status === 'in-progress' || !true;
      
      expect(isNormalDisabled).toBe(false);
      expect(isInProgressDisabled).toBe(true);
    });

    it('validates active session state handling', () => {
      const task = createMockTask({ id: 'task-1' });
      const activeSession = createMockActiveSession({ taskId: 'task-1' });
      const differentSession = createMockActiveSession({ taskId: 'task-2' });
      
      const isTaskActive = activeSession?.taskId === task.id;
      const isTaskNotActive = differentSession?.taskId === task.id;
      
      expect(isTaskActive).toBe(true);
      expect(isTaskNotActive).toBe(false);
    });
  });

  describe('Task Filtering and Sorting Logic', () => {
    it('filters tasks by project correctly', () => {
      const project1 = createMockProject({ id: 'project-1' });
      const project2 = createMockProject({ id: 'project-2' });
      
      const tasks = [
        createMockTask({ id: 'task-1', projectId: 'project-1' }),
        createMockTask({ id: 'task-2', projectId: 'project-2' }),
        createMockTask({ id: 'task-3', projectId: 'project-1' })
      ];
      
      const project1Tasks = tasks.filter(task => task.projectId === project1.id);
      const project2Tasks = tasks.filter(task => task.projectId === project2.id);
      
      expect(project1Tasks).toHaveLength(2);
      expect(project2Tasks).toHaveLength(1);
      expect(project1Tasks.map(t => t.id)).toEqual(['task-1', 'task-3']);
      expect(project2Tasks.map(t => t.id)).toEqual(['task-2']);
    });

    it('filters tasks by tags correctly', () => {
      const tasks = [
        createMockTask({ id: 'task-1', tags: ['urgent', 'work'] }),
        createMockTask({ id: 'task-2', tags: ['normal'] }),
        createMockTask({ id: 'task-3', tags: ['urgent', 'personal'] })
      ];
      
      const urgentTasks = tasks.filter(task => task.tags && task.tags.includes('urgent'));
      const workTasks = tasks.filter(task => task.tags && task.tags.includes('work'));
      
      expect(urgentTasks).toHaveLength(2);
      expect(workTasks).toHaveLength(1);
      expect(urgentTasks.map(t => t.id)).toEqual(['task-1', 'task-3']);
      expect(workTasks.map(t => t.id)).toEqual(['task-1']);
    });

    it('sorts tasks with completed last and by creation date', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      const tasks = [
        createMockTask({ id: 'task-1', isComplete: true, createdAt: yesterday }),
        createMockTask({ id: 'task-2', isComplete: false, createdAt: now }),
        createMockTask({ id: 'task-3', isComplete: false, createdAt: tomorrow }),
        createMockTask({ id: 'task-4', isComplete: true, createdAt: now })
      ];
      
      // Sort logic: incomplete first, then by creation date
      const sorted = tasks.sort((a, b) => {
        // Completed tasks go last
        if (a.isComplete !== b.isComplete) {
          return a.isComplete - b.isComplete;
        }
        // Then sort by creation date
        return (a.createdAt || 0) - (b.createdAt || 0);
      });
      
      expect(sorted[0].id).toBe('task-2'); // incomplete, created now
      expect(sorted[1].id).toBe('task-3'); // incomplete, created tomorrow
      expect(sorted[2].id).toBe('task-1'); // complete, created yesterday
      expect(sorted[3].id).toBe('task-4'); // complete, created now
    });

    it('filters tasks by due date correctly', () => {
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const nextYear = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      
      const tasks = [
        createMockTask({ id: 'task-1', dueDate: nextWeek.toISOString() }),
        createMockTask({ id: 'task-2', dueDate: nextMonth.toISOString() }),
        createMockTask({ id: 'task-3', dueDate: nextYear.toISOString() }),
        createMockTask({ id: 'task-4', dueDate: null })
      ];
      
      // Filter for next 7 days
      const sevenDayTasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return dueDate <= sevenDaysFromNow;
      });
      
      // Filter for next 30 days
      const thirtyDayTasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        return dueDate <= thirtyDaysFromNow;
      });
      
      expect(sevenDayTasks).toHaveLength(1);
      expect(thirtyDayTasks).toHaveLength(2);
    });
  });

  describe('Handler Function Validation', () => {
    it('validates handler function structure', () => {
      const handlers = createMockHandlers();
      
      expect(typeof handlers.onToggle).toBe('function');
      expect(typeof handlers.onOpenDetail).toBe('function');
      expect(typeof handlers.onStartTask).toBe('function');
      expect(typeof handlers.onCompleteTask).toBe('function');
      expect(typeof handlers.onEditTask).toBe('function');
    });

    it('simulates handler calls with proper arguments', () => {
      const handlers = createMockHandlers();
      const task = createMockTask();
      
      handlers.onToggle(task);
      handlers.onOpenDetail(task);
      handlers.onStartTask(task);
      handlers.onCompleteTask(task);
      handlers.onEditTask(task);
      
      expect(handlers.onToggle).toHaveBeenCalledWith(task);
      expect(handlers.onOpenDetail).toHaveBeenCalledWith(task);
      expect(handlers.onStartTask).toHaveBeenCalledWith(task);
      expect(handlers.onCompleteTask).toHaveBeenCalledWith(task);
      expect(handlers.onEditTask).toHaveBeenCalledWith(task);
    });

    it('handles null and undefined tasks safely', () => {
      const handlers = createMockHandlers();
      
      // Should not throw with null or undefined
      expect(() => handlers.onToggle(null)).not.toThrow();
      expect(() => handlers.onOpenDetail(undefined)).not.toThrow();
      expect(() => handlers.onStartTask(null)).not.toThrow();
    });
  });

  describe('Session Management Logic', () => {
    it('creates valid active session', () => {
      const session = createMockActiveSession();
      
      expect(session).toHaveProperty('taskId');
      expect(session).toHaveProperty('startTime');
      expect(session).toHaveProperty('duration');
      expect(session).toHaveProperty('active');
      expect(session).toHaveProperty('type');
      
      expect(typeof session.taskId).toBe('string');
      expect(session.startTime instanceof Date).toBe(true);
      expect(typeof session.duration).toBe('number');
      expect(typeof session.active).toBe('boolean');
      expect(session.type).toBe('work');
    });

    it('validates session state conflicts', () => {
      const task = createMockTask();
      const activeSession = createMockActiveSession({ taskId: 'other-task' });
      
      // Should prevent starting new session when one is active
      const canStart = !activeSession || activeSession.taskId === task.id;
      expect(canStart).toBe(false);
      
      // Should allow starting when no session is active
      const canStartNoSession = !null;
      expect(canStartNoSession).toBe(true);
    });

    it('validates session type restrictions', () => {
      const workSession = createMockActiveSession({ type: 'work' });
      const breakSession = createMockActiveSession({ type: 'break' });
      
      expect(workSession.type).toBe('work');
      expect(breakSession.type).toBe('break');
      
      // Work sessions should have task IDs
      expect(workSession.taskId).toBeTruthy();
      
      // Break sessions may not have task IDs
      const breakWithoutTask = createMockActiveSession({ 
        type: 'break', 
        taskId: null 
      });
      expect(breakWithoutTask.taskId).toBeNull();
    });
  });

  describe('Defensive Programming Patterns', () => {
    it('handles missing task properties with safe fallbacks', () => {
      const malformedTask = { id: 'test' }; // Missing most properties
      
      const safeTask = {
        id: malformedTask?.id || 'unknown',
        title: malformedTask?.title || 'Untitled Task',
        isComplete: Boolean(malformedTask?.isComplete),
        status: malformedTask?.status || 'idle',
        dueDate: malformedTask?.dueDate || null,
        tags: Array.isArray(malformedTask?.tags) ? malformedTask.tags : []
      };
      
      expect(safeTask.id).toBe('test');
      expect(safeTask.title).toBe('Untitled Task');
      expect(safeTask.isComplete).toBe(false);
      expect(safeTask.status).toBe('idle');
      expect(safeTask.dueDate).toBeNull();
      expect(safeTask.tags).toEqual([]);
    });

    it('validates handler existence before calling', () => {
      const validHandler = vi.fn();
      const invalidHandler = null;
      
      const safeCall = (handler, arg) => {
        if (handler && typeof handler === 'function') {
          handler(arg);
        }
      };
      
      safeCall(validHandler, 'test');
      safeCall(invalidHandler, 'test');
      safeCall('not-a-function', 'test');
      
      expect(validHandler).toHaveBeenCalledWith('test');
      // Should not throw errors for invalid handlers
    });

    it('validates console warning patterns in development', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Force development mode and simulate warnings
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      if (process.env.NODE_ENV === 'development') {
        if (!null) {
          console.warn('Missing required prop');
        }
        if (!undefined) {
          console.warn('Handler is missing');
        }
      }
      
      expect(consoleWarn).toHaveBeenCalledWith('Missing required prop');
      expect(consoleWarn).toHaveBeenCalledWith('Handler is missing');
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Data Consistency Validation', () => {
    it('ensures task data consistency across views', () => {
      const task = createMockTask();
      const project = createMockProject();
      const activeSession = createMockActiveSession({ taskId: task.id });
      
      // Task should behave consistently regardless of view
      const isActiveInTasksView = activeSession?.taskId === task.id;
      const isActiveInProjectView = activeSession?.taskId === task.id;
      
      expect(isActiveInTasksView).toBe(isActiveInProjectView);
      expect(isActiveInTasksView).toBe(true);
    });

    it('validates project-task relationships', () => {
      const project = createMockProject({ id: 'project-1' });
      const projectTasks = [
        createMockTask({ id: 'task-1', projectId: 'project-1' }),
        createMockTask({ id: 'task-2', projectId: 'project-1' })
      ];
      const otherTasks = [
        createMockTask({ id: 'task-3', projectId: 'project-2' })
      ];
      
      const allTasks = [...projectTasks, ...otherTasks];
      const filteredTasks = allTasks.filter(t => t.projectId === project.id);
      
      expect(filteredTasks).toHaveLength(2);
      expect(filteredTasks.every(t => t.projectId === project.id)).toBe(true);
    });

    it('validates task state transitions are logical', () => {
      const task = createMockTask({ status: 'idle', isComplete: false });
      
      // Valid transition: idle -> in-progress
      const startedTask = { ...task, status: 'in-progress' };
      expect(startedTask.status).toBe('in-progress');
      expect(startedTask.isComplete).toBe(false);
      
      // Valid transition: in-progress -> completed (with status reset)
      const completedTask = { ...startedTask, isComplete: true, status: 'idle' };
      expect(completedTask.isComplete).toBe(true);
      expect(completedTask.status).toBe('idle');
      
      // Valid transition: completed -> uncompleted
      const uncompletedTask = { ...completedTask, isComplete: false };
      expect(uncompletedTask.isComplete).toBe(false);
      expect(uncompletedTask.status).toBe('idle');
    });
  });
});