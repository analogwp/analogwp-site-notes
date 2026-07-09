import './styles.scss';
/**
 * Date field with formatted display and calendar icon.
 */
import { useRef } from '@wordpress/element';
import classnames from 'classnames';
import { CalendarIcon } from '../../../../shared/icons';

const formatDisplayDate = (value) => {
	if (!value) {
		return '';
	}

	const date = new Date(`${value}T00:00:00`);

	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return date.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

const FieldDate = ({
	value,
	onChange,
	placeholder = '',
	className = '',
}) => {
	const inputRef = useRef(null);
	const displayValue = formatDisplayDate(value);

	const openPicker = () => {
		const input = inputRef.current;

		if (!input) {
			return;
		}

		if (typeof input.showPicker === 'function') {
			input.showPicker();
			return;
		}

		input.click();
	};

	const handleKeyDown = (event) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			openPicker();
		}
	};

	return (
		<div
			className={classnames('sn-field-date', className)}
			onClick={openPicker}
			onKeyDown={handleKeyDown}
			role="button"
			tabIndex={0}
		>
			<div className="sn-field-date__display">
				<span
					className={classnames('sn-field-date__value', {
						'sn-field-date__value--placeholder': !displayValue,
					})}
				>
					{displayValue || placeholder}
				</span>
				<CalendarIcon size="lg" className="sn-field-date__icon" />
			</div>
			<input
				ref={inputRef}
				type="date"
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className="sn-field-date__native"
				aria-label={placeholder}
				tabIndex={-1}
			/>
		</div>
	);
};

export default FieldDate;
