import classnames from 'classnames';

export const ICON_SIZE_MAP = {
	xs: 12,
	sm: 14,
	md: 16,
	lg: 20,
	xl: 24,
};

export const resolveIconPixelSize = (size, fallback = ICON_SIZE_MAP.md) => {
	if (size === undefined || size === null) {
		return fallback;
	}

	if (typeof size === 'number') {
		return size;
	}

	return ICON_SIZE_MAP[size] ?? fallback;
};

/**
 * Base SVG icon wrapper used by all shared icons.
 */
const Icon = ({
	children,
	className = '',
	size = 'md',
	viewBox = '0 0 24 24',
	fill,
	stroke,
	style,
	...props
}) => {
	const dimension = resolveIconPixelSize(size);
	const dimensionValue = `${dimension}px`;

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			className={classnames('sn-icon', size && `sn-icon--${size}`, className)}
			viewBox={viewBox}
			fill={fill}
			stroke={stroke}
			style={{
				width: dimensionValue,
				height: dimensionValue,
				flexShrink: 0,
				...style,
			}}
			aria-hidden={props['aria-label'] ? undefined : true}
			{...props}
		>
			{children}
		</svg>
	);
};

export default Icon;
