import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, RotateCcw, Clock, Plus } from 'lucide-react';
import { formatTime } from '../../../utils/helpers';
import TimeEntryModal from '../../shared/TimeEntryModal';

// Tomato and Vine icons as SVG components
const TomatoIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-red-100">
        <path d="M12 2C10.5 2 9.5 3 9.5 4.5C9.5 5 9.7 5.4 10 5.7C8.3 6.8 7 8.8 7 11C7 15.4 9.6 19 12 19S17 15.4 17 11C17 8.8 15.7 6.8 14 5.7C14.3 5.4 14.5 5 14.5 4.5C14.5 3 13.5 2 12 2Z"/>
        <path d="M10.5 3.5C10.5 3.2 10.7 3 11 3S11.5 3.2 11.5 3.5V4.5C11.5 4.8 11.3 5 11 5S10.5 4.8 10.5 4.5V3.5Z"/>
        <path d="M12.5 3.5C12.5 3.2 12.7 3 13 3S13.5 3.2 13.5 3.5V4.5C13.5 4.8 13.3 5 13 5S12.5 4.8 12.5 4.5V3.5Z"/>
    </svg>
);

const VineIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-green-100">
        <path d="M12 2L10.5 3.5C9.5 4.5 9 5.7 9 7V9C7.3 9.4 6 10.8 6 12.5C6 14.2 7.3 15.6 9 16V17C9 18.3 9.5 19.5 10.5 20.5L12 22L13.5 20.5C14.5 19.5 15 18.3 15 17V16C16.7 15.6 18 14.2 18 12.5C18 10.8 16.7 9.4 15 9V7C15 5.7 14.5 4.5 13.5 3.5L12 2Z"/>
        <path d="M8 8C7.5 7.5 7 7.2 6.5 7C6 6.8 5.5 6.8 5 7C4.5 7.2 4 7.5 3.5 8"/>
        <path d="M16 8C16.5 7.5 17 7.2 17.5 7C18 6.8 18.5 6.8 19 7C19.5 7.2 20 7.5 20.5 8"/>
    </svg>
);

function Timer({ duration, startTime, onFinish, sessionType }) {
    const [remaining, setRemaining] = useState(duration);

    useEffect(() => {
        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTime.getTime()) / 1000;
            const newRemaining = Math.max(0, Math.floor(duration - elapsed));
            setRemaining(newRemaining);

            if (newRemaining <= 0) {
                clearInterval(interval);
                try { 
                    new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg").play(); 
                } catch(e) { 
                    console.error("Audio playback failed", e); 
                }
                onFinish();
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [duration, startTime, onFinish]);

    return (
        <div className="text-4xl font-mono font-bold text-white">
            {formatTime(remaining)}
        </div>
    );
}

function EnhancedTimerWidget({ 
    activeSession, 
    tasks, 
    onStartSession, 
    onPauseSession, 
    onResetSession, 
    onSessionComplete,
    onAddTimeEntry 
}) {
    const [sessionType, setSessionType] = useState('work');
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState(25 * 60); // 25 minutes default
    const [showTimeEntryModal, setShowTimeEntryModal] = useState(false);
    const [timeEntryTask, setTimeEntryTask] = useState(null);

    const isActive = activeSession && activeSession.active;
    const currentType = activeSession?.type || sessionType;
    
    // Color themes
    const workTheme = {
        bg: 'bg-red-500/80',
        border: 'border-red-600',
        text: 'text-red-100',
        accent: 'text-red-200'
    };
    
    const restTheme = {
        bg: 'bg-green-500/80',
        border: 'border-green-600', 
        text: 'text-green-100',
        accent: 'text-green-200'
    };

    const currentTheme = currentType === 'work' ? workTheme : restTheme;
    const CurrentIcon = currentType === 'work' ? TomatoIcon : VineIcon;

    const handleStartClick = (isDouble = false) => {
        if (sessionType === 'work') {
            // Work session needs task selection
            const duration = isDouble ? 50 * 60 : 25 * 60;
            setSelectedDuration(duration);
            setShowTaskModal(true);
        } else {
            // Rest session can start immediately
            const duration = isDouble ? 10 * 60 : 5 * 60;
            onStartSession(null, sessionType, duration);
        }
    };

    const handleTaskSelect = (task) => {
        onStartSession(task, sessionType, selectedDuration);
        setShowTaskModal(false);
    };

    const handleManualTimeEntry = (task) => {
        setTimeEntryTask(task);
        setShowTimeEntryModal(true);
    };

    const handleSaveTimeEntry = async (taskId, timeEntry) => {
        if (onAddTimeEntry && typeof onAddTimeEntry === 'function') {
            await onAddTimeEntry(taskId, timeEntry);
        }
        setShowTimeEntryModal(false);
        setTimeEntryTask(null);
    };

    return (
        <>
            <div className={`p-6 rounded-lg shadow-lg transition-all duration-300 ${currentTheme.bg} ${currentTheme.border} border-2`}>
                {/* Header with session type toggle */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <CurrentIcon size={28} />
                        <h3 className="text-lg font-bold text-white">
                            {currentType === 'work' ? 'Focus Session' : 'Rest & Recharge'}
                        </h3>
                    </div>
                    
                    {!isActive && (
                        <div className="flex bg-white/20 rounded-lg p-1">
                            <button
                                onClick={() => setSessionType('work')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                    sessionType === 'work' 
                                        ? 'bg-white/30 text-white' 
                                        : 'text-white/70 hover:text-white'
                                }`}
                            >
                                Work
                            </button>
                            <button
                                onClick={() => setSessionType('rest')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                    sessionType === 'rest' 
                                        ? 'bg-white/30 text-white' 
                                        : 'text-white/70 hover:text-white'
                                }`}
                            >
                                Rest
                            </button>
                        </div>
                    )}
                </div>

                {/* Timer display or controls */}
                <div className="text-center">
                    {isActive ? (
                        <>
                            <Timer 
                                duration={activeSession.duration} 
                                startTime={activeSession.startTime.toDate()} 
                                onFinish={onSessionComplete}
                                sessionType={currentType}
                            />
                            {activeSession.type === 'work' && (
                                <p className="text-white/80 text-sm mt-2">
                                    Working on: {tasks.find(t => t.id === activeSession.taskId)?.title || 'Unknown task'}
                                </p>
                            )}
                            
                            {/* Active session controls */}
                            <div className="flex justify-center space-x-3 mt-4">
                                <button
                                    onClick={onPauseSession}
                                    className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                                >
                                    <Pause size={18} className="mr-2" />
                                    Pause
                                </button>
                                <button
                                    onClick={onResetSession}
                                    className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                                >
                                    <Square size={18} className="mr-2" />
                                    Stop
                                </button>
                                {activeSession.type === 'work' && activeSession.taskId && (
                                    <button
                                        onClick={() => handleManualTimeEntry(tasks.find(t => t.id === activeSession.taskId))}
                                        className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                                        title="Add manual time entry"
                                    >
                                        <Plus size={18} className="mr-2" />
                                        <Clock size={18} />
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="text-4xl font-mono font-bold text-white mb-4">
                                {sessionType === 'work' ? '25:00' : '05:00'}
                            </div>
                            
                            {/* Start controls */}
                            <div className="flex justify-center space-x-3">
                                <button
                                    onClick={() => handleStartClick(false)}
                                    className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                                >
                                    <Play size={18} className="mr-2" />
                                    Start
                                </button>
                                <button
                                    onClick={() => handleStartClick(true)}
                                    className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                                >
                                    <Play size={18} className="mr-2" />
                                    Double
                                </button>
                            </div>
                            
                            {/* Manual time entry for work sessions */}
                            {sessionType === 'work' && (
                                <div className="mt-4 flex justify-center">
                                    <button
                                        onClick={() => setShowTaskModal(true)}
                                        className="flex items-center px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors text-sm"
                                        title="Add manual time entry"
                                    >
                                        <Clock size={16} className="mr-2" />
                                        Log Time
                                    </button>
                                </div>
                            )}
                            
                            <p className="text-white/70 text-xs mt-3">
                                {sessionType === 'work' ? 'Start a focused work session' : 'Take a refreshing break'}
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Task Selection Modal */}
            {showTaskModal && (
                <TaskSelectionModal
                    tasks={tasks}
                    onSelectTask={sessionType === 'work' && !isActive ? handleTaskSelect : handleManualTimeEntry}
                    onClose={() => setShowTaskModal(false)}
                    duration={selectedDuration}
                    isManualTimeEntry={sessionType === 'work' && !isActive ? false : true}
                />
            )}
            
            {/* Time Entry Modal */}
            <TimeEntryModal
                isOpen={showTimeEntryModal}
                onClose={() => {
                    setShowTimeEntryModal(false);
                    setTimeEntryTask(null);
                }}
                onSave={handleSaveTimeEntry}
                task={timeEntryTask}
            />
        </>
    );
}

function TaskSelectionModal({ tasks, onSelectTask, onClose, duration, isManualTimeEntry = false }) {
    const [searchTerm, setSearchTerm] = useState('');
    
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const filteredTasks = safeTasks.filter(t => {
        if (!t || t.isComplete) return false;
        const title = typeof t.title === 'string' ? t.title : '';
        return title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in-fast">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-semibold mb-4">
                    {isManualTimeEntry ? 'Choose a task to log time for' : `Choose a task for your ${formatTime(duration)} session`}
                </h3>
                
                {/* Search input */}
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full mb-4 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    autoFocus
                />
                
                {/* Task list */}
                <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                    {filteredTasks.map(task => (
                        <button
                            key={task.id}
                            onClick={() => onSelectTask(task)}
                            className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="font-medium">{task.title}</div>
                            {task.detail && (
                                <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {task.detail}
                                </div>
                            )}
                        </button>
                    ))}
                    {filteredTasks.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No tasks found</p>
                    )}
                </div>
                
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md text-sm font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EnhancedTimerWidget;