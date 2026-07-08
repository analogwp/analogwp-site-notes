import classnames from 'classnames';

const SIZE_MAP = {
	xs: 12,
	sm: 14,
	md: 16,
	lg: 20,
	xl: 24,
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
	...props
}) => {
	const dimension = SIZE_MAP[size] ?? size;

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			className={classnames('sn-icon', size && `sn-icon--${size}`, className)}
			width={typeof dimension === 'number' ? dimension : undefined}
			height={typeof dimension === 'number' ? dimension : undefined}
			viewBox={viewBox}
			fill={fill}
			stroke={stroke}
			aria-hidden={props['aria-label'] ? undefined : true}
			{...props}
		>
			{children}
		</svg>
	);
};

export default Icon;
