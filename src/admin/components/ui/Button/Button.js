import './styles.scss';
/**
 * WordPress dependencies
 */
import { Button as WPButton } from '@wordpress/components';
import classnames from 'classnames';
import { resolveIconPixelSize } from '../../../../shared/icons';

const resolveButtonIconSize = (iconSize, icon) => {
	if (iconSize !== undefined) {
		return resolveIconPixelSize(iconSize);
	}

	if (icon?.props?.size !== undefined) {
		return resolveIconPixelSize(icon.props.size);
	}

	return resolveIconPixelSize('md');
};

const Button = ({
	children,
	variant = 'default',
	size = 'default',
	className = '',
	icon,
	iconSize,
	disabled = false,
	loading = false,
	...props
}) => {
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
				break;
		}

		if (size === 'small') {
			wpProps.isSmall = true;
		} else if (size === 'large') {
			wpProps.isLarge = true;
		}

		if (loading) {
			wpProps.isBusy = true;
			wpProps.disabled = true;
		}

		return wpProps;
	};

	const buttonClasses = classnames(
		'sn-button',
		{
			'sn-button--primary': variant === 'primary',
			'sn-button--default': variant === 'default',
			'sn-button--secondary': variant === 'secondary',
			'sn-button--tertiary': variant === 'tertiary',
			'sn-button--danger': variant === 'danger' || variant === 'destructive',
			'sn-button--link': variant === 'link',
			[`sn-button--${size}`]: size !== 'default',
			'sn-button--loading': loading,
			'sn-button--with-icon': !!icon,
		},
		className
	);

	return (
		<WPButton
			{...getWPButtonProps()}
			className={buttonClasses}
			disabled={disabled || loading}
			icon={icon}
			iconSize={icon ? resolveButtonIconSize(iconSize, icon) : undefined}
		>
			{children}
		</WPButton>
	);
};

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
