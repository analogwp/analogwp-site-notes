import './styles.scss';
/**
 * Time input field with clock icon.
 */
import classnames from 'classnames';
import { ClockCircleIcon } from '../../../../shared/icons';

const FieldTime = ({
	value,
	onChange,
	placeholder = 'HH:MM',
	className = '',
}) => (
	<div className={classnames('sn-field-time', className)}>
		<input
			type="text"
			value={value}
			onChange={(event) => onChange(event.target.value)}
			placeholder={placeholder}
			className="sn-field-time__input"
			inputMode="numeric"
		/>
		<ClockCircleIcon size="lg" className="sn-field-time__icon" />
	</div>
);

export default FieldTime;
