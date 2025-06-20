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
import { Plus, Zap, Target, Folder, Link, Calendar, Hash, Settings, X, Tag, Edit2, ShieldAlert, LayoutDashboard, ListChecks, Briefcase, Sun, Moon, PlayCircle, Timer as TimerIcon, Coffee, Square, CheckCircle, Download, Upload } from 'lucide-react';

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

// --- Nudge System & Pomodoro Configs ---
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
    const [isImportConfirmModalOpen, setIsImportConfirmModalOpen] = useState(false);
    const [fileToImport, setFileToImport] = useState(null);

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
            const messageMap = { [MODES.REMEMBER]: "Manual Mode: Gentle nudges active.", [MODES.STAY_ON_TARGET]: "Manual Mode: 'Stay on Target' active.", [MODES.LAZY]: "Manual Mode: 'Lazy Sumb...' active." };
            return { level: levelMap[manualMode], message: messageMap[manualMode] };
        }
        const openProjectsCount = projects.filter(p => tasks.some(t => t.projectId === p.id && !t.isComplete)).length;
        const oldestProjectAge = projects.length > 0 && projects[0].createdAt ? (new Date() - projects[0].createdAt) / (1000 * 3600 * 24) : 0;
        if (oldestProjectAge > THRESHOLDS.PROJECT_AGE_VERY_OLD || openProjectsCount > THRESHOLDS.PROJECT_COUNT_MANY) return { level: LEVELS.LAZY, message: "Automatic: Aggressive nudging active." };
        if (oldestProjectAge > THRESHOLDS.PROJECT_AGE_OLD || openProjectsCount > THRESHOLDS.PROJECT_COUNT_SOME) return { level: LEVELS.STAY_ON_TARGET, message: "Automatic: Nudge level: Stay on Target." };
        if (oldestProjectAge > THRESHOLDS.PROJECT_AGE_OLD / 2) return { level: LEVELS.REMEMBER, message: "Automatic: Gentle nudges are active." };
        return { level: NUDGE_CONFIG.LEVELS.NONE, message: "All clear." };
    }, [projects, tasks, settings.nudgeMode]);

    // --- Handlers ---
    const handleSaveProject = async (projectData) => { /* ... see previous versions ... */ };
    const handleSaveTask = async (taskData) => { /* ... see previous versions ... */ };
    const handleStartTask = async (task) => { /* ... see previous versions ... */ };
    const openNewProjectModal = () => { setEditingProject(null); setIsProjectModalOpen(true); };
    const openEditProjectModal = (project) => { setEditingProject(project); setIsProjectModalOpen(true); };
    const handleSessionEnd = (session) => { setSessionEndData(session); setIsSessionEndModalOpen(true); };
    const handleSaveSessionNotes = async (notes, markComplete, completionNotes) => { /* ... see previous versions ... */ };
    const openTaskDetailForNew = (template) => { setEditingTask(template); setIsTaskDetailModalOpen(true); };
    
    const handleExportData = async () => {
        try {
            const [projectsSnapshot, tasksSnapshot] = await Promise.all([
                getDocs(query(collection(db, basePath, 'projects'))),
                getDocs(query(collection(db, basePath, 'tasks')))
            ]);
            const allTasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
            alert("Data export failed. Check the console for details.");
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
            const settingsRef = doc(db, basePath, 'settings', 'config');
            batch.set(settingsRef, data.settings);
            const categoriesRef = doc(db, basePath, 'settings', 'categories');
            batch.set(categoriesRef, data.categories);

            data.projects.forEach(project => {
                const { tasks: projectTasks, ...projectData } = project;
                const projectRef = doc(db, basePath, 'projects', project.id);
                batch.set(projectRef, projectData);
                if(projectTasks?.length) {
                    projectTasks.forEach(task => {
                        const taskRef = doc(db, basePath, 'tasks', task.id);
                        batch.set(taskRef, task);
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

    // --- Render Logic ---
    const renderView = () => {
        if (activeView === 'tracking') {
            return <TrackingView session={activeSession} tasks={tasks} userId={'shared'} onSessionEnd={handleSessionEnd} />;
        }
        if (selectedProjectId) {
            const project = projects.find(p => p.id === selectedProjectId);
            return project ? <ProjectView 
                key={project.id} project={project} tasks={tasks.filter(t => t.projectId === project.id)}
                settings={settings} categoryColor={categories[project.category]}
                onOpenTaskDetail={(task) => { setEditingTask(task); setIsTaskDetailModalOpen(true); }}
                onOpenNewTaskDetail={openTaskDetailForNew} onStartTask={handleStartTask}
                onEditProject={openEditProjectModal} nudgeState={nudgeState} onBack={() => setSelectedProjectId(null)} 
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
            <style>{`/* ... */`}</style>
            <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen flex flex-col">
                <TopNavBar activeView={activeView} setActiveView={setActiveView} setIsSettingsModalOpen={setIsSettingsModalOpen} onNewProject={openNewProjectModal} hasActiveSession={!!activeSession} />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{renderView()}</main>
                {isImportConfirmModalOpen && <ImportConfirmModal onClose={() => setIsImportConfirmModalOpen(false)} onConfirm={executeImport} />}
                {isProjectModalOpen && <ProjectModal onClose={() => {setIsProjectModalOpen(false); setEditingProject(null);}} onSave={handleSaveProject} existingProject={editingProject} categories={Object.keys(categories)} />}
                {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)} currentSettings={settings} onExportData={handleExportData} onFileSelectedForImport={handleFileSelectedForImport} />}
                {isTaskDetailModalOpen && editingTask && <TaskDetailModal onClose={() => setIsTaskDetailModalOpen(false)} onSave={handleSaveTask} task={editingTask} />}
                {isSessionEndModalOpen && <SessionEndModal onClose={() => setIsSessionEndModalOpen(false)} onSave={handleSaveSessionNotes} />}
            </div>
        </>
    );
}

// --- Components ---
function TopNavBar({ activeView, setActiveView, setIsSettingsModalOpen, onNewProject, hasActiveSession }) { /* ... */ return <div></div>}
function DashboardView({ projects, tasks, nudgeState, setSelectedProjectId, categories, activeSession }) { /* ... */ return <div></div>}
function ProjectsView({ projects, tasks, setSelectedProjectId, categories }) { /* ... */ return <div></div>}
function TasksView({ tasks, projects, onStartTask, activeSession }) { /* ... */ return <div></div>}
function TrackingView({ session, tasks, userId, onSessionEnd }) { /* ... */ return <div></div>}
function ProjectView({ project, tasks, settings, categoryColor, onOpenTaskDetail, onOpenNewTaskDetail, nudgeState, onBack, onStartTask, onEditProject }) { /* ... */ return <div></div>}
const RecommendationEngine = React.memo(({ projects, tasks }) => { /* ... */ return <div></div>});
function NudgeStatus({ nudgeState }) { /* ... */ return <div></div>}
function TaskItem({ task, onToggle, onOpenDetail, onStartTask, isTaskActive }) { /* ... */ return <div></div>}
function Timer({ duration, startTime, onFinish }) { /* ... */ return <div></div>}
function ActiveTimerWidget({ session, task }) { /* ... */ return <div></div>}

// --- MODALS ---
function ProjectModal({ onClose, onSave, existingProject, categories }) { /* ... */ return <div></div>}
function SettingsModal({ onClose, currentSettings, onExportData, onFileSelectedForImport }) {
    const fileInputRef = useRef(null);
    const handleImportClick = () => fileInputRef.current.click();
    // ...
    return <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">...<input type="file" ref={fileInputRef} onChange={onFileSelectedForImport} accept=".json" className="hidden" />...</div>;
}
function ImportConfirmModal({ onClose, onConfirm }) { /* ... */ return <div></div>}
function SessionEndModal({ onClose, onSave }) { /* ... */ return <div></div>}
function TaskDetailModal({ onClose, onSave, task }) { /* ... */ return <div></div>}
