import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

function ProjectFilters({ 
    ownerFilter, 
    setOwnerFilter, 
    owners, 
    stageFilter, 
    setStageFilter, 
    stages = [],
    // New props for Past Due and Nudged filters
    pastDueFilter,
    setPastDueFilter,
    nudgedFilter,
    setNudgedFilter,
    showTaskFilters = false
}) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 w-full">
            {/* Owner Filter */}
            <div className="w-full sm:w-56">
                <label htmlFor="owner-filter" className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                    View as
                </label>
                <select 
                    id="owner-filter" 
                    value={ownerFilter} 
                    onChange={(e) => setOwnerFilter(e.target.value)}
                    className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                    {owners.map(owner => (
                        <option key={owner} value={owner}>{owner}</option>
                    ))}
                </select>
            </div>
            
            {/* Stage Filter */}
            {stages.length > 0 && (
                <div className="w-full sm:w-56">
                    <label htmlFor="stage-filter" className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                        Stage
                    </label>
                    <select 
                        id="stage-filter" 
                        value={stageFilter || 'All'} 
                        onChange={(e) => setStageFilter && setStageFilter(e.target.value)}
                        className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="All">All Stages</option>
                        {stages.map(stage => (
                            <option key={stage.id} value={stage.id}>
                                {stage.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Task-specific filters - Past Due and Nudged */}
            {showTaskFilters && (
                <div className="flex gap-2">
                    {/* Past Due Filter Toggle */}
                    <button
                        onClick={() => setPastDueFilter && setPastDueFilter(!pastDueFilter)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            pastDueFilter
                                ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-2 border-red-300 dark:border-red-700'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                        title="Show only past due tasks"
                    >
                        <Clock className="w-4 h-4" />
                        Past Due
                    </button>

                    {/* Nudged Filter Toggle */}
                    <button
                        onClick={() => setNudgedFilter && setNudgedFilter(!nudgedFilter)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            nudgedFilter
                                ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-2 border-orange-300 dark:border-orange-700'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                        title="Show only AI-nudged tasks"
                    >
                        <AlertTriangle className="w-4 h-4" />
                        Nudged
                    </button>
                </div>
            )}
        </div>
    );
}

export default ProjectFilters;