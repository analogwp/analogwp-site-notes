import './styles.scss';
import classnames from 'classnames';

const Badge = ({
	children,
	variant = 'default',
	size = 'medium',
	className = '',
	...props
}) => {
	const badgeClasses = classnames(
		'sn-badge',
		`sn-badge--${variant}`,
		`sn-badge--${size}`,
		className
	);

	return (
		<span className={badgeClasses} {...props}>
			{children}
		</span>
	);
};

export default Badge;
