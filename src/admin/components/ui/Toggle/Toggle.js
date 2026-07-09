import './styles.scss';
import { ToggleControl as WPToggleControl } from '@wordpress/components';
import classnames from 'classnames';

const Toggle = ({
	className = '',
	size = 'default',
	variant = 'default',
	...props
}) => {
	const toggleClasses = classnames(
		'sn-toggle',
		{
			[`sn-toggle--${size}`]: size !== 'default',
			[`sn-toggle--${variant}`]: variant !== 'default',
		},
		className
	);

	return (
		<WPToggleControl
			className={toggleClasses}
			{...props}
		/>
	);
};

export default Toggle;
