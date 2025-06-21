import React, { useEffect, useRef } from 'react';
import { Brain, AlertCircle, CheckCircle, Clock, Target, X, Volume2 } from 'lucide-react';

function AINudgeDisplay({ recommendations, onClose, settings, activeSession, onStartTaskAfterRest }) {
    const hasTriggeredRef = useRef(false);
    
    if (!recommendations) return null;

    // Trigger TTS and ntfy notification when component mounts (only once)
    useEffect(() => {
        if (!hasTriggeredRef.current && recommendations.robotRecommendation) {
            // TTS
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(recommendations.robotRecommendation);
                speechSynthesis.speak(utterance);
            }

            // ntfy notification (only one notification)
            if (settings?.ntfyUrl && recommendations.robotCharacter) {
                const message = `🤖 ${recommendations.robotCharacter}: ${recommendations.robotRecommendation}`;
                fetch(settings.ntfyUrl, { 
                    method: 'POST', 
                    body: message, 
                    headers: { 'Title': 'AI Nudge Alert' } 
                }).catch(err => console.warn('Failed to send ntfy notification:', err));
            }
            
            hasTriggeredRef.current = true;
        }
    }, [recommendations, settings]);
    
    // Auto-hide modal when rest session ends
    useEffect(() => {
        if (activeSession && activeSession.type === 'work') {
            // Rest session has ended, hide the modal
            onClose();
        }
    }, [activeSession, onClose]);

    const getIntensityColor = (intensity) => {
        switch (intensity) {
            case 'high': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
            case 'medium': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
            case 'low': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
            default: return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
        }
    };

    const getIntensityIcon = (intensity) => {
        switch (intensity) {
            case 'high': return <AlertCircle className="text-red-500" size={20} />;
            case 'medium': return <Clock className="text-yellow-500" size={20} />;
            case 'low': return <CheckCircle className="text-green-500" size={20} />;
            default: return <Target className="text-blue-500" size={20} />;
        }
    };

    // Function to replay TTS
    const replayTTS = () => {
        if (recommendations.robotRecommendation && 'speechSynthesis' in window) {
            speechSynthesis.cancel(); // Stop any current speech
            const utterance = new SpeechSynthesisUtterance(recommendations.robotRecommendation);
            speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in-fast">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <Brain className="text-indigo-600 dark:text-indigo-400" size={24} />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                AI Productivity Insights
                            </h2>
                            {recommendations.robotCharacter && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Powered by {recommendations.robotCharacter}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {recommendations.robotRecommendation && 'speechSynthesis' in window && (
                            <button
                                onClick={replayTTS}
                                className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                title="Replay audio message"
                            >
                                <Volume2 size={20} />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Error handling */}
                {recommendations.error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <AlertCircle className="text-red-500" size={16} />
                            <span className="text-sm font-medium text-red-800 dark:text-red-200">
                                AI Analysis Error
                            </span>
                        </div>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            {recommendations.error}
                        </p>
                    </div>
                )}

                {/* Main recommendation */}
                <div className={`p-4 rounded-lg border-2 mb-6 ${getIntensityColor(recommendations.nudgeIntensity)}`}>
                    <div className="flex items-start space-x-3">
                        {getIntensityIcon(recommendations.nudgeIntensity)}
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Recommended Focus
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                {recommendations.recommendedFocus}
                            </p>
                            
                            {/* Detailed Analysis */}
                            {recommendations.originalResponse && (
                                <div className="bg-white/50 dark:bg-gray-700/50 rounded p-3 text-sm">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="font-medium text-gray-600 dark:text-gray-400">Projects</p>
                                            <p className="text-gray-800 dark:text-gray-200">
                                                {recommendations.originalResponse.projects?.totalProjects || 0} total, 
                                                {recommendations.originalResponse.projects?.activeProjects || 0} active
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-600 dark:text-gray-400">Tasks</p>
                                            <p className="text-gray-800 dark:text-gray-200">
                                                {recommendations.originalResponse.tasks?.totalTasks || 0} total, 
                                                {recommendations.originalResponse.tasks?.overdueTasks || 0} overdue
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Start Task After Rest Button */}
                            {activeSession?.type === 'break' && onStartTaskAfterRest && (
                                <button
                                    onClick={() => {
                                        onStartTaskAfterRest();
                                        onClose();
                                    }}
                                    className="mt-4 w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                                >
                                    <Target size={16} />
                                    <span>Start Focus Session After Break</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Insights Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Near Completion Projects */}
                    {recommendations.nearCompletionProjects && recommendations.nearCompletionProjects.length > 0 && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2 flex items-center">
                                <CheckCircle size={16} className="mr-2" />
                                Almost Done
                            </h4>
                            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                                {recommendations.nearCompletionProjects.slice(0, 3).map((project, idx) => (
                                    <li key={idx} className="truncate">• {project}</li>
                                ))}
                                {recommendations.nearCompletionProjects.length > 3 && (
                                    <li className="text-xs opacity-70">
                                        +{recommendations.nearCompletionProjects.length - 3} more
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}

                    {/* Urgent Tasks */}
                    {recommendations.urgentTasks && recommendations.urgentTasks.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2 flex items-center">
                                <AlertCircle size={16} className="mr-2" />
                                Urgent Tasks
                            </h4>
                            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                                {recommendations.urgentTasks.slice(0, 3).map((taskId, idx) => (
                                    <li key={idx} className="truncate">• Task {taskId}</li>
                                ))}
                                {recommendations.urgentTasks.length > 3 && (
                                    <li className="text-xs opacity-70">
                                        +{recommendations.urgentTasks.length - 3} more
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}

                    {/* Neglected Projects */}
                    {recommendations.neglectedProjects && recommendations.neglectedProjects.length > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center">
                                <Clock size={16} className="mr-2" />
                                Needs Attention
                            </h4>
                            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                {recommendations.neglectedProjects.slice(0, 3).map((project, idx) => (
                                    <li key={idx} className="truncate">• {project}</li>
                                ))}
                                {recommendations.neglectedProjects.length > 3 && (
                                    <li className="text-xs opacity-70">
                                        +{recommendations.neglectedProjects.length - 3} more
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Generated {recommendations.timestamp ? new Date(recommendations.timestamp).toLocaleTimeString() : 'now'}
                    </p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AINudgeDisplay;