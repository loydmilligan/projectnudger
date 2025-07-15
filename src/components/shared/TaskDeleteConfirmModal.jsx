import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

function TaskDeleteConfirmModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    task, 
    childrenCount = 0 
}) {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            await onConfirm(task.id);
            onClose();
        } catch (error) {
            console.error('Error deleting task:', error);
            // Error will be handled by parent component
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancel = () => {
        if (!isDeleting) {
            onClose();
        }
    };

    // Handle click outside modal
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !isDeleting) {
            onClose();
        }
    };

    // Handle escape key
    const handleKeyDown = (e) => {
        if (e.key === 'Escape' && !isDeleting) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-task-title"
        >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 
                        id="delete-task-title"
                        className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"
                    >
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Delete Task
                    </h3>
                    <button
                        onClick={handleCancel}
                        disabled={isDeleting}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Close dialog"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Task Details */}
                <div className="mb-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Task to delete:</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                            {task?.title || 'Unknown Task'}
                        </p>
                    </div>
                    
                    {/* Hierarchical Warning */}
                    {childrenCount > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-3">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                        Warning: This task has {childrenCount} subtask{childrenCount !== 1 ? 's' : ''}
                                    </p>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                        All subtasks will also be deleted and cannot be recovered.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirmation Message */}
                <div className="mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete this task? This action cannot be undone.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={handleCancel}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        {isDeleting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Delete Task
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TaskDeleteConfirmModal;