import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { NUDGE_CONFIG } from '../../../config/constants';

function NudgeStatus({ nudgeState }) {
    const { LEVELS } = NUDGE_CONFIG;
    const colorClasses = {
        [LEVELS.NONE]: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20",
        [LEVELS.REMEMBER]: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
        [LEVELS.STAY_ON_TARGET]: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20",
        [LEVELS.LAZY]: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
    };
    
    return (
        <div className={`p-3 rounded-lg border text-sm flex items-center bg-white dark:bg-gray-800 ${colorClasses[nudgeState.level]}`}>
            <ShieldAlert size={18} className="mr-3 flex-shrink-0" />
            <div>
                <p className="font-semibold">Nudge Status:</p>
                <p className="text-xs">{nudgeState.message}</p>
            </div>
        </div>
    );
}

export default NudgeStatus;