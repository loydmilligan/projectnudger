import React from 'react';
import RecommendationEngine from './RecommendationEngine';
import NudgeStatus from './NudgeStatus';
import EnhancedTimerWidget from './EnhancedTimerWidget';
import ProjectFilters from '../../shared/ProjectFilters';
import ProgressBar from '../../shared/ProgressBar';
import { getComplementaryColor } from '../../../utils/helpers';

function DashboardView({ 
    projects, 
    tasks,
    hierarchicalTasks,
    nudgeState, 
    setSelectedProjectId, 
    categories, 
    activeSession, 
    ownerFilter, 
    setOwnerFilter, 
    owners,
    onStartSession,
    onPauseSession,
    onResetSession,
    onSessionComplete,
    onCompleteTask,
    onStartTask,
    onEditTask,
    expandedTasks,
    onToggleExpand,
    onAddSubTask
}) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <EnhancedTimerWidget
                    activeSession={activeSession}
                    tasks={tasks}
                    onStartSession={onStartSession}
                    onPauseSession={onPauseSession}
                    onResetSession={onResetSession}
                    onSessionComplete={onSessionComplete}
                />
                <RecommendationEngine projects={projects} tasks={tasks} />
                <NudgeStatus nudgeState={nudgeState} />
            </div>
            <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold">Projects</h2>
                     <ProjectFilters ownerFilter={ownerFilter} setOwnerFilter={setOwnerFilter} owners={owners} />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {projects.map(project => {
                        // Calculate task completion for this project
                        const projectTasks = tasks.filter(t => t.projectId === project.id);
                        const completedTasks = projectTasks.filter(t => t.isComplete);
                        const totalTasks = projectTasks.length;
                        const completedCount = completedTasks.length;
                        const completionPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
                        const isFullyCompleted = completionPercentage === 100;
                        
                        return (
                            <button key={project.id} onClick={() => setSelectedProjectId(project.id)}
                                    style={{ backgroundColor: categories[project.category] }}
                                    className={`w-full text-left p-4 rounded-lg transition-all text-white focus:outline-none focus:ring-2 dark:focus:ring-offset-gray-900 focus:ring-offset-2 ${
                                        isFullyCompleted ? 'ring-2 ring-green-400 ring-opacity-60' : ''
                                    }`}
                                    onMouseOver={e => e.currentTarget.style.backgroundColor = getComplementaryColor(categories[project.category])}
                                    onMouseOut={e => e.currentTarget.style.backgroundColor = categories[project.category]}>
                                <div className="mb-2">
                                    <p className="font-bold truncate" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>{project.name}</p>
                                    <p className="text-xs text-white/80">{project.category} - {project.owner}</p>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="mt-2">
                                    <ProgressBar
                                        completed={completedCount}
                                        total={totalTasks}
                                        percentage={completionPercentage}
                                        size="sm"
                                        showLabel={true}
                                        className="w-full"
                                    />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default DashboardView;