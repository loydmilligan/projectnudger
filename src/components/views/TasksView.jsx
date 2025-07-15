import React, { useState, useMemo } from 'react';
import TaskItem from '../shared/TaskItem';
import ProjectFilters from '../shared/ProjectFilters';
import { applyTaskFilters, isPastDue, isNudgedTask } from '../../utils/taskFilters';
import { buildTaskHierarchy } from '../../utils/taskHelpers';

function TasksView({ 
    tasks, 
    hierarchicalTasks,
    projects, 
    onStartTask, 
    onCompleteTask, 
    onEditTask, 
    activeSession, 
    aiNudgeRecommendations,
    expandedTasks,
    onToggleExpand,
    onAddSubTask
}) {
    const [filters, setFilters] = useState({ project: 'All', tag: '', dueDate: 'All' });
    // New toggle filter states
    const [pastDueFilter, setPastDueFilter] = useState(false);
    const [nudgedFilter, setNudgedFilter] = useState(false);

    const filteredHierarchicalTasks = useMemo(() => {
        // First apply standard filters (project, tag, dueDate)
        let filtered = applyTaskFilters(tasks, filters, aiNudgeRecommendations);
        
        // Apply toggle filters (Past Due and Nudged)
        if (pastDueFilter) {
            filtered = filtered.filter(task => isPastDue(task));
        }
        
        if (nudgedFilter) {
            filtered = filtered.filter(task => isNudgedTask(task, aiNudgeRecommendations));
        }
        
        // If no filters are active, use the pre-built hierarchy
        if (filters.project === 'All' && !filters.tag && filters.dueDate === 'All' && !pastDueFilter && !nudgedFilter) {
            return hierarchicalTasks;
        }
        
        // When filters are active, build hierarchy from filtered tasks
        const hierarchy = buildTaskHierarchy(filtered);
        return hierarchy;
    }, [tasks, hierarchicalTasks, filters, aiNudgeRecommendations, pastDueFilter, nudgedFilter]);

    const allTags = useMemo(() => [...new Set(tasks.flatMap(t => t.tags || []))], [tasks]);

    // Recursive function to render hierarchical tasks
    const renderHierarchicalTasks = (taskList) => {
        return taskList.map(task => {
            // Add visual indicators for filtered task types
            const isPastDueTask = isPastDue(task);
            const isNudgedTaskIndicator = isNudgedTask(task, aiNudgeRecommendations);
            
            return (
                <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={onCompleteTask}
                    onOpenDetail={onEditTask}
                    onStartTask={onStartTask}
                    isTaskActive={activeSession?.taskId === task.id}
                    aiNudgeRecommendations={aiNudgeRecommendations}
                    depth={task.depth || 0}
                    children={task.children || []}
                    onToggleExpand={onToggleExpand}
                    isExpanded={expandedTasks.has(task.id)}
                    onAddSubTask={onAddSubTask}
                    // Enhanced visual indicators
                    showPastDueIndicator={isPastDueTask}
                    showNudgedIndicator={isNudgedTaskIndicator}
                    highlightPastDue={pastDueFilter && isPastDueTask}
                    highlightNudged={nudgedFilter && isNudgedTaskIndicator}
                />
            );
        });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Master Task List</h2>
            
            {/* Standard dropdown filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-200 dark:bg-gray-800 rounded-lg">
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

            {/* Enhanced task filters using ProjectFilters component */}
            <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <label className="text-sm font-medium text-blue-800 dark:text-blue-200 block mb-2">Quick Filters</label>
                <ProjectFilters
                    showTaskFilters={true}
                    pastDueFilter={pastDueFilter}
                    setPastDueFilter={setPastDueFilter}
                    nudgedFilter={nudgedFilter}
                    setNudgedFilter={setNudgedFilter}
                    // Hide project/stage filters since they're handled above
                    owners={[]}
                    stages={[]}
                />
            </div>

            <ul className="space-y-3">
                {renderHierarchicalTasks(filteredHierarchicalTasks)}
            </ul>
        </div>
    );
}

export default TasksView;