import React from 'react';

function ProjectFilters({ ownerFilter, setOwnerFilter, owners }) {
    return (
        <div className="w-full sm:w-56">
            <label htmlFor="owner-filter" className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">View as</label>
            <select 
                id="owner-filter" 
                value={ownerFilter} 
                onChange={(e) => setOwnerFilter(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
                {owners.map(owner => <option key={owner} value={owner}>{owner}</option>)}
            </select>
        </div>
    );
}

export default ProjectFilters;