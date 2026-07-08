/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { SpinnerIcon } from '../../../shared/icons';

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
        'sn-button',
        `sn-button--${variant}`,
        `sn-button--${size}`,
        fullWidth && 'sn-button--full-width',
        loading && 'sn-button--loading',
        className,
    ].filter(Boolean).join(' ');

    // Loading spinner
    const LoadingSpinner = () => (
        <SpinnerIcon className="sn-button__spinner" />
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
                <span className="sn-button__icon sn-button__icon--left">
                    <LoadingSpinner />
                </span>
            )}
            {!loading && icon && iconPosition === 'left' && (
                <span className="sn-button__icon sn-button__icon--left">{icon}</span>
            )}
            <span className="sn-button__content">{children}</span>
            {!loading && icon && iconPosition === 'right' && (
                <span className="sn-button__icon sn-button__icon--right">{icon}</span>
            )}
        </button>
    );
};

export default Button;
