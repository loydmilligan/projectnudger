# **Project Nudger Refactoring Guide**

## **Overview**

This document provides a comprehensive guide for refactoring the Project Nudger application from a single large App.jsx file (\~600 lines) into a well-structured, modular codebase while maintaining identical functionality.

## **Goals**

* **Improve Maintainability:** Easier to find and modify specific features.  
* **Enhance Readability:** Clear separation of concerns.  
* **Enable Scalability:** Simple to add new features.  
* **Facilitate Testing:** Isolated components and functions.  
* **Support Collaboration:** Multiple developers can work simultaneously.

## **New File Structure**

src/  
├── App.jsx                    \# Main app component (simplified to \~150 lines)  
├── index.css  
├── main.jsx  
│  
├── config/  
│   ├── firebase.js           \# Firebase configuration and initialization  
│   └── constants.js          \# App constants (NUDGE\_CONFIG, POMODORO\_CONFIG)  
│  
├── utils/  
│   ├── helpers.js            \# Helper functions (timeAgo, color functions, etc.)  
│   └── dummyData.js          \# Dummy data generation logic  
│  
├── hooks/  
│   ├── useFirestore.js       \# Custom hook for Firestore subscriptions  
│   ├── useNudgeState.js      \# Nudge calculation logic  
│   └── usePomodoro.js        \# Pomodoro timer logic  
│  
├── services/  
│   ├── projects.js           \# Project-related Firebase operations  
│   ├── tasks.js              \# Task-related Firebase operations  
│   └── settings.js           \# Settings and categories operations  
│  
├── components/  
│   ├── layout/  
│   │   ├── TopNavBar.jsx  
│   │   └── NudgerLogo.jsx  
│   │  
│   ├── views/  
│   │   ├── DashboardView/  
│   │   │   ├── index.jsx  
│   │   │   ├── RecommendationEngine.jsx  
│   │   │   ├── NudgeStatus.jsx  
│   │   │   └── ActiveTimerWidget.jsx  
│   │   ├── ProjectsView/  
│   │   │   ├── index.jsx  
│   │   │   └── ProjectCard.jsx  
│   │   ├── TasksView/  
│   │   │   ├── index.jsx  
│   │   │   └── TaskItem.jsx  
│   │   ├── ProjectView/  
│   │   │   ├── index.jsx  
│   │   │   └── TaskList.jsx  
│   │   ├── TrackingView/  
│   │   │   ├── index.jsx  
│   │   │   └── Timer.jsx  
│   │   └── ArchivedProjectsView/  
│   │       └── index.jsx  
│   │  
│   ├── modals/  
│   │   ├── ProjectModal.jsx  
│   │   ├── SettingsModal.jsx  
│   │   ├── TaskDetailModal.jsx  
│   │   ├── SessionEndModal.jsx  
│   │   └── ImportConfirmModal.jsx  
│   │  
│   └── shared/  
│       ├── ProjectFilters.jsx  
│       └── LoadingSpinner.jsx  
│  
└── contexts/  
    └── AppContext.jsx         \# Optional: Context for global state (Phase 5\)

## **Refactoring Phases**

### **Phase 1: Extract Configuration and Utilities**

*Estimated Time: 1-2 hours*

Step 1.1: Create Firebase Configuration  
Create src/config/firebase.js:  
import { initializeApp } from 'firebase/app';  
import { getFirestore } from 'firebase/firestore';

const firebaseConfig \= {  
  apiKey: import.meta.env.VITE\_FIREBASE\_API\_KEY,  
  authDomain: import.meta.env.VITE\_FIREBASE\_AUTH\_DOMAIN,  
  projectId: import.meta.env.VITE\_PROJECT\_ID,  
  storageBucket: import.meta.env.VITE\_STORAGE\_BUCKET,  
  messagingSenderId: import.meta.env.VITE\_MESSAGING\_SENDER\_ID,  
  appId: import.meta.env.VITE\_APP\_ID  
};

const appId \= typeof \_\_app\_id \!== 'undefined' ? \_\_app\_id : 'default-app-id';  
const app \= initializeApp(firebaseConfig);  
const db \= getFirestore(app);  
const basePath \= \`artifacts/${appId}/public/data\`;

export { db, basePath };

Step 1.2: Extract Constants  
Create src/config/constants.js:  
export const NUDGE\_CONFIG \= {  
    LEVELS: {  
        NONE: 0,  
        REMEMBER: 1,  
        STAY\_ON\_TARGET: 2,  
        LAZY: 3  
    },  
    MODES: {  
        AUTOMATIC: 'Automatic',  
        REMEMBER: 'Remember',  
        STAY\_ON\_TARGET: 'Stay on Target',  
        LAZY: 'Lazy'  
    },  
    THRESHOLDS: {  
        PROJECT\_AGE\_OLD: 30,  
        PROJECT\_AGE\_VERY\_OLD: 90,  
        PROJECT\_COUNT\_SOME: 5,  
        PROJECT\_COUNT\_MANY: 10,  
        TASK\_INTERVAL\_LEVEL\_1: 10,  
        TASK\_INTERVAL\_LEVEL\_2: 5,  
        TASK\_INTERVAL\_LEVEL\_3: 2  
    }  
};

export const POMODORO\_CONFIG \= {  
    WORK\_SESSION: 25 \* 60,  
    SHORT\_BREAK: 5 \* 60,  
    LONG\_BREAK: 10 \* 60  
};

Step 1.3: Extract Helper Functions  
Create src/utils/helpers.js:  
export const timeAgo \= (date) \=\> {  
    if (\!date) return 'N/A';  
    const seconds \= Math.floor((new Date() \- date) / 1000);  
    if (seconds \< 5\) return 'just now';  
    let interval \= seconds / 31536000;  
    if (interval \> 1\) return Math.floor(interval) \+ " years";  
    interval \= seconds / 2592000;  
    if (interval \> 1\) return Math.floor(interval) \+ " months";  
    interval \= seconds / 86400;  
    if (interval \> 1\) return Math.floor(interval) \+ " days";  
    return "Today";  
};

export const generateHslColor \= (existingColors \= \[\]) \=\> {  
    let hue;  
    do {  
        hue \= Math.floor(Math.random() \* 360);  
    } while (existingColors.some(color \=\>  
        Math.abs(parseInt(color.match(/hsl\\((\\d+)/)\[1\]) \- hue) \< 30  
    ));  
    return \`hsl(${hue}, 70%, 50%)\`;  
};

export const getComplementaryColor \= (hsl) \=\> {  
    if (\!hsl) return 'hsl(200, 70%, 50%)';  
    const \[\_, h, s, l\] \= hsl.match(/hsl\\((\\d+),\\s\*(\[\\d.\]+)%,\\s\*(\[\\d.\]+)%\\)/).map(Number);  
    return \`hsl(${(h \+ 180\) % 360}, ${s \* 0.8}%, ${l \* 1.2}%)\`;  
};

export const getAnalogousColor \= (hsl) \=\> {  
    if (\!hsl) return 'hsl(200, 70%, 20%)';  
    const \[\_, h, s, l\] \= hsl.match(/hsl\\((\\d+),\\s\*(\[\\d.\]+)%,\\s\*(\[\\d.\]+)%\\)/).map(Number);  
    return \`hsl(${(h \+ 30\) % 360}, ${s \* 0.5}%, ${l \* 0.5}%)\`;  
};

export const formatTime \= (seconds) \=\> {  
    const mins \= Math.floor(seconds / 60);  
    const secs \= seconds % 60;  
    return \`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}\`;  
};

Step 1.4: Extract Dummy Data Logic  
Create src/utils/dummyData.js:  
import { writeBatch, doc, collection } from 'firebase/firestore';  
import { db, basePath } from '../config/firebase';

export const generateDummyData \= async () \=\> {  
   if (\!confirm("This will add several dummy projects and tasks to your database, replacing existing data. Are you sure?")) return;

   try {  
       const batch \= writeBatch(db);  
       const dummyCategories \= {  
            "Work": "hsl(210, 70%, 50%)",  
            "Personal": "hsl(140, 70%, 50%)",  
            "Learning": "hsl(45, 70%, 50%)"  
        };

       batch.set(doc(db, basePath, 'settings', 'categories'), dummyCategories);

       const projectsToAdd \= \[  
           {  
                id: 'dummy\_proj\_1',  
                name: 'Q3 Report Finalization',  
                owner: 'Matt Mariani',  
                category: 'Work',  
                priority: 10,  
                status: 'active',  
                createdAt: new Date()  
            },  
           {  
                id: 'dummy\_proj\_2',  
                name: 'Home Reno Planning',  
                owner: 'Mara Mariani',  
                category: 'Personal',  
                priority: 5,  
                status: 'active',  
                createdAt: new Date(Date.now() \- 40 \* 24 \* 3600 \* 1000\)  
            },  
           {  
                id: 'dummy\_proj\_3',  
                name: 'Learn Rust Programming',  
                owner: 'Matt Mariani',  
                category: 'Learning',  
                priority: 3,  
                status: 'inactive',  
                createdAt: new Date(Date.now() \- 100 \* 24 \* 3600 \* 1000\)  
            },  
       \];

       const tasksToAdd \= \[  
           {  
                projectId: 'dummy\_proj\_1',  
                title: "Compile financial data",  
                detail: "Get spreadsheets from finance team.",  
                status: 'idle',  
                isComplete: false  
            },  
           {  
                projectId: 'dummy\_proj\_1',  
                title: "Draft executive summary",  
                detail: "",  
                status: 'idle',  
                isComplete: false  
            },  
           {  
                projectId: 'dummy\_proj\_2',  
                title: "Get quotes for kitchen cabinets",  
                detail: "",  
                status: 'idle',  
                isComplete: false  
            },  
           {  
                projectId: 'dummy\_proj\_2',  
                title: "Choose paint colors",  
                detail: "Leaning towards a neutral gray.",  
                status: 'idle',  
                isComplete: false  
            },  
           {  
                projectId: 'dummy\_proj\_3',  
                title: "Read the official Rust book",  
                detail: "Focus on chapters 1-5.",  
                status: 'idle',  
                isComplete: false  
            },  
       \];

       projectsToAdd.forEach(proj \=\>  
            batch.set(doc(db, basePath, 'projects', proj.id), proj)  
       );  
       tasksToAdd.forEach(task \=\>  
            batch.set(doc(collection(db, basePath, 'tasks')), task)  
       );

       await batch.commit();  
       alert("Dummy data generated successfully\!");  
   } catch (error) {  
       console.error("Dummy data generation failed:", error);  
       alert("Failed to generate dummy data. Check console for details.");  
   }  
};

Step 1.5: Update App.jsx Imports  
Update the top of App.jsx:  
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
import { NUDGE\_CONFIG, POMODORO\_CONFIG } from './config/constants';  
import { timeAgo, generateHslColor, getComplementaryColor, getAnalogousColor, formatTime } from './utils/helpers';  
import { generateDummyData } from './utils/dummyData';

// Remove the configuration and helper function definitions from here

### **Phase 2: Extract Layout Components**

*Estimated Time: 2-3 hours*

Step 2.1: Create NudgerLogo Component  
Create src/components/layout/NudgerLogo.jsx:  
import React from 'react';

const NudgerLogo \= () \=\> (  
    \<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-600 dark:text-indigo-400"\>  
        \<path d="M7.5 19.5C6.83333 17.6667 6.5 15.3333 6.5 12.5C6.5 9.66667 6.83333 7.33333 7.5 5.5M12 21C10 18.1667 9 15.1667 9 12C9 8.83333 10 5.83333 12 3M16.5 19.5C17.1667 17.6667 17.5 15.3333 17.5 12.5C17.5 9.66667 17.1667 7.33333 16.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/\>  
        \<path d="M3.50989 9H6.50989" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/\>  
        \<path d="M3.50989 15H6.50989" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/\>  
        \<path d="M17.5099 9H20.5099" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/\>  
        \<path d="M17.5099 15H20.5099" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/\>  
    \</svg\>  
);

export default NudgerLogo;

Step 2.2: Create TopNavBar Component  
Create src/components/layout/TopNavBar.jsx:  
import React from 'react';  
import { Plus, Settings, LayoutDashboard, Briefcase, ListChecks, Archive, Timer as TimerIcon } from 'lucide-react';  
import NudgerLogo from './NudgerLogo';

function TopNavBar({ activeView, setActiveView, setIsSettingsModalOpen, onNewProject, hasActiveSession }) {  
    const navItems \= \[  
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },  
        { id: 'projects', label: 'Projects', icon: Briefcase },  
        { id: 'tasks', label: 'Tasks', icon: ListChecks },  
        { id: 'archived', label: 'Archived', icon: Archive },  
    \];

    if (hasActiveSession) {  
        navItems.splice(3, 0, { id: 'tracking', label: 'Tracking', icon: TimerIcon });  
    }

    return (  
        \<header className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700/80 sticky top-0 z-40"\>  
            \<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"\>  
                \<div className="flex items-center justify-between h-16"\>  
                    \<div className="flex items-center space-x-8"\>  
                        \<div className="flex items-center space-x-2"\>  
                            \<NudgerLogo /\>  
                            \<h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 font-display"\>Project Nudger\</h1\>  
                        \</div\>  
                        \<nav className="hidden md:flex space-x-4"\>  
                            {navItems.map(item \=\> (  
                                \<button  
                                    key={item.id}  
                                    onClick={() \=\> setActiveView(item.id)}  
                                    className={\`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${  
                                        activeView \=== item.id  
                                            ? 'bg-indigo-100 dark:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300'  
                                            : 'hover:bg-gray-200 dark:hover:bg-gray-700'  
                                    }\`}  
                                \>  
                                    \<item.icon className="mr-2" size={18} /\>  
                                    {item.label}  
                                \</button\>  
                            ))}  
                        \</nav\>  
                    \</div\>  
                    \<div className="flex items-center space-x-4"\>  
                        \<button  
                            onClick={onNewProject}  
                            className="hidden sm:flex items-center px-4 py-2 rounded-md text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"  
                        \>  
                            \<Plus size={18} className="mr-2"/\>  
                            New Project  
                        \</button\>  
                        \<button  
                            onClick={() \=\> setIsSettingsModalOpen(true)}  
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"  
                        \>  
                            \<Settings size={20} /\>  
                        \</button\>  
                    \</div\>  
                \</div\>  
            \</div\>  
        \</header\>  
    );  
}

export default TopNavBar;

### **Phase 3: Extract View Components**

*Estimated Time: 3-4 hours*

Step 3.1: Create DashboardView Component  
Create src/components/views/DashboardView/index.jsx:  
import React from 'react';  
import { Users } from 'lucide-react';  
import RecommendationEngine from './RecommendationEngine';  
import NudgeStatus from './NudgeStatus';  
import ActiveTimerWidget from './ActiveTimerWidget';  
import ProjectFilters from '../../shared/ProjectFilters';  
import { getComplementaryColor } from '../../../utils/helpers';

function DashboardView({  
    projects,  
    tasks,  
    nudgeState,  
    setSelectedProjectId,  
    categories,  
    activeSession,  
    ownerFilter,  
    setOwnerFilter,  
    owners  
}) {  
    const activeTask \= activeSession && tasks.find(t \=\> t.id \=== activeSession.taskId);

    return (  
        \<div className="grid grid-cols-1 lg:grid-cols-3 gap-6"\>  
            \<div className="lg:col-span-1 space-y-6"\>  
                {activeSession && activeTask &&  
                    \<ActiveTimerWidget session={activeSession} task={activeTask} /\>  
                }  
                \<RecommendationEngine projects={projects} tasks={tasks} /\>  
                \<NudgeStatus nudgeState={nudgeState} /\>  
            \</div\>  
            \<div className="lg:col-span-2"\>  
                \<div className="flex justify-between items-center mb-4"\>  
                    \<h2 className="text-xl font-bold"\>Projects\</h2\>  
                    \<ProjectFilters  
                        ownerFilter={ownerFilter}  
                        setOwnerFilter={setOwnerFilter}  
                        owners={owners}  
                    /\>  
                \</div\>  
                \<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"\>  
                    {projects.map(project \=\> (  
                        \<button  
                            key={project.id}  
                            onClick={() \=\> setSelectedProjectId(project.id)}  
                           style={{ backgroundColor: categories\[project.category\] }}  
                            className={\`w-full text-left p-4 rounded-lg transition-all text-white focus:outline-none focus:ring-2 dark:focus:ring-offset-gray-900 focus:ring-offset-2\`}  
                            onMouseOver={e \=\> e.currentTarget.style.backgroundColor \= getComplementaryColor(categories\[project.category\])}  
                            onMouseOut={e \=\> e.currentTarget.style.backgroundColor \= categories\[project.category\]}  
                        \>  
                            \<p className="font-bold truncate" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}\>  
                                {project.name}  
                            \</p\>  
                            \<p className="text-xs text-white/80"\>{project.category} \- {project.owner}\</p\>  
                        \</button\>  
                    ))}  
                \</div\>  
            \</div\>  
        \</div\>  
    );  
}

export default DashboardView;

Create placeholder components for the DashboardView subcomponents:

* src/components/views/DashboardView/RecommendationEngine.jsx  
* src/components/views/DashboardView/NudgeStatus.jsx  
* src/components/views/DashboardView/ActiveTimerWidget.jsx

### **Phase 4: Extract Service Layer**

*Estimated Time: 2-3 hours*

Step 4.1: Create Project Service  
Create src/services/projects.js:  
import {  
    collection,  
    addDoc,  
    updateDoc,  
    doc,  
    query,  
    onSnapshot  
} from 'firebase/firestore';  
import { db, basePath } from '../config/firebase';

export const subscribeToProjects \= (callback) \=\> {  
    const projectsQuery \= query(collection(db, basePath, 'projects'));  
    return onSnapshot(projectsQuery, snapshot \=\> {  
        const projects \= snapshot.docs.map(d \=\> ({  
            id: d.id,  
            ...d.data(),  
            createdAt: d.data().createdAt?.toDate()  
        }));  
        callback(projects);  
    });  
};

export const createProject \= async (projectData) \=\> {  
    const { id, ...dataToCreate } \= projectData;  
    return await addDoc(collection(db, basePath, 'projects'), {  
        ...dataToCreate,  
        status: 'active',  
        createdAt: new Date()  
    });  
};

export const updateProject \= async (projectId, projectData) \=\> {  
    const { id, ...dataToUpdate } \= projectData;  
    return await updateDoc(doc(db, basePath, 'projects', projectId), dataToUpdate);  
};

Step 4.2: Create Task Service  
Create src/services/tasks.js:  
import {  
    collection,  
    addDoc,  
    updateDoc,  
    doc,  
    query,  
    onSnapshot,  
   arrayUnion  
} from 'firebase/firestore';  
import { db, basePath } from '../config/firebase';

export const subscribeToTasks \= (callback) \=\> {  
    return onSnapshot(query(collection(db, basePath, 'tasks')), snapshot \=\> {  
        const tasks \= snapshot.docs.map(d \=\> ({  
            id: d.id,  
            ...d.data(),  
            createdAt: d.data().createdAt?.toDate(),  
           completedAt: d.data().completedAt?.toDate(),  
           dueDate: d.data().dueDate?.toDate()  
        }));  
        callback(tasks);  
    });  
};

export const createTask \= async (taskData) \=\> {  
    const { id, ...dataToSave } \= taskData;  
    return await addDoc(collection(db, basePath, 'tasks'), {  
        ...dataToSave,  
        createdAt: new Date()  
    });  
};

export const updateTask \= async (taskId, taskData) \=\> {  
    const { id, ...dataToUpdate } \= taskData;  
    return await updateDoc(doc(db, basePath, 'tasks', taskId), dataToUpdate);  
};

export const addSessionToTask \= async (taskId, sessionData) \=\> {  
    const sessionNote \= {  
        date: new Date(),  
        duration: sessionData.duration,  
        notes: sessionData.notes || "No notes for this session."  
    };

    const updatePayload \= {  
        status: 'idle',  
        sessions: arrayUnion(sessionNote)  
    };

    if (sessionData.markComplete) {  
       updatePayload.isComplete \= true;  
       updatePayload.completedAt \= new Date();  
       updatePayload.completionNotes \= sessionData.completionNotes || "Task completed.";  
   }

    return await updateDoc(doc(db, basePath, 'tasks', taskId), updatePayload);  
};

### **Phase 5: Create Custom Hooks**

*Estimated Time: 3-4 hours*

Step 5.1: Create useNudgeState Hook  
Create src/hooks/useNudgeState.js:  
import { useMemo } from 'react';  
import { NUDGE\_CONFIG } from '../config/constants';

export const useNudgeState \= (projects, tasks, nudgeMode) \=\> {  
    return useMemo(() \=\> {  
        const activeProjects \= projects.filter(p \=\> p.status \=== 'active');  
        const openProjectsCount \= activeProjects.filter(p \=\>  
            tasks.some(t \=\> t.projectId \=== p.id && \!t.isComplete)  
        ).length;

        const oldestProjectAge \= activeProjects.length \> 0 &&  
            activeProjects.sort((a,b) \=\> (a.createdAt || 0\) \- (b.createdAt || 0))\[0\].createdAt  
            ? (new Date() \- activeProjects.sort((a,b) \=\> (a.createdAt || 0\) \- (b.createdAt || 0))\[0\].createdAt) / (1000 \* 3600 \* 24\)  
            : 0;

        const { LEVELS, THRESHOLDS, MODES } \= NUDGE\_CONFIG;

        if (nudgeMode && nudgeMode \!== MODES.AUTOMATIC) {  
           const levelMap \= {  
                \[MODES.REMEMBER\]: LEVELS.REMEMBER,  
                \[MODES.STAY\_ON\_TARGET\]: LEVELS.STAY\_ON\_TARGET,  
                \[MODES.LAZY\]: LEVELS.LAZY  
            };  
           const messageMap \= {  
                \[MODES.REMEMBER\]: "Manual Mode: Gentle nudges active.",  
                \[MODES.STAY\_ON\_TARGET\]: "Manual Mode: 'Stay on Target' active.",  
                \[MODES.LAZY\]: "Manual Mode: 'Lazy Sumb...' active."  
            };  
           return {  
                level: levelMap\[nudgeMode\],  
                message: messageMap\[nudgeMode\]  
            };  
        }

        if (oldestProjectAge \> THRESHOLDS.PROJECT\_AGE\_VERY\_OLD || openProjectsCount \> THRESHOLDS.PROJECT\_COUNT\_MANY) {  
           return { level: LEVELS.LAZY, message: "Automatic: Aggressive nudging active." };  
        }  
        if (oldestProjectAge \> THRESHOLDS.PROJECT\_AGE\_OLD || openProjectsCount \> THRESHOLDS.PROJECT\_COUNT\_SOME) {  
           return { level: LEVELS.STAY\_ON\_TARGET, message: "Automatic: Nudge level: Stay on Target." };  
        }  
        if (oldestProjectAge \> THRESHOLDS.PROJECT\_AGE\_OLD / 2\) {  
           return { level: LEVELS.REMEMBER, message: "Automatic: Gentle nudges are active." };  
        }

        return { level: NUDGE\_CONFIG.LEVELS.NONE, message: "All clear." };  
    }, \[projects, tasks, nudgeMode\]);  
};

## **Testing Strategy**

### **Phase Testing**

After each phase, test the following:

* **Build Test:** Run npm run dev and ensure no errors.  
* **Functionality Test:** Verify all features work as before.  
* **Firebase Test:** Check that data still saves/loads correctly.  
* **UI Test:** Ensure all components render properly.

### **Integration Testing Checklist**

* \[ \] Projects can be created, edited, and archived  
* \[ \] Tasks can be created, edited, and completed  
* \[ \] Pomodoro timer starts and stops correctly  
* \[ \] Nudge calculations work properly  
* \[ \] Settings persist correctly  
* \[ \] Import/Export functionality works  
* \[ \] Theme switching works  
* \[ \] Owner filtering works

## **Best Practices During Refactoring**

* **Use Git Branches:** Create a new branch for the refactoring work.  
  git checkout \-b refactor/modularize-app

* **Commit Frequently:** Make small, atomic commits.  
  git add .  
  git commit \-m "refactor: extract firebase configuration"

* **Test After Each Change:** Run the app after each file extraction.  
* **Keep Original Functionality:** Don't add new features during refactoring.  
* **Document As You Go:** Add JSDoc comments to new functions.

## **Common Issues and Solutions**

* **Issue: Import Path Errors**  
  * **Solution:** Use relative paths consistently. VS Code can help auto-fix imports.  
* **Issue: Missing Props**  
  * **Solution:** Check that all props are passed down correctly when extracting components.  
* **Issue: Firebase Connection Issues**  
  * **Solution:** Ensure the firebase config is exported correctly and imported in services.  
* **Issue: State Management Complexity**  
  * **Solution:** Consider using Context API in Phase 5 if prop drilling becomes excessive.

## **Next Steps After Refactoring**

* Add PropTypes or TypeScript for better type safety.  
* Implement Unit Tests to test individual components and functions.  
* Add Error Boundaries for better error handling.  
* Optimize Performance using React.memo, useMemo, and useCallback appropriately.  
* Add Code Documentation (JSDoc comments for all major functions).  
* Set Up CI/CD for automated testing and deployment.