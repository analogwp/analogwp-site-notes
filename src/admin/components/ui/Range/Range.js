import './styles.scss';
import { RangeControl as WPRangeControl } from '@wordpress/components';
import classnames from 'classnames';

const Range = ({
	className = '',
	size = 'default',
	variant = 'default',
	...props
}) => {
	const rangeClasses = classnames(
		'sn-range',
		{
			[`sn-range--${size}`]: size !== 'default',
			[`sn-range--${variant}`]: variant !== 'default',
		},
		className
	);

	return (
		<WPRangeControl
			className={rangeClasses}
			{...props}
		/>
	);
};

export default Range;
