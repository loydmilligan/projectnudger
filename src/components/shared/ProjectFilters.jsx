import React from 'react';

function ProjectFilters({ 
    ownerFilter, 
    setOwnerFilter, 
    owners, 
    stageFilter, 
    setStageFilter, 
    stages = [] 
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
        </div>
    );
}

export default ProjectFilters;