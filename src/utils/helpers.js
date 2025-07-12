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