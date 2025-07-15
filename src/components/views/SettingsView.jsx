import React, { useState, useRef } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { Download, Upload, Beaker, Sun, Moon, X, Brain, Trash2 } from 'lucide-react';
import { db, basePath } from '../../config/firebase';
import { NUDGE_CONFIG } from '../../config/constants';
import useNotifications from '../../hooks/useNotifications';
import { cleanupProjectsAndTasks, previewCleanup } from '../../utils/cleanupData';

function SettingsView({ currentSettings, onExportData, onFileSelectedForImport, onGenerateDummyData, owners, setSettings, projects, tasks, onTestAINudge, activeSession }) {
    const fileInputRef = useRef(null);
    const handleImportClick = () => fileInputRef.current.click();
    const [localSettings, setLocalSettings] = useState(currentSettings);
    const { showSuccess, showError, showInfo, showFirebaseError } = useNotifications();
    const [showCleanupModal, setShowCleanupModal] = useState(false);
    const [cleanupPreview, setCleanupPreview] = useState(null);
    const [isCleaningUp, setIsCleaningUp] = useState(false);

    const handleSave = async () => {
        console.log('Saving settings:', localSettings);
        const settingsRef = doc(db, basePath, 'settings', 'config');
        try {
            await setDoc(settingsRef, localSettings, { merge: true });
            setSettings(localSettings);
            console.log('Settings saved successfully');
            showSuccess('Settings Saved', 'Your settings have been saved successfully!');
        } catch(e) { 
            console.error("Error saving settings:", e);
            showFirebaseError(e);
        }
    };

    const handleCleanupPreview = async () => {
        try {
            const projectsToKeep = ["3dprints", "Trinium Sales", "Update Home assistant"];
            const preview = await previewCleanup(projectsToKeep);
            setCleanupPreview(preview);
            setShowCleanupModal(true);
        } catch (error) {
            console.error('Error generating cleanup preview:', error);
            showError('Failed to generate cleanup preview', error.message);
        }
    };

    const handleCleanup = async () => {
        if (!window.confirm('Are you sure? This will permanently delete all projects and tasks except for: 3dprints, Trinium Sales, and Update Home assistant. This action cannot be undone!')) {
            return;
        }

        setIsCleaningUp(true);
        try {
            const projectsToKeep = ["3dprints", "Trinium Sales", "Update Home assistant"];
            const summary = await cleanupProjectsAndTasks(projectsToKeep);
            
            showSuccess(
                'Cleanup Complete',
                `Deleted ${summary.projectsDeleted} projects and ${summary.tasksDeleted} tasks. Kept ${summary.projectsKept} projects and ${summary.tasksKept} tasks.`
            );
            
            setShowCleanupModal(false);
            
            // Reload the page to refresh the data
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error('Error during cleanup:', error);
            showError('Cleanup Failed', error.message);
        } finally {
            setIsCleaningUp(false);
        }
    };
    
    const NudgeDescription = ({mode}) => {
        const descriptions = {
            [NUDGE_CONFIG.MODES.AUTOMATIC]: "System automatically adjusts based on workload.",
            [NUDGE_CONFIG.MODES.REMEMBER]: "Gentle reminders every 10 tasks on non-recommended projects.",
            [NUDGE_CONFIG.MODES.STAY_ON_TARGET]: "Warns on new project creation; nudges every 5 tasks.",
            [NUDGE_CONFIG.MODES.LAZY]: "Blocks new projects; nudges every 2 tasks.",
        };
        return <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{descriptions[mode]}</p>
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Customize your Project Nudger experience and manage your data.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* General Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">General</h2>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
                            <div className="mt-2 flex rounded-md bg-gray-100 dark:bg-gray-700 p-1">
                                <button 
                                    onClick={()=>setLocalSettings({...localSettings, theme: 'light'})} 
                                    className={`w-1/2 py-2 text-sm rounded-md flex items-center justify-center transition-colors ${
                                        localSettings.theme === 'light' 
                                            ? 'bg-white dark:bg-gray-500/50 shadow-sm' 
                                            : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    <Sun className="mr-2" size={16}/>Light
                                </button>
                                <button 
                                    onClick={()=>setLocalSettings({...localSettings, theme: 'dark'})} 
                                    className={`w-1/2 py-2 text-sm rounded-md flex items-center justify-center transition-colors ${
                                        localSettings.theme === 'dark' 
                                            ? 'bg-black/20 dark:bg-gray-900 shadow-sm' 
                                            : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    <Moon className="mr-2" size={16}/>Dark
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nudge Mode</label>
                            <select 
                                value={localSettings.nudgeMode} 
                                onChange={e => setLocalSettings({...localSettings, nudgeMode: e.target.value})} 
                                className="w-full mt-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value={NUDGE_CONFIG.MODES.AUTOMATIC}>Automatic</option>
                                <option value={NUDGE_CONFIG.MODES.REMEMBER}>Level 1: Remember</option>
                                <option value={NUDGE_CONFIG.MODES.STAY_ON_TARGET}>Level 2: Stay on Target</option>
                                <option value={NUDGE_CONFIG.MODES.LAZY}>Level 3: Lazy Sumb...</option>
                            </select>
                            <NudgeDescription mode={localSettings.nudgeMode} />
                        </div>
                    </div>
                </div>

                {/* Integrations */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Integrations</h2>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ntfy.sh Topic URL</label>
                            <input 
                                type="url" 
                                value={localSettings.ntfyUrl || ''} 
                                onChange={e => setLocalSettings({...localSettings, ntfyUrl: e.target.value})} 
                                placeholder="https://ntfy.sh/your-topic"
                                className="w-full mt-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Receive push notifications on your devices via ntfy.sh
                            </p>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">AI Nudge Assistant</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="flex items-center">
                                        <input 
                                            type="checkbox" 
                                            checked={localSettings.aiNudgeEnabled || false} 
                                            onChange={e => setLocalSettings({...localSettings, aiNudgeEnabled: e.target.checked})}
                                            className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                        />
                                        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Enable AI-powered nudges
                                        </span>
                                    </label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Get intelligent task recommendations after completing Pomodoro sessions
                                    </p>
                                </div>

                                {/* AI Nudge Output Options */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="flex items-center">
                                            <input 
                                                type="checkbox" 
                                                checked={localSettings.aiNudgeTtsEnabled !== false} 
                                                onChange={e => setLocalSettings({...localSettings, aiNudgeTtsEnabled: e.target.checked})}
                                                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                            />
                                            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Enable Text-to-Speech
                                            </span>
                                        </label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Speak robot recommendations aloud
                                        </p>
                                    </div>

                                    <div>
                                        <label className="flex items-center">
                                            <input 
                                                type="checkbox" 
                                                checked={localSettings.aiNudgeNtfyEnabled !== false} 
                                                onChange={e => setLocalSettings({...localSettings, aiNudgeNtfyEnabled: e.target.checked})}
                                                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                            />
                                            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Enable Push Notifications
                                            </span>
                                        </label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Send notifications via ntfy
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Provider</label>
                                    <select 
                                        value={localSettings.aiProvider || 'openai'} 
                                        onChange={e => setLocalSettings({...localSettings, aiProvider: e.target.value})} 
                                        className="w-full mt-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="openai">OpenAI (GPT-4o-mini) ✓ Browser Compatible</option>
                                        <option value="gemini">Google Gemini (2.0 Flash) ✓ Browser Compatible</option>
                                        <option value="anthropic">Anthropic Claude (Haiku) ⚠️ Server Required</option>
                                    </select>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Choose your preferred AI provider. Note: Anthropic requires server-side proxy due to CORS restrictions.
                                    </p>
                                </div>

                                {/* OpenAI API Key */}
                                {(localSettings.aiProvider || 'openai') === 'openai' && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">OpenAI API Key</label>
                                        <input 
                                            type="password" 
                                            value={localSettings.openaiApiKey || ''} 
                                            onChange={e => setLocalSettings({...localSettings, openaiApiKey: e.target.value})} 
                                            placeholder="sk-..."
                                            className="w-full mt-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Your OpenAI API key for generating intelligent nudges
                                        </p>
                                    </div>
                                )}

                                {/* Gemini API Key */}
                                {localSettings.aiProvider === 'gemini' && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Google Gemini API Key</label>
                                        <input 
                                            type="password" 
                                            value={localSettings.geminiApiKey || ''} 
                                            onChange={e => setLocalSettings({...localSettings, geminiApiKey: e.target.value})} 
                                            placeholder="AI..."
                                            className="w-full mt-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Your Google AI Studio API key for Gemini
                                        </p>
                                    </div>
                                )}

                                {/* Anthropic API Key */}
                                {localSettings.aiProvider === 'anthropic' && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Anthropic API Key</label>
                                        <input 
                                            type="password" 
                                            value={localSettings.anthropicApiKey || ''} 
                                            onChange={e => setLocalSettings({...localSettings, anthropicApiKey: e.target.value})} 
                                            placeholder="sk-ant-..."
                                            className="w-full mt-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Your Anthropic API key for Claude models
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Additional Request</label>
                                    <input 
                                        type="text"
                                        value={localSettings.aiAdditionalRequest || ''} 
                                        onChange={e => setLocalSettings({...localSettings, aiAdditionalRequest: e.target.value})} 
                                        placeholder="Suggest a 5-minute activity to prevent repetitive stress injury during breaks"
                                        className="w-full mt-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Optional request for the AI assistant (e.g., inspirational quotes, break activities, productivity tips)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Debug Mode */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Debug & Testing</h2>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    checked={localSettings.debugMode || false} 
                                    onChange={e => setLocalSettings({...localSettings, debugMode: e.target.checked})}
                                    className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                />
                                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Enable debug mode
                                </span>
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Shows additional testing tools and debug information
                            </p>
                        </div>

                        {localSettings.debugMode && (
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="space-y-3">
                                    <button 
                                        onClick={onGenerateDummyData} 
                                        className="w-full flex items-center justify-center px-4 py-3 rounded-md text-sm font-semibold bg-yellow-600 hover:bg-yellow-700 text-black transition-colors"
                                    >
                                        <Beaker size={16} className="mr-2"/> Generate Dummy Data
                                    </button>
                                    
                                    <button 
                                        onClick={onTestAINudge || (async () => {
                                            try {
                                                const { generateAINudge } = await import('../../utils/aiNudgeService');
                                                const aiRecommendations = await generateAINudge(localSettings, projects || [], tasks || [], activeSession);
                                                if (aiRecommendations) {
                                                    console.log('AI Nudge Test Result:', aiRecommendations);
                                                    showSuccess('AI Nudge Test Complete', 'Check console for detailed results.');
                                                } else {
                                                    console.log('AI Nudge Test Skipped - session is active or feature disabled');
                                                    showInfo('AI Nudge Test Skipped', 'Either a session is active or the feature is disabled.');
                                                }
                                            } catch (error) {
                                                console.error('AI nudge test failed:', error);
                                                showError('AI Nudge Test Failed', error.message || 'An unexpected error occurred.');
                                            }
                                        })}
                                        className="w-full flex items-center justify-center px-4 py-3 rounded-md text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                                    >
                                        <Brain size={16} className="mr-2"/> Test AI Nudge
                                    </button>
                                    
                                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                        <p>• Dummy data creates sample projects and tasks</p>
                                        <p>• Test AI nudge immediately queries OpenAI with current data</p>
                                        <p>• Results logged to browser console</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Obsidian Sync */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Obsidian Sync</h2>
                    
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Obsidian Sync</label>
                            <input
                                type="checkbox"
                                checked={localSettings.obsidianSyncEnabled || false}
                                onChange={e => setLocalSettings({...localSettings, obsidianSyncEnabled: e.target.checked})}
                                className="h-5 w-5 text-indigo-600 rounded-md"
                            />
                        </div>
                        {localSettings.obsidianSyncEnabled && (
                            <>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">REST API Endpoint</label>
                                    <input
                                        type="text"
                                        value={localSettings.obsidianEndpoint || ''}
                                        onChange={e => setLocalSettings({...localSettings, obsidianEndpoint: e.target.value})}
                                        placeholder="http://localhost:27123"
                                        className="mt-1 w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">API Key</label>
                                    <input
                                        type="password"
                                        value={localSettings.obsidianApiKey || ''}
                                        onChange={e => setLocalSettings({...localSettings, obsidianApiKey: e.target.value})}
                                        className="mt-1 w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Vault Sub-folder</label>
                                    <input
                                        type="text"
                                        value={localSettings.obsidianVaultPath || 'Nudger'}
                                        onChange={e => setLocalSettings({...localSettings, obsidianVaultPath: e.target.value})}
                                        className="mt-1 w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-sync</label>
                                    <select
                                        value={localSettings.obsidianAutoSync || 'manual'}
                                        onChange={e => setLocalSettings({...localSettings, obsidianAutoSync: e.target.value})}
                                        className="mt-1 w-full bg-gray-100 dark:bg-gray-700 rounded-md p-2 text-sm"
                                    >
                                        <option value="manual">Manual</option>
                                        <option value="onChange">On Change</option>
                                        <option value="timer">Every 15 min</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Data Management */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Data Management</h2>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={onExportData} 
                                className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                            >
                                <Download size={16} className="mr-2"/> Export Data
                            </button>
                            <button 
                                onClick={handleImportClick} 
                                className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-semibold bg-gray-600 hover:bg-gray-700 text-white transition-colors"
                            >
                                <Upload size={16} className="mr-2"/> Import Data
                            </button>
                        </div>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <button 
                                onClick={handleCleanupPreview} 
                                className="w-full flex items-center justify-center px-4 py-3 rounded-md text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors"
                            >
                                <Trash2 size={16} className="mr-2"/> Cleanup Projects & Tasks
                            </button>
                            <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                Remove all projects and tasks except: 3dprints, Trinium Sales, and Update Home assistant
                            </p>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={onFileSelectedForImport} 
                            accept=".json" 
                            className="hidden" 
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Export your data as JSON backup or import from a previous backup.
                        </p>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
                <button 
                    type="button" 
                    onClick={() => {
                        console.log('Save button clicked');
                        handleSave();
                    }} 
                    className="px-6 py-3 rounded-md text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                >
                    Save Settings
                </button>
            </div>

            {/* Cleanup Preview Modal */}
            {showCleanupModal && cleanupPreview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Cleanup Preview
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Review what will be deleted before proceeding
                            </p>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Projects to Keep */}
                            <div>
                                <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                                    Projects to Keep ({cleanupPreview.projectsToKeep.length})
                                </h4>
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-3">
                                    {cleanupPreview.projectsToKeep.length === 0 ? (
                                        <p className="text-sm text-gray-500">None found</p>
                                    ) : (
                                        <ul className="space-y-1">
                                            {cleanupPreview.projectsToKeep.map(project => (
                                                <li key={project.id} className="text-sm text-green-800 dark:text-green-200">
                                                    • {project.name} ({project.status})
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {/* Projects to Delete */}
                            <div>
                                <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                                    Projects to Delete ({cleanupPreview.projectsToDelete.length})
                                </h4>
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-md p-3 max-h-32 overflow-y-auto">
                                    {cleanupPreview.projectsToDelete.length === 0 ? (
                                        <p className="text-sm text-gray-500">None</p>
                                    ) : (
                                        <ul className="space-y-1">
                                            {cleanupPreview.projectsToDelete.map(project => (
                                                <li key={project.id} className="text-sm text-red-800 dark:text-red-200">
                                                    • {project.name} ({project.status})
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {/* Tasks Summary */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                    Tasks Summary
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-3">
                                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                            Tasks to Keep: {cleanupPreview.tasksToKeep.length}
                                        </p>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900/20 rounded-md p-3">
                                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                            Tasks to Delete: {cleanupPreview.tasksToDelete.length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                            <button 
                                onClick={() => setShowCleanupModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleCleanup}
                                disabled={isCleaningUp}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {isCleaningUp ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Cleaning...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} className="mr-2"/>
                                        Confirm Cleanup
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SettingsView;