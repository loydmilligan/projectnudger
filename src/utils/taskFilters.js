/**
 * Task Filtering Utilities
 * Centralized filtering logic for task views including past due and nudged task detection
 */

/**
 * Determines if a task is past its due date with timezone awareness
 * @param {Object} task - Task object with dueDate property
 * @returns {boolean} True if task is past due, false otherwise
 */
export function isPastDue(task) {
    if (!task.dueDate) {
        return false;
    }
    
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    
    // Compare dates with timezone awareness
    return dueDate < now;
}

/**
 * Identifies tasks flagged by AI nudge system as urgent
 * Uses flexible string matching to handle AI variations in task naming
 * @param {Object} task - Task object with title property
 * @param {Object} aiNudgeRecommendations - AI recommendations containing urgentTasks array
 * @returns {boolean} True if task is flagged as urgent/nudged, false otherwise
 */
export function isNudgedTask(task, aiNudgeRecommendations) {
    // Return false if no AI recommendations available
    if (!aiNudgeRecommendations || !aiNudgeRecommendations.urgentTasks) {
        return false;
    }
    
    // Return false if task has no title
    if (!task.title) {
        return false;
    }
    
    const taskTitle = task.title.toLowerCase().trim();
    const urgentTasks = aiNudgeRecommendations.urgentTasks;
    
    // Check if this task's title matches any of the urgent tasks
    return urgentTasks.some(urgentTask => {
        if (typeof urgentTask === 'string') {
            const urgentTaskTitle = urgentTask.toLowerCase().trim();
            
            // Exact match
            if (taskTitle === urgentTaskTitle) {
                return true;
            }
            
            // Partial match - check if one contains the other
            // This handles cases where AI might use abbreviated task names
            if (taskTitle.includes(urgentTaskTitle) || urgentTaskTitle.includes(taskTitle)) {
                return true;
            }
        } else if (urgentTask && urgentTask.title) {
            // Handle object format if AI returns objects instead of strings
            const urgentTaskTitle = urgentTask.title.toLowerCase().trim();
            if (taskTitle === urgentTaskTitle || taskTitle.includes(urgentTaskTitle) || urgentTaskTitle.includes(taskTitle)) {
                return true;
            }
        }
        
        return false;
    });
}

/**
 * Applies all filtering logic including past due and nudged filters
 * Maintains compatibility with existing project and tag filters
 * @param {Array} tasks - Array of task objects
 * @param {Object} filters - Filter object with project, tag, and dueDate properties
 * @param {Object} aiNudgeRecommendations - AI recommendations for nudged task detection
 * @returns {Array} Filtered array of tasks
 */
export function applyTaskFilters(tasks, filters, aiNudgeRecommendations = null) {
    return tasks.filter(task => {
        // Project filter
        const projectMatch = filters.project === 'All' || task.projectId === filters.project;
        
        // Tag filter
        const tagMatch = !filters.tag || (task.tags && task.tags.includes(filters.tag));
        
        // Due date filter with new past_due and nudged options
        let dateMatch = true;
        
        if (filters.dueDate !== 'All') {
            switch (filters.dueDate) {
                case 'past_due':
                    dateMatch = isPastDue(task);
                    break;
                case 'nudged':
                    dateMatch = isNudgedTask(task, aiNudgeRecommendations);
                    break;
                case '7':
                case '30':
                    // Existing logic for "Next X Days" filters
                    dateMatch = task.dueDate && 
                               new Date(task.dueDate) < new Date(
                                   new Date().setDate(new Date().getDate() + Number(filters.dueDate))
                               );
                    break;
                default:
                    // Handle any other specific filter values
                    dateMatch = true;
                    break;
            }
        }
        
        // All filters must match (AND operation)
        return projectMatch && tagMatch && dateMatch;
    });
}