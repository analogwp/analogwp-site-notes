/**
 * WordPress dependencies
 */
import { Button as WPButton } from '@wordpress/components';
import classnames from 'classnames';

/**
 * Custom Button wrapper component over WordPress Button
 * Provides centralized styling and consistent behavior
 */
const Button = ({ 
    children,
    variant = 'default',
    size = 'default',
    className = '',
    icon,
    disabled = false,
    loading = false,
    ...props
}) => {
    // Convert variant to WordPress Button props
    const getWPButtonProps = () => {
        const wpProps = { ...props };
        
        switch (variant) {
            case 'primary':
                wpProps.isPrimary = true;
                break;
            case 'secondary':
                wpProps.isSecondary = true;
                break;
            case 'tertiary':
                wpProps.variant = 'tertiary';
                break;
            case 'danger':
            case 'destructive':
                wpProps.isDestructive = true;
                break;
            case 'link':
                wpProps.variant = 'link';
                break;
            default:
                // default styling
                break;
        }

        // Handle size
        if (size === 'small') {
            wpProps.isSmall = true;
        } else if (size === 'large') {
            wpProps.isLarge = true;
        }

        // Handle loading state
        if (loading) {
            wpProps.isBusy = true;
            wpProps.disabled = true;
        }

        return wpProps;
    };

    // Additional custom classes for our styling
    const buttonClasses = classnames(
        'sn-button text-[14px]!', // Base class for our custom styling
        {		
						'bg-blue-600! hover:bg-blue-700! rounded-full': variant === 'primary',
						'text-blue-700 bg-white border border-blue-700 rounded-lg px-4 py-2.5 hover:bg-blue-700 hover:text-white!': variant === 'default',
						'px-6! py-2.5! h-auto!': variant !== 'link' && variant !== 'default',
						'rounded-full border-none! outline-none! shadow-sm! bg-white/40! text-gray-700!': variant === 'secondary',
						'text-gray-700! ': variant === 'tertiary',
						'text-red-800! border! border-red-800! hover:text-red-600! hover:border-red-600!': variant === 'danger',
            [`sn-button--${variant}`]: variant !== 'default',
            [`sn-button--${size}`]: size !== 'default',
            'sn-button--loading': loading,
            'sn-button--with-icon space-x-2': !!icon,
						'px-3! no-underline! text-gray-600! hover:text-blue-600! focus:text-blue-600! hover:shadow-none! focus:shadow-none!': variant === 'link',
        },
        className
    );

    return (
        <WPButton
            {...getWPButtonProps()}
            className={buttonClasses}
            disabled={disabled || loading}
            icon={icon}
        >
            {children}
        </WPButton>
    );
};

/**
 * IconButton component - Button with only an icon, no text
 */
export const IconButton = ({ 
    children,
    variant = 'tertiary',
    size = 'default',
    className = '',
    title,
    ...props
}) => {
    const iconButtonClasses = classnames(
        'sn-icon-button',
        {
            [`sn-icon-button--${variant}`]: variant !== 'tertiary',
            [`sn-icon-button--${size}`]: size !== 'default',
        },
        className
    );

    return (
        <Button
            variant={variant}
            size={size}
            className={iconButtonClasses}
            title={title}
            {...props}
        >
            {children}
        </Button>
    );
};

export default Button;