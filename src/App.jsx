import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
    getDocs,
    writeBatch
} from 'firebase/firestore';
import { Plus, Zap, Target, Folder, Link, Calendar, Hash, Settings, X, Tag, Edit2, ShieldAlert, LayoutDashboard, ListChecks, Briefcase, Sun, Moon, PlayCircle, Timer as TimerIcon, Coffee, Square, CheckCircle, Download, Upload, Beaker, Archive, ArchiveRestore, Users } from 'lucide-react';

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const basePath = `artifacts/${appId}/public/data`;

// --- Configs ---
const NUDGE_CONFIG = {
    LEVELS: { NONE: 0, REMEMBER: 1, STAY_ON_TARGET: 2, LAZY: 3 },
    MODES: { AUTOMATIC: 'Automatic', REMEMBER: 'Remember', STAY_ON_TARGET: 'Stay on Target', LAZY: 'Lazy' },
    THRESHOLDS: { PROJECT_AGE_OLD: 30, PROJECT_AGE_VERY_OLD: 90, PROJECT_COUNT_SOME: 5, PROJECT_COUNT_MANY: 10, TASK_INTERVAL_LEVEL_1: 10, TASK_INTERVAL_LEVEL_2: 5, TASK_INTERVAL_LEVEL_3: 2 }
};
const POMODORO_CONFIG = { WORK_SESSION: 25 * 60, SHORT_BREAK: 5 * 60, LONG_BREAK: 10 * 60 };

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
    const [settings, setSettings] = useState({ ntfyUrl: '', totalTasksCompleted: 0, nudgeMode: NUDGE_CONFIG.MODES.AUTOMATIC, theme: 'dark', ownerFilter: 'All' });
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
    const [isImportConfirmModalOpen, setIsImportConfirmModalOpen] = useState(false);
    const [fileToImport, setFileToImport] = useState(null);

    // --- Memoized derived state ---
    const activeTask = useMemo(() => activeSession ? tasks.find(t => t.id === activeSession.taskId) : null, [activeSession, tasks]);
    const selectedProject = useMemo(() => selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null, [selectedProjectId, projects]);
    const owners = useMemo(() => ['All', ...new Set(projects.map(p => p.owner).filter(Boolean))], [projects]);
    const visibleProjects = useMemo(() => {
        return projects.filter(p => {
            const ownerMatch = settings.ownerFilter === 'All' || p.owner === settings.ownerFilter;
            const statusMatch = p.status === 'active' || p.status === 'inactive';
            return ownerMatch && statusMatch;
        });
    }, [projects, settings.ownerFilter]);

    // --- Effects ---
    useEffect(() => {
        const settingsDocRef = doc(db, basePath, 'settings', 'config');
        const unsubSettings = onSnapshot(settingsDocRef, (doc) => setSettings(doc.exists() ? { ownerFilter: 'All', ...doc.data() } : { ntfyUrl: '', totalTasksCompleted: 0, nudgeMode: NUDGE_CONFIG.MODES.AUTOMATIC, theme: 'dark', ownerFilter: 'All' }));
        const projectsQuery = query(collection(db, basePath, 'projects'));
        const unsubProjects = onSnapshot(projectsQuery, s => setProjects(s.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate() }))));
        const unsubTasks = onSnapshot(query(collection(db, basePath, 'tasks')), s => setTasks(s.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate(), completedAt: d.data().completedAt?.toDate(), dueDate: d.data().dueDate?.toDate() }))));
        const unsubCategories = onSnapshot(doc(db, basePath, 'settings', 'categories'), doc => setCategories(doc.exists() ? doc.data() : {}));
        const unsubSession = onSnapshot(doc(db, basePath, 'tracking', 'activeSession'), (doc) => {
            if (doc.exists() && doc.data().active) {
                const data = doc.data();
                const endTime = data.startTime.toDate().getTime() + data.duration * 1000;
                if (endTime > Date.now()) { setActiveSession({ ...data, endTime }); } 
                else { setDoc(doc.ref, { active: false }, { merge: true }); setActiveSession(null); }
            } else {
                setActiveSession(null);
            }
        });
        return () => { unsubSettings(); unsubProjects(); unsubTasks(); unsubCategories(); unsubSession(); };
    }, []);
    
    useEffect(() => { document.documentElement.classList.toggle('dark', settings.theme === 'dark'); }, [settings.theme]);
    useEffect(() => {
        let title = "Project Nudger";
        if (activeView === 'tracking' && activeTask) { title = `Tracking: ${activeTask.title} | Nudger`; } 
        else if (selectedProject) { title = `${selectedProject.name} | Nudger`; } 
        else { const viewName = activeView.charAt(0).toUpperCase() + activeView.slice(1); title = `${viewName} | Nudger`; }
        document.title = title;
    }, [activeView, selectedProject, activeTask]);

    const nudgeState = useMemo(() => {
        const activeProjects = projects.filter(p => p.status === 'active');
        const openProjectsCount = activeProjects.filter(p => tasks.some(t => t.projectId === p.id && !t.isComplete)).length;
        const oldestProjectAge = activeProjects.length > 0 && activeProjects[0].createdAt ? (new Date() - activeProjects[0].createdAt) / (1000 * 3600 * 24) : 0;
        const { LEVELS, THRESHOLDS, MODES } = NUDGE_CONFIG;
        const manualMode = settings.nudgeMode;
        if (manualMode && manualMode !== MODES.AUTOMATIC) {
            const levelMap = { [MODES.REMEMBER]: LEVELS.REMEMBER, [MODES.STAY_ON_TARGET]: LEVELS.STAY_ON_TARGET, [MODES.LAZY]: LEVELS.LAZY };
            const messageMap = { [MODES.REMEMBER]: "Manual Mode: Gentle nudges active.", [MODES.STAY_ON_TARGET]: "Manual Mode: 'Stay on Target' active.", [MODES.LAZY]: "Manual Mode: 'Lazy Sumb...' active." };
            return { level: levelMap[manualMode], message: messageMap[manualMode] };
        }
        if (oldestProjectAge > THRESHOLDS.PROJECT_AGE_VERY_OLD || openProjectsCount > THRESHOLDS.PROJECT_COUNT_MANY) return { level: LEVELS.LAZY, message: "Automatic: Aggressive nudging active." };
        if (oldestProjectAge > THRESHOLDS.PROJECT_AGE_OLD || openProjectsCount > THRESHOLDS.PROJECT_COUNT_SOME) return { level: LEVELS.STAY_ON_TARGET, message: "Automatic: Nudge level: Stay on Target." };
        if (oldestProjectAge > THRESHOLDS.PROJECT_AGE_OLD / 2) return { level: LEVELS.REMEMBER, message: "Automatic: Gentle nudges are active." };
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
            const { id, ...dataToUpdate } = projectData;
            await updateDoc(doc(db, basePath, 'projects', id), dataToUpdate);
        } else {
            const { id, ...dataToCreate } = projectData;
            await addDoc(collection(db, basePath, 'projects'), { ...dataToCreate, status: 'active', createdAt: new Date() });
        }
        setIsProjectModalOpen(false);
        setEditingProject(null);
    };

    const handleSaveTask = async (taskData) => {
        const { id, ...dataToSave } = taskData;
        if (id) { await updateDoc(doc(db, basePath, 'tasks', id), dataToSave); } 
        else { await addDoc(collection(db, basePath, 'tasks'), { ...dataToSave, createdAt: new Date() }); }
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
    
    const handleExportData = async () => {
        try {
            const [projectsSnapshot, tasksSnapshot] = await Promise.all([
                getDocs(query(collection(db, basePath, 'projects'))),
                getDocs(query(collection(db, basePath, 'tasks')))
            ]);
            const allTasks = tasksSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            const aggregatedProjects = projectsSnapshot.docs.map(pDoc => {
                const project = { id: pDoc.id, ...pDoc.data() };
                const projectTasks = allTasks.filter(t => t.projectId === project.id);
                return { ...project, tasks: projectTasks };
            });
            const exportData = { version: 1, exportedAt: new Date().toISOString(), settings, categories, projects: aggregatedProjects };
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
        } catch (error) {
            console.error("Error exporting data:", error);
            alert("Data export failed. Check console for details.");
        }
    };

    const handleFileSelectedForImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            setFileToImport(e.target.result);
            setIsImportConfirmModalOpen(true);
        };
        reader.readAsText(file);
        event.target.value = null; 
    };

    const executeImport = async () => {
        if (!fileToImport) return;
        try {
            const data = JSON.parse(fileToImport);
            if (!data.version || !data.projects || !data.settings || !data.categories) throw new Error("Invalid or malformed import file.");
            const batch = writeBatch(db);
            batch.set(doc(db, basePath, 'settings', 'config'), data.settings);
            batch.set(doc(db, basePath, 'settings', 'categories'), data.categories);
            data.projects.forEach(project => {
                if (!project.id) { console.warn("Skipping project with no ID:", project); return; }
                const { tasks: projectTasks, ...projectData } = project;
                batch.set(doc(db, basePath, 'projects', project.id), projectData);
                if(projectTasks?.length) {
                    projectTasks.forEach(task => {
                        if (!task.id || !task.projectId) { console.warn("Skipping task with missing ID or projectId:", task); return; }
                        batch.set(doc(db, basePath, 'tasks', task.id), task);
                    });
                }
            });
            await batch.commit();
            alert("Data imported successfully!");
        } catch (error) {
            console.error("Import failed:", error);
            alert(`Import failed: ${error.message}`);
        } finally {
            setFileToImport(null);
            setIsImportConfirmModalOpen(false);
        }
    };
    
    const openNewProjectModal = () => { setEditingProject(null); setIsProjectModalOpen(true); };
    const openEditProjectModal = (project) => { setEditingProject(project); setIsProjectModalOpen(true); };
    const handleSessionEnd = (session) => { setSessionEndData(session); setIsSessionEndModalOpen(true); };
    const openTaskDetailForNew = (template) => { setEditingTask(template); setIsTaskDetailModalOpen(true); };
    const handleSaveSessionNotes = async (notes, markComplete, completionNotes) => {
        if (!sessionEndData) return;
        const { taskId, duration, isDouble } = sessionEndData;
        const taskRef = doc(db, basePath, 'tasks', taskId);
        const sessionNote = { date: new Date(), duration, notes: notes || "No notes for this session." };
        const updatePayload = { status: 'idle', sessions: arrayUnion(sessionNote) };
        if (markComplete) {
            updatePayload.isComplete = true;
            updatePayload.completedAt = new Date();
            updatePayload.completionNotes = completionNotes || "Task completed.";
        }
        await updateDoc(taskRef, updatePayload);
        setIsSessionEndModalOpen(false);
        setSessionEndData(null);
        const breakDuration = isDouble ? POMODORO_CONFIG.LONG_BREAK : POMODORO_CONFIG.SHORT_BREAK;
        await setDoc(doc(db, basePath, 'tracking', 'activeSession'), { startTime: new Date(), duration: breakDuration, active: true, type: 'break' });
    };

    const generateDummyData = async () => {
        if (!confirm("This will add several dummy projects and tasks to your database. Are you sure?")) return;
        try {
            const batch = writeBatch(db);
            const dummyCategories = { "Work": "hsl(210, 70%, 50%)", "Personal": "hsl(140, 70%, 50%)", "Learning": "hsl(45, 70%, 50%)" };
            batch.set(doc(db, basePath, 'settings', 'categories'), dummyCategories);
            const projectsToAdd = [
                { id: 'dummy_proj_1', name: 'Q3 Report Finalization', owner: 'Matt Mariani', category: 'Work', priority: 10, status: 'active', createdAt: new Date() },
                { id: 'dummy_proj_2', name: 'Home Reno Planning', owner: 'Mara Mariani', category: 'Personal', priority: 5, status: 'active', createdAt: new Date(Date.now() - 40 * 24 * 3600 * 1000) },
                { id: 'dummy_proj_3', name: 'Learn Rust Programming', owner: 'Matt Mariani', category: 'Learning', priority: 3, status: 'inactive', createdAt: new Date(Date.now() - 100 * 24 * 3600 * 1000) },
            ];
            const tasksToAdd = [
                { projectId: 'dummy_proj_1', title: "Compile financial data", detail: "Get spreadsheets from finance team.", status: 'idle', isComplete: false },
                { projectId: 'dummy_proj_1', title: "Draft executive summary", detail: "", status: 'idle', isComplete: false },
                { projectId: 'dummy_proj_2', title: "Get quotes for kitchen cabinets", detail: "", status: 'idle', isComplete: false },
                { projectId: 'dummy_proj_2', title: "Choose paint colors", detail: "Leaning towards a neutral gray.", status: 'idle', isComplete: false },
                { projectId: 'dummy_proj_3', title: "Read the official Rust book", detail: "Focus on chapters 1-5.", status: 'idle', isComplete: false },
            ];
            projectsToAdd.forEach(proj => batch.set(doc(db, basePath, 'projects', proj.id), proj));
            tasksToAdd.forEach(task => batch.set(doc(collection(db, basePath, 'tasks')), task));
            await batch.commit();
            alert("Dummy data generated successfully!");
        } catch (error) {
            console.error("Dummy data generation failed:", error);
            alert("Failed to generate dummy data. Check console for details.");
        }
    };

    // --- Render Logic ---
    const renderView = () => {
        if (activeView === 'archived') { return <ArchivedProjectsView allProjects={projects} onSaveProject={handleSaveProject}/>; }
        if (activeView === 'tracking') { return <TrackingView session={activeSession} tasks={tasks} onSessionEnd={handleSessionEnd} />; }
        if (selectedProjectId) {
            return <ProjectView 
                project={selectedProject} tasks={tasks.filter(t => t.projectId === selectedProjectId)}
                settings={settings} categoryColor={categories[selectedProject.category]}
                onOpenTaskDetail={(task) => { setEditingTask(task); setIsTaskDetailModalOpen(true); }}
                onOpenNewTaskDetail={openTaskDetailForNew} onStartTask={handleStartTask}
                onEditProject={openEditProjectModal} nudgeState={nudgeState} onBack={() => setSelectedProjectId(null)} 
             />;
        }
        switch (activeView) {
            case 'dashboard': return <DashboardView projects={visibleProjects} tasks={tasks} nudgeState={nudgeState} setSelectedProjectId={setSelectedProjectId} categories={categories} activeSession={activeSession} />;
            case 'projects': return <ProjectsView projects={visibleProjects} tasks={tasks} setSelectedProjectId={setSelectedProjectId} categories={categories} />;
            case 'tasks': return <TasksView tasks={tasks} projects={projects} onStartTask={handleStartTask} activeSession={activeSession}/>;
            default: return <div>Select a view</div>;
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen flex flex-col">
            <TopNavBar activeView={activeView} setActiveView={setActiveView} setIsSettingsModalOpen={setIsSettingsModalOpen} onNewProject={openNewProjectModal} hasActiveSession={!!activeSession} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{renderView()}</main>
            {isImportConfirmModalOpen && <ImportConfirmModal onClose={() => setIsImportConfirmModalOpen(false)} onConfirm={executeImport} />}
            {isProjectModalOpen && <ProjectModal onClose={() => {setIsProjectModalOpen(false); setEditingProject(null);}} onSave={handleSaveProject} existingProject={editingProject} categories={Object.keys(categories)} />}
            {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)} currentSettings={settings} onExportData={handleExportData} onFileSelectedForImport={handleFileSelectedForImport} onGenerateDummyData={generateDummyData} owners={owners} />}
            {isTaskDetailModalOpen && editingTask && <TaskDetailModal onClose={() => setIsTaskDetailModalOpen(false)} onSave={handleSaveTask} task={editingTask} />}
            {isSessionEndModalOpen && <SessionEndModal onClose={() => setIsSessionEndModalOpen(false)} onSave={handleSaveSessionNotes} />}
        </div>
    );
}

// --- Components ---
const NudgerLogo = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600 dark:text-indigo-400">
        <path d="M7.5 19.5C6.83333 17.6667 6.5 15.3333 6.5 12.5C6.5 9.66667 6.83333 7.33333 7.5 5.5M12 21C10 18.1667 9 15.1667 9 12C9 8.83333 10 5.83333 12 3M16.5 19.5C17.1667 17.6667 17.5 15.3333 17.5 12.5C17.5 9.66667 17.1667 7.33333 16.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M3.50989 9H6.50989" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M3.50989 15H6.50989" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M17.5099 9H20.5099" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M17.5099 15H20.5099" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
);

function TopNavBar({ activeView, setActiveView, setIsSettingsModalOpen, onNewProject, hasActiveSession }) {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'projects', label: 'Projects', icon: Briefcase },
        { id: 'tasks', label: 'Tasks', icon: ListChecks },
        { id: 'archived', label: 'Archived', icon: Archive },
    ];
    if (hasActiveSession) { navItems.splice(3, 0, { id: 'tracking', label: 'Tracking', icon: TimerIcon }); }
    return (
        <header className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700/80 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-2">
                            <NudgerLogo />
                            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 font-display">Project Nudger</h1>
                        </div>
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

function DashboardView({ projects, tasks, nudgeState, setSelectedProjectId, categories, activeSession }) { /* ... includes ProjectFilters */ return <div></div>}
function ProjectsView({ projects, tasks, setSelectedProjectId, categories }) { /* ... */ return <div></div>}
function TasksView({ tasks, projects, onStartTask, activeSession }) { /* ... */ return <div></div>}
function TrackingView({ session, tasks, onSessionEnd }) { /* ... */ return <div></div>}
function ProjectView({ project, tasks, settings, categoryColor, onOpenTaskDetail, onOpenNewTaskDetail, nudgeState, onBack, onStartTask, onEditProject }) { /* ... */ return <div></div>}
const RecommendationEngine = React.memo(({ projects, tasks }) => { /* ... */ return <div></div>});
function NudgeStatus({ nudgeState }) { /* ... */ return <div></div>}
function TaskItem({ task, onToggle, onOpenDetail, onStartTask, isTaskActive }) { /* ... */ return <div></div>}
function Timer({ duration, startTime, onFinish }) { /* ... */ return <div></div>}
function ActiveTimerWidget({ session, task }) { /* ... */ return <div></div>}
function ArchivedProjectsView({ allProjects, onSaveProject }) { /* ... */ return <div></div> }

// --- MODALS ---
function ProjectModal({ onClose, onSave, existingProject, categories }) {
    const [name, setName] = useState(existingProject?.name || '');
    const [owner, setOwner] = useState(existingProject?.owner || '');
    const [category, setCategory] = useState(existingProject?.category || '');
    const [url, setUrl] = useState(existingProject?.url || '');
    const [priority, setPriority] = useState(existingProject?.priority || 3);
    const [status, setStatus] = useState(existingProject?.status || 'active');
    const [isNewCategory, setIsNewCategory] = useState(!existingProject && categories.length === 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !category.trim() || !owner.trim()) return;
        onSave({ id: existingProject?.id, name, owner, category, url, priority: Number(priority), status });
    };

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        if (value === '__NEW__') { setIsNewCategory(true); setCategory(''); } 
        else { setIsNewCategory(false); setCategory(value); }
    };
    
    useEffect(() => { if (!existingProject && categories.length > 0) setCategory(categories[0]); }, [existingProject, categories]);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in-fast">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-semibold mb-4">{existingProject ? 'Edit Project' : 'Create New Project'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Project Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full mt-1 bg-gray-100 dark:bg-gray-700 rounded-md p-2 text-sm"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-sm font-medium">Owner</label>
                           <input type="text" value={owner} onChange={e => setOwner(e.target.value)} required placeholder="e.g., Matt Mariani" className="w-full mt-1 bg-gray-100 dark:bg-gray-700 rounded-md p-2 text-sm"/>
                        </div>
                        <div>
                           <label className="text-sm font-medium">Status</label>
                           <select value={status} onChange={e => setStatus(e.target.value)} className="w-full mt-1 bg-gray-100 dark:bg-gray-700 rounded-md p-2 text-sm">
                               <option value="active">Active</option>
                               <option value="inactive">Inactive</option>
                               <option value="archived">Archived</option>
                           </select>
                        </div>
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
                         {isNewCategory && (<input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="Enter new category name" required className="w-full mt-2 bg-gray-100 dark:bg-gray-700 rounded-md p-2 text-sm"/>)}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-sm font-medium">Priority</label>
                           <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full mt-1 bg-gray-100 dark:bg-gray-700 rounded-md p-2 text-sm">
                               <option value={1}>Low</option>
                               <option value={3}>Medium</option>
                               <option value={5}>High</option>
                               <option value={10}>Urgent</option>
                           </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">URL (Optional)</label>
                            <input type="url" value={url} onChange={e => setUrl(e.target.value)} className="w-full mt-1 bg-gray-100 dark:bg-gray-700 rounded-md p-2 text-sm"/>
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

function SettingsModal({ onClose, currentSettings, onExportData, onFileSelectedForImport, onGenerateDummyData, owners }) {
    const fileInputRef = useRef(null);
    const [localSettings, setLocalSettings] = useState(currentSettings);

    const handleSave = async () => {
        const { ownerFilter, ...settingsToSave } = localSettings;
        const settingsRef = doc(db, basePath, 'settings', 'config');
        try {
            await setDoc(settingsRef, settingsToSave, { merge: true });
            onClose();
        } catch(e) { console.error("Error saving settings:", e) }
    };
    
    // ...
}

function ImportConfirmModal({ onClose, onConfirm }) { /* ... */ return <div></div>}
function SessionEndModal({ onClose, onSave }) { /* ... */ return <div></div>}
function TaskDetailModal({ onClose, onSave, task }) { /* ... */ return <div></div>}
