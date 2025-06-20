import React, { useMemo } from 'react';
import { Zap, Target } from 'lucide-react';

const RecommendationEngine = React.memo(({ projects, tasks }) => {
    const recommendation = useMemo(() => {
        const projectsWithIncompleteTasks = projects
            .map(p => ({ ...p, incompleteTasks: tasks.filter(t => t.projectId === p.id && !t.isComplete) }))
            .filter(p => p.incompleteTasks.length > 0)
            .map(p => {
                const daysOld = p.createdAt ? (new Date() - p.createdAt) / (1000 * 3600 * 24) : 0;
                const score = (p.priority || 3) * 2 + daysOld;
                return { ...p, score };
            }).sort((a, b) => b.score - a.score); 
        if (projectsWithIncompleteTasks.length === 0) return { project: null, task: null };
        const recommendedProject = projectsWithIncompleteTasks[0];
        const nextTask = recommendedProject.incompleteTasks.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))[0];
        return { project: recommendedProject, task: nextTask };
    }, [projects, tasks]);
    
    if (!recommendation.project) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold text-green-500 dark:text-green-400 flex items-center">
                    <Zap size={18} className="mr-2"/>
                    All Clear!
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">No pending tasks.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 flex items-center">
                <Target size={18} className="mr-2"/>
                Recommended Next Task
            </h2>
            <div className="mt-2 text-sm">
                <p className="font-medium text-gray-800 dark:text-gray-200">{recommendation.task.title}</p>
                <p className="text-gray-600 dark:text-gray-400">
                    From project: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{recommendation.project.name}</span>
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-xs">
                    Priority: {recommendation.project.priority || 'Medium'} | Score: {recommendation.project.score.toFixed(2)}
                </p>
            </div>
        </div>
    );
});

export default RecommendationEngine;