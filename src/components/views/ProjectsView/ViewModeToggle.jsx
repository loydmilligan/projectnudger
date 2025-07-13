import React from 'react';
import { LayoutGrid, Kanban } from 'lucide-react';

/**
 * Toggle component for switching between grid and kanban views
 * Provides a clean interface for view mode selection with visual indicators
 */
function ViewModeToggle({ viewMode, onViewModeChange, disabled = false }) {
    const modes = [
        {
            id: 'grid',
            name: 'Grid',
            icon: LayoutGrid,
            description: 'Traditional grid layout with project cards'
        },
        {
            id: 'kanban',
            name: 'Kanban',
            icon: Kanban,
            description: 'Kanban board with stage columns'
        }
    ];

    return (
        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            {modes.map(mode => {
                const Icon = mode.icon;
                const isActive = viewMode === mode.id;
                
                return (
                    <button
                        key={mode.id}
                        onClick={() => !disabled && onViewModeChange(mode.id)}
                        disabled={disabled}
                        className={`
                            flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                            ${isActive 
                                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm' 
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                            }
                            ${disabled 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:bg-white/50 dark:hover:bg-gray-600/50 cursor-pointer'
                            }
                        `}
                        title={mode.description}
                    >
                        <Icon size={16} />
                        <span className="hidden sm:inline">{mode.name}</span>
                    </button>
                );
            })}
        </div>
    );
}

export default ViewModeToggle;