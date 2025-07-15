import React, { useState } from 'react';
import { Clock, X } from 'lucide-react';

function TimeEntryModal({ isOpen, onClose, onSave, task }) {
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');
    const [notes, setNotes] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateTime = () => {
        const newErrors = {};
        
        const h = parseInt(hours) || 0;
        const m = parseInt(minutes) || 0;
        
        if (h < 0 || h > 23) {
            newErrors.hours = 'Hours must be between 0 and 23';
        }
        
        if (m < 0 || m > 59) {
            newErrors.minutes = 'Minutes must be between 0 and 59';
        }
        
        if (h === 0 && m === 0) {
            newErrors.time = 'Time entry must be greater than 0';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateTime()) return;
        
        setIsSubmitting(true);
        
        try {
            const timeEntry = {
                timestamp: new Date(),
                duration: (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0), // Convert to minutes
                notes: notes.trim(),
                source: 'manual'
            };
            
            await onSave(task.id, timeEntry);
            handleClose();
        } catch (error) {
            console.error('Error saving time entry:', error);
            setErrors({ submit: 'Failed to save time entry. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setHours('');
        setMinutes('');
        setNotes('');
        setErrors({});
        setIsSubmitting(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Add Time Entry
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {task && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-300">Adding time to:</p>
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                            {task.title}
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Time Spent
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={hours}
                                    onChange={(e) => setHours(e.target.value)}
                                    placeholder="0"
                                    className={`w-full px-3 py-2 border rounded-md text-center ${
                                        errors.hours
                                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                    } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                                    Hours
                                </p>
                            </div>
                            <span className="text-gray-500 dark:text-gray-400">:</span>
                            <div className="flex-1">
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={minutes}
                                    onChange={(e) => setMinutes(e.target.value)}
                                    placeholder="0"
                                    className={`w-full px-3 py-2 border rounded-md text-center ${
                                        errors.minutes
                                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                    } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                                    Minutes
                                </p>
                            </div>
                        </div>
                        {errors.hours && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                {errors.hours}
                            </p>
                        )}
                        {errors.minutes && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                {errors.minutes}
                            </p>
                        )}
                        {errors.time && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                {errors.time}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows="3"
                            placeholder="What did you work on? Any notes about this time entry..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        />
                    </div>

                    {errors.submit && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {errors.submit}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                'Add Time Entry'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TimeEntryModal;