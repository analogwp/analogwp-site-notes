import './styles.scss';
import classnames from 'classnames';
import { SpinnerIcon } from '../../../../shared/icons';

const Spinner = ({
	size = 'medium',
	className = '',
	...props
}) => {
	const spinnerClasses = classnames(
		'sn-spinner',
		`sn-spinner--${size}`,
		className
	);

	return (
		<SpinnerIcon
			className={spinnerClasses}
			{...props}
		/>
	);
};

export default Spinner;
