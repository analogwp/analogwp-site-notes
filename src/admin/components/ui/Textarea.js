import { TextareaControl as WPTextareaControl } from '@wordpress/components';
import classnames from 'classnames';

const Textarea = ({
	className = '',
	size = 'default',
	variant = 'default',
	...props
}) => {
	const textareaClasses = classnames(
		'sn-textarea',
		{
			[`sn-textarea--${size}`]: size !== 'default',
			[`sn-textarea--${variant}`]: variant !== 'default',
		},
		className
	);

	return (
		<WPTextareaControl
			className={textareaClasses}
			{...props}
		/>
	);
};

export default Textarea;
