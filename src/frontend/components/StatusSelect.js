/**
 * WordPress dependencies
 */
import { useState, useRef, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { SidebarFieldSettingsIcon } from '../../shared/icons';
import { NOTE_STATUSES, getStatusByKey } from '../constants/noteStatuses';

/**
 * Status badge colors matching admin manage-note SidebarSelect.
 *
 * @param {string} statusKey
 * @return {Object}
 */
export const getStatusBadgeStyle = (statusKey) => {
	const status = getStatusByKey(statusKey);
	if (!status) {
		return {};
	}

	return {
		backgroundColor: status.color,
		color: status.textColor,
	};
};

/**
 * Admin-style status field for the frontend single-note view.
 *
 * @param {Object}   props
 * @param {string}   props.value
 * @param {Function} props.onChange
 * @param {boolean}  props.disabled
 * @return {JSX.Element}
 */
const StatusSelect = ({ value, onChange, disabled = false }) => {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef(null);
	const selected = getStatusByKey(value) || NOTE_STATUSES[0];

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

	const handleSelect = (statusKey) => {
		onChange(statusKey);
		setIsOpen(false);
	};

	return (
		<div
			ref={containerRef}
			className={`sn-sidebar-field${isOpen ? ' sn-sidebar-field--open' : ''}${
				disabled ? ' sn-sidebar-field--disabled' : ''
			}`}
		>
			<div className="sn-sidebar-field__trigger">
				<button
					type="button"
					className="sn-sidebar-field__toggle"
					onClick={() => {
						if (!disabled) {
							setIsOpen((open) => !open);
						}
					}}
					disabled={disabled}
					aria-haspopup="listbox"
					aria-expanded={isOpen}
				>
					<span className="sn-sidebar-field__header">
						<span className="sn-sidebar-field__label">
							{__('Status', 'analogwp-site-notes')}
						</span>
						<SidebarFieldSettingsIcon size="md" className="sn-sidebar-field__icon" />
					</span>
					<span className="sn-sidebar-field__body">
						<span
							className="sn-sidebar-field__pill"
							style={getStatusBadgeStyle(selected.key)}
						>
							{selected.title}
						</span>
					</span>
				</button>

				{isOpen && (
					<div className="sn-sidebar-field__dropdown">
						<ul className="sn-sidebar-field__menu" role="listbox">
							{NOTE_STATUSES.map((status) => {
								const isSelected = status.key === value;

								return (
									<li key={status.key} className="sn-sidebar-field__menu-item">
										<button
											type="button"
											role="option"
											aria-selected={isSelected}
											className={`sn-sidebar-field__option${
												isSelected ? ' sn-sidebar-field__option--selected' : ''
											}`}
											onClick={() => handleSelect(status.key)}
										>
											<span
												className="sn-sidebar-field__pill"
												style={getStatusBadgeStyle(status.key)}
											>
												{status.title}
											</span>
										</button>
									</li>
								);
							})}
						</ul>
					</div>
				)}
			</div>
		</div>
	);
};

export default StatusSelect;
