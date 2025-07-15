import React from 'react';
import { Clock, FileText, User, Calendar } from 'lucide-react';
import { formatTime } from '../../utils/helpers';

function ExpandableTaskDetails({ task, isExpanded, onToggle }) {
    if (!task) return null;

    const timeTracked = task.timeTracked || [];
    const totalMinutes = timeTracked.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    const formatDuration = (minutes) => {
        if (minutes === 0) return '0 min';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours === 0) return `${mins} min`;
        if (mins === 0) return `${hours}h`;
        return `${hours}h ${mins}m`;
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const sortedTimeEntries = [...timeTracked].sort((a, b) => {
        const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
        return dateB - dateA; // Most recent first
    });

    if (!isExpanded) return null;

    return (
        <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Time Tracking Details
                    </h4>
                    <button
                        onClick={onToggle}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        Hide Details
                    </button>
                </div>

                {/* Time Summary */}
                <div className="mb-4 p-3 bg-white dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            Total Time Tracked:
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {totalHours > 0 ? `${totalHours}h ${remainingMinutes}m` : `${totalMinutes}m`}
                        </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            Total Entries:
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {timeTracked.length}
                        </span>
                    </div>
                </div>

                {/* Time Entries */}
                {sortedTimeEntries.length > 0 ? (
                    <div className="space-y-2">
                        <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                            Time Entries
                        </h5>
                        <div className="max-h-32 overflow-y-auto space-y-2">
                            {sortedTimeEntries.map((entry, index) => (
                                <div
                                    key={index}
                                    className="bg-white dark:bg-gray-700 rounded-md p-3 border border-gray-200 dark:border-gray-600"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {formatDuration(entry.duration)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className={`w-2 h-2 rounded-full ${
                                                        entry.source === 'timer' 
                                                            ? 'bg-blue-500' 
                                                            : 'bg-green-500'
                                                    }`} />
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {entry.source === 'timer' ? 'Timer' : 'Manual'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(entry.timestamp)}
                                            </div>
                                            {entry.notes && (
                                                <div className="mt-2 flex items-start gap-1">
                                                    <FileText className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                                        {entry.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No time entries yet
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Start tracking time to see entries here
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ExpandableTaskDetails;