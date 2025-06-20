import React, { useMemo } from 'react';
import { ArchiveRestore } from 'lucide-react';

function ArchivedProjectsView({ allProjects, onSaveProject }) {
    const archivedProjects = useMemo(() => allProjects.filter(p => p.status === 'archived'), [allProjects]);

    const handleReactivate = (project) => {
        onSaveProject({ ...project, status: 'active' });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Archived Projects</h2>
            {archivedProjects.length === 0 ? (
                <p className="text-gray-500">No archived projects found.</p>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {archivedProjects.map(project => (
                            <li key={project.id} className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{project.name}</p>
                                    <p className="text-sm text-gray-500">{project.category}</p>
                                </div>
                                <button onClick={() => handleReactivate(project)} className="flex items-center px-3 py-1.5 rounded-md text-sm font-semibold bg-green-500 hover:bg-green-600 text-white transition-colors">
                                    <ArchiveRestore size={16} className="mr-2"/> Reactivate
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default ArchivedProjectsView;