import React, { useState, useMemo } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { Edit2 } from 'lucide-react';
import { db, basePath } from '../../config/firebase';
import { getAnalogousColor } from '../../utils/helpers';
import TaskItem from '../shared/TaskItem';

function ProjectView({ 
    project, 
    tasks, 
    hierarchicalTasks,
    settings, 
    categoryColor, 
    onCompleteTask, 
    onEditTask, 
    onDeleteTask,
    onOpenNewTaskDetail, 
    nudgeState, 
    onBack, 
    onStartTask, 
    onEditProject, 
    aiNudgeRecommendations,
    expandedTasks,
    onToggleExpand,
    onAddSubTask
}) {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    
    // Use hierarchical tasks if provided, otherwise fallback to flat tasks
    const projectTasksToRender = useMemo(() => {
        if (hierarchicalTasks && hierarchicalTasks.length > 0) {
            return hierarchicalTasks;
        }
        // Fallback to flat tasks sorted by completion status and creation date
        return tasks.filter(t => t.projectId === project.id).sort((a, b) => (a.isComplete - b.isComplete) || (a.createdAt || 0) - (b.createdAt || 0));
    }, [tasks, hierarchicalTasks, project.id]);
    

    const handleQuickAddTask = async () => {
        if (!newTaskTitle.trim()) return;
        await addDoc(collection(db, basePath, 'tasks'), {
            projectId: project.id, title: newTaskTitle.trim(), detail: '', isComplete: false, createdAt: new Date(), tags: [], dueDate: null, status: 'idle'
        });
        setNewTaskTitle('');
    };
    
    const handleOpenAddModal = () => {
        onOpenNewTaskDetail({
            projectId: project.id, title: newTaskTitle, detail: '', isComplete: false, tags: [], dueDate: null, status: 'idle'
        });
        setNewTaskTitle('');
    };

    // Recursive function to render hierarchical tasks
    const renderHierarchicalTasks = (taskList) => {
        return taskList.map(task => (
            <TaskItem
                key={task.id}
                task={task}
                onToggle={onCompleteTask}
                onOpenDetail={onEditTask}
                onStartTask={onStartTask}
                onDeleteTask={onDeleteTask}
                aiNudgeRecommendations={aiNudgeRecommendations}
                depth={task.depth || 0}
                children={task.children || []}
                onToggleExpand={onToggleExpand}
                isExpanded={expandedTasks && expandedTasks.has(task.id)}
                onAddSubTask={onAddSubTask}
            />
        ));
    };

    // Render function that handles both hierarchical and flat tasks
    const renderTasks = () => {
        if (hierarchicalTasks && hierarchicalTasks.length > 0) {
            return renderHierarchicalTasks(projectTasksToRender);
        }
        // Fallback to flat rendering
        return projectTasksToRender.map(task => (
            <TaskItem 
                key={task.id} 
                task={task} 
                onToggle={onCompleteTask} 
                onOpenDetail={onEditTask} 
                onStartTask={onStartTask} 
                onDeleteTask={onDeleteTask}
                aiNudgeRecommendations={aiNudgeRecommendations}
                onAddSubTask={onAddSubTask}
            />
        ));
    };


    return (
        <div className="space-y-6 animate-fade-in">
             <button onClick={onBack} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-4">&larr; Back</button>
            <div className="flex justify-between items-center">
                <h2 className="font-display text-5xl">{project.name}</h2>
                <button onClick={() => onEditProject(project)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <Edit2 size={20} />
                </button>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: getAnalogousColor(categoryColor) }}>
                <h3 className="font-semibold text-lg mb-4 text-white/90">Tasks</h3>
                <div className="flex space-x-2 mb-4">
                    <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleQuickAddTask()}
                        placeholder="Type new task title..." className="flex-1 bg-gray-900/50 border-gray-600/50 rounded-md p-2 text-sm focus:ring-indigo-400 focus:border-indigo-400"/>
                    <button onClick={handleOpenAddModal} className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-md text-sm font-semibold text-white">Add Details...</button>
                </div>
                <ul className="space-y-2">
                    {renderTasks()}
                </ul>
            </div>
        </div>
    );
}

export default ProjectView;