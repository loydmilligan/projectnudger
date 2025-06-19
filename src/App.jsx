import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot, 
    query, 
    updateDoc, 
    doc,
    setDoc,
    increment,
    arrayUnion,
    getDocs
} from 'firebase/firestore';
import { Plus, Zap, Target, Folder, Link, Calendar, Hash, Settings, X, Tag, Edit2, ShieldAlert, LayoutDashboard, ListChecks, Briefcase, Sun, Moon, PlayCircle, Timer as TimerIcon, Coffee, Square, CheckCircle, Download } from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Hardcoded User ID ---
const basePath = `artifacts/${appId}/public/data`;

// --- Nudge System Configuration ---
const NUDGE_CONFIG = {
    LEVELS: { NONE: 0, REMEMBER: 1, STAY_ON_TARGET: 2, LAZY: 3 },
    MODES: { AUTOMATIC: 'Automatic', REMEMBER: 'Remember', STAY_ON_TARGET: 'Stay on Target', LAZY: 'Lazy' },
    THRESHOLDS: { PROJECT_AGE_OLD: 30, PROJECT_AGE_VERY_OLD: 90, PROJECT_COUNT_SOME: 5, PROJECT_COUNT_MANY: 10, TASK_INTERVAL_LEVEL_1: 10, TASK_INTERVAL_LEVEL_2: 5, TASK_INTERVAL_LEVEL_3: 2 }
};

const POMODORO_CONFIG = {
    WORK_SESSION: 25 * 60,
    SHORT_BREAK: 5 * 60,
    LONG_BREAK: 10 * 60
};

// --- Helper Functions ---
const timeAgo = (date) => { if (!date) return 'N/A'; const seconds = Math.floor((new Date() - date) / 1000); if (seconds < 5) return 'just now'; let interval = seconds / 31536000; if (interval > 1) return Math.floor(interval) + " years"; interval = seconds / 2592000; if (interval > 1) return Math.floor(interval) + " months"; interval = seconds / 86400; if (interval > 1) return Math.floor(interval) + " days"; return "Today"; };
const generateHslColor = (existingColors = []) => { let hue; do { hue = Math.floor(Math.random() * 360); } while (existingColors.some(color => Math.abs(parseInt(color.match(/hsl\((\d+)/)[1]) - hue) < 30)); return `hsl(${hue}, 70%, 50%)`; };
const getComplementaryColor = (hsl) => { if (!hsl) return 'hsl(200, 70%, 50%)'; const [_, h, s, l] = hsl.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/).map(Number); return `hsl(${(h + 180) % 360}, ${s * 0.8}%, ${l * 1.2}%)`; };
const getAnalogousColor = (hsl) => { if (!hsl) return 'hsl(200, 70%, 20%)'; const [_, h, s, l] = hsl.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/).map(Number); return `hsl(${(h + 30) % 360}, ${s * 0.5}%, ${l * 0.5}%)`; };
const formatTime = (seconds) => { const mins = Math.floor(seconds / 60); const secs = seconds % 60; return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`; };

// --- Main App Component ---
export default function App() {
    // --- State ---
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [categories, setCategories] = useState({});
    const [settings, setSettings] = useState({ ntfyUrl: '', totalTasksCompleted: 0, nudgeMode: NUDGE_CONFIG.MODES.AUTOMATIC, theme: 'dark' });
    const [activeSession, setActiveSession] = useState(null);
    const [activeView, setActiveView] = useState('dashboard');
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
    const [isSessionEndModalOpen, setIsSessionEndModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [sessionEndData, setSessionEndData] = useState(null);

    // --- Effects for Data Loading and Theme ---
    useEffect(() => {
        const settingsDocRef = doc(db, basePath, 'settings', 'config');
        const unsubSettings = onSnapshot(settingsDocRef, (doc) => setSettings(doc.exists() ? { totalTasksCompleted: 0, ...doc.data() } : { ntfyUrl: '', totalTasksCompleted: 0, nudgeMode: NUDGE_CONFIG.MODES.AUTOMATIC, theme: 'dark' }));
        
        const unsubProjects = onSnapshot(query(collection(db, basePath, 'projects')), s => setProjects(s.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate() }))));
        const unsubTasks = onSnapshot(query(collection(db, basePath, 'tasks')), s => setTasks(s.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate(), completedAt: d.data().completedAt?.toDate(), dueDate: d.data().dueDate?.toDate() }))));
        const unsubCategories = onSnapshot(doc(db, basePath, 'settings', 'categories'), doc => setCategories(doc.exists() ? doc.data() : {}));
        const unsubSession = onSnapshot(doc(db, basePath, 'tracking', 'activeSession'), (doc) => {
            if (doc.exists() && doc.data().active) {
                const data = doc.data();
                const endTime = data.startTime.toDate().getTime() + data.duration * 1000;
                if (endTime > Date.now()) {
                    setActiveSession({ ...data, endTime });
                } else {
                    setDoc(doc.ref, { active: false }, { merge: true });
                    setActiveSession(null);
                }
            } else {
                setActiveSession(null);
            }
        });

        return () => { unsubSettings(); unsubProjects(); unsubTasks(); unsubCategories(); unsubSession(); };
    }, []);
    
    useEffect(() => { document.documentElement.classList.toggle('dark', settings.theme === 'dark'); }, [settings.theme]);

    // --- Nudge Logic ---
    const nudgeState = useMemo(() => {
        const { LEVELS, THRESHOLDS, MODES } = NUDGE_CONFIG;
        const manualMode = settings.nudgeMode;

        if (manualMode && manualMode !== MODES.AUTOMATIC) {
            const levelMap = { [MODES.REMEMBER]: LEVELS.REMEMBER, [MODES.STAY_ON_TARGET]: LEVELS.STAY_ON_TARGET, [MODES.LAZY]: LEVELS.LAZY };
            const messageMap = {
                [MODES.REMEMBER]: "Manual Mode: Gentle nudges active.",
                [MODES.STAY_ON_TARGET]: "Manual Mode: 'Stay on Target' active.",
                [MODES.LAZY]: "Manual Mode: 'Lazy Sumb...' active.",
            };
            return { level: levelMap[manualMode], message: messageMap[manualMode] };
        }
        
        const openProjectsCount = projects.filter(p => tasks.some(t => t.projectId === p.id && !t.isComplete)).length;
        const oldestProjectAge = projects.length > 0 && projects[0].createdAt ? (new Date() - projects[0].createdAt) / (1000 * 3600 * 24) : 0;
        
        if (oldestProjectAge > THRESHOLDS.PROJECT_AGE_VERY_OLD || openProjectsCount > THRESHOLDS.PROJECT_COUNT_MANY) {
            return { level: LEVELS.LAZY, message: "Automatic: Aggressive nudging active." };
        }
        if (oldestProjectAge > THRESHOLDS.PROJECT_AGE_OLD || openProjectsCount > THRESHOLDS.PROJECT_COUNT_SOME) {
            return { level: LEVELS.STAY_ON_TARGET, message: "Automatic: Nudge level: Stay on Target." };
        }
        if (oldestProjectAge > THRESHOLDS.PROJECT_AGE_OLD / 2) {
             return { level: LEVELS.REMEMBER, message: "Automatic: Gentle nudges are active." };
        }
        return { level: NUDGE_CONFIG.LEVELS.NONE, message: "All clear." };
    }, [projects, tasks, settings.nudgeMode]);

    // --- Handlers ---
    const handleSaveProject = async (projectData) => {
        if (projectData.category && !categories[projectData.category]) {
            let newCategories = { ...categories };
            newCategories[projectData.category] = generateHslColor(Object.values(categories));
            await setDoc(doc(db, basePath, 'settings', 'categories'), newCategories, { merge: true });
        }

        if (projectData.id) {
            const projectId = projectData.id;
            const { id, ...dataToUpdate } = projectData;
            await updateDoc(doc(db, basePath, 'projects', projectId), dataToUpdate);
        } else {
            const { id, ...dataToCreate } = projectData;
            await addDoc(collection(db, basePath, 'projects'), { ...dataToCreate, createdAt: new Date() });
        }
        
        setIsProjectModalOpen(false);
        setEditingProject(null);
    };

    const openNewProjectModal = () => {
        setEditingProject(null);
        setIsProjectModalOpen(true);
    };

    const openEditProjectModal = (project) => {
        setEditingProject(project);
        setIsProjectModalOpen(true);
    };

    const handleSaveTask = async (taskData) => {
        const { id, ...dataToSave } = taskData;
        if (id) {
            await updateDoc(doc(db, basePath, 'tasks', id), dataToSave);
        } else {
            await addDoc(collection(db, basePath, 'tasks'), { ...dataToSave, createdAt: new Date() });
        }
        setIsTaskDetailModalOpen(false);
        setEditingTask(null);
    };

    const handleStartTask = async (task) => {
        if (activeSession) return;
        const session = { taskId: task.id, startTime: new Date(), duration: POMODORO_CONFIG.WORK_SESSION, isDouble: false, active: true, type: 'work' };
        await setDoc(doc(db, basePath, 'tracking', 'activeSession'), session);
        await updateDoc(doc(db, basePath, 'tasks', task.id), { status: 'in-progress' });
        setActiveView('tracking');
    };
    
    const handleSessionEnd = (session) => {
        setSessionEndData(session);
        setIsSessionEndModalOpen(true);
    };

    const handleSaveSessionNotes = async (notes, markComplete, completionNotes) => {
        if (!sessionEndData) return;
        const { taskId, duration, isDouble } = sessionEndData;
        const taskRef = doc(db, basePath, 'tasks', taskId);
        
        const sessionNote = {
            date: new Date(),
            duration,
            notes: notes || "No notes for this session."
        };

        const updatePayload = {
            status: 'idle',
            sessions: arrayUnion(sessionNote)
        };
        
        if (markComplete) {
            updatePayload.isComplete = true;
            updatePayload.completedAt = new Date();
            updatePayload.completionNotes = completionNotes || "Task completed.";
        }
        
        await updateDoc(taskRef, updatePayload);
        setIsSessionEndModalOpen(false);
        setSessionEndData(null);
        
        const breakDuration = isDouble ? POMODORO_CONFIG.LONG_BREAK : POMODORO_CONFIG.SHORT_BREAK;
        await setDoc(doc(db, basePath, 'tracking', 'activeSession'), {
            startTime: new Date(),
            duration: breakDuration,
            active: true,
            type: 'break'
        });
    };
    
    const openTaskDetailForNew = (template) => {
        setEditingTask(template);
        setIsTaskDetailModalOpen(true);
    };
    
    const handleExportData = async () => {
        console.log("Starting data export...");
        try {
            const projectsQuery = query(collection(db, basePath, 'projects'));
            const tasksQuery = query(collection(db, basePath, 'tasks'));

            const [projectsSnapshot, tasksSnapshot] = await Promise.all([
                getDocs(projectsQuery),
                getDocs(tasksQuery)
            ]);

            const allTasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            const aggregatedProjects = projectsSnapshot.docs.map(pDoc => {
                const project = { id: pDoc.id, ...pDoc.data() };
                const projectTasks = allTasks.filter(t => t.projectId === project.id);
                return { ...project, tasks: projectTasks };
            });

            const exportData = {
                version: 1,
                exportedAt: new Date().toISOString(),
                settings,
                categories,
                projects: aggregatedProjects
            };

            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `nudger-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log("Export successful.");

        } catch (error) {
            console.error("Error exporting data:", error);
            alert("Data export failed. Check the console for details.");
        }
    };

    // --- Render Logic ---
    const renderView = () => {
        if (activeView === 'tracking') {
            return <TrackingView session={activeSession} tasks={tasks} userId={'shared'} onSessionEnd={handleSessionEnd} />;
        }
        if (selectedProjectId) {
            const project = projects.find(p => p.id === selectedProjectId);
            return project ? <ProjectView 
                key={project.id} 
                project={project}
                tasks={tasks.filter(t => t.projectId === project.id)}
                settings={settings} 
                categoryColor={categories[project.category]}
                onOpenTaskDetail={(task) => { setEditingTask(task); setIsTaskDetailModalOpen(true); }}
                onOpenNewTaskDetail={openTaskDetailForNew}
                onStartTask={handleStartTask}
                onEditProject={openEditProjectModal}
                nudgeState={nudgeState}
                onBack={() => setSelectedProjectId(null)} 
             /> : null;
        }
        switch (activeView) {
            case 'dashboard': return <DashboardView projects={projects} tasks={tasks} nudgeState={nudgeState} setSelectedProjectId={setSelectedProjectId} categories={categories} activeSession={activeSession} />;
            case 'projects': return <ProjectsView projects={projects} tasks={tasks} setSelectedProjectId={setSelectedProjectId} categories={categories} />;
            case 'tasks': return <TasksView tasks={tasks} projects={projects} onStartTask={handleStartTask} activeSession={activeSession}/>;
            default: return <div>Select a view</div>;
        }
    };

    return (
        <>
            <style>
                {`@keyframes fade-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } } @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.3s ease-out forwards; } .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }`}
            </style>
            <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen flex flex-col">
                <TopNavBar activeView={activeView} setActiveView={setActiveView} setIsSettingsModalOpen={setIsSettingsModalOpen} onNewProject={openNewProjectModal} hasActiveSession={!!activeSession} />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{renderView()}</main>
                {isSessionEndModalOpen && <SessionEndModal onClose={() => setIsSessionEndModalOpen(false)} onSave={handleSaveSessionNotes} />}
                {isProjectModalOpen && <ProjectModal 
                    onClose={() => {setIsProjectModalOpen(false); setEditingProject(null);}} 
                    onSave={handleSaveProject} 
                    existingProject={editingProject}
                    categories={Object.keys(categories)} 
                />}
                {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)} currentSettings={settings} onExportData={handleExportData} />}
                {isTaskDetailModalOpen && editingTask && <TaskDetailModal onClose={() => setIsTaskDetailModalOpen(false)} onSave={handleSaveTask} task={editingTask} />}
            </div>
        </>
    );
}

// --- Navigation ---
function TopNavBar({ activeView, setActiveView, setIsSettingsModalOpen, onNewProject, hasActiveSession }) {
    const navItems = [ { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'projects', label: 'Projects', icon: Briefcase }, { id: 'tasks', label: 'Tasks', icon: ListChecks }];
    if (hasActiveSession) {
        navItems.push({ id: 'tracking', label: 'Tracking', icon: TimerIcon });
    }
    return (
        <header className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700/80 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-display">Nudger</h1>
                        <nav className="hidden md:flex space-x-4">
                            {navItems.map(item => (
                                <button key={item.id} onClick={() => setActiveView(item.id)}
                                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === item.id ? 'bg-indigo-100 dark:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                                    <item.icon className="mr-2" size={18} />{item.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button onClick={onNewProject} className="hidden sm:flex items-center px-4 py-2 rounded-md text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
                            <Plus size={18} className="mr-2"/> New Project
                        </button>
                        <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><Settings size={20} /></button>
                    </div>
                </div>
            </div>
        </header>
    );
}


// --- Views ---
function DashboardView({ projects, tasks, nudgeState, setSelectedProjectId, categories, activeSession }) {
    const activeTask = activeSession && tasks.find(t => t.id === activeSession.taskId);
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                {activeSession && activeTask && <ActiveTimerWidget session={activeSession} task={activeTask} />}
                <RecommendationEngine projects={projects} tasks={tasks} />
                <NudgeStatus nudgeState={nudgeState} />
            </div>
            <div className="lg:col-span-2">
                <h2 className="text-xl font-bold mb-4">Quick Select Project</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {projects.map(project => (
                        <button key={project.id} onClick={() => setSelectedProjectId(project.id)}
                                style={{ backgroundColor: categories[project.category] }}
                                className={`w-full text-left p-4 rounded-lg transition-all text-white focus:outline-none focus:ring-2 dark:focus:ring-offset-gray-900 focus:ring-offset-2`}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = getComplementaryColor(categories[project.category])}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = categories[project.category]}>
                            <p className="font-bold truncate" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>{project.name}</p>
                            <p className="text-xs text-white/80">{project.category} - {timeAgo(project.createdAt)}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ProjectsView({ projects, tasks, setSelectedProjectId, categories }) {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">All Projects</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map(project => {
                    const projectTasks = tasks.filter(t => t.projectId === project.id && !t.isComplete).sort((a,b) => (a.createdAt || 0) - (b.createdAt || 0));
                    return (
                        <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border border-transparent hover:border-indigo-500 transition-colors flex flex-col">
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-bold">{project.name}</h3>
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full text-white" style={{backgroundColor: categories[project.category]}}>{project.category}</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Priority: {project.priority} | Created: {timeAgo(project.createdAt)}</p>
                                <div className="mt-4 border-t dark:border-gray-700 pt-3">
                                    <h4 className="text-sm font-semibold mb-2">Next Tasks:</h4>
                                    <ul className="space-y-2">
                                        {projectTasks.slice(0, 3).map(task => (
                                            <li key={task.id} className="text-sm text-gray-600 dark:text-gray-300 truncate">{task.title}</li>
                                        ))}
                                        {projectTasks.length === 0 && <li className="text-sm text-gray-400 italic">No pending tasks.</li>}
                                    </ul>
                                </div>
                            </div>
                             <button onClick={() => setSelectedProjectId(project.id)} className="w-full mt-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm">
                                View Details
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function TasksView({ tasks, projects, onStartTask, activeSession }) {
    const [filters, setFilters] = useState({ project: 'All', tag: '', dueDate: 'All' });
    const projectMap = useMemo(() => projects.reduce((acc, p) => ({...acc, [p.id]: p.name}), {}), [projects]);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const projectMatch = filters.project === 'All' || task.projectId === filters.project;
            const tagMatch = !filters.tag || (task.tags && task.tags.includes(filters.tag));
            const dateMatch = filters.dueDate === 'All' || (task.dueDate && new Date(task.dueDate) < new Date(new Date().setDate(new Date().getDate() + Number(filters.dueDate))));
            return projectMatch && tagMatch && dateMatch;
        }).sort((a,b) => (a.isComplete - b.isComplete) || (a.createdAt || 0) - (b.createdAt || 0));
    }, [tasks, filters]);

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
                    </select>
                </div>
            </div>
            <ul className="space-y-3">
                {filteredTasks.map(task => <TaskItem key={task.id} task={task} onStartTask={onStartTask} isTaskActive={activeSession?.taskId === task.id}/>)}
            </ul>
        </div>
    );
}

function TrackingView({ session, tasks, userId, onSessionEnd }) {
    const task = useMemo(() => tasks.find(t => t.id === session?.taskId), [tasks, session]);
    
    const handleStop = async () => {
        if (!userId) return;
        onSessionEnd(session);
        await setDoc(doc(db, basePath, 'tracking', 'activeSession'), { active: false }, { merge: true });
    };

    const handleDouble = async () => {
        if (!userId || !session || session.type !== 'work' ) return;
        const newDuration = POMODORO_CONFIG.WORK_SESSION * 2;
        await updateDoc(doc(db, basePath, 'tracking', 'activeSession'), {
            duration: newDuration,
            isDouble: true
        });
    }

    if (!session || !task) {
        return <div className="text-center p-10"><h2 className="text-2xl font-bold">No active session.</h2><p>Start a task from the Projects or Tasks view.</p></div>
    }

    return (
        <div className="max-w-2xl mx-auto text-center">
            <div className={`p-8 rounded-lg ${session.type === 'work' ? 'bg-indigo-600' : 'bg-green-600'}`}>
                <h2 className="text-3xl font-bold text-white">{session.type === 'work' ? 'Work Session' : 'Rest & Recharge'}</h2>
                <Timer key={session.startTime.toString()} duration={session.duration} startTime={session.startTime.toDate()} onFinish={handleStop} />
            </div>
            <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                 <h3 className="text-xl font-bold">{task.title}</h3>
                 <p className="text-gray-600 dark:text-gray-400 mt-2">{task.detail}</p>
            </div>
            <div className="mt-6 flex justify-center space-x-4">
                {session.type === 'work' && !session.isDouble && <button onClick={handleDouble} className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold">Double Session</button>}
                <button onClick={handleStop} className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold">Stop & Log</button>
            </div>
        </div>
    );
}

function ProjectView({ project, tasks, userId, settings, categoryColor, onOpenTaskDetail, onOpenNewTaskDetail, nudgeState, onBack, onStartTask, onEditProject }) {
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

// --- Components ---
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
    if (!recommendation.project) return <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"><h2 className="text-lg font-semibold text-green-500 dark:text-green-400 flex items-center"><Zap size={18} className="mr-2"/>All Clear!</h2><p className="text-gray-500 dark:text-gray-400 text-sm mt-1">No pending tasks.</p></div>;
    return <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"><h2 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 flex items-center"><Target size={18} className="mr-2"/>Recommended Next Task</h2><div className="mt-2 text-sm"><p className="font-medium text-gray-800 dark:text-gray-200">{recommendation.task.title}</p><p className="text-gray-600 dark:text-gray-400">From project: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{recommendation.project.name}</span></p><p className="text-gray-500 dark:text-gray-500 text-xs">Priority: {recommendation.project.priority || 'Medium'} | Score: {recommendation.project.score.toFixed(2)}</p></div></div>;
});

function NudgeStatus({ nudgeState }) {
    const { LEVELS } = NUDGE_CONFIG;
    const colorClasses = {
        [LEVELS.NONE]: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20",
        [LEVELS.REMEMBER]: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
        [LEVELS.STAY_ON_TARGET]: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20",
        [LEVELS.LAZY]: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
    };
    return <div className={`p-3 rounded-lg border text-sm flex items-center bg-white dark:bg-gray-800 ${colorClasses[nudgeState.level]}`}><ShieldAlert size={18} className="mr-3 flex-shrink-0" /><div><p className="font-semibold">Nudge Status:</p><p className="text-xs">{nudgeState.message}</p></div></div>;
}

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

function Timer({ duration, startTime, onFinish }) {
    const [remaining, setRemaining] = useState(duration);

    useEffect(() => {
        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTime.getTime()) / 1000;
            const newRemaining = Math.max(0, Math.floor(duration - elapsed));
            setRemaining(newRemaining);

            if (newRemaining <= 0) {
                clearInterval(interval);
                try { new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg").play(); } catch(e) { console.error("Audio playback failed", e); }
                onFinish();
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [duration, startTime, onFinish]);

    return <div className="text-8xl font-bold my-4 text-white font-mono">{formatTime(remaining)}</div>;
}

function ActiveTimerWidget({ session, task }) {
    return (
        <div className={`p-4 rounded-lg shadow ${session.type === 'work' ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-green-100 dark:bg-green-900/50'}`}>
            <h3 className="font-bold text-lg">{session.type === 'work' ? 'Working On:' : 'On Break'}</h3>
            {session.type === 'work' && <p className="truncate">{task.title}</p>}
            <div className="text-center text-3xl font-mono my-2"><Timer key={session.startTime.toString()} duration={session.duration} startTime={session.startTime.toDate()} onFinish={() => {}} /></div>
        </div>
    )
}

// --- MODALS ---
function ProjectModal({ onClose, onSave, existingProject, categories }) {
    const [name, setName] = useState(existingProject?.name || '');
    const [category, setCategory] = useState(existingProject?.category || '');
    const [url, setUrl] = useState(existingProject?.url || '');
    const [priority, setPriority] = useState(existingProject?.priority || 3);
    const [isNewCategory, setIsNewCategory] = useState(!existingProject && categories.length === 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !category.trim()) return;
        onSave({ id: existingProject?.id, name, category, url, priority: Number(priority) });
    };

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        if (value === '__NEW__') {
            setIsNewCategory(true);
            setCategory('');
        } else {
            setIsNewCategory(false);
            setCategory(value);
        }
    };
    
    useEffect(() => {
        if (!existingProject && categories.length > 0) {
            setCategory(categories[0]);
        }
    }, [existingProject, categories]);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in-fast">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-semibold mb-4">{existingProject ? 'Edit Project' : 'Create New Project'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Project Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full mt-1 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Category</label>
                        <div className="flex items-center space-x-2">
                           <select value={isNewCategory ? '__NEW__' : category} onChange={handleCategoryChange} className="w-full mt-1 bg-gray-100 dark:bg-gray-700 rounded-md p-2 text-sm">
                                <option value="" disabled>Select category...</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                <option value="__NEW__">-- Create New Category --</option>
                            </select>
                        </div>
                         {isNewCategory && (
                             <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="Enter new category name" required className="w-full mt-2 bg-gray-100 dark:bg-gray-700 rounded-md p-2 text-sm"/>
                         )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-sm font-medium">Priority</label>
                           <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full mt-1 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm">
                               <option value={1}>Low</option>
                               <option value={3}>Medium</option>
                               <option value={5}>High</option>
                               <option value={10}>Urgent</option>
                           </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">URL (Optional)</label>
                            <input type="url" value={url} onChange={e => setUrl(e.target.value)} className="w-full mt-1 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"/>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SettingsModal({ onClose, currentSettings, onExportData }) {
    const [ntfyUrl, setNtfyUrl] = useState(currentSettings.ntfyUrl || '');
    const [nudgeMode, setNudgeMode] = useState(currentSettings.nudgeMode || NUDGE_CONFIG.MODES.AUTOMATIC);
    const [theme, setTheme] = useState(currentSettings.theme || 'dark');
    
    const handleSave = async () => {
        const settingsRef = doc(db, basePath, 'settings', 'config');
        try {
            await setDoc(settingsRef, { ntfyUrl, nudgeMode, theme }, { merge: true });
            onClose();
        } catch(e) { console.error("Error saving settings:", e) }
    };
    
    const NudgeDescription = ({mode}) => {
        const descriptions = {
            [NUDGE_CONFIG.MODES.AUTOMATIC]: "System automatically adjusts based on workload.",
            [NUDGE_CONFIG.MODES.REMEMBER]: "Gentle reminders every 10 tasks on non-recommended projects.",
            [NUDGE_CONFIG.MODES.STAY_ON_TARGET]: "Warns on new project creation; nudges every 5 tasks.",
            [NUDGE_CONFIG.MODES.LAZY]: "Blocks new projects; nudges every 2 tasks.",
        };
        return <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{descriptions[mode]}</p>
    }

    return (
         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in-fast">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
                 <button onClick={onClose} className="absolute top-3 right-3 p-1 text-gray-400 hover:text-white"><X size={20}/></button>
                <h3 className="text-xl font-semibold mb-4">Settings</h3>
                <div className="space-y-6">
                    <div>
                        <label className="text-sm font-medium">Nudge Mode</label>
                        <select value={nudgeMode} onChange={e => setNudgeMode(e.target.value)} className="w-full mt-1 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm">
                            <option value={NUDGE_CONFIG.MODES.AUTOMATIC}>Automatic</option>
                            <option value={NUDGE_CONFIG.MODES.REMEMBER}>Level 1: Remember</option>
                            <option value={NUDGE_CONFIG.MODES.STAY_ON_TARGET}>Level 2: Stay on Target</option>
                            <option value={NUDGE_CONFIG.MODES.LAZY}>Level 3: Lazy Sumb...</option>
                        </select>
                        <NudgeDescription mode={nudgeMode} />
                    </div>
                     <div>
                        <label className="text-sm font-medium">Theme</label>
                        <div className="mt-1 flex rounded-md bg-gray-100 dark:bg-gray-700 p-1">
                            <button onClick={()=>setTheme('light')} className={`w-1/2 py-1 text-sm rounded-md flex items-center justify-center transition-colors ${theme === 'light' ? 'bg-white dark:bg-gray-500/50' : ''}`}><Sun className="mr-2" size={16}/>Light</button>
                            <button onClick={()=>setTheme('dark')} className={`w-1/2 py-1 text-sm rounded-md flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-black/20 dark:bg-gray-900' : ''}`}><Moon className="mr-2" size={16}/>Dark</button>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium">ntfy.sh Topic URL</label>
                        <input type="url" value={ntfyUrl} onChange={e => setNtfyUrl(e.target.value)} placeholder="https://ntfy.sh/your-topic"
                               className="w-full mt-1 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"/>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                         <label className="text-sm font-medium">Data Management</label>
                         <button onClick={onExportData} className="w-full mt-2 flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                            <Download size={16} className="mr-2"/> Export All Data
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Download a JSON file of all your projects and tasks.</p>
                    </div>
                </div>
                 <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 rounded-md text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white">Save Settings</button>
                </div>
            </div>
        </div>
    );
}
function SessionEndModal({ onClose, onSave }) {
    const [notes, setNotes] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [completionNotes, setCompletionNotes] = useState('');

    const handleSave = () => {
        onSave(notes, isComplete, completionNotes);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h3 className="text-xl font-semibold mb-4">Session Complete!</h3>
                <div>
                    <label className="text-sm font-medium">Session Notes</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="w-full mt-1 bg-gray-100 dark:bg-gray-700 rounded-md p-2" placeholder="What did you accomplish?"/>
                </div>
                <div className="mt-4">
                    <label className="flex items-center">
                        <input type="checkbox" checked={isComplete} onChange={e => setIsComplete(e.target.checked)} className="h-4 w-4 rounded text-indigo-600"/>
                        <span className="ml-2">Mark task as complete</span>
                    </label>
                </div>
                {isComplete && (
                    <div className="mt-4">
                        <label className="text-sm font-medium">Completion Notes</label>
                        <textarea value={completionNotes} onChange={e => setCompletionNotes(e.target.value)} rows={2} className="w-full mt-1 bg-gray-100 dark:bg-gray-700 rounded-md p-2" placeholder="Final thoughts on this task..."/>
                    </div>
                )}
                <div className="flex justify-end space-x-3 pt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-600">Cancel</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 rounded-md bg-indigo-600 text-white">Save & End</button>
                </div>
            </div>
        </div>
    );
}

function TaskDetailModal({ onClose, onSave, task }) {
    const [title, setTitle] = useState(task.title || '');
    const [detail, setDetail] = useState(task.detail || '');
    const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    const [tags, setTags] = useState(task.tags?.join(', ') || '');
    const handleSubmit = (e) => { e.preventDefault(); onSave({ ...task, title, detail, dueDate: dueDate ? new Date(dueDate) : null, tags: tags.split(',').map(t => t.trim()).filter(Boolean) }); };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in-fast">
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-semibold mb-4">{task.id ? 'Edit Task' : 'Add New Task'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full mt-1 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Details</label>
                        <textarea value={detail} onChange={e => setDetail(e.target.value)} rows={4} className="w-full mt-1 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Due Date</label>
                            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full mt-1 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"/>
                        </div>
                         <div>
                            <label className="text-sm font-medium">Tags (comma-separated)</label>
                            <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full mt-1 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"/>
                        </div>
                    </div>
                     <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white">Save Task</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
