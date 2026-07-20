import './styles.scss';
/**
 * GitHub-style sidebar select: label + settings icon header, value shown below.
 */
import { useState, useRef, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';
import { SidebarFieldSettingsIcon } from '../../../../shared/icons';
import SelectMenuSearch from '../SelectMenuSearch/SelectMenuSearch';
import { filterSelectOptions } from '../selectMenuUtils';

const SidebarSelect = ({
	label,
	emptyText,
	value,
	onChange,
	options = [],
	clearable = false,
	clearLabel = '',
	clearValue = '',
	disabled = false,
	className = '',
	renderOptionLeading = null,
	getOptionStyle = null,
	footerLink = null,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const containerRef = useRef(null);
	const searchInputRef = useRef(null);
	const selectedOption = options.find((option) => String(option.value) === String(value));
	const hasValue = Boolean(
		selectedOption
		&& value !== ''
		&& value !== null
		&& value !== undefined
		&& String(value) !== String(clearValue)
	);
	const resolvedClearLabel = clearLabel || emptyText;
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

	const toggleOpen = () => {
		if (!disabled) {
			setIsOpen((open) => !open);
		}
	};

	const handleSelect = (optionValue) => {
		onChange(optionValue);
		setIsOpen(false);
	};

	const renderSelectedValue = () => {
		if (!hasValue) {
			return <span className="sn-sidebar-field__empty">{emptyText}</span>;
		}

		if (getOptionStyle) {
			return (
				<span className="sn-sidebar-field__pill" style={getOptionStyle(value)}>
					{selectedOption.label}
				</span>
			);
		}

		if (renderOptionLeading) {
			return (
				<span className="sn-sidebar-field__assignee">
					{renderOptionLeading(selectedOption)}
					<span className="sn-sidebar-field__value">{selectedOption.label}</span>
				</span>
			);
		}

		return <span className="sn-sidebar-field__value">{selectedOption.label}</span>;
	};

	return (
		<div
			ref={containerRef}
			className={classnames('sn-sidebar-field', className, {
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
							{clearable && (
								<li className="sn-sidebar-field__menu-item">
									<button
										type="button"
										role="option"
										aria-selected={!hasValue}
										className={classnames('sn-sidebar-field__option', 'sn-sidebar-field__option--clear', {
											'sn-sidebar-field__option--selected': !hasValue,
										})}
										onClick={() => handleSelect(clearValue)}
									>
										<span className="sn-sidebar-field__option-label">{resolvedClearLabel}</span>
									</button>
								</li>
							)}
							{filteredOptions.map((option) => {
								const isSelected = String(option.value) === String(value);

								return (
									<li key={option.value || option.label} className="sn-sidebar-field__menu-item">
										<button
											type="button"
											role="option"
											aria-selected={isSelected}
											className={classnames('sn-sidebar-field__option', {
												'sn-sidebar-field__option--selected': isSelected,
											})}
											onClick={() => handleSelect(option.value)}
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

export default SidebarSelect;
