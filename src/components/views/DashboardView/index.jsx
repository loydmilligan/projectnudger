import React from 'react';
import RecommendationEngine from './RecommendationEngine';
import NudgeStatus from './NudgeStatus';
import ActiveTimerWidget from './ActiveTimerWidget';
import ProjectFilters from '../../shared/ProjectFilters';
import { getComplementaryColor } from '../../../utils/helpers';

function DashboardView({ projects, tasks, nudgeState, setSelectedProjectId, categories, activeSession, ownerFilter, setOwnerFilter, owners }) {
    const activeTask = activeSession && tasks.find(t => t.id === activeSession.taskId);
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                {activeSession && activeTask && <ActiveTimerWidget session={activeSession} task={activeTask} />}
                <RecommendationEngine projects={projects} tasks={tasks} />
                <NudgeStatus nudgeState={nudgeState} />
            </div>
            <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold">Projects</h2>
                     <ProjectFilters ownerFilter={ownerFilter} setOwnerFilter={setOwnerFilter} owners={owners} />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {projects.map(project => (
                        <button key={project.id} onClick={() => setSelectedProjectId(project.id)}
                                style={{ backgroundColor: categories[project.category] }}
                                className={`w-full text-left p-4 rounded-lg transition-all text-white focus:outline-none focus:ring-2 dark:focus:ring-offset-gray-900 focus:ring-offset-2`}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = getComplementaryColor(categories[project.category])}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = categories[project.category]}>
                            <p className="font-bold truncate" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>{project.name}</p>
                            <p className="text-xs text-white/80">{project.category} - {project.owner}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DashboardView;