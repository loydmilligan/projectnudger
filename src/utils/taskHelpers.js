/**
 * Utility functions for hierarchical task management
 * Handles building task hierarchies, flattening, depth calculations, and parent-child relationships
 */

/**
 * Converts a flat array of tasks into a nested hierarchical structure
 * @param {Array} tasks - Flat array of task objects
 * @returns {Array} Nested array with parent-child relationships
 */
export function buildTaskHierarchy(tasks) {
    if (!tasks || !Array.isArray(tasks)) {
        return [];
    }

    // Group tasks by parentTaskId
    const taskMap = {};
    const rootTasks = [];
    
    // First pass: create map and identify root tasks
    tasks.forEach(task => {
        taskMap[task.id] = { ...task, children: [] };
        if (!task.parentTaskId) {
            rootTasks.push(taskMap[task.id]);
        }
    });

    // Second pass: build parent-child relationships
    tasks.forEach(task => {
        if (task.parentTaskId && taskMap[task.parentTaskId]) {
            taskMap[task.parentTaskId].children.push(taskMap[task.id]);
        }
    });

    // Third pass: calculate depth and sort children
    const calculateDepthAndSort = (taskArray, depth = 0) => {
        taskArray.forEach(task => {
            task.depth = depth;
            if (task.children.length > 0) {
                // Sort children by order field, then by creation date
                task.children.sort((a, b) => {
                    const orderA = a.order || 0;
                    const orderB = b.order || 0;
                    if (orderA !== orderB) return orderA - orderB;
                    
                    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                    return dateA - dateB;
                });
                calculateDepthAndSort(task.children, depth + 1);
            }
        });
    };

    // Sort root tasks by order, then by creation date
    rootTasks.sort((a, b) => {
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        if (orderA !== orderB) return orderA - orderB;
        
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateA - dateB;
    });

    calculateDepthAndSort(rootTasks);
    
    return rootTasks;
}

/**
 * Converts a hierarchical task structure back to a flat array
 * @param {Array} hierarchicalTasks - Nested task array
 * @returns {Array} Flat array of task objects
 */
export function flattenTaskHierarchy(hierarchicalTasks) {
    if (!hierarchicalTasks || !Array.isArray(hierarchicalTasks)) {
        return [];
    }

    const flattened = [];
    
    const flattenRecursive = (tasks) => {
        tasks.forEach(task => {
            // Create a copy without the children property for the flat structure
            const { children, ...flatTask } = task;
            flattened.push(flatTask);
            
            if (children && children.length > 0) {
                flattenRecursive(children);
            }
        });
    };
    
    flattenRecursive(hierarchicalTasks);
    return flattened;
}

/**
 * Calculates the nesting depth of a task by traversing up the parent chain
 * @param {Object} task - Task object
 * @param {Array} allTasks - Array of all tasks to search through
 * @returns {number} Depth level (0 = root, 1 = first level sub-task, etc.)
 */
export function getTaskDepth(task, allTasks) {
    if (!task || !task.parentTaskId) {
        return 0;
    }
    
    const parent = allTasks.find(t => t.id === task.parentTaskId);
    if (!parent) {
        return 0; // Orphaned task, treat as root
    }
    
    return 1 + getTaskDepth(parent, allTasks);
}

/**
 * Determines if a parent task can be completed based on children status
 * @param {Object} parentTask - Parent task object
 * @param {Array} childTasks - Array of child task objects
 * @returns {boolean} True if all children are complete or if no children exist
 */
export function canCompleteParent(parentTask, childTasks) {
    if (!parentTask || !Array.isArray(childTasks)) {
        return true;
    }
    
    // If no children, parent can be completed
    if (childTasks.length === 0) {
        return true;
    }
    
    // All children must be complete for parent to be completable
    return childTasks.every(child => child.isComplete);
}

/**
 * Gets all direct child tasks for a specified parent
 * @param {string} parentTaskId - ID of the parent task
 * @param {Array} allTasks - Array of all tasks
 * @returns {Array} Array of direct child tasks
 */
export function getTaskChildren(parentTaskId, allTasks) {
    if (!parentTaskId || !Array.isArray(allTasks)) {
        return [];
    }
    
    return allTasks.filter(task => task.parentTaskId === parentTaskId);
}

/**
 * Gets all descendant tasks (children, grandchildren, etc.) for a specified parent
 * @param {string} parentTaskId - ID of the parent task
 * @param {Array} allTasks - Array of all tasks
 * @returns {Array} Array of all descendant tasks
 */
export function getTaskDescendants(parentTaskId, allTasks) {
    if (!parentTaskId || !Array.isArray(allTasks)) {
        return [];
    }
    
    const descendants = [];
    const directChildren = getTaskChildren(parentTaskId, allTasks);
    
    directChildren.forEach(child => {
        descendants.push(child);
        descendants.push(...getTaskDescendants(child.id, allTasks));
    });
    
    return descendants;
}

/**
 * Validates that a task hierarchy doesn't have circular references
 * @param {Array} tasks - Array of all tasks
 * @returns {Array} Array of task IDs that have circular references
 */
export function validateTaskHierarchy(tasks) {
    if (!Array.isArray(tasks)) {
        return [];
    }
    
    const circularTasks = [];
    
    const hasCircularReference = (taskId, visited = new Set()) => {
        if (visited.has(taskId)) {
            return true; // Circular reference found
        }
        
        const task = tasks.find(t => t.id === taskId);
        if (!task || !task.parentTaskId) {
            return false;
        }
        
        visited.add(taskId);
        return hasCircularReference(task.parentTaskId, visited);
    };
    
    tasks.forEach(task => {
        if (task.parentTaskId && hasCircularReference(task.id)) {
            circularTasks.push(task.id);
        }
    });
    
    return circularTasks;
}

/**
 * Gets the root parent task for a given task
 * @param {Object} task - Task object
 * @param {Array} allTasks - Array of all tasks
 * @returns {Object|null} Root parent task or null if not found
 */
export function getRootParent(task, allTasks) {
    if (!task || !Array.isArray(allTasks)) {
        return null;
    }
    
    if (!task.parentTaskId) {
        return task; // This task is already the root
    }
    
    const parent = allTasks.find(t => t.id === task.parentTaskId);
    if (!parent) {
        return task; // Orphaned task, treat as root
    }
    
    return getRootParent(parent, allTasks);
}

/**
 * Calculates completion percentage for a parent task based on its children
 * @param {Object} parentTask - Parent task object
 * @param {Array} allTasks - Array of all tasks
 * @returns {number} Completion percentage (0-100)
 */
export function getParentCompletionPercentage(parentTask, allTasks) {
    if (!parentTask || !Array.isArray(allTasks)) {
        return 0;
    }
    
    const children = getTaskChildren(parentTask.id, allTasks);
    if (children.length === 0) {
        return parentTask.isComplete ? 100 : 0;
    }
    
    const completedChildren = children.filter(child => child.isComplete).length;
    return Math.round((completedChildren / children.length) * 100);
}