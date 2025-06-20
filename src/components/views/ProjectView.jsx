import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { addDoc, collection, updateDoc, doc, setDoc, increment } from 'firebase/firestore';
import { Edit2, PlayCircle, TimerIcon, Calendar } from 'lucide-react';
import { db, basePath } from '../../config/firebase';
import { NUDGE_CONFIG } from '../../config/constants';
import { getAnalogousColor } from '../../utils/helpers';
import TaskItem from '../shared/TaskItem';

function ProjectView({ project, tasks, settings, categoryColor, onOpenTaskDetail, onOpenNewTaskDetail, nudgeState, onBack, onStartTask, onEditProject }) {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const projectTasks = useMemo(() => tasks.filter(t => t.projectId === project.id).sort((a, b) => (a.isComplete - b.isComplete) || (a.createdAt || 0) - (b.createdAt || 0)), [tasks, project.id]);
    
    const sendNudgeNotification = useCallback((level) => {
        const { THRESHOLDS, LEVELS } = NUDGE_CONFIG;
        const totalCompleted = settings.totalTasksCompleted || 0;
        let shouldNudge = false;
        let message = `Remember what's important. Some of your projects are getting old.`;
        if (level === LEVELS.LAZY && (totalCompleted + 1) % THRESHOLDS.TASK_INTERVAL_LEVEL_3 === 0) { shouldNudge = true; message = `Hey look something shiny! Don't get distracted from your older, important projects.`; }
        else if (level === LEVELS.STAY_ON_TARGET && (totalCompleted + 1) % THRESHOLDS.TASK_INTERVAL_LEVEL_2 === 0) { shouldNudge = true; message = `Stay on target. You've got some old projects that need attention.`; }
        else if (level === LEVELS.REMEMBER && (totalCompleted + 1) % THRESHOLDS.TASK_INTERVAL_LEVEL_1 === 0) { shouldNudge = true; }
        if (shouldNudge) { if (settings.ntfyUrl) fetch(settings.ntfyUrl, { method: 'POST', body: message, headers: { 'Title': 'Project Nudger Alert' } }); if ('Notification' in window && Notification.permission === 'granted') new Notification('Project Nudger', { body: message }); if ('speechSynthesis' in window) speechSynthesis.speak(new SpeechSynthesisUtterance(message)); }
    }, [settings]);

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

    const handleToggleTask = async (task) => {
        const isCompleting = !task.isComplete;
        await updateDoc(doc(db, basePath, 'tasks', task.id), { 
            isComplete: isCompleting, 
            completedAt: isCompleting ? new Date() : null,
            status: 'idle'
        });
        if (isCompleting) {
            const settingsRef = doc(db, basePath, 'settings', 'config');
            await setDoc(settingsRef, { totalTasksCompleted: increment(1) }, {merge: true});
            sendNudgeNotification(nudgeState.level);
        }
    };
    
    useEffect(() => { if ('Notification' in window) Notification.requestPermission(); }, []);

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
                    {projectTasks.map(task => <TaskItem key={task.id} task={task} onToggle={handleToggleTask} onOpenDetail={onOpenNewTaskDetail} onStartTask={onStartTask}/>)}
                </ul>
            </div>
        </div>
    );
}

export default ProjectView;