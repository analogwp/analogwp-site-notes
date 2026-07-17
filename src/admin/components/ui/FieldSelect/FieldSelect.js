import './styles.scss';
/**
 * Custom bordered select field with optional leading content (e.g. avatar).
 */
import { useState, useRef, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';
import { ChevronDownIcon } from '../../../../shared/icons';
import SelectMenuSearch from '../SelectMenuSearch/SelectMenuSearch';
import { filterSelectOptions } from '../selectMenuUtils';

const FieldSelect = ({
	value,
	onChange,
	options,
	placeholder = '',
	displayLabel = null,
	renderLeading = null,
	clearable = false,
	clearLabel = '',
	clearValue = '',
	disabled = false,
	className = '',
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const containerRef = useRef(null);
	const searchInputRef = useRef(null);
	const selectedOption = options.find((option) => String(option.value) === String(value));
	const hasValue = Boolean(displayLabel || selectedOption?.label);
	const triggerLabel = displayLabel || selectedOption?.label || placeholder;
	const resolvedClearLabel = clearLabel || placeholder;
	const filteredOptions = filterSelectOptions(options, searchQuery);

	useEffect(() => {
		if (!isOpen) {
			setSearchQuery('');
			return undefined;
		}

		if (searchInputRef.current) {
			searchInputRef.current.focus();
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
				<div className="sn-field-select__dropdown">
					<SelectMenuSearch
						value={searchQuery}
						onChange={setSearchQuery}
						inputRef={searchInputRef}
					/>
					<ul className="sn-field-select__menu" role="listbox">
						{clearable && (
							<li className="sn-field-select__menu-item">
								<button
									type="button"
									role="option"
									aria-selected={!hasValue}
									className={classnames('sn-field-select__option', 'sn-field-select__option--clear', {
										'sn-field-select__option--selected': !hasValue,
									})}
									onClick={() => handleSelect(clearValue)}
								>
									<span className="sn-field-select__option-label">{resolvedClearLabel}</span>
								</button>
							</li>
						)}
						{filteredOptions.map((option) => {
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
						{filteredOptions.length === 0 && (
							<li className="sn-field-select__empty">
								{__('No results found', 'analogwp-site-notes')}
							</li>
						)}
					</ul>
				</div>
			)}
		</div>
	);
};

export default FieldSelect;
