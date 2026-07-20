import '../SidebarSelect/styles.scss';
/**
 * GitHub-style sidebar multi-select: label + settings icon header, pills shown below.
 */
import { useState, useRef, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';
import { SidebarFieldSettingsIcon } from '../../../../shared/icons';
import SelectMenuSearch from '../SelectMenuSearch/SelectMenuSearch';
import { filterSelectOptions } from '../selectMenuUtils';

const sanitizeMultiSelectValue = (value = []) => value.filter(
	(item) => item !== null && item !== undefined && String(item) !== '' && String(item) !== '0'
);

const SidebarMultiSelect = ({
	label,
	emptyText,
	value = [],
	onChange,
	options = [],
	disabled = false,
	className = '',
	getOptionStyle = null,
	renderOptionLeading = null,
	renderPill = null,
	footerLink = null,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const containerRef = useRef(null);
	const searchInputRef = useRef(null);
	const selectedValues = sanitizeMultiSelectValue(value);
	const filteredOptions = filterSelectOptions(options, searchQuery);

	const getOptionForValue = (item) => options.find(
		(option) => String(option.value) === String(item)
	);

	const isOptionSelected = (optionValue) => selectedValues.some(
		(item) => String(item) === String(optionValue)
	);

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

	const toggleOpen = () => {
		if (!disabled) {
			setIsOpen((open) => !open);
		}
	};

	const handleToggle = (optionValue) => {
		const optionId = String(optionValue);

		if (isOptionSelected(optionId)) {
			onChange(selectedValues.filter((item) => String(item) !== optionId));
			return;
		}

		onChange([...selectedValues, optionId]);
	};

	const renderSelectedValue = () => {
		if (selectedValues.length === 0) {
			return <span className="sn-sidebar-field__empty">{emptyText}</span>;
		}

		return (
			<span className="sn-sidebar-field__pills">
				{selectedValues.map((item) => {
					const option = getOptionForValue(item);

					if (renderPill && option) {
						return (
							<span key={item} className="sn-sidebar-field__pill sn-sidebar-field__pill--user">
								{renderPill(option)}
							</span>
						);
					}

					return (
						<span
							key={item}
							className="sn-sidebar-field__pill sn-sidebar-field__pill--tag"
							style={getOptionStyle ? getOptionStyle(item) : undefined}
						>
							{option?.label || item}
						</span>
					);
				})}
			</span>
		);
	};

	return (
		<div
			ref={containerRef}
			className={classnames('sn-sidebar-field', 'sn-sidebar-field--multi', className, {
				'sn-sidebar-field--open': isOpen,
				'sn-sidebar-field--disabled': disabled,
			})}
		>
			<div className="sn-sidebar-field__trigger">
				<button
					type="button"
					className="sn-sidebar-field__toggle"
					onClick={toggleOpen}
					disabled={disabled}
					aria-haspopup="listbox"
					aria-expanded={isOpen}
				>
					<span className="sn-sidebar-field__header">
						<span className="sn-sidebar-field__label">{label}</span>
						<SidebarFieldSettingsIcon size="md" className="sn-sidebar-field__icon" />
					</span>
					<span className="sn-sidebar-field__body">
						{renderSelectedValue()}
					</span>
				</button>

				{isOpen && (
					<div className="sn-sidebar-field__dropdown">
						<SelectMenuSearch
							value={searchQuery}
							onChange={setSearchQuery}
							inputRef={searchInputRef}
							className="sn-sidebar-field__search"
						/>
						<ul className="sn-sidebar-field__menu" role="listbox">
							{options.length === 0 && (
								<li className="sn-sidebar-field__empty-item">
									{__('No options available', 'analogwp-site-notes')}
								</li>
							)}
							{filteredOptions.map((option) => {
								const isSelected = isOptionSelected(option.value);

								return (
									<li key={option.value} className="sn-sidebar-field__menu-item">
										<button
											type="button"
											role="option"
											aria-selected={isSelected}
											className={classnames('sn-sidebar-field__option', {
												'sn-sidebar-field__option--selected': isSelected,
											})}
											onClick={() => handleToggle(option.value)}
										>
											{renderOptionLeading && renderOptionLeading(option)}
											{getOptionStyle ? (
												<span
													className="sn-sidebar-field__pill"
													style={getOptionStyle(option.value)}
												>
													{option.label}
												</span>
											) : (
												<span className="sn-sidebar-field__option-label">{option.label}</span>
											)}
											{isSelected && (
												<span className="sn-sidebar-field__check" aria-hidden="true">✓</span>
											)}
										</button>
									</li>
								);
							})}
							{filteredOptions.length === 0 && (
								<li className="sn-sidebar-field__empty-item">
									{__('No results found', 'analogwp-site-notes')}
								</li>
							)}
						</ul>
					</div>
				)}
			</div>

			{footerLink && (
				<div className="sn-sidebar-field__footer">
					{footerLink}
				</div>
			)}
		</div>
	);
};

export default SidebarMultiSelect;
