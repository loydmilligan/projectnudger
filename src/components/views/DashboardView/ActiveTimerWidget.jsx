import React, { useState, useEffect } from 'react';
import { formatTime } from '../../../utils/helpers';

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

function ActiveTimerWidget({ session, task }) {
    return (
        <div className={`p-4 rounded-lg shadow ${session.type === 'work' ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-green-100 dark:bg-green-900/50'}`}>
            <h3 className="font-bold text-lg">{session.type === 'work' ? 'Working On:' : 'On Break'}</h3>
            {session.type === 'work' && <p className="truncate">{task.title}</p>}
            <div className="text-center text-3xl font-mono my-2">
                <Timer key={session.startTime.toString()} duration={session.duration} startTime={session.startTime.toDate()} onFinish={() => {}} />
            </div>
        </div>
    );
}

export default ActiveTimerWidget;