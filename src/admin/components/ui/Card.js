import classnames from 'classnames';

const Card = ({
	children,
	className = '',
	padding = 'medium',
	shadow = 'small',
	radius = 'card',
	...props
}) => {
	const cardClasses = classnames(
		'sn-card',
		`sn-card--padding-${padding}`,
		`sn-card--shadow-${shadow}`,
		{
			'sn-card--radius-sm': radius === 'small',
		},
		className
	);

	return (
		<div className={cardClasses} {...props}>
			{children}
		</div>
	);
};

export default Card;
