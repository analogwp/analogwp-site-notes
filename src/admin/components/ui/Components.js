/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Badge Component for status indicators, priorities, etc.
 */
export const Badge = ({ 
    children,
    variant = 'default',
    size = 'medium',
    className = '',
    ...props
}) => {
    // Base badge classes
    const baseClasses = 'inline-flex items-center font-medium';
    
    // Variant classes
    const variantClasses = {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-indigo-100 text-indigo-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800'
    };
    
    // Size classes
    const sizeClasses = {
        small: 'px-2 py-1 text-xs rounded-full',
        medium: 'px-2.5 py-0.5 text-sm rounded-full',
        large: 'px-3 py-1 text-sm rounded-full'
    };
    
    // Combine all classes
    const badgeClasses = [
        baseClasses,
        variantClasses[variant] || variantClasses.default,
        sizeClasses[size] || sizeClasses.medium,
        className
    ].filter(Boolean).join(' ');
    
    return (
        <span className={badgeClasses} {...props}>
            {children}
        </span>
    );
};

/**
 * Card Component for consistent container styling
 */
export const Card = ({ 
    children,
    className = '',
    padding = 'medium',
    shadow = 'small',
    ...props
}) => {
    // Base card classes
    const baseClasses = 'bg-white border border-gray-200 rounded-lg';
    
    // Padding classes
    const paddingClasses = {
        none: '',
        small: 'p-4',
        medium: 'p-6',
        large: 'p-8'
    };
    
    // Shadow classes
    const shadowClasses = {
        none: '',
        small: 'shadow-sm',
        medium: 'shadow-md',
        large: 'shadow-lg'
    };
    
    // Combine all classes
    const cardClasses = [
        baseClasses,
        paddingClasses[padding] || paddingClasses.medium,
        shadowClasses[shadow] || shadowClasses.small,
        className
    ].filter(Boolean).join(' ');
    
    return (
        <div className={cardClasses} {...props}>
            {children}
        </div>
    );
};

/**
 * Spinner Component for loading states
 */
export const Spinner = ({ 
    size = 'medium',
    className = '',
    ...props
}) => {
    // Size classes
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-6 h-6',
        large: 'w-8 h-8'
    };
    
    const spinnerClasses = [
        'animate-spin',
        sizeClasses[size] || sizeClasses.medium,
        className
    ].filter(Boolean).join(' ');
    
    return (
        <svg 
            className={spinnerClasses}
            fill="none" 
            viewBox="0 0 24 24"
            {...props}
        >
            <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
            />
            <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );
};

/**
 * Alert Component for notifications and messages
 */
export const Alert = ({ 
    children,
    variant = 'info',
    className = '',
    dismissible = false,
    onDismiss,
    ...props
}) => {
    // Base alert classes
    const baseClasses = 'p-4 border rounded-lg';
    
    // Variant classes
    const variantClasses = {
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        success: 'bg-green-50 border-green-200 text-green-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        danger: 'bg-red-50 border-red-200 text-red-800'
    };
    
    // Combine all classes
    const alertClasses = [
        baseClasses,
        variantClasses[variant] || variantClasses.info,
        className
    ].filter(Boolean).join(' ');
    
    return (
        <div className={alertClasses} {...props}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    {children}
                </div>
                {dismissible && (
                    <button
                        onClick={onDismiss}
                        className="ml-4 text-current hover:opacity-75 transition-opacity"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};