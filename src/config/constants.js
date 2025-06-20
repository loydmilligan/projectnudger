export const NUDGE_CONFIG = {
    LEVELS: {
        NONE: 0,
        REMEMBER: 1,
        STAY_ON_TARGET: 2,
        LAZY: 3
    },
    MODES: {
        AUTOMATIC: 'Automatic',
        REMEMBER: 'Remember',
        STAY_ON_TARGET: 'Stay on Target',
        LAZY: 'Lazy'
    },
    THRESHOLDS: {
        PROJECT_AGE_OLD: 30,
        PROJECT_AGE_VERY_OLD: 90,
        PROJECT_COUNT_SOME: 5,
        PROJECT_COUNT_MANY: 10,
        TASK_INTERVAL_LEVEL_1: 10,
        TASK_INTERVAL_LEVEL_2: 5,
        TASK_INTERVAL_LEVEL_3: 2
    }
};

export const POMODORO_CONFIG = {
    WORK_SESSION: 25 * 60,
    SHORT_BREAK: 5 * 60,
    LONG_BREAK: 10 * 60
};