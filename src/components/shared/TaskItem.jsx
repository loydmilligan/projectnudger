import React, { useState } from 'react';
import { PlayCircle, TimerIcon, Calendar, Loader2, AlertTriangle, Bell, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { isPastDue, isNudgedTask } from '../../utils/taskFilters';

function TaskItem({ 
    task = {}, 
    onToggle = null, 
    onOpenDetail = null, 
    onStartTask = null, 
    isTaskActive = false,
    aiNudgeRecommendations = null,
    depth = 0,
    children = [],
    onToggleExpand = null,
    isExpanded = false,
    onAddSubTask = null
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
        if (children.length > 0 && !onToggleExpand) {
            console.warn('TaskItem: onToggleExpand handler is missing - expand/collapse functionality will be disabled');
        }
        if (!onAddSubTask) {
            console.warn('TaskItem: onAddSubTask handler is missing - add sub-task functionality will be disabled');
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

    // Calculate visual indicator states
    const isPastDueTask = isPastDue(safeTask);
    const isNudgedTaskIndicator = isNudgedTask(safeTask, aiNudgeRecommendations);

    // Determine container styling based on urgency
    const getContainerClasses = () => {
        let baseClasses = 'flex items-center p-2.5 rounded-md text-sm transition-colors group relative';
        
        // Add indentation based on depth
        const indentationPx = depth * 20;
        
        // Background and border styling based on urgency (past due takes precedence)
        if (isPastDueTask) {
            baseClasses += ' bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border-l-4 border-red-500';
        } else if (isNudgedTaskIndicator) {
            baseClasses += ' bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 border-l-4 border-orange-500';
        } else {
            baseClasses += ' bg-gray-100 dark:bg-gray-900/40 hover:bg-gray-200 dark:hover:bg-gray-900/60';
        }
        
        // Active task border (only if not past due or nudged)
        if (isTaskActive && !isPastDueTask && !isNudgedTaskIndicator) {
            baseClasses += ' border-l-4 border-indigo-500';
        }
        
        // In-progress opacity
        if (safeTask.status === 'in-progress') {
            baseClasses += ' opacity-70';
        }
        
        return baseClasses;
    };

    // Calculate indentation style
    const getIndentationStyle = () => {
        return {
            marginLeft: `${depth * 20}px`
        };
    };

    // Determine due date styling
    const getDueDateClasses = () => {
        if (isPastDueTask) {
            return 'text-xs flex items-center text-red-600 dark:text-red-400 font-semibold';
        }
        return 'text-xs flex items-center text-gray-500';
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

    const handleToggleExpand = (e) => {
        e.stopPropagation();
        if (onToggleExpand && typeof onToggleExpand === 'function') {
            onToggleExpand(safeTask.id);
        }
    };

    const handleAddSubTask = (e) => {
        e.stopPropagation();
        if (onAddSubTask && typeof onAddSubTask === 'function') {
            onAddSubTask(safeTask);
        }
    };

    return (
        <>
            <li 
                className={getContainerClasses()}
                style={getIndentationStyle()}
                data-testid={`task-item-${safeTask.id}`}
                aria-label={`${isPastDueTask && isNudgedTaskIndicator ? 'Past due and nudged task - urgent attention required' : isPastDueTask ? 'Past due task' : isNudgedTaskIndicator ? 'Nudged task - requires attention' : 'Task'}`}
            >
                {/* Expand/Collapse button for parent tasks */}
                {children.length > 0 && (
                    <button
                        onClick={handleToggleExpand}
                        className="mr-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        data-testid={`task-expand-button-${safeTask.id}`}
                    >
                        {isExpanded ? (
                            <ChevronDown size={16} className="text-gray-500" />
                        ) : (
                            <ChevronRight size={16} className="text-gray-500" />
                        )}
                    </button>
                )}
                {/* Spacer for tasks without children to align with parent tasks */}
                {children.length === 0 && (
                    <div className="w-6 mr-2 flex-shrink-0" />
                )}

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
                            className={getDueDateClasses()}
                            data-testid={`task-due-date-${safeTask.id}`}
                        >
                            {isPastDueTask && <AlertTriangle size={12} className="mr-1 text-red-600 dark:text-red-400"/>}
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

            {/* Add Sub-task button */}
            {!safeTask.isComplete && onAddSubTask && (
                <button 
                    onClick={handleAddSubTask} 
                    className="ml-2 p-1 text-gray-500 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Add sub-task"
                    data-testid={`task-add-subtask-button-${safeTask.id}`}
                >
                    <Plus size={16} />
                </button>
            )}
            
            {/* Child count badge for parent tasks */}
            {children.length > 0 && (
                <div 
                    className="ml-2 bg-gray-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    data-testid={`task-child-count-${safeTask.id}`}
                    title={`${children.length} sub-task${children.length !== 1 ? 's' : ''}`}
                >
                    {children.length}
                </div>
            )}
            
            {/* Nudged task notification badge */}
            {isNudgedTaskIndicator && (
                <div 
                    className="absolute top-1 right-1 bg-orange-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs z-10"
                    data-testid={`task-nudged-badge-${safeTask.id}`}
                    aria-label="Nudged task indicator"
                >
                    <Bell size={10} />
                </div>
            )}
        </li>

        {/* Render children when expanded */}
        {isExpanded && children.length > 0 && children.map(child => (
            <TaskItem
                key={child.id}
                task={child}
                onToggle={onToggle}
                onOpenDetail={onOpenDetail}
                onStartTask={onStartTask}
                isTaskActive={isTaskActive}
                aiNudgeRecommendations={aiNudgeRecommendations}
                depth={child.depth || depth + 1}
                children={child.children || []}
                onToggleExpand={onToggleExpand}
                isExpanded={child.children && child.children.length > 0 ? isExpanded : false}
                onAddSubTask={onAddSubTask}
            />
        ))}
    </>
    );
}

export default TaskItem;