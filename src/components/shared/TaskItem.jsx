import React from 'react';
import { PlayCircle, TimerIcon, Calendar } from 'lucide-react';

function TaskItem({ 
    task = {}, 
    onToggle = null, 
    onOpenDetail = null, 
    onStartTask = null, 
    isTaskActive = false 
}) {
    // Development warnings for missing critical props
    if (process.env.NODE_ENV === 'development') {
        if (!task || typeof task !== 'object') {
            console.warn('TaskItem: task prop is required and should be an object');
        }
        if (!onToggle) {
            console.warn('TaskItem: onToggle handler is missing - checkbox functionality will be disabled');
        }
        if (!onOpenDetail) {
            console.warn('TaskItem: onOpenDetail handler is missing - click to edit functionality will be disabled');
        }
        if (!onStartTask) {
            console.warn('TaskItem: onStartTask handler is missing - start task button will be disabled');
        }
    }

    // Defensive checks for task properties with fallbacks
    const safeTask = {
        id: task?.id || 'unknown',
        title: task?.title || 'Untitled Task',
        isComplete: Boolean(task?.isComplete),
        status: task?.status || 'idle',
        dueDate: task?.dueDate || null,
        tags: Array.isArray(task?.tags) ? task.tags : []
    };

    // Safe event handlers that check for existence before calling
    const handleToggle = () => {
        if (onToggle && typeof onToggle === 'function') {
            onToggle(task);
        }
    };

    const handleOpenDetail = () => {
        if (onOpenDetail && typeof onOpenDetail === 'function') {
            onOpenDetail(task);
        }
    };

    const handleStartTask = (e) => {
        e.stopPropagation();
        if (onStartTask && typeof onStartTask === 'function') {
            onStartTask(task);
        }
    };

    return (
        <li className={`flex items-center bg-gray-100 dark:bg-gray-900/40 hover:bg-gray-200 dark:hover:bg-gray-900/60 p-2.5 rounded-md text-sm transition-colors group ${isTaskActive ? 'border-l-4 border-indigo-500' : ''} ${safeTask.status === 'in-progress' ? 'opacity-70' : ''}`}>
            <input 
                type="checkbox" 
                checked={safeTask.isComplete} 
                onChange={handleToggle}
                disabled={safeTask.status === 'in-progress' || !onToggle} 
                className="w-4 h-4 rounded bg-gray-300 dark:bg-gray-700 border-gray-400 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 mr-3 flex-shrink-0 disabled:opacity-50"
            />
            <div 
                className={`flex-1 ${onOpenDetail ? 'cursor-pointer' : ''}`} 
                onClick={handleOpenDetail}
            >
                <span className={`${safeTask.isComplete ? 'line-through text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
                    {safeTask.title}
                </span>
                <div className="flex items-center space-x-2 mt-1">
                    {safeTask.dueDate && (
                        <span className={`text-xs flex items-center ${new Date() > new Date(safeTask.dueDate) ? 'text-red-500' : 'text-gray-500'}`}>
                            <Calendar size={12} className="mr-1"/>
                            {new Date(safeTask.dueDate).toLocaleDateString()}
                        </span>
                    )}
                    {safeTask.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-300 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
            {safeTask.status !== 'in-progress' && !isTaskActive && !safeTask.isComplete && onStartTask && (
                <button 
                    onClick={handleStartTask} 
                    className="ml-2 p-1 text-gray-500 hover:text-green-500"
                    disabled={!onStartTask}
                >
                    <PlayCircle size={18} />
                </button>
            )}
            {isTaskActive && <TimerIcon size={18} className="ml-2 text-indigo-500 animate-pulse" />}
        </li>
    );
}

export default TaskItem;