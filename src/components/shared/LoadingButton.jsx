import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingButton = ({ 
    isLoading = false, 
    children, 
    onClick, 
    disabled = false, 
    variant = 'primary',
    size = 'medium',
    className = '',
    ...props 
}) => {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variantClasses = {
        primary: "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500",
        secondary: "bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-gray-100 focus:ring-gray-500",
        danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
        success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
        ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-500"
    };
    
    const sizeClasses = {
        small: "px-2 py-1 text-xs",
        medium: "px-4 py-2 text-sm",
        large: "px-6 py-3 text-base"
    };

    const buttonClasses = `${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size] || sizeClasses.medium} ${className}`;

    const handleClick = (e) => {
        if (!isLoading && !disabled && onClick) {
            onClick(e);
        }
    };

    return (
        <button
            className={buttonClasses}
            onClick={handleClick}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && (
                <Loader2 
                    className={`animate-spin mr-2 ${size === 'small' ? 'w-3 h-3' : size === 'large' ? 'w-5 h-5' : 'w-4 h-4'}`}
                />
            )}
            {children}
        </button>
    );
};

export default LoadingButton;