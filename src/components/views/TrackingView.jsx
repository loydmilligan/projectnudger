import React, { useMemo, useState, useEffect } from 'react';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db, basePath } from '../../config/firebase';
import { POMODORO_CONFIG } from '../../config/constants';
import { formatTime } from '../../utils/helpers';

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

function TrackingView({ session, tasks, onSessionEnd }) {
    const task = useMemo(() => tasks.find(t => t.id === session?.taskId), [tasks, session]);
    
    const handleStop = async () => {
        onSessionEnd(session);
        await setDoc(doc(db, basePath, 'tracking', 'activeSession'), { active: false }, { merge: true });
    };

    const handleDouble = async () => {
        if (!session || session.type !== 'work' ) return;
        const newDuration = POMODORO_CONFIG.WORK_SESSION * 2;
        await updateDoc(doc(db, basePath, 'tracking', 'activeSession'), { duration: newDuration, isDouble: true });
    }

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