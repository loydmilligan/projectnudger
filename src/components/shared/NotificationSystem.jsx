import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const NotificationSystem = ({ notifications, onDismiss }) => {
    if (!notifications || notifications.length === 0) {
        return null;
    }

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5" />;
            case 'error':
                return <XCircle className="w-5 h-5" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5" />;
            case 'info':
                return <Info className="w-5 h-5" />;
            default:
                return <Info className="w-5 h-5" />;
        }
    };

    const getNotificationStyles = (type) => {
        const baseStyles = "border-l-4 shadow-lg rounded-md";
        switch (type) {
            case 'success':
                return `${baseStyles} bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200`;
            case 'error':
                return `${baseStyles} bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200`;
            case 'warning':
                return `${baseStyles} bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-800 dark:text-yellow-200`;
            case 'info':
                return `${baseStyles} bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-200`;
            default:
                return `${baseStyles} bg-gray-50 dark:bg-gray-900/20 border-gray-500 text-gray-800 dark:text-gray-200`;
        }
    };

    const getIconColor = (type) => {
        switch (type) {
            case 'success':
                return 'text-green-500';
            case 'error':
                return 'text-red-500';
            case 'warning':
                return 'text-yellow-500';
            case 'info':
                return 'text-blue-500';
            default:
                return 'text-gray-500';
        }
    };

    return (
        <div 
            className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full"
            role="region"
            aria-label="Notifications"
        >
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`${getNotificationStyles(notification.type)} p-4 transition-all duration-300 ease-in-out transform animate-slide-in-right`}
                    role="alert"
                    aria-live="polite"
                >
                    <div className="flex items-start">
                        <div className={`flex-shrink-0 ${getIconColor(notification.type)} mr-3`}>
                            {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                                {notification.title}
                            </p>
                            {notification.message && (
                                <p className="text-sm mt-1 opacity-90">
                                    {notification.message}
                                </p>
                            )}
                        </div>
                        <div className="ml-3 flex-shrink-0">
                            <button
                                onClick={() => onDismiss(notification.id)}
                                className="inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md p-1"
                                aria-label={`Dismiss ${notification.title} notification`}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationSystem;