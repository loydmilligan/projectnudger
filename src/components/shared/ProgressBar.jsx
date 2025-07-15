import React from 'react';

function ProgressBar({ 
    percentage = 0, 
    total = 0, 
    completed = 0, 
    size = 'md',
    showLabel = true,
    className = '' 
}) {
    // Calculate percentage from completed/total if not provided directly
    const calculatedPercentage = percentage || (total > 0 ? Math.round((completed / total) * 100) : 0);
    
    // Ensure percentage is within 0-100 range
    const safePercentage = Math.min(100, Math.max(0, calculatedPercentage));
    
    // Size configurations
    const sizeClasses = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4'
    };
    
    const labelSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    };
    
    // Color based on completion percentage
    const getProgressColor = (percent) => {
        if (percent === 100) return 'bg-green-500';
        if (percent >= 75) return 'bg-blue-500';
        if (percent >= 50) return 'bg-yellow-500';
        if (percent >= 25) return 'bg-orange-500';
        return 'bg-red-500';
    };
    
    const progressColor = getProgressColor(safePercentage);
    
    // Completion status styling
    const isComplete = safePercentage === 100;
    const containerClasses = `relative w-full ${className}`;
    const backgroundClasses = `w-full ${sizeClasses[size]} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`;
    const barClasses = `h-full ${progressColor} transition-all duration-300 ease-out rounded-full ${
        isComplete ? 'ring-2 ring-green-400 ring-opacity-50' : ''
    }`;
    
    return (
        <div className={containerClasses}>
            {showLabel && (
                <div className="flex justify-between mb-1">
                    <span className={`${labelSizeClasses[size]} font-medium text-gray-700 dark:text-gray-300`}>
                        {total > 0 ? `${completed}/${total} tasks` : 'Progress'}
                    </span>
                    <span className={`${labelSizeClasses[size]} font-medium ${
                        isComplete ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                        {safePercentage}%
                    </span>
                </div>
            )}
            
            <div 
                className={backgroundClasses}
                role="progressbar"
                aria-valuenow={safePercentage}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-label={`Progress: ${safePercentage}%`}
            >
                <div 
                    className={barClasses}
                    style={{ width: `${safePercentage}%` }}
                >
                    {/* Animated stripe pattern for active progress */}
                    {!isComplete && safePercentage > 0 && (
                        <div className="absolute inset-0 opacity-20">
                            <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" />
                        </div>
                    )}
                </div>
            </div>
            
            {/* Completion celebration effect */}
            {isComplete && (
                <div className="absolute -top-1 -right-1">
                    <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                </div>
            )}
        </div>
    );
}

export default ProgressBar;