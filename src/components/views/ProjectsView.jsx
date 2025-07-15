import React, { useState, useEffect } from 'react';
import ProjectFilters from '../shared/ProjectFilters';
import KanbanBoard from './ProjectsView/KanbanBoard';
import ProjectCard from './ProjectsView/ProjectCard';
import ViewModeToggle from './ProjectsView/ViewModeToggle';
import StageManager from './ProjectsView/StageManager';
import { useProjectStages } from '../../hooks/useProjectStages';
import { migrateProjectsToStages } from '../../utils/projectStages';
import { Settings } from 'lucide-react';

function ProjectsView({ 
    projects, 
    tasks, 
    setSelectedProjectId, 
    categories, 
    ownerFilter, 
    setOwnerFilter, 
    owners, 
    onCompleteTask, 
    onStartTask, 
    onEditTask, 
    onEditProject, 
    onDeleteProject, 
    onArchiveProject, 
    onMoveProjectToStage,
    loadingStates 
}) {
    // View mode state (default to grid, persisted in localStorage)
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem('projectViewMode') || 'grid';
    });
    
    // Stage management
    const {
        stages,
        loading: stagesLoading,
        error: stagesError,
        addStage,
        updateStage,
        deleteStage,
        reorderStageList,
        resetToDefaults
    } = useProjectStages();
    
    // Stage manager modal state
    const [isStageManagerOpen, setIsStageManagerOpen] = useState(false);
    
    // Stage filter state
    const [stageFilter, setStageFilter] = useState('All');
    
    // Archive filter state (default to false - archived projects hidden by default)
    const [showArchived, setShowArchived] = useState(() => {
        const saved = sessionStorage.getItem('showArchived');
        return saved ? JSON.parse(saved) : false;
    });
    
    // Migrate projects to stages if needed
    const migratedProjects = React.useMemo(() => {
        if (!stages.length) return projects;
        return migrateProjectsToStages(projects, stages);
    }, [projects, stages]);
    
    // Filter projects by stage and archive status
    const filteredProjects = React.useMemo(() => {
        let filtered = migratedProjects;
        
        // Filter by archive status first (archived projects hidden by default)
        if (!showArchived) {
            filtered = filtered.filter(project => !project.archived);
        }
        
        // Then filter by stage
        if (stageFilter !== 'All') {
            filtered = filtered.filter(project => project.stage === stageFilter);
        }
        
        return filtered;
    }, [migratedProjects, stageFilter, showArchived]);
    
    // Persist view mode changes
    useEffect(() => {
        localStorage.setItem('projectViewMode', viewMode);
    }, [viewMode]);
    
    // Persist archive filter preference
    useEffect(() => {
        sessionStorage.setItem('showArchived', JSON.stringify(showArchived));
    }, [showArchived]);
    
    // Handle project stage movement
    const handleMoveProject = async (projectId, newStageId) => {
        if (onMoveProjectToStage) {
            await onMoveProjectToStage(projectId, newStageId);
        }
    };
    
    // Handle view mode change
    const handleViewModeChange = (newMode) => {
        setViewMode(newMode);
    };
    
    return (
        <div className="space-y-6">
            {/* Header section with filters and controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <ProjectFilters 
                        ownerFilter={ownerFilter} 
                        setOwnerFilter={setOwnerFilter} 
                        owners={owners}
                        stageFilter={stageFilter}
                        setStageFilter={setStageFilter}
                        stages={stages}
                        showArchived={showArchived}
                        setShowArchived={setShowArchived}
                    />
                </div>
                
                <div className="flex items-center gap-4">
                    <ViewModeToggle 
                        viewMode={viewMode} 
                        onViewModeChange={handleViewModeChange}
                        disabled={stagesLoading}
                    />
                    
                    <button
                        onClick={() => setIsStageManagerOpen(true)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        title="Manage project stages"
                    >
                        <Settings size={16} />
                        <span className="hidden sm:inline">Manage Stages</span>
                    </button>
                </div>
            </div>
            
            {/* Projects count and title */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                    Projects ({filteredProjects.length})
                    {stageFilter !== 'All' && (
                        <span className="text-lg font-normal text-gray-500 dark:text-gray-400 ml-2">
                            in {stages.find(s => s.id === stageFilter)?.name || stageFilter}
                        </span>
                    )}
                </h2>
            </div>
            
            {/* Error states */}
            {stagesError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-800 dark:text-red-200">Error loading stages: {stagesError}</p>
                </div>
            )}
            
            {/* Main content area */}
            <div className="min-h-96">
                {viewMode === 'kanban' ? (
                    <KanbanBoard
                        projects={filteredProjects}
                        stages={stages}
                        tasks={tasks}
                        categories={categories}
                        setSelectedProjectId={setSelectedProjectId}
                        onEditProject={onEditProject}
                        onDeleteProject={onDeleteProject}
                        onArchiveProject={onArchiveProject}
                        onMoveProject={handleMoveProject}
                        loadingStates={loadingStates}
                        isLoading={stagesLoading}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProjects.map(project => (
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
                                isDraggable={false}
                                showStage={true}
                            />
                        ))}
                        
                        {filteredProjects.length === 0 && (
                            <div className="col-span-full flex items-center justify-center h-32 text-gray-400 dark:text-gray-500">
                                <p>No projects found{stageFilter !== 'All' ? ` in ${stages.find(s => s.id === stageFilter)?.name || stageFilter}` : ''}.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Stage Manager Modal */}
            <StageManager
                isOpen={isStageManagerOpen}
                onClose={() => setIsStageManagerOpen(false)}
                stages={stages}
                onAddStage={addStage}
                onUpdateStage={updateStage}
                onDeleteStage={deleteStage}
                onReorderStages={reorderStageList}
                onResetToDefaults={resetToDefaults}
                isLoading={stagesLoading}
            />
        </div>
    );
}

export default ProjectsView;