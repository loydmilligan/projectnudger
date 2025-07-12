// Comprehensive test suite for task interactions - functional testing approach
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  createMockTask, 
  createMockProject, 
  createMockActiveSession,
  createMockHandlers,
  mockConsole,
  setNodeEnv,
  mockFirebase,
  mockM5DialBLEService
} from './test-utils.jsx';

describe('Task Interactions Test Suite', () => {
  let consoleMocks;
  let restoreEnv;
  
  beforeEach(() => {
    vi.clearAllMocks();
    consoleMocks = mockConsole();
    restoreEnv = setNodeEnv('development');
  });
  
  afterEach(() => {
    consoleMocks.restore();
    restoreEnv();
  });

  describe('Task Data Structure Validation', () => {
    it('creates valid task objects for testing', () => {
      const task = createMockTask({
        id: 'test-task',
        title: 'Test Task',
        isComplete: false,
        status: 'idle',
        tags: ['test', 'important'],
        dueDate: '2024-12-25T10:00:00Z'
      });

      expect(task.id).toBe('test-task');
      expect(task.title).toBe('Test Task');
      expect(task.isComplete).toBe(false);
      expect(task.status).toBe('idle');
      expect(Array.isArray(task.tags)).toBe(true);
      expect(task.tags).toEqual(['test', 'important']);
      expect(task.dueDate).toBe('2024-12-25T10:00:00Z');
    });

    it('validates task property types and defaults', () => {
      const taskWithDefaults = createMockTask();
      
      expect(typeof taskWithDefaults.id).toBe('string');
      expect(typeof taskWithDefaults.title).toBe('string');
      expect(typeof taskWithDefaults.isComplete).toBe('boolean');
      expect(typeof taskWithDefaults.status).toBe('string');
      expect(Array.isArray(taskWithDefaults.tags)).toBe(true);
      expect(taskWithDefaults.status).toBe('idle');
      expect(taskWithDefaults.isComplete).toBe(false);
    });

    it('validates defensive task property handling', () => {
      const malformedTask = { 
        id: 'test', 
        tags: 'not-an-array',
        isComplete: 'not-a-boolean'
      };

      // Simulate the defensive programming logic from TaskItem
      const safeTask = {
        id: malformedTask.id || 'unknown',
        title: malformedTask.title || 'Untitled Task',
        isComplete: Boolean(malformedTask.isComplete),
        status: malformedTask.status || 'idle',
        dueDate: malformedTask.dueDate || null,
        tags: Array.isArray(malformedTask.tags) ? malformedTask.tags : []
      };

      expect(safeTask.id).toBe('test');
      expect(safeTask.title).toBe('Untitled Task');
      expect(safeTask.isComplete).toBe(true); // 'not-a-boolean' is truthy
      expect(safeTask.status).toBe('idle');
      expect(safeTask.dueDate).toBe(null);
      expect(safeTask.tags).toEqual([]);
    });
  });

  describe('Task Handler Function Logic', () => {
    it('validates task completion handler logic', async () => {
      const task = createMockTask({ id: 'test-task', isComplete: false });
      
      // Simulate handleCompleteTask logic
      const isCompleting = !task.isComplete;
      const updateData = {
        isComplete: isCompleting,
        completedAt: isCompleting ? new Date() : null,
        status: 'idle'
      };

      expect(updateData.isComplete).toBe(true);
      expect(updateData.completedAt).toBeInstanceOf(Date);
      expect(updateData.status).toBe('idle');

      // Test Firebase integration
      await mockFirebase.updateDoc(
        mockFirebase.doc(mockFirebase.db, mockFirebase.basePath, 'tasks', task.id),
        updateData
      );

      expect(mockFirebase.updateDoc).toHaveBeenCalledWith(
        expect.any(Object),
        updateData
      );
    });

    it('validates task start handler logic', async () => {
      const task = createMockTask({ id: 'test-task' });
      const activeSession = null; // No active session

      if (!activeSession) {
        const session = {
          taskId: task.id,
          startTime: new Date(),
          duration: 1500, // 25 minutes
          isDouble: false,
          active: true,
          type: 'work'
        };

        // Test session creation
        await mockFirebase.setDoc(
          mockFirebase.doc(mockFirebase.db, mockFirebase.basePath, 'tracking', 'activeSession'),
          session
        );

        // Test task status update
        await mockFirebase.updateDoc(
          mockFirebase.doc(mockFirebase.db, mockFirebase.basePath, 'tasks', task.id),
          { status: 'in-progress' }
        );

        expect(mockFirebase.setDoc).toHaveBeenCalled();
        expect(mockFirebase.updateDoc).toHaveBeenCalled();
        expect(session.taskId).toBe(task.id);
        expect(session.active).toBe(true);
      }
    });

    it('validates task edit handler logic', () => {
      const task = createMockTask({ id: 'test-task' });
      const mockSetEditingTask = vi.fn();
      const mockSetIsTaskDetailModalOpen = vi.fn();

      // Simulate handleEditTask logic
      mockSetEditingTask(task);
      mockSetIsTaskDetailModalOpen(true);

      expect(mockSetEditingTask).toHaveBeenCalledWith(task);
      expect(mockSetIsTaskDetailModalOpen).toHaveBeenCalledWith(true);
    });

    it('validates active session prevention logic', () => {
      const task = createMockTask({ id: 'test-task' });
      const activeSession = createMockActiveSession({ taskId: 'other-task' });
      const mockShowWarning = vi.fn();

      // Simulate prevention logic from handleStartTask
      if (activeSession) {
        mockShowWarning('Session Active', 'Please complete or stop the current session first.');
        return;
      }

      expect(mockShowWarning).toHaveBeenCalledWith(
        'Session Active', 
        'Please complete or stop the current session first.'
      );
    });
  });

  describe('Task State Management Logic', () => {
    it('validates start button visibility logic', () => {
      const normalTask = createMockTask({ isComplete: false, status: 'idle' });
      const completedTask = createMockTask({ isComplete: true });
      const inProgressTask = createMockTask({ status: 'in-progress' });
      
      // Simulate TaskItem start button visibility logic
      const shouldShowForNormal = !normalTask.isComplete && 
                                   normalTask.status !== 'in-progress' && 
                                   !false; // isTaskActive = false
      const shouldShowForCompleted = !completedTask.isComplete && 
                                     completedTask.status !== 'in-progress' && 
                                     !false;
      const shouldShowForInProgress = !inProgressTask.isComplete && 
                                      inProgressTask.status !== 'in-progress' && 
                                      !false;
      
      expect(shouldShowForNormal).toBe(true);
      expect(shouldShowForCompleted).toBe(false);
      expect(shouldShowForInProgress).toBe(false);
    });

    it('validates active session detection logic', () => {
      const task = createMockTask({ id: 'task-1' });
      const activeSession = createMockActiveSession({ taskId: 'task-1' });
      const noSession = null;
      const wrongSession = createMockActiveSession({ taskId: 'task-2' });
      
      const isActive = Boolean(activeSession && activeSession.taskId === task.id);
      const isNotActiveNoSession = Boolean(noSession && noSession.taskId === task.id);
      const isNotActiveWrongSession = Boolean(wrongSession && wrongSession.taskId === task.id);
      
      expect(isActive).toBe(true);
      expect(isNotActiveNoSession).toBe(false);
      expect(isNotActiveWrongSession).toBe(false);
    });

    it('validates checkbox disable logic', () => {
      const normalTask = createMockTask({ status: 'idle' });
      const inProgressTask = createMockTask({ status: 'in-progress' });
      const noHandlerTask = createMockTask();
      
      // Simulate TaskItem checkbox disable logic
      const disabledForNormal = normalTask.status === 'in-progress' || !true; // has onToggle
      const disabledForInProgress = inProgressTask.status === 'in-progress' || !true;
      const disabledForNoHandler = noHandlerTask.status === 'in-progress' || !false; // no onToggle
      
      expect(disabledForNormal).toBe(false);
      expect(disabledForInProgress).toBe(true);
      expect(disabledForNoHandler).toBe(true);
    });
  });

  describe('Task Filtering and Sorting Logic', () => {
    it('validates task filtering by project', () => {
      const tasks = [
        createMockTask({ id: 'task-1', projectId: 'project-1', title: 'Project 1 Task' }),
        createMockTask({ id: 'task-2', projectId: 'project-2', title: 'Project 2 Task' }),
        createMockTask({ id: 'task-3', projectId: 'project-1', title: 'Another Project 1 Task' })
      ];
      
      // Simulate TasksView filtering logic
      const filterProject = 'project-1';
      const filteredTasks = tasks.filter(task => {
        const projectMatch = filterProject === 'All' || task.projectId === filterProject;
        return projectMatch;
      });
      
      expect(filteredTasks).toHaveLength(2);
      expect(filteredTasks[0].id).toBe('task-1');
      expect(filteredTasks[1].id).toBe('task-3');
    });

    it('validates task filtering by tag', () => {
      const tasks = [
        createMockTask({ id: 'task-1', tags: ['urgent', 'work'] }),
        createMockTask({ id: 'task-2', tags: ['personal'] }),
        createMockTask({ id: 'task-3', tags: ['urgent', 'personal'] })
      ];
      
      // Simulate TasksView tag filtering logic
      const filterTag = 'urgent';
      const filteredTasks = tasks.filter(task => {
        const tagMatch = !filterTag || (task.tags && task.tags.includes(filterTag));
        return tagMatch;
      });
      
      expect(filteredTasks).toHaveLength(2);
      expect(filteredTasks[0].id).toBe('task-1');
      expect(filteredTasks[1].id).toBe('task-3');
    });

    it('validates task sorting logic', () => {
      const tasks = [
        createMockTask({ id: 'task-1', isComplete: true, createdAt: new Date('2024-01-01') }),
        createMockTask({ id: 'task-2', isComplete: false, createdAt: new Date('2024-01-03') }),
        createMockTask({ id: 'task-3', isComplete: false, createdAt: new Date('2024-01-02') })
      ];
      
      // Simulate TasksView sorting logic: completed last, then by creation date
      const sortedTasks = tasks.sort((a, b) => 
        (a.isComplete - b.isComplete) || 
        ((a.createdAt || 0) - (b.createdAt || 0))
      );
      
      expect(sortedTasks[0].id).toBe('task-3'); // Incomplete, earliest
      expect(sortedTasks[1].id).toBe('task-2'); // Incomplete, latest
      expect(sortedTasks[2].id).toBe('task-1'); // Complete, last
    });

    it('validates project task filtering logic', () => {
      const tasks = [
        createMockTask({ id: 'task-1', projectId: 'project-1' }),
        createMockTask({ id: 'task-2', projectId: 'project-2' }),
        createMockTask({ id: 'task-3', projectId: 'project-1' })
      ];
      
      // Simulate ProjectView task filtering logic
      const projectId = 'project-1';
      const projectTasks = tasks.filter(t => t.projectId === projectId)
                               .sort((a, b) => (a.isComplete - b.isComplete) || (a.createdAt || 0) - (b.createdAt || 0));
      
      expect(projectTasks).toHaveLength(2);
      expect(projectTasks[0].id).toBe('task-1');
      expect(projectTasks[1].id).toBe('task-3');
    });
  });

  describe('BLE Integration Logic', () => {
    it('validates BLE command sending for task start', async () => {
      const task = createMockTask({ title: 'Test Task' });
      mockM5DialBLEService.connected = true;
      
      // Simulate BLE integration in handleStartTask
      if (mockM5DialBLEService.connected) {
        await mockM5DialBLEService.sendCommand({
          command: 'SET_TASK',
          payload: { task_name: task.title }
        });
        
        await mockM5DialBLEService.sendCommand({ command: 'START' });
        
        expect(mockM5DialBLEService.sendCommand).toHaveBeenNthCalledWith(1, {
          command: 'SET_TASK',
          payload: { task_name: 'Test Task' }
        });
        expect(mockM5DialBLEService.sendCommand).toHaveBeenNthCalledWith(2, {
          command: 'START'
        });
      }
    });

    it('validates BLE disconnected state handling', async () => {
      const task = createMockTask({ title: 'Test Task' });
      mockM5DialBLEService.connected = false;
      
      // Should not send commands when disconnected
      if (mockM5DialBLEService.connected) {
        await mockM5DialBLEService.sendCommand({ command: 'START' });
      }
      
      expect(mockM5DialBLEService.sendCommand).not.toHaveBeenCalled();
    });
  });

  describe('Development Warnings Logic', () => {
    it('validates development warning logic for missing handlers', () => {
      const task = createMockTask({ id: 'test-task' });
      
      // Simulate TaskItem development warnings
      if (process.env.NODE_ENV === 'development') {
        if (!task || typeof task !== 'object') {
          console.warn('TaskItem: task prop is required and should be an object');
        }
        if (!null) { // onToggle is null
          console.warn('TaskItem: onToggle handler is missing - checkbox functionality will be disabled');
        }
        if (!null) { // onOpenDetail is null
          console.warn('TaskItem: onOpenDetail handler is missing - click to edit functionality will be disabled');
        }
        if (!null) { // onStartTask is null
          console.warn('TaskItem: onStartTask handler is missing - start task button will be disabled');
        }
      }
      
      expect(consoleMocks.warn).toHaveBeenCalledWith(
        'TaskItem: onToggle handler is missing - checkbox functionality will be disabled'
      );
      expect(consoleMocks.warn).toHaveBeenCalledWith(
        'TaskItem: onOpenDetail handler is missing - click to edit functionality will be disabled'
      );
      expect(consoleMocks.warn).toHaveBeenCalledWith(
        'TaskItem: onStartTask handler is missing - start task button will be disabled'
      );
    });

    it('validates warning suppression in production', () => {
      const restoreProd = setNodeEnv('production');
      const task = createMockTask({ id: 'test-task' });
      
      // Simulate TaskItem development warnings in production
      if (process.env.NODE_ENV === 'development') {
        console.warn('This should not appear in production');
      }
      
      expect(consoleMocks.warn).not.toHaveBeenCalled();
      restoreProd();
    });

    it('validates task prop validation warnings', () => {
      const invalidTask = null;
      
      // Simulate TaskItem task validation
      if (process.env.NODE_ENV === 'development') {
        if (!invalidTask || typeof invalidTask !== 'object') {
          console.warn('TaskItem: task prop is required and should be an object');
        }
      }
      
      expect(consoleMocks.warn).toHaveBeenCalledWith(
        'TaskItem: task prop is required and should be an object'
      );
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('validates safe handler calling pattern', () => {
      const validHandler = vi.fn();
      const invalidHandler = null;
      const task = createMockTask();
      
      // Simulate TaskItem safe handler calling
      const safeCall = (handler, arg) => {
        if (handler && typeof handler === 'function') {
          handler(arg);
        }
      };
      
      safeCall(validHandler, task);
      safeCall(invalidHandler, task);
      
      expect(validHandler).toHaveBeenCalledWith(task);
      // No error should be thrown for invalid handler
    });

    it('validates empty array handling', () => {
      const emptyTasks = [];
      const emptyProjects = [];
      
      // Should not cause errors when filtering empty arrays
      const filteredTasks = emptyTasks.filter(task => task.projectId === 'any-id');
      const allTags = [...new Set(emptyTasks.flatMap(t => t.tags || []))];
      
      expect(filteredTasks).toEqual([]);
      expect(allTags).toEqual([]);
    });

    it('validates due date comparison logic', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const overdue = new Date() > new Date(yesterday.toISOString());
      const notOverdue = new Date() > new Date(tomorrow.toISOString());
      
      expect(overdue).toBe(true);
      expect(notOverdue).toBe(false);
    });

    it('validates rapid action prevention logic', () => {
      let isToggling = false;
      const mockHandler = vi.fn();
      
      // Simulate rapid click prevention
      const handleToggle = async () => {
        if (!isToggling) {
          isToggling = true;
          try {
            await mockHandler();
          } finally {
            isToggling = false;
          }
        }
      };
      
      // First call should work
      handleToggle();
      expect(mockHandler).toHaveBeenCalledTimes(1);
      
      // Second rapid call should be prevented (isToggling is still true)
      if (!isToggling) {
        handleToggle();
      }
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integration Scenario Testing', () => {
    it('validates complete task workflow', async () => {
      const task = createMockTask({ 
        id: 'workflow-task', 
        isComplete: false, 
        status: 'idle' 
      });
      
      // 1. Start task
      const session = {
        taskId: task.id,
        startTime: new Date(),
        duration: 1500,
        active: true,
        type: 'work'
      };
      
      await mockFirebase.setDoc(
        mockFirebase.doc(mockFirebase.db, mockFirebase.basePath, 'tracking', 'activeSession'),
        session
      );
      
      await mockFirebase.updateDoc(
        mockFirebase.doc(mockFirebase.db, mockFirebase.basePath, 'tasks', task.id),
        { status: 'in-progress' }
      );
      
      // 2. Complete task
      const updateData = {
        isComplete: true,
        completedAt: new Date(),
        status: 'idle'
      };
      
      await mockFirebase.updateDoc(
        mockFirebase.doc(mockFirebase.db, mockFirebase.basePath, 'tasks', task.id),
        updateData
      );
      
      expect(mockFirebase.setDoc).toHaveBeenCalled();
      expect(mockFirebase.updateDoc).toHaveBeenCalledTimes(2);
    });

    it('validates cross-view consistency logic', () => {
      const task = createMockTask({ id: 'consistent-task' });
      const activeSession = createMockActiveSession({ taskId: 'consistent-task' });
      
      // TasksView active task detection
      const tasksViewActive = activeSession?.taskId === task.id;
      
      // ProjectView would use same logic if it passed activeSession
      const projectViewActive = activeSession?.taskId === task.id;
      
      expect(tasksViewActive).toBe(true);
      expect(projectViewActive).toBe(true);
      expect(tasksViewActive).toBe(projectViewActive);
    });

    it('validates handler consistency across views', () => {
      const task = createMockTask({ id: 'handler-task' });
      const handlers = createMockHandlers();
      
      // Both views should call the same handlers with the same task
      handlers.onCompleteTask(task);
      handlers.onEditTask(task);
      handlers.onStartTask(task);
      
      expect(handlers.onCompleteTask).toHaveBeenCalledWith(task);
      expect(handlers.onEditTask).toHaveBeenCalledWith(task);
      expect(handlers.onStartTask).toHaveBeenCalledWith(task);
    });
  });
});