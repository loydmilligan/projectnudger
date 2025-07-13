import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import ProjectCard from './ProjectCard';

/**
 * Individual kanban column component for project stages
 * Provides a droppable area for projects and displays stage information
 */
function KanbanColumn({ 
    stage, 
    projects = [], 
    tasks = [], 
    categories = {}, 
    setSelectedProjectId, 
    onEditProject, 
    onDeleteProject, 
    onArchiveProject, 
    onCreateProject,
    loadingStates = {} 
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: stage.id,
    });

    const stageProjectIds = projects.map(project => project.id);

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800 rounded-lg">
            {/* Column header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                    <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: stage.color }}
                        title={stage.description}
                    />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {stage.name}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 px-2 py-1 rounded-full">
                        {projects.length}
                    </span>
                </div>
                
                {/* Add project button - only show for planning stage or first stage */}
                {(stage.id === 'planning' || stage.order === 0) && (
                    <button
                        onClick={() => onCreateProject && onCreateProject(stage.id)}
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        title="Add new project"
                    >
                        <Plus size={16} />
                    </button>
                )}
            </div>

            {/* Droppable area for projects */}
            <div 
                ref={setNodeRef}
                className={`flex-1 p-4 space-y-4 min-h-32 transition-colors ${
                    isOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
            >
                <SortableContext items={stageProjectIds} strategy={verticalListSortingStrategy}>
                    {projects.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-500 text-sm italic">
                            {isOver ? 'Drop project here' : 'No projects'}
                        </div>
                    ) : (
                        projects.map(project => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                tasks={tasks}
                                categories={categories}
                                setSelectedProjectId={setSelectedProjectId}
                                onEditProject={onEditProject}
                                onDeleteProject={onDeleteProject}
                                onArchiveProject={onArchiveProject}
                                loadingStates={loadingStates}
                                isDraggable={true}
                                showStage={false} // Don't show stage in kanban view since it's implicit
                            />
                        ))
                    )}
                </SortableContext>
            </div>

            {/* Column footer with stage description (if available) */}
            {stage.description && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        {stage.description}
                    </p>
                </div>
            )}
        </div>
    );
}

export default KanbanColumn;