/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Button Component
 * 
 * A customizable button component with multiple variants and sizes.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.variant - Button variant: 'primary', 'secondary', 'danger', 'ghost', 'link'
 * @param {string} props.size - Button size: 'sm', 'md', 'lg'
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.loading - Whether button is in loading state
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Click handler
 * @param {string} props.type - Button type: 'button', 'submit', 'reset'
 * @param {Object} props.icon - Icon element to display
 * @param {string} props.iconPosition - Icon position: 'left', 'right'
 * @param {string} props.ariaLabel - Accessible label
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    className = '',
    onClick,
    type = 'button',
    icon,
    iconPosition = 'left',
    ariaLabel,
    ...rest
}) => {
    // Build class names
    const classNames = [
        'cht-button',
        `cht-button--${variant}`,
        `cht-button--${size}`,
        fullWidth && 'cht-button--full-width',
        loading && 'cht-button--loading',
        className,
    ].filter(Boolean).join(' ');

    // Loading spinner
    const LoadingSpinner = () => (
        <svg 
            className="cht-button__spinner" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
        >
            <circle 
                className="cht-button__spinner-track" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
            />
            <path 
                className="cht-button__spinner-path" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );

    return (
        <button
            type={type}
            className={classNames}
            onClick={onClick}
            disabled={disabled || loading}
            aria-label={ariaLabel}
            {...rest}
        >
            {loading && (
                <span className="cht-button__icon cht-button__icon--left">
                    <LoadingSpinner />
                </span>
            )}
            {!loading && icon && iconPosition === 'left' && (
                <span className="cht-button__icon cht-button__icon--left">{icon}</span>
            )}
            <span className="cht-button__content">{children}</span>
            {!loading && icon && iconPosition === 'right' && (
                <span className="cht-button__icon cht-button__icon--right">{icon}</span>
            )}
        </button>
    );
};

export default Button;
