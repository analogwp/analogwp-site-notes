import './styles.scss';
import { SelectControl as WPSelectControl } from '@wordpress/components';
import classnames from 'classnames';

const Select = ({
	className = '',
	size = 'default',
	variant = 'default',
	...props
}) => {
	const selectClasses = classnames(
		'sn-select',
		{
			[`sn-select--${size}`]: size !== 'default',
			[`sn-select--${variant}`]: variant !== 'default',
		},
		className
	);

	return (
		<WPSelectControl
			className={selectClasses}
			{...props}
		/>
	);
};

export default Select;
