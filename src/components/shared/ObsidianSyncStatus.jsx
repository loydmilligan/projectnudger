// src/components/shared/ObsidianSyncStatus.jsx
import React from 'react';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

function StatusIcon({ state }) {
    if (state === 'syncing') return <Loader2 className="animate-spin" size={16}/>;
    if (state === 'error') return <AlertTriangle className="text-red-500" size={16}/>;
    return <CheckCircle className="text-green-500" size={16}/>;
}

export default function ObsidianSyncStatus({ state = 'idle', lastSync }) {
    const label = state === 'syncing' ? 'Syncing…'
        : state === 'error' ? 'Error'
        : lastSync ? `Last: ${new Date(lastSync).toLocaleTimeString()}` : 'Ready';
    return (
        <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-300">
            <StatusIcon state={state}/>
            <span>{label}</span>
        </div>
    );
}
