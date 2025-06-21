import React, { useState, useRef } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { Download, Upload, Beaker, Sun, Moon, X, Brain } from 'lucide-react';
import { db, basePath } from '../../config/firebase';
import { NUDGE_CONFIG } from '../../config/constants';

function SettingsView({ currentSettings, onExportData, onFileSelectedForImport, onGenerateDummyData, owners, setSettings, projects, tasks, onTestAINudge }) {
    const fileInputRef = useRef(null);
    const handleImportClick = () => fileInputRef.current.click();
    const [localSettings, setLocalSettings] = useState(currentSettings);

    const handleSave = async () => {
        console.log('Saving settings:', localSettings);
        const settingsRef = doc(db, basePath, 'settings', 'config');
        try {
            await setDoc(settingsRef, localSettings, { merge: true });
            setSettings(localSettings);
            console.log('Settings saved successfully');
            alert('Settings saved successfully!');
        } catch(e) { 
            console.error("Error saving settings:", e);
            alert(`Error saving settings: ${e.message}`);
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

                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Prompt Template</label>
                                    <textarea 
                                        value={localSettings.aiPromptTemplate || `You are {ROBOT_CHARACTER}, a robot productivity coach analyzing task data.

Return ONLY valid JSON (no markdown, no extra text) in this EXACT format:

{
  "urgentTasks": [],
  "nearCompletionProjects": [],
  "neglectedProjects": [],
  "recommendedFocus": "Brief recommendation based on the data",
  "robotRecommendation": "Same recommendation in {ROBOT_CHARACTER}'s voice with their personality",
  "robotCharacter": "{ROBOT_CHARACTER}",
  "nudgeIntensity": "low"
}

Rules:
1. Return ONLY the JSON object above
2. Keep "robotRecommendation" under 200 characters
3. Use {ROBOT_CHARACTER}'s speech patterns and personality
4. Base recommendations on actual project data provided
5. NO markdown formatting, NO code blocks, NO extra text`} 
                                        onChange={e => setLocalSettings({...localSettings, aiPromptTemplate: e.target.value})} 
                                        rows={8}
                                        className="w-full mt-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Customize how the AI analyzes your projects and generates recommendations
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
                                                const aiRecommendations = await generateAINudge(localSettings, projects || [], tasks || []);
                                                console.log('AI Nudge Test Result:', aiRecommendations);
                                                alert('AI nudge test complete! Check console for detailed results.');
                                            } catch (error) {
                                                console.error('AI nudge test failed:', error);
                                                alert(`AI nudge test failed: ${error.message}`);
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
        </div>
    );
}

export default SettingsView;