import React, { useState, useMemo } from 'react';
import TaskItem from '../shared/TaskItem';
import { applyTaskFilters } from '../../utils/taskFilters';

function TasksView({ tasks, projects, onStartTask, onCompleteTask, onEditTask, activeSession, aiNudgeRecommendations }) {
    const [filters, setFilters] = useState({ project: 'All', tag: '', dueDate: 'All' });

    const filteredTasks = useMemo(() => {
        const filtered = applyTaskFilters(tasks, filters, aiNudgeRecommendations);
        return filtered.sort((a,b) => (a.isComplete - b.isComplete) || (a.createdAt || 0) - (b.createdAt || 0));
    }, [tasks, filters, aiNudgeRecommendations]);

    const allTags = useMemo(() => [...new Set(tasks.flatMap(t => t.tags || []))], [tasks]);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Master Task List</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-200 dark:bg-gray-800 rounded-lg">
                <div>
                    <label className="text-sm font-medium">Project</label>
                    <select onChange={e => setFilters({...filters, project: e.target.value})} className="w-full mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm">
                        <option value="All">All Projects</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="text-sm font-medium">Tag</label>
                    <select onChange={e => setFilters({...filters, tag: e.target.value})} className="w-full mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm">
                        <option value="">All Tags</option>
                         {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="text-sm font-medium">Due Date</label>
                    <select onChange={e => setFilters({...filters, dueDate: e.target.value})} className="w-full mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm">
                        <option value="All">Any Time</option>
                        <option value="7">Next 7 Days</option>
                        <option value="30">Next 30 Days</option>
                        <option value="past_due">Past Due</option>
                        <option value="nudged">Nudged</option>
                    </select>
                </div>
            </div>
            <ul className="space-y-3">
                {filteredTasks.map(task => <TaskItem key={task.id} task={task} onToggle={onCompleteTask} onOpenDetail={onEditTask} onStartTask={onStartTask} isTaskActive={activeSession?.taskId === task.id} aiNudgeRecommendations={aiNudgeRecommendations}/>)}
            </ul>
        </div>
    );
}

export default TasksView;