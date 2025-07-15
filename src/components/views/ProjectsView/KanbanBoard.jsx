import React, { useState, useMemo } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { AlertCircle, Loader2 } from 'lucide-react';
import KanbanColumn from './KanbanColumn';
import ProjectCard from './ProjectCard';
import { groupProjectsByStage } from '../../../utils/projectStages';

/**
 * Main kanban board layout component with configurable columns and drag-drop support
 * Handles project movement between stages and provides responsive column layout
 */
function KanbanBoard({ 
    projects = [], 
    stages = [], 
    tasks = [], 
    categories = {}, 
    setSelectedProjectId, 
    onEditProject, 
    onDeleteProject, 
    onArchiveProject, 
    onCreateProject,
    onMoveProject,
    loadingStates = {},
    isLoading = false
}) {
    const [activeProject, setActiveProject] = useState(null);

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Group projects by stage
    const projectsByStage = useMemo(() => {
        return groupProjectsByStage(projects, stages);
    }, [projects, stages]);

    // Handle drag start
    const handleDragStart = (event) => {
        const { active } = event;
        const project = projects.find(p => p.id === active.id);
        setActiveProject(project);
    };

    // Handle drag end
    const handleDragEnd = async (event) => {
        const { active, over } = event;
        
        setActiveProject(null);

        if (!over) {
            console.log('Drag ended without valid drop target');
            return;
        }

        const projectId = active.id;
        const newStageId = over.id;

        console.log(`Drag ended: Project ${projectId} dropped on stage ${newStageId}`);

        // Find the project being moved
        const project = projects.find(p => p.id === projectId);
        if (!project) {
            console.error('Project not found:', projectId);
            return;
        }

        // Check if the stage actually changed
        if (project.stage === newStageId) {
            console.log('Project already in target stage, no move needed');
            return;
        }

        // Find the target stage
        const targetStage = stages.find(s => s.id === newStageId);
        if (!targetStage) {
            console.error('Target stage not found:', newStageId);
            return;
        }

        console.log(`Moving project "${project.name}" from "${project.stage}" to "${targetStage.name}"`);

        // Call the move handler
        if (onMoveProject) {
            try {
                await onMoveProject(projectId, newStageId);
                console.log('Project move completed successfully');
            } catch (error) {
                console.error('Failed to move project:', error);
                // Error handling should be done by the parent component
            }
        } else {
            console.warn('onMoveProject handler not provided');
        }
    };

    // Handle drag cancel
    const handleDragCancel = () => {
        setActiveProject(null);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-2 text-gray-500">
                    <Loader2 className="animate-spin" size={24} />
                    <span>Loading kanban board...</span>
                </div>
            </div>
        );
    }

    // Error state - no stages
    if (!stages || stages.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                        No stages configured
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Configure project stages to use the kanban board.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                {/* Kanban columns container */}
                <div className="grid gap-6 h-full" style={{
                    gridTemplateColumns: `repeat(${Math.min(stages.length, 4)}, minmax(280px, 1fr))`
                }}>
                    {stages.map(stage => {
                        const stageProjects = projectsByStage[stage.id] || [];
                        
                        return (
                            <KanbanColumn
                                key={stage.id}
                                stage={stage}
                                projects={stageProjects}
                                tasks={tasks}
                                categories={categories}
                                setSelectedProjectId={setSelectedProjectId}
                                onEditProject={onEditProject}
                                onDeleteProject={onDeleteProject}
                                onArchiveProject={onArchiveProject}
                                onCreateProject={onCreateProject}
                                loadingStates={loadingStates}
                            />
                        );
                    })}
                </div>

                {/* Drag overlay with enhanced visual feedback */}
                <DragOverlay>
                    {activeProject ? (
                        <div className="opacity-95 transform rotate-2 shadow-2xl ring-2 ring-blue-500 ring-opacity-50">
                            <ProjectCard
                                project={activeProject}
                                tasks={tasks}
                                categories={categories}
                                setSelectedProjectId={() => {}} // No-op during drag
                                onEditProject={() => {}} // No-op during drag
                                onDeleteProject={() => {}} // No-op during drag
                                onArchiveProject={() => {}} // No-op during drag
                                loadingStates={{}}
                                isDraggable={false} // No drag handle in overlay
                                showStage={true}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Responsive warning for mobile */}
            <div className="md:hidden mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <div className="flex">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            The kanban board works best on larger screens. Consider using the grid view on mobile devices.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default KanbanBoard;