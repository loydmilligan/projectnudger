import React from 'react';
import { PlayCircle, TimerIcon, Calendar } from 'lucide-react';

function TaskItem({ task, onToggle, onOpenDetail, onStartTask, isTaskActive }) {
    return (
        <li className={`flex items-center bg-gray-100 dark:bg-gray-900/40 hover:bg-gray-200 dark:hover:bg-gray-900/60 p-2.5 rounded-md text-sm transition-colors group ${isTaskActive ? 'border-l-4 border-indigo-500' : ''} ${task.status === 'in-progress' ? 'opacity-70' : ''}`}>
            <input type="checkbox" checked={task.isComplete} onChange={() => onToggle(task)} disabled={task.status === 'in-progress'} className="w-4 h-4 rounded bg-gray-300 dark:bg-gray-700 border-gray-400 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 mr-3 flex-shrink-0 disabled:opacity-50"/>
            <div className="flex-1" onClick={() => onOpenDetail(task)}>
                <span className={`${task.isComplete ? 'line-through text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>{task.title}</span>
                 <div className="flex items-center space-x-2 mt-1">
                    {task.dueDate && <span className={`text-xs flex items-center ${new Date() > new Date(task.dueDate) ? 'text-red-500' : 'text-gray-500'}`}><Calendar size={12} className="mr-1"/>{new Date(task.dueDate).toLocaleDateString()}</span>}
                    {task.tags?.map(tag => <span key={tag} className="text-xs bg-gray-300 dark:bg-gray-700 px-1.5 py-0.5 rounded">{tag}</span>)}
                </div>
            </div>
            {task.status !== 'in-progress' && !isTaskActive && !task.isComplete &&
                <button onClick={(e) => { e.stopPropagation(); onStartTask(task);}} className="ml-2 p-1 text-gray-500 hover:text-green-500"><PlayCircle size={18} /></button>
            }
            {isTaskActive && <TimerIcon size={18} className="ml-2 text-indigo-500 animate-pulse" />}
        </li>
    );
}

export default TaskItem;