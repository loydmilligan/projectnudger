import React, { useState } from 'react';
import { PlayCircle, TimerIcon, Calendar, Loader2 } from 'lucide-react';

function TaskItem({ 
    task = {}, 
    onToggle = null, 
    onOpenDetail = null, 
    onStartTask = null, 
    isTaskActive = false 
}) {
    const [isToggling, setIsToggling] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
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
    const handleToggle = async () => {
        if (onToggle && typeof onToggle === 'function' && !isToggling) {
            setIsToggling(true);
            try {
                await onToggle(task);
            } finally {
                setIsToggling(false);
            }
        }
    };

    const handleOpenDetail = () => {
        if (onOpenDetail && typeof onOpenDetail === 'function') {
            onOpenDetail(task);
        }
    };

    const handleStartTask = async (e) => {
        e.stopPropagation();
        if (onStartTask && typeof onStartTask === 'function' && !isStarting) {
            setIsStarting(true);
            try {
                await onStartTask(task);
            } finally {
                setIsStarting(false);
            }
        }
    };

    return (
        <li 
            className={`flex items-center bg-gray-100 dark:bg-gray-900/40 hover:bg-gray-200 dark:hover:bg-gray-900/60 p-2.5 rounded-md text-sm transition-colors group ${isTaskActive ? 'border-l-4 border-indigo-500' : ''} ${safeTask.status === 'in-progress' ? 'opacity-70' : ''}`}
            data-testid={`task-item-${safeTask.id}`}
        >
            <div className="relative mr-3 flex-shrink-0">
                {isToggling ? (
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                ) : (
                    <input 
                        type="checkbox" 
                        checked={safeTask.isComplete} 
                        onChange={handleToggle}
                        disabled={safeTask.status === 'in-progress' || !onToggle || isToggling} 
                        className="w-4 h-4 rounded bg-gray-300 dark:bg-gray-700 border-gray-400 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                        data-testid={`task-checkbox-${safeTask.id}`}
                    />
                )}
            </div>
            <div 
                className={`flex-1 ${onOpenDetail ? 'cursor-pointer' : ''}`} 
                onClick={handleOpenDetail}
                data-testid={`task-content-${safeTask.id}`}
            >
                <span 
                    className={`${safeTask.isComplete ? 'line-through text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}
                    data-testid={`task-title-${safeTask.id}`}
                >
                    {safeTask.title}
                </span>
                <div className="flex items-center space-x-2 mt-1">
                    {safeTask.dueDate && (
                        <span 
                            className={`text-xs flex items-center ${new Date() > new Date(safeTask.dueDate) ? 'text-red-500' : 'text-gray-500'}`}
                            data-testid={`task-due-date-${safeTask.id}`}
                        >
                            <Calendar size={12} className="mr-1"/>
                            {new Date(safeTask.dueDate).toLocaleDateString()}
                        </span>
                    )}
                    {safeTask.tags.map(tag => (
                        <span 
                            key={tag} 
                            className="text-xs bg-gray-300 dark:bg-gray-700 px-1.5 py-0.5 rounded"
                            data-testid={`task-tag-${tag}-${safeTask.id}`}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
            {safeTask.status !== 'in-progress' && !isTaskActive && !safeTask.isComplete && onStartTask && (
                <button 
                    onClick={handleStartTask} 
                    className="ml-2 p-1 text-gray-500 hover:text-green-500 disabled:opacity-50"
                    disabled={!onStartTask || isStarting}
                    data-testid={`task-start-button-${safeTask.id}`}
                >
                    {isStarting ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <PlayCircle size={18} />
                    )}
                </button>
            )}
            {isTaskActive && (
                <TimerIcon 
                    size={18} 
                    className="ml-2 text-indigo-500 animate-pulse" 
                    data-testid={`task-active-timer-${safeTask.id}`}
                />
            )}
        </li>
    );
}

export default TaskItem;