import './styles.scss';
/**
 * Custom bordered select field with optional leading content (e.g. avatar).
 */
import { useState, useRef, useEffect } from '@wordpress/element';
import classnames from 'classnames';
import { ChevronDownIcon } from '../../../../shared/icons';

const FieldSelect = ({
	value,
	onChange,
	options,
	placeholder = '',
	displayLabel = null,
	renderLeading = null,
	disabled = false,
	className = '',
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef(null);
	const selectedOption = options.find((option) => String(option.value) === String(value));
	const hasValue = displayLabel || selectedOption?.label;
	const triggerLabel = displayLabel || selectedOption?.label || placeholder;

	useEffect(() => {
		if (!isOpen) {
			return undefined;
		}

		const handlePointerDown = (event) => {
			if (containerRef.current && !containerRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};

		const handleKeyDown = (event) => {
			if (event.key === 'Escape') {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handlePointerDown);
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('mousedown', handlePointerDown);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [isOpen]);

	const handleSelect = (optionValue) => {
		onChange(optionValue);
		setIsOpen(false);
	};

	return (
		<div
			ref={containerRef}
			className={classnames('sn-field-select', className, {
				'sn-field-select--open': isOpen,
				'sn-field-select--disabled': disabled,
			})}
		>
			<button
				type="button"
				className="sn-field-select__trigger"
				onClick={() => !disabled && setIsOpen((open) => !open)}
				disabled={disabled}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
			>
				{renderLeading && selectedOption && renderLeading(selectedOption)}
				<span
					className={classnames('sn-field-select__value', {
						'sn-field-select__value--placeholder': !hasValue,
					})}
				>
					{triggerLabel}
				</span>
				<ChevronDownIcon size="lg" className="sn-field-select__chevron" />
			</button>

			{isOpen && (
				<ul className="sn-field-select__menu" role="listbox">
					{options.map((option) => {
						const isSelected = String(option.value) === String(value);

						return (
							<li key={option.value || option.label} className="sn-field-select__menu-item">
								<button
									type="button"
									role="option"
									aria-selected={isSelected}
									className={classnames('sn-field-select__option', {
										'sn-field-select__option--selected': isSelected,
									})}
									onClick={() => handleSelect(option.value)}
								>
									{renderLeading && renderLeading(option)}
									<span className="sn-field-select__option-label">{option.label}</span>
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};

export default FieldSelect;
