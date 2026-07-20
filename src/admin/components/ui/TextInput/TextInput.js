import './styles.scss';
import { TextControl as WPTextControl } from '@wordpress/components';
import classnames from 'classnames';

const TextInput = ({
	className = '',
	size = 'default',
	variant = 'default',
	...props
}) => {
	const inputClasses = classnames(
		'sn-text-input',
		{
			[`sn-text-input--${size}`]: size !== 'default',
			[`sn-text-input--${variant}`]: variant !== 'default',
		},
		className
	);

	return (
		<WPTextControl
			className={inputClasses}
			{...props}
		/>
	);
};

export default TextInput;
