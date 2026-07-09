/**
 * Custom select with colored badge options.
 */
import { useState, useRef, useEffect } from '@wordpress/element';
import classnames from 'classnames';
import { ChevronDownIcon } from '../../../shared/icons';

const BadgeSelect = ({
	value,
	onChange,
	options,
	getOptionStyle,
	className = '',
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef(null);
	const selectedOption = options.find((option) => option.value === value) || options[0];
	const selectedStyle = getOptionStyle(value);

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
			className={classnames('sn-badge-select', className, {
				'sn-badge-select--open': isOpen,
			})}
		>
			<button
				type="button"
				className="sn-badge-select__trigger"
				onClick={() => setIsOpen((open) => !open)}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
			>
				<span className="sn-badge-select__badge" style={selectedStyle}>
					{selectedOption?.label}
				</span>
				<ChevronDownIcon size="sm" className="sn-badge-select__chevron" />
			</button>

			{isOpen && (
				<ul className="sn-badge-select__menu" role="listbox">
					{options.map((option) => {
						const isSelected = option.value === value;

						return (
							<li key={option.value} className="sn-badge-select__menu-item">
								<button
									type="button"
									role="option"
									aria-selected={isSelected}
									className={classnames('sn-badge-select__option', {
										'sn-badge-select__option--selected': isSelected,
									})}
									onClick={() => handleSelect(option.value)}
								>
									<span
										className="sn-badge-select__badge"
										style={getOptionStyle(option.value)}
									>
										{option.label}
									</span>
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};

export default BadgeSelect;
