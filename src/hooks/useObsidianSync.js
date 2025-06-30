// src/hooks/useObsidianSync.js
// Lightweight sync orchestrator hook – Phase 3 skeleton
import { useState, useCallback, useMemo } from 'react';
import ObsidianApi from '../utils/obsidianApi';
import { getMergedObsidianConfig } from '../config/obsidian';

/**
 * @param {object} firebaseSettings – settings object loaded from Firebase (or local copy)
 */
export default function useObsidianSync(firebaseSettings) {
    const cfg = useMemo(() => getMergedObsidianConfig({
        endpoint: firebaseSettings.obsidianEndpoint,
        apiKey: firebaseSettings.obsidianApiKey,
        vaultPath: firebaseSettings.obsidianVaultPath,
        autoSync: firebaseSettings.obsidianAutoSync,
    }), [firebaseSettings]);

    const api = useMemo(() => new ObsidianApi(cfg), [cfg]);

    const [state, setState] = useState('idle'); // idle | syncing | completed | error
    const [lastSync, setLastSync] = useState(null);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const syncNow = useCallback(async ({ projects, tasks }) => {
        if (state === 'syncing') return; // debounce
        try {
            setState('syncing');
            setResult(null);
            // 1. Ping connection
            await api.testConnection();
            // 2. TODO: real sync pipeline will go here (Phase 4)
                        // --- Build content ---
            const allProjects = projects || [];
            const rawTasks = tasks || [];
            // Exclude tasks that are complete and older than 30 days
            const THIRTY_DAYS = 14 * 24 * 60 * 60 * 1000;
            const now = Date.now();
            const allTasks = rawTasks.filter(t => {
                if (!t.isComplete) return true;
                const completedAt = t.completedAt ? new Date(t.completedAt).getTime() : 0;
                return (now - completedAt) <= THIRTY_DAYS;
            });

            // Index by projectId for quick lookup
            const tasksByProject = allTasks.reduce((acc, t) => {
                if (!acc[t.projectId]) acc[t.projectId] = [];
                acc[t.projectId].push(t);
                return acc;
            }, {});

            const items = [];
            // Dashboard
            const { generateDashboardMarkdown, projectFileName, taskFileName, generateProjectMarkdown, generateTaskMarkdown } = await import('../utils/markdownTemplates.js');
            items.push({ path: 'dashboard.md', content: generateDashboardMarkdown(allProjects, allTasks) });

            // Projects & tasks
            allProjects.forEach(pr => {
                const prTasks = tasksByProject[pr.id] || [];
                items.push({ path: projectFileName(pr), content: generateProjectMarkdown(pr, prTasks) });
            });
            allTasks.forEach(t => {
                const parentProject = allProjects.find(p => p.id === t.projectId);
                items.push({ path: taskFileName(t), content: generateTaskMarkdown(t, parentProject) });
            });

            // --- Push to Obsidian ---
            let created = 0;
            let updated = 0;

            for (const item of items) {
                try {
                    const createdThis = await api.updateNote(item.path, item.content);
                    if (createdThis) created++; else updated++;
                } catch (err) {
                    if (err.message && err.message.includes('404')) {
                        await api.createNote(item.path, item.content);
                        created++;
                    } else {
                        throw err;
                    }
                }
            }

            setResult({ created, updated, total: items.length });

            setLastSync(Date.now());
            setState('completed');
        } catch (e) {
            console.error('[ObsidianSync] sync failed', e);
            setError(e.message);
            setState('error');
        }
    }, [api, state]);

    const reset = useCallback(() => {
        setState('idle');
        setError(null);
        setResult(null);
    }, []);

    return {
        state,
        lastSync,
        error,
        result,
        reset,
        syncNow,
    };
}
