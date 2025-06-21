import React from 'react';
import { Plus, Settings, LayoutDashboard, Briefcase, ListChecks, Archive, Timer as TimerIcon } from 'lucide-react';
import NudgerLogo from './NudgerLogo';

function TopNavBar({ activeView, setActiveView, setIsSettingsModalOpen, onNewProject, hasActiveSession }) {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'projects', label: 'Projects', icon: Briefcase },
        { id: 'tasks', label: 'Tasks', icon: ListChecks },
        { id: 'archived', label: 'Archived', icon: Archive },
    ];

    if (hasActiveSession) {
        navItems.splice(3, 0, { id: 'tracking', label: 'Tracking', icon: TimerIcon });
    }

    return (
        <header className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700/80 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <NudgerLogo />
                        <nav className="hidden md:flex space-x-4">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveView(item.id)}
                                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        activeView === item.id
                                            ? 'bg-indigo-100 dark:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300'
                                            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <item.icon className="mr-2" size={18} />
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onNewProject}
                            className="hidden sm:flex items-center px-4 py-2 rounded-md text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                        >
                            <Plus size={18} className="mr-2"/>
                            New Project
                        </button>
                        <button
                            onClick={() => setIsSettingsModalOpen(true)}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Settings size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default TopNavBar;