import { useState, useCallback, useRef } from 'react';

const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const timeoutRefs = useRef(new Map());

    const dismissNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        
        // Clear the timeout if it exists
        if (timeoutRefs.current.has(id)) {
            clearTimeout(timeoutRefs.current.get(id));
            timeoutRefs.current.delete(id);
        }
    }, []);

    const addNotification = useCallback((notification) => {
        const id = Date.now() + Math.random(); // Simple unique ID
        const newNotification = {
            id,
            type: 'info',
            autoDismiss: true,
            duration: 4000, // Default 4 seconds
            ...notification
        };

        setNotifications(prev => [...prev, newNotification]);

        // Auto-dismiss if enabled
        if (newNotification.autoDismiss) {
            const timeoutId = setTimeout(() => {
                dismissNotification(id);
            }, newNotification.duration);
            
            timeoutRefs.current.set(id, timeoutId);
        }

        return id;
    }, [dismissNotification]);

    const showSuccess = useCallback((title, message, options = {}) => {
        return addNotification({
            type: 'success',
            title,
            message,
            duration: 3000, // Success messages dismiss faster
            ...options
        });
    }, [addNotification]);

    const showError = useCallback((title, message, options = {}) => {
        return addNotification({
            type: 'error',
            title,
            message,
            duration: 10000, // Error messages stay longer
            ...options
        });
    }, [addNotification]);

    const showWarning = useCallback((title, message, options = {}) => {
        return addNotification({
            type: 'warning',
            title,
            message,
            duration: 5000,
            ...options
        });
    }, [addNotification]);

    const showInfo = useCallback((title, message, options = {}) => {
        return addNotification({
            type: 'info',
            title,
            message,
            duration: 4000,
            ...options
        });
    }, [addNotification]);

    const clearAll = useCallback(() => {
        // Clear all timeouts
        timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
        timeoutRefs.current.clear();
        
        setNotifications([]);
    }, []);

    // Firebase error categorization helper
    const categorizeFirebaseError = useCallback((error) => {
        const errorCode = error?.code || '';
        const errorMessage = error?.message || error?.toString() || 'Unknown error';

        // Network errors
        if (errorCode.includes('network') || 
            errorMessage.toLowerCase().includes('network') ||
            errorMessage.toLowerCase().includes('offline') ||
            errorCode === 'unavailable') {
            return {
                title: 'Connection Issue',
                message: 'Please check your internet connection and try again.',
                type: 'error'
            };
        }

        // Permission errors
        if (errorCode === 'permission-denied' || 
            errorCode === 'unauthenticated') {
            return {
                title: 'Permission Denied',
                message: 'You don\'t have permission to perform this action.',
                type: 'error'
            };
        }

        // Quota exceeded
        if (errorCode === 'quota-exceeded' || 
            errorCode === 'resource-exhausted') {
            return {
                title: 'Storage Limit Reached',
                message: 'Your storage quota has been exceeded. Please contact support.',
                type: 'error'
            };
        }

        // Not found
        if (errorCode === 'not-found') {
            return {
                title: 'Data Not Found',
                message: 'The requested data could not be found.',
                type: 'warning'
            };
        }

        // Already exists
        if (errorCode === 'already-exists') {
            return {
                title: 'Already Exists',
                message: 'This item already exists.',
                type: 'warning'
            };
        }

        // Invalid argument
        if (errorCode === 'invalid-argument') {
            return {
                title: 'Invalid Data',
                message: 'Please check your input and try again.',
                type: 'error'
            };
        }

        // Default error
        return {
            title: 'Operation Failed',
            message: errorMessage.length > 100 ? 'An unexpected error occurred. Please try again.' : errorMessage,
            type: 'error'
        };
    }, []);

    const showFirebaseError = useCallback((error) => {
        const categorized = categorizeFirebaseError(error);
        return showError(categorized.title, categorized.message);
    }, [categorizeFirebaseError, showError]);

    return {
        notifications,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showFirebaseError,
        dismissNotification,
        clearAll,
        addNotification
    };
};

export default useNotifications;