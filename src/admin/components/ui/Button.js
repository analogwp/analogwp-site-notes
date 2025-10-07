/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Reusable Button Component with multiple variants
 */
const Button = ({ 
    children,
    variant = 'primary',
    size = 'large',
    disabled = false,
    loading = false,
    icon = null,
    iconPosition = 'left',
    className = '',
    type = 'button',
    onClick,
    ...props
}) => {
    // Base button classes
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    // Variant classes
    const variantClasses = {
        primary: 'text-white bg-blue-700 border border-blue-600 shadow-sm hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-white border border-transparent shadow-sm hover:bg-white focus:ring-blue-500',
        success: 'text-white bg-green-600 border border-green-600 hover:bg-green-700 focus:ring-green-500',
        danger: 'text-white bg-red-700 border border-red-700 hover:bg-red-600 focus:ring-red-600',
        warning: 'text-white bg-yellow-600 border border-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        ghost: 'text-gray-600 bg-transparent border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
        link: 'text-indigo-600 bg-transparent border-none hover:text-indigo-500 focus:ring-indigo-500 underline-offset-4 hover:underline'
    };
    
    // Size classes
    const sizeClasses = {
        small: 'px-3 py-1.5 text-sm rounded-full',
        medium: 'px-4 py-2 text-sm rounded-full',
        large: 'px-6 py-3 text-base font-medium! rounded-full'
    };
    
    // Disabled classes
    const disabledClasses = disabled || loading 
        ? 'opacity-50 cursor-not-allowed pointer-events-none' 
        : 'cursor-pointer';
    
    // Combine all classes
    const buttonClasses = [
        baseClasses,
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.medium,
        disabledClasses,
        className
    ].filter(Boolean).join(' ');
    
    // Handle icon rendering
    const renderIcon = () => {
        if (loading) {
            return (
                <svg 
                    className={`w-4 h-4 animate-spin ${iconPosition === 'right' ? 'ml-2' : 'mr-2'}`} 
                    fill="none" 
                    viewBox="0 0 24 24"
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
        }
        
        if (icon) {
            return (
                <span className={iconPosition === 'right' ? 'ml-2' : 'mr-2'}>
                    {icon}
                </span>
            );
        }
        
        return null;
    };
    
    return (
        <button
            type={type}
            className={buttonClasses}
            onClick={onClick}
            disabled={disabled || loading}
            {...props}
        >
            {iconPosition === 'left' && renderIcon()}
            {children}
            {iconPosition === 'right' && renderIcon()}
        </button>
    );
};

/**
 * Icon Button Component for actions with just icons
 */
export const IconButton = ({ 
    children,
    variant = 'ghost',
    size = 'medium',
    disabled = false,
    loading = false,
    className = '',
    title,
    onClick,
    ...props
}) => {
    // Base classes for icon buttons
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    // Variant classes
    const variantClasses = {
        primary: 'text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
        secondary: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:ring-indigo-500',
        success: 'text-green-600 bg-green-50 hover:bg-green-100 focus:ring-green-500',
        danger: 'text-red-600 bg-red-50 hover:bg-red-100 focus:ring-red-500',
        warning: 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100 focus:ring-yellow-500',
        ghost: 'text-gray-600 bg-transparent hover:bg-gray-50 focus:ring-gray-500'
    };
    
    // Size classes for icon buttons (square)
    const sizeClasses = {
        small: 'w-8 h-8 rounded-md',
        medium: 'w-10 h-10 rounded-md',
        large: 'w-12 h-12 rounded-lg'
    };
    
    // Disabled classes
    const disabledClasses = disabled || loading 
        ? 'opacity-50 cursor-not-allowed pointer-events-none' 
        : 'cursor-pointer';
    
    // Combine all classes
    const buttonClasses = [
        baseClasses,
        variantClasses[variant] || variantClasses.ghost,
        sizeClasses[size] || sizeClasses.medium,
        disabledClasses,
        className
    ].filter(Boolean).join(' ');
    
    return (
        <button
            type="button"
            className={buttonClasses}
            onClick={onClick}
            disabled={disabled || loading}
            title={title}
            {...props}
        >
            {loading ? (
                <svg 
                    className="w-4 h-4 animate-spin" 
                    fill="none" 
                    viewBox="0 0 24 24"
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
            ) : (
                children
            )}
        </button>
    );
};

export default Button;