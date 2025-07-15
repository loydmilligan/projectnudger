import React, { useMemo, useState, useEffect } from 'react';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db, basePath } from '../../config/firebase';
import { POMODORO_CONFIG } from '../../config/constants';
import { formatTime } from '../../utils/helpers';
import { Settings, Clock, BarChart3, Calendar, TrendingUp } from 'lucide-react';
import TimeEntryModal from '../shared/TimeEntryModal';

function Timer({ duration, startTime, onFinish }) {
    const [remaining, setRemaining] = useState(duration);

    useEffect(() => {
        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTime.getTime()) / 1000;
            const newRemaining = Math.max(0, Math.floor(duration - elapsed));
            setRemaining(newRemaining);

            if (newRemaining <= 0) {
                clearInterval(interval);
                try { new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg").play(); } catch(e) { console.error("Audio playback failed", e); }
                onFinish();
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [duration, startTime, onFinish]);

    return <div className="text-8xl font-bold my-4 text-white font-mono">{formatTime(remaining)}</div>;
}

function TrackingView({ session, tasks, onSessionEnd, onAddTimeEntry }) {
    const task = useMemo(() => tasks.find(t => t.id === session?.taskId), [tasks, session]);
    const [showSettings, setShowSettings] = useState(false);
    const [showTimeEntryModal, setShowTimeEntryModal] = useState(false);
    const [timeEntryTask, setTimeEntryTask] = useState(null);
    const [timeTrackingSettings, setTimeTrackingSettings] = useState({
        autoTrackPomodoros: true,
        showTimeIndicators: true,
        dailyTimeGoal: 8 * 60, // 8 hours in minutes
        weeklyTimeGoal: 40 * 60 // 40 hours in minutes
    });

    // Calculate time tracking statistics
    const timeStats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        
        let dailyTime = 0;
        let weeklyTime = 0;
        let totalTasks = 0;
        let tasksWithTime = 0;
        
        tasks.forEach(task => {
            if (task.timeTracked && Array.isArray(task.timeTracked)) {
                totalTasks++;
                let taskTime = 0;
                
                task.timeTracked.forEach(entry => {
                    const entryDate = entry.timestamp?.toDate ? entry.timestamp.toDate() : new Date(entry.timestamp);
                    const duration = entry.duration || 0;
                    
                    if (entryDate >= today) {
                        dailyTime += duration;
                    }
                    if (entryDate >= startOfWeek) {
                        weeklyTime += duration;
                    }
                    taskTime += duration;
                });
                
                if (taskTime > 0) {
                    tasksWithTime++;
                }
            }
        });
        
        return {
            dailyTime,
            weeklyTime,
            totalTasks,
            tasksWithTime,
            dailyProgress: (dailyTime / timeTrackingSettings.dailyTimeGoal) * 100,
            weeklyProgress: (weeklyTime / timeTrackingSettings.weeklyTimeGoal) * 100
        };
    }, [tasks, timeTrackingSettings]);

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}m`;
        if (mins === 0) return `${hours}h`;
        return `${hours}h ${mins}m`;
    };
    
    const handleStop = async () => {
        onSessionEnd(session);
        await setDoc(doc(db, basePath, 'tracking', 'activeSession'), { active: false }, { merge: true });
    };

    const handleDouble = async () => {
        if (!session || session.type !== 'work' ) return;
        const newDuration = POMODORO_CONFIG.WORK_SESSION * 2;
        await updateDoc(doc(db, basePath, 'tracking', 'activeSession'), { duration: newDuration, isDouble: true });
    };

    const handleManualTimeEntry = (task) => {
        setTimeEntryTask(task);
        setShowTimeEntryModal(true);
    };

    const handleSaveTimeEntry = async (taskId, timeEntry) => {
        if (onAddTimeEntry && typeof onAddTimeEntry === 'function') {
            await onAddTimeEntry(taskId, timeEntry);
        }
        setShowTimeEntryModal(false);
        setTimeEntryTask(null);
    };

    if (!session || !task) {
        return <div className="text-center p-10"><h2 className="text-2xl font-bold">No active session.</h2><p>Start a task from the Projects or Tasks view.</p></div>
    }

    return (
        <div className="max-w-2xl mx-auto text-center">
            <div className={`p-8 rounded-lg ${session.type === 'work' ? 'bg-indigo-600' : 'bg-green-600'}`}>
                <h2 className="text-3xl font-bold text-white">{session.type === 'work' ? 'Work Session' : 'Rest & Recharge'}</h2>
                <Timer key={session.startTime.toString()} duration={session.duration} startTime={session.startTime.toDate()} onFinish={handleStop} />
            </div>
            <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                 <h3 className="text-xl font-bold">{task.title}</h3>
                 <p className="text-gray-600 dark:text-gray-400 mt-2">{task.detail}</p>
            </div>
            <div className="mt-6 flex justify-center space-x-4">
                {session.type === 'work' && !session.isDouble && <button onClick={handleDouble} className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold">Double Session</button>}
                <button onClick={handleStop} className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold">Stop & Log</button>
            </div>
        </div>
    );
}

export default TrackingView;