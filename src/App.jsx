import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
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

// Import configurations and utilities
import { db, basePath } from './config/firebase';
import { NUDGE_CONFIG, POMODORO_CONFIG } from './config/constants';
import { timeAgo, generateHslColor, getComplementaryColor, getAnalogousColor, formatTime } from './utils/helpers';
import { generateDummyData } from './utils/dummyData';

// Import layout components
import TopNavBar from './components/layout/TopNavBar';

// Import view components
import DashboardView from './components/views/DashboardView';
import ProjectsView from './components/views/ProjectsView';
import TasksView from './components/views/TasksView';
import TrackingView from './components/views/TrackingView';
import ArchivedProjectsView from './components/views/ArchivedProjectsView';
import ProjectView from './components/views/ProjectView';
import SettingsView from './components/views/SettingsView';

// Import shared components
import SessionCompletionModal from './components/shared/SessionCompletionModal';
import AINudgeDisplay from './components/shared/AINudgeDisplay';

// Import AI nudge service
import { generateAINudge } from './utils/aiNudgeService';


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
    const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
    const [isSessionEndModalOpen, setIsSessionEndModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [sessionEndData, setSessionEndData] = useState(null);
    const [isImportConfirmModalOpen, setIsImportConfirmModalOpen] = useState(false);
    const [fileToImport, setFileToImport] = useState(null);
    const [isSessionCompletionModalOpen, setIsSessionCompletionModalOpen] = useState(false);
    const [completedSessionType, setCompletedSessionType] = useState(null);
    const [aiNudgeRecommendations, setAiNudgeRecommendations] = useState(null);
    const [isAiNudgeDisplayOpen, setIsAiNudgeDisplayOpen] = useState(false);
    
    // --- Memoized derived state ---
    const activeTask = useMemo(() => activeSession ? tasks.find(t => t.id === activeSession.taskId) : null, [activeSession, tasks]);
    const selectedProject = useMemo(() => selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null, [selectedProjectId, projects]);
    const owners = useMemo(() => ['All', ...new Set(projects.map(p => p.owner).filter(Boolean))], [projects]);
    const visibleProjects = useMemo(() => {
        return projects.filter(p => {
            const ownerMatch = settings.ownerFilter === 'All' || p.owner === settings.ownerFilter;
            // Show projects that are active, inactive, or have no status (default to active)
            const statusMatch = !p.status || p.status === 'active' || p.status === 'inactive';
            return ownerMatch && statusMatch;
        });
    }, [projects, settings.ownerFilter]);

    // --- Effects ---
    useEffect(() => {
        const settingsDocRef = doc(db, basePath, 'settings', 'config');
        const unsubSettings = onSnapshot(settingsDocRef, (doc) => setSettings(doc.exists() ? { ownerFilter: 'All', ...doc.data() } : { ntfyUrl: '', totalTasksCompleted: 0, nudgeMode: NUDGE_CONFIG.MODES.AUTOMATIC, theme: 'dark', ownerFilter: 'All' }));
        const projectsQuery = query(collection(db, basePath, 'projects'));
        const unsubProjects = onSnapshot(projectsQuery, s => setProjects(s.docs.map(d => ({ 
            id: d.id, 
            ...d.data(), 
            createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : d.data().createdAt 
        }))));
        const unsubTasks = onSnapshot(query(collection(db, basePath, 'tasks')), s => setTasks(s.docs.map(d => ({ 
            id: d.id, 
            ...d.data(), 
            createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : d.data().createdAt,
            completedAt: d.data().completedAt?.toDate ? d.data().completedAt.toDate() : d.data().completedAt,
            dueDate: d.data().dueDate?.toDate ? d.data().dueDate.toDate() : d.data().dueDate
        }))));
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
        const oldestProjectAge = activeProjects.length > 0 && activeProjects.sort((a,b) => (a.createdAt || 0) - (b.createdAt || 0))[0].createdAt ? (new Date() - activeProjects.sort((a,b) => (a.createdAt || 0) - (b.createdAt || 0))[0].createdAt) / (1000 * 3600 * 24) : 0;
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
            // Ensure status is preserved or set to active if missing
            if (!dataToUpdate.status) {
                dataToUpdate.status = 'active';
            }
            await updateDoc(doc(db, basePath, 'projects', id), dataToUpdate);
        } else {
            const { id, ...dataToCreate } = projectData;
            await addDoc(collection(db, basePath, 'projects'), { ...dataToCreate, status: 'active', createdAt: new Date() });
        }
        setIsProjectModalOpen(false);
        setEditingProject(null);
    };

    const handleSaveTask = async (taskData) => {
        try {
            const { id, ...dataToSave } = taskData;
            
            // Remove undefined values to prevent Firestore errors
            Object.keys(dataToSave).forEach(key => {
                if (dataToSave[key] === undefined) {
                    delete dataToSave[key];
                }
            });
            
            if (id) { 
                await updateDoc(doc(db, basePath, 'tasks', id), dataToSave); 
            } else { 
                await addDoc(collection(db, basePath, 'tasks'), { ...dataToSave, createdAt: new Date() }); 
            }
            setIsTaskDetailModalOpen(false);
            setEditingTask(null);
        } catch (error) {
            console.error("Error saving task:", error);
            alert("Failed to save task. Please try again.");
        }
    };

    const handleStartTask = async (task) => {
        if (activeSession) return;
        const session = { taskId: task.id, startTime: new Date(), duration: POMODORO_CONFIG.WORK_SESSION, isDouble: false, active: true, type: 'work' };
        await setDoc(doc(db, basePath, 'tracking', 'activeSession'), session);
        await updateDoc(doc(db, basePath, 'tasks', task.id), { status: 'in-progress' });
        setActiveView('tracking');
    };

    // Enhanced timer functions for the new dashboard widget
    const handleStartSession = async (task, sessionType, duration) => {
        if (activeSession) return;
        
        const session = {
            taskId: task?.id || null,
            startTime: new Date(),
            duration: duration,
            isDouble: duration > 30 * 60, // More than 30 minutes is considered double
            active: true,
            type: sessionType
        };
        
        await setDoc(doc(db, basePath, 'tracking', 'activeSession'), session);
        
        if (task && sessionType === 'work') {
            await updateDoc(doc(db, basePath, 'tasks', task.id), { status: 'in-progress' });
        }
    };

    const handlePauseSession = async () => {
        if (!activeSession) return;
        await setDoc(doc(db, basePath, 'tracking', 'activeSession'), { active: false }, { merge: true });
    };

    const handleResetSession = async () => {
        if (!activeSession) return;
        await setDoc(doc(db, basePath, 'tracking', 'activeSession'), { active: false }, { merge: true });
        
        // Reset task status if it was in progress
        if (activeSession.taskId && activeSession.type === 'work') {
            await updateDoc(doc(db, basePath, 'tasks', activeSession.taskId), { status: 'idle' });
        }
    };

    const handleSessionComplete = async () => {
        if (!activeSession) return;
        
        setCompletedSessionType(activeSession.type);
        setIsSessionCompletionModalOpen(true);
        
        // Trigger AI nudge for work sessions only
        if (activeSession.type === 'work') {
            try {
                const aiRecommendations = await generateAINudge(settings, projects, tasks);
                if (aiRecommendations) {
                    setAiNudgeRecommendations(aiRecommendations);
                    // Show AI nudge after a short delay to let the session completion modal appear first
                    setTimeout(() => {
                        setIsAiNudgeDisplayOpen(true);
                    }, 1000);
                }
            } catch (error) {
                console.error('Failed to generate AI nudge:', error);
            }
        }
    };

    const handleSessionCompletionSaveNotes = async (notes) => {
        if (!activeSession || !activeSession.taskId) return;
        
        const sessionNote = {
            date: new Date(),
            duration: activeSession.duration,
            notes: notes || "No notes for this session."
        };

        await updateDoc(doc(db, basePath, 'tasks', activeSession.taskId), {
            status: 'idle',
            sessions: arrayUnion(sessionNote)
        });
    };

    const handleStartNextSession = async (task, sessionType, duration) => {
        // Close current session
        await setDoc(doc(db, basePath, 'tracking', 'activeSession'), { active: false }, { merge: true });
        
        // Start new session
        await handleStartSession(task, sessionType, duration);
        setIsSessionCompletionModalOpen(false);
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
            batch.set(doc(db, basePath, 'settings', 'config'), data.settings);
            batch.set(doc(db, basePath, 'settings', 'categories'), data.categories);
            data.projects.forEach(project => {
                if (!project.id) { console.warn("Skipping project with no ID:", project); return; }
                const { tasks: projectTasks, ...projectData } = project;
                // Ensure imported projects have a status field
                if (!projectData.status) {
                    projectData.status = 'active';
                }
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


    // --- Render Logic ---
    const renderView = () => {
        if (activeView === 'archived') { return <ArchivedProjectsView allProjects={projects} onSaveProject={handleSaveProject}/>; }
        if (activeView === 'tracking') { return <TrackingView session={activeSession} tasks={tasks} onSessionEnd={handleSessionEnd} />; }
        if (selectedProjectId) {
            return <ProjectView project={selectedProject} tasks={tasks.filter(t => t.projectId === selectedProjectId)} settings={settings} categoryColor={categories[selectedProject.category]} onOpenTaskDetail={(task) => { setEditingTask(task); setIsTaskDetailModalOpen(true); }} onOpenNewTaskDetail={openTaskDetailForNew} onStartTask={handleStartTask} onEditProject={openEditProjectModal} nudgeState={nudgeState} onBack={() => setSelectedProjectId(null)} />;
        }
        switch (activeView) {
            case 'dashboard': return <DashboardView 
                projects={visibleProjects} 
                tasks={tasks} 
                nudgeState={nudgeState} 
                setSelectedProjectId={setSelectedProjectId} 
                categories={categories} 
                activeSession={activeSession} 
                ownerFilter={settings.ownerFilter} 
                setOwnerFilter={(val) => setSettings({...settings, ownerFilter: val})} 
                owners={owners}
                onStartSession={handleStartSession}
                onPauseSession={handlePauseSession}
                onResetSession={handleResetSession}
                onSessionComplete={handleSessionComplete}
            />;
            case 'projects': return <ProjectsView projects={visibleProjects} tasks={tasks} setSelectedProjectId={setSelectedProjectId} categories={categories} ownerFilter={settings.ownerFilter} setOwnerFilter={(val) => setSettings({...settings, ownerFilter: val})} owners={owners} />;
            case 'tasks': return <TasksView tasks={tasks} projects={projects} onStartTask={handleStartTask} activeSession={activeSession}/>;
            case 'settings': return <SettingsView currentSettings={settings} onExportData={handleExportData} onFileSelectedForImport={handleFileSelectedForImport} onGenerateDummyData={generateDummyData} owners={owners} setSettings={setSettings} />;
            default: return <div className="text-center p-10">Loading...</div>;
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen flex flex-col">
            <TopNavBar activeView={activeView} setActiveView={setActiveView} onNewProject={openNewProjectModal} hasActiveSession={!!activeSession} setSelectedProjectId={setSelectedProjectId} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{renderView()}</main>
            {isImportConfirmModalOpen && <ImportConfirmModal onClose={() => setIsImportConfirmModalOpen(false)} onConfirm={executeImport} />}
            {isProjectModalOpen && <ProjectModal onClose={() => {setIsProjectModalOpen(false); setEditingProject(null);}} onSave={handleSaveProject} existingProject={editingProject} categories={Object.keys(categories)} owners={owners} />}
            {isTaskDetailModalOpen && editingTask && <TaskDetailModal onClose={() => setIsTaskDetailModalOpen(false)} onSave={handleSaveTask} task={editingTask} />}
            {isSessionEndModalOpen && <SessionEndModal onClose={() => setIsSessionEndModalOpen(false)} onSave={handleSaveSessionNotes} />}
            {isSessionCompletionModalOpen && (
                <SessionCompletionModal
                    sessionType={completedSessionType}
                    tasks={tasks}
                    onStartNext={handleStartNextSession}
                    onClose={() => setIsSessionCompletionModalOpen(false)}
                    onSaveNotes={handleSessionCompletionSaveNotes}
                />
            )}
            
            {/* AI Nudge Display */}
            {isAiNudgeDisplayOpen && aiNudgeRecommendations && (
                <AINudgeDisplay 
                    recommendations={aiNudgeRecommendations}
                    settings={settings}
                    onClose={() => {
                        setIsAiNudgeDisplayOpen(false);
                        setAiNudgeRecommendations(null);
                    }}
                />
            )}
        </div>
    );
}

// --- Modal Components ---

function ProjectModal({ onClose, onSave, existingProject, categories, owners }) {
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
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full mt-1 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-sm font-medium">Owner</label>
                           <input type="text" list="owners" value={owner} onChange={e => setOwner(e.target.value)} required placeholder="e.g., Matt Mariani" className="w-full mt-1 bg-gray-100 dark:bg-gray-700 rounded-md p-2 text-sm"/>
                            <datalist id="owners">
                                {owners.filter(o => o !== 'All').map(o => <option key={o} value={o} />)}
                            </datalist>
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

function ImportConfirmModal({ onClose, onConfirm }) {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in-fast">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                        <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                            Confirm Data Import
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                You are about to import data from a backup file. This will **overwrite** any existing projects or tasks that have the same ID. This action cannot be undone. Are you sure you wish to proceed?
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm" onClick={onConfirm}>Import and Overwrite</button>
                    <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

function SessionEndModal({ onClose, onSave }) {
    const [notes, setNotes] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [completionNotes, setCompletionNotes] = useState('');
    const handleSave = () => { onSave(notes, isComplete, completionNotes); onClose(); };
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
    const handleSubmit = (e) => { 
        e.preventDefault(); 
        onSave({ 
            id: task.id,
            projectId: task.projectId,
            title, 
            detail, 
            dueDate: dueDate ? new Date(dueDate) : null, 
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            status: task.status || 'idle',
            isComplete: task.isComplete || false
        }); 
    };
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
