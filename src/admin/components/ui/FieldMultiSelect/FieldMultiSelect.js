import './styles.scss';
/**
 * Multi-select field with removable tags in the trigger.
 */
import { useState, useRef, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';
import { ChevronDownIcon, CloseSmallIcon } from '../../../../shared/icons';
import SelectMenuSearch from '../SelectMenuSearch/SelectMenuSearch';
import { filterSelectOptions, shouldShowSelectSearch } from '../selectMenuUtils';

const FieldMultiSelect = ({
	value = [],
	onChange,
	options,
	placeholder = '',
	disabled = false,
	className = '',
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const containerRef = useRef(null);
	const searchInputRef = useRef(null);
	const availableOptions = options.filter(
		(option) => !value.includes(option.value)
	);
	const showSearch = shouldShowSelectSearch(options);
	const filteredOptions = filterSelectOptions(availableOptions, searchQuery);

	useEffect(() => {
		if (!isOpen) {
			setSearchQuery('');
			return undefined;
		}

		if (showSearch && searchInputRef.current) {
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
	}, [isOpen, showSearch]);

	const handleAdd = (optionValue) => {
		if (value.includes(optionValue)) {
			return;
		}

		onChange([...value, optionValue]);
	};

	const handleRemove = (optionValue, event) => {
		event.preventDefault();
		event.stopPropagation();
		onChange(value.filter((item) => item !== optionValue));
	};

	const toggleOpen = () => {
		if (!disabled) {
			setIsOpen((open) => !open);
		}
	};

	return (
		<div
			ref={containerRef}
			className={classnames('sn-field-multi-select', className, {
				'sn-field-multi-select--open': isOpen,
				'sn-field-multi-select--disabled': disabled,
			})}
		>
			<button
				type="button"
				className="sn-field-multi-select__trigger"
				onClick={toggleOpen}
				disabled={disabled}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
			>
				<div className="sn-field-multi-select__values">
					{value.length === 0 ? (
						<span className="sn-field-multi-select__placeholder">
							{placeholder}
						</span>
					) : (
						value.map((item) => (
							<span key={item} className="sn-field-multi-select__tag">
								<span className="sn-field-multi-select__tag-label">{item}</span>
								<button
									type="button"
									className="sn-field-multi-select__tag-remove"
									onClick={(event) => handleRemove(item, event)}
									aria-label={`Remove ${item}`}
								>
									<CloseSmallIcon size="sm" />
								</button>
							</span>
						))
					)}
				</div>
				<ChevronDownIcon size="lg" className="sn-field-multi-select__chevron" />
			</button>

			{isOpen && availableOptions.length > 0 && (
				<div className="sn-field-multi-select__dropdown">
					{showSearch && (
						<SelectMenuSearch
							value={searchQuery}
							onChange={setSearchQuery}
							inputRef={searchInputRef}
						/>
					)}
					<ul className="sn-field-multi-select__menu" role="listbox">
						{filteredOptions.map((option) => (
							<li key={option.value} className="sn-field-multi-select__menu-item">
								<button
									type="button"
									role="option"
									className="sn-field-multi-select__option"
									onClick={() => handleAdd(option.value)}
								>
									<span className="sn-field-multi-select__option-label">
										{option.label}
									</span>
								</button>
							</li>
						))}
						{filteredOptions.length === 0 && (
							<li className="sn-field-multi-select__empty">
								{__('No results found', 'analogwp-site-notes')}
							</li>
						)}
					</ul>
				</div>
			)}
		</div>
	);
};

export default FieldMultiSelect;
