import React from 'react';
import ProjectFilters from '../shared/ProjectFilters';
import { timeAgo } from '../../utils/helpers';

function ProjectsView({ projects, tasks, setSelectedProjectId, categories, ownerFilter, setOwnerFilter, owners }) {
    return (
        <div>
            <div className="md:w-1/3 mb-6">
                <ProjectFilters ownerFilter={ownerFilter} setOwnerFilter={setOwnerFilter} owners={owners} />
            </div>
            <h2 className="text-2xl font-bold mb-6">Projects ({projects.length})</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map(project => {
                    const projectTasks = tasks.filter(t => t.projectId === project.id && !t.isComplete).sort((a,b) => (a.createdAt || 0) - (b.createdAt || 0));
                    return (
                        <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border border-transparent hover:border-indigo-500 transition-colors flex flex-col">
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-bold">{project.name}</h3>
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full text-white" style={{backgroundColor: categories[project.category]}}>{project.category}</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Owner: {project.owner}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Priority: {project.priority} | Created: {timeAgo(project.createdAt)}</p>
                                <div className="mt-4 border-t dark:border-gray-700 pt-3">
                                    <h4 className="text-sm font-semibold mb-2">Next Tasks:</h4>
                                    <ul className="space-y-2">
                                        {projectTasks.slice(0, 3).map(task => (
                                            <li key={task.id} className="text-sm text-gray-600 dark:text-gray-300 truncate">{task.title}</li>
                                        ))}
                                        {projectTasks.length === 0 && <li className="text-sm text-gray-400 italic">No pending tasks.</li>}
                                    </ul>
                                </div>
                            </div>
                             <button onClick={() => setSelectedProjectId(project.id)} className="w-full mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm">
                                View Details
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ProjectsView;