import './styles.scss';
import { ColorPicker as WPColorPicker } from '@wordpress/components';
import classnames from 'classnames';

const ColorPicker = ({
	className = '',
	size = 'default',
	variant = 'default',
	...props
}) => {
	const colorPickerClasses = classnames(
		'sn-color-picker',
		{
			[`sn-color-picker--${size}`]: size !== 'default',
			[`sn-color-picker--${variant}`]: variant !== 'default',
		},
		className
	);

	return (
		<WPColorPicker
			className={colorPickerClasses}
			{...props}
		/>
	);
};

export default ColorPicker;
