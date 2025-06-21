import React, { useState } from 'react';
import { Coffee, Target, Play } from 'lucide-react';

function SessionCompletionModal({ 
    sessionType, 
    onStartNext, 
    onClose, 
    onSaveNotes, 
    tasks 
}) {
    const [notes, setNotes] = useState('');
    const [selectedTask, setSelectedTask] = useState(null);
    const [showTaskSelection, setShowTaskSelection] = useState(false);

    const isWorkSession = sessionType === 'work';
    const nextSessionType = isWorkSession ? 'rest' : 'work';
    
    const handleStartNext = (isDouble = false) => {
        if (isWorkSession) {
            // Work session completed, start rest
            const duration = isDouble ? 10 * 60 : 5 * 60;
            if (notes.trim()) {
                onSaveNotes(notes);
            }
            onStartNext(null, 'rest', duration);
        } else {
            // Rest session completed, need to select task for work
            const duration = isDouble ? 50 * 60 : 25 * 60;
            if (selectedTask) {
                onStartNext(selectedTask, 'work', duration);
            } else {
                setShowTaskSelection(true);
            }
        }
    };

    const handleTaskSelect = (task) => {
        setSelectedTask(task);
        setShowTaskSelection(false);
    };

    const incompleteTasks = tasks.filter(task => !task.isComplete);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in-fast">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="text-center">
                    {/* Completion celebration */}
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                        isWorkSession ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                        {isWorkSession ? <Target size={32} /> : <Coffee size={32} />}
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-2">
                        {isWorkSession ? '🍅 Focus Session Complete!' : '🌿 Rest Session Complete!'}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {isWorkSession 
                            ? 'Great work! Time for a well-deserved break.' 
                            : 'Refreshed and ready! Let\'s get back to productive work.'
                        }
                    </p>
                </div>

                {/* Notes section for work sessions */}
                {isWorkSession && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">
                            What did you accomplish?
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            placeholder="Describe what you completed during this session..."
                        />
                    </div>
                )}

                {/* Task selection for next work session */}
                {!isWorkSession && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">
                            Choose your next focus task:
                        </label>
                        {showTaskSelection ? (
                            <div className="max-h-40 overflow-y-auto space-y-2 border rounded-lg p-2 dark:border-gray-600">
                                {incompleteTasks.map(task => (
                                    <button
                                        key={task.id}
                                        onClick={() => handleTaskSelect(task)}
                                        className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <div className="font-medium">{task.title}</div>
                                        {task.detail && (
                                            <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                {task.detail}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : selectedTask ? (
                            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <div className="font-medium">{selectedTask.title}</div>
                                <button
                                    onClick={() => setShowTaskSelection(true)}
                                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    Change task
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowTaskSelection(true)}
                                className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                            >
                                Click to select a task
                            </button>
                        )}
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col space-y-3">
                    <div className="flex space-x-3">
                        <button
                            onClick={() => handleStartNext(false)}
                            disabled={!isWorkSession && !selectedTask}
                            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-semibold transition-colors ${
                                nextSessionType === 'rest'
                                    ? 'bg-green-500 hover:bg-green-600 text-white'
                                    : 'bg-red-500 hover:bg-red-600 text-white disabled:bg-gray-300 disabled:text-gray-500'
                            }`}
                        >
                            <Play size={18} className="mr-2" />
                            Start {nextSessionType === 'rest' ? '5min Rest' : '25min Focus'}
                        </button>
                        
                        <button
                            onClick={() => handleStartNext(true)}
                            disabled={!isWorkSession && !selectedTask}
                            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-semibold transition-colors ${
                                nextSessionType === 'rest'
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-300 disabled:text-gray-500'
                            }`}
                        >
                            <Play size={18} className="mr-2" />
                            Double {nextSessionType === 'rest' ? '10min Rest' : '50min Focus'}
                        </button>
                    </div>
                    
                    <button
                        onClick={() => {
                            if (isWorkSession && notes.trim()) {
                                onSaveNotes(notes);
                            }
                            onClose();
                        }}
                        className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                        Finish for now
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SessionCompletionModal;