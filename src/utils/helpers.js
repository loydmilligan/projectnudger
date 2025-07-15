// Import dateHelpers for age calculations
import { calculateProjectAge, formatAge, getAgeColorClass as getAgeColorFromCategory } from './dateHelpers';

export const timeAgo = (date) => {
    if (!date) return 'N/A';
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 5) return 'just now';
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days";
    return "Today";
};

export const generateHslColor = (existingColors = []) => {
    let hue;
    do {
        hue = Math.floor(Math.random() * 360);
    } while (existingColors.some(color =>
        Math.abs(parseInt(color.match(/hsl\((\d+)/)[1]) - hue) < 30
    ));
    return `hsl(${hue}, 70%, 50%)`;
};

export const getComplementaryColor = (hsl) => {
    if (!hsl) return 'hsl(200, 70%, 50%)';
    const [_, h, s, l] = hsl.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/).map(Number);
    return `hsl(${(h + 180) % 360}, ${s * 0.8}%, ${l * 1.2}%)`;
};

export const getAnalogousColor = (hsl) => {
    if (!hsl) return 'hsl(200, 70%, 20%)';
    const [_, h, s, l] = hsl.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/).map(Number);
    return `hsl(${(h + 30) % 360}, ${s * 0.5}%, ${l * 0.5}%)`;
};

export const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Validates if a string is a valid URL format
 * @param {string} urlString - String to validate as URL
 * @returns {boolean} - true if valid URL, false otherwise
 */
export const isValidUrl = (urlString) => {
    try {
        // Handle null/undefined/empty strings
        if (!urlString || typeof urlString !== 'string' || urlString.trim() === '') {
            return false;
        }

        // Normalize the URL string
        const trimmedUrl = urlString.trim();
        
        // Add https:// if no protocol is present
        let urlToTest;
        if (trimmedUrl.match(/^https?:\/\//)) {
            urlToTest = trimmedUrl;
        } else {
            // Handle protocol-relative URLs by removing leading //
            const urlToFormat = trimmedUrl.startsWith('//') ? trimmedUrl.slice(2) : trimmedUrl;
            urlToTest = `https://${urlToFormat}`;
        }
        
        // Use URL constructor for validation
        const url = new URL(urlToTest);
        
        // Ensure it has a valid hostname
        if (!url.hostname || url.hostname.length === 0) {
            return false;
        }

        // Basic domain validation - must have at least one dot
        if (!url.hostname.includes('.')) {
            return false;
        }

        // Ensure protocol is http or https
        if (!['http:', 'https:'].includes(url.protocol)) {
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Formats URL string by adding https:// prefix if missing and validates format
 * @param {string} urlString - URL string to format
 * @returns {string} - Formatted URL with https:// prefix, or empty string if invalid
 */
export const formatUrl = (urlString) => {
    try {
        // Handle null/undefined/empty strings
        if (!urlString || typeof urlString !== 'string' || urlString.trim() === '') {
            return '';
        }

        const trimmedUrl = urlString.trim();
        
        // Check if URL is valid first
        if (!isValidUrl(trimmedUrl)) {
            return '';
        }

        // Add https:// prefix if missing
        if (!trimmedUrl.match(/^https?:\/\//)) {
            // Handle protocol-relative URLs by removing leading //
            const urlToFormat = trimmedUrl.startsWith('//') ? trimmedUrl.slice(2) : trimmedUrl;
            return `https://${urlToFormat}`;
        }

        return trimmedUrl;
    } catch (error) {
        return '';
    }
};

/**
 * Determines if a task's due date has passed the current date/time
 * @param {Object} task - Task object containing dueDate property
 * @returns {boolean} - true if task is past due, false otherwise
 */
export const isPastDue = (task) => {
    // Handle null/undefined task object
    if (!task || typeof task !== 'object') {
        return false;
    }

    // Handle null/undefined dueDate
    if (!task.dueDate) {
        return false;
    }

    try {
        // Convert dueDate to Date object for comparison
        const dueDate = new Date(task.dueDate);
        
        // Check if dueDate is a valid date
        if (isNaN(dueDate.getTime())) {
            return false;
        }

        // Get current date/time for timezone-aware comparison
        const currentDate = new Date();

        // Return true if due date is before current date/time
        return dueDate < currentDate;
    } catch (error) {
        // Handle any unexpected errors gracefully
        return false;
    }
};

/**
 * Calculate task count statistics for a project
 * @param {Object} project - Project object
 * @param {Array} tasks - Array of all tasks
 * @returns {Object} Object with completed, total, and percentage
 */
export const getTaskCountForProject = (project, tasks) => {
  if (!project || !Array.isArray(tasks)) {
    return { completed: 0, total: 0, percentage: 0 };
  }

  const projectTasks = tasks.filter(task => task.projectId === project.id);
  const completedTasks = projectTasks.filter(task => task.isComplete);
  
  const total = projectTasks.length;
  const completed = completedTasks.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
};

/**
 * Get project age information with formatted display
 * @param {Object} project - Project object with createdAt date
 * @returns {Object} Age information with formatted string and metadata
 */
export const getProjectAge = (project) => {
  if (!project || !project.createdAt) {
    return { 
      formatted: 'Unknown', 
      days: 0, 
      category: 'normal',
      isNew: false,
      isStale: false
    };
  }

  const ageInfo = calculateProjectAge(project.createdAt);
  const formatted = formatAge(ageInfo.days);

  return {
    formatted,
    days: ageInfo.days,
    category: ageInfo.category,
    isNew: ageInfo.isNew,
    isStale: ageInfo.isStale
  };
};

/**
 * Get age color class wrapper function
 * @param {string} category - Age category
 * @returns {string} Tailwind CSS color classes
 */
export const getAgeColorClass = (category) => {
  return getAgeColorFromCategory(category);
};

/**
 * Determines if a task would be considered 'nudged' based on nudge system criteria
 * Uses the same heuristic algorithm as the AI nudge service for consistency
 * @param {Object} task - Task object to evaluate
 * @param {Array} projects - Array of all projects for context
 * @param {Array} tasks - Array of all tasks for project analysis
 * @returns {boolean} - true if task should be considered 'nudged', false otherwise
 */
export const isNudged = (task, projects, tasks) => {
    try {
        // Handle null/undefined inputs
        if (!task || typeof task !== 'object') {
            return false;
        }

        if (!Array.isArray(projects) || !Array.isArray(tasks)) {
            return false;
        }

        // Return false for completed tasks
        if (task.isComplete) {
            return false;
        }

        // Return false for tasks with no projectId
        if (!task.projectId) {
            return false;
        }

        // Calculate task age
        const now = new Date();
        const taskAge = task.createdAt ? 
            Math.floor((now - new Date(task.createdAt)) / (1000 * 60 * 60 * 24)) : 0;

        // Return false for very new tasks (< 24 hours old)
        if (taskAge < 1) {
            return false;
        }

        // Find the project associated with this task
        const project = projects.find(p => p.id === task.projectId);
        if (!project) {
            return false;
        }

        // Return false for archived projects
        if (project.status === 'archived') {
            return false;
        }

        // Calculate project statistics (same algorithm as aiNudgeService.js)
        const projectTasks = tasks.filter(t => t.projectId === project.id);
        const completedTasks = projectTasks.filter(t => t.isComplete);
        const completionPercentage = projectTasks.length > 0 ? 
            (completedTasks.length / projectTasks.length) * 100 : 0;

        // Calculate days since project creation
        const daysSinceCreated = project.createdAt ? 
            Math.floor((now - new Date(project.createdAt)) / (1000 * 60 * 60 * 24)) : 0;

        // Find most recent task activity in project
        const projectTaskDates = projectTasks
            .map(t => t.completedAt || t.createdAt)
            .filter(Boolean)
            .map(date => new Date(date));

        const lastActivity = projectTaskDates.length > 0 ? 
            new Date(Math.max(...projectTaskDates)) : project.createdAt;

        const daysSinceActivity = lastActivity ? 
            Math.floor((now - new Date(lastActivity)) / (1000 * 60 * 60 * 24)) : daysSinceCreated;

        // Calculate nudge score (same algorithm as AI service)
        const daysOld = project.createdAt ? (now - new Date(project.createdAt)) / (1000 * 60 * 60 * 24) : 0;
        const nudgeScore = (project.priority || 3) * 2 + daysOld;

        // Calculate project characteristics
        const isNearCompletion = completionPercentage >= 80 && completionPercentage < 100;
        const isStalled = daysSinceActivity > 7 && completionPercentage > 0;
        const isNeglected = daysSinceActivity > 14;

        // Apply weighted scoring system
        let score = 0;

        // Neglected project (highest weight)
        if (isNeglected) {
            score += 4;
        }

        // High nudge score project
        if (nudgeScore > 20) {
            score += 3;
        }

        // Stalled project
        if (isStalled) {
            score += 2;
        }

        // Old incomplete task
        if (taskAge > 5) {
            score += 1;
        }

        // Return true if score meets nudged threshold
        return score >= 3;

    } catch (error) {
        // Handle any unexpected errors gracefully
        console.warn('Error in isNudged function:', error);
        return false;
    }
};