import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit2, Trash2, Archive, Loader2, GripVertical } from 'lucide-react';
import { timeAgo } from '../../../utils/helpers';

/**
 * Reusable ProjectCard component for both grid and kanban views
 * Supports drag and drop when in kanban mode and provides consistent
 * project display with action buttons
 */
function ProjectCard({ 
    project, 
    tasks = [], 
    categories = {}, 
    setSelectedProjectId, 
    onEditProject, 
    onDeleteProject, 
    onArchiveProject, 
    loadingStates = {},
    isDraggable = false,
    showStage = false
}) {
    // Drag and drop setup (only when isDraggable is true)
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: project.id,
        disabled: !isDraggable
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    // Calculate project tasks
    const projectTasks = tasks.filter(t => t.projectId === project.id && !t.isComplete)
        .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

    const categoryColor = categories[project.category] || '#6366f1';

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border border-transparent hover:border-indigo-500 transition-colors flex flex-col ${
                isDragging ? 'shadow-lg' : ''
            }`}
        >
            {/* Header with drag handle and project info */}
            <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-start flex-1">
                        {/* Drag handle - only visible in kanban mode */}
                        {isDraggable && (
                            <div
                                {...attributes}
                                {...listeners}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-grab active:cursor-grabbing mr-2 flex-shrink-0"
                                title="Drag to move between stages"
                            >
                                <GripVertical size={16} className="text-gray-400" />
                            </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold truncate">{project.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span 
                                    className="inline-block text-xs font-semibold px-2 py-1 rounded-full text-white"
                                    style={{ backgroundColor: categoryColor }}
                                >
                                    {project.category}
                                </span>
                                {showStage && project.stage && (
                                    <span className="inline-block text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                        {project.stage}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditProject(project);
                            }}
                            disabled={loadingStates?.editProject}
                            className={`p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors ${
                                loadingStates?.editProject ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title="Edit project"
                        >
                            {loadingStates?.editProject ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Edit2 size={16} />
                            )}
                        </button>
                        
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onArchiveProject(project.id);
                            }}
                            disabled={loadingStates?.archiveProject}
                            className={`p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors ${
                                loadingStates?.archiveProject ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title="Archive project"
                        >
                            {loadingStates?.archiveProject ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Archive size={16} />
                            )}
                        </button>
                        
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteProject(project.id);
                            }}
                            disabled={loadingStates?.deleteProject}
                            className={`p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors ${
                                loadingStates?.deleteProject ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title="Delete project"
                        >
                            {loadingStates?.deleteProject ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Trash2 size={16} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Project metadata */}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Owner: {project.owner}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Priority: {project.priority} | Created: {timeAgo(project.createdAt)}
                </p>

                {/* Next tasks section */}
                <div className="mt-4 border-t dark:border-gray-700 pt-3">
                    <h4 className="text-sm font-semibold mb-2">Next Tasks:</h4>
                    <ul className="space-y-2">
                        {projectTasks.slice(0, 3).map(task => (
                            <li key={task.id} className="text-sm text-gray-600 dark:text-gray-300 truncate">
                                {task.title}
                            </li>
                        ))}
                        {projectTasks.length === 0 && (
                            <li className="text-sm text-gray-400 italic">No pending tasks.</li>
                        )}
                        {projectTasks.length > 3 && (
                            <li className="text-xs text-gray-500 dark:text-gray-400">
                                +{projectTasks.length - 3} more tasks
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            {/* View details button */}
            <div className="mt-4 pt-3 border-t dark:border-gray-700">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProjectId(project.id);
                    }} 
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm"
                >
                    View Details
                </button>
            </div>
        </div>
    );
}

export default ProjectCard;