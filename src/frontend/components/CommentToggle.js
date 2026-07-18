/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { CommentCursorIcon, HideIcon } from '../../shared/icons';

const CommentToggle = ({ isActive, onToggle }) => {
	const [isVisible, setIsVisible] = useState(true);

	// Keep admin bar title status and dropdown label in sync with Notes mode.
	useEffect(() => {
		const adminBarStatus = document.getElementById('sn-admin-bar-status');
		if (adminBarStatus) {
			adminBarStatus.textContent = isActive
				? __('On', 'analogwp-site-notes')
				: __('Off', 'analogwp-site-notes');
			adminBarStatus.classList.toggle('is-on', isActive);
			adminBarStatus.classList.toggle('is-off', !isActive);
		}

		const adminBarToggle = document.getElementById('sn-admin-bar-toggle');
		if (adminBarToggle) {
			adminBarToggle.textContent = isActive
				? __('Disable Notes', 'analogwp-site-notes')
				: __('Enable Notes', 'analogwp-site-notes');
		}
	}, [isActive]);

	// Parent admin bar title and dropdown item both toggle Notes mode.
	useEffect(() => {
		const handleToggleClick = (event) => {
			event.preventDefault();
			onToggle(!isActive);
		};

		const parentItem = document.querySelector('#wp-admin-bar-agwp-sn-menu > .ab-item');
		const dropdownItem = document.querySelector('.agwp-sn-admin-bar-toggle');

		parentItem?.addEventListener('click', handleToggleClick);
		dropdownItem?.addEventListener('click', handleToggleClick);

		return () => {
			parentItem?.removeEventListener('click', handleToggleClick);
			dropdownItem?.removeEventListener('click', handleToggleClick);
		};
	}, [isActive, onToggle]);

	if (!isVisible) {
		return null;
	}

	return (
		<div className={`sn-toggle-button ${isActive ? 'active' : ''}`} data-sn-ignore="true">
			<button
				onClick={() => onToggle(!isActive)}
				className="sn-toggle-btn"
				data-sn-ignore="true"
				aria-label={
					isActive
						? __('Disable Notes mode', 'analogwp-site-notes')
						: __('Enable Notes mode', 'analogwp-site-notes')
				}
			>
				<span className="sn-toggle-icon">
					<CommentCursorIcon />
				</span>

				<span className="sn-toggle-text">
					{__('Notes', 'analogwp-site-notes')}
					<span className={`sn-toggle-status ${isActive ? 'is-on' : 'is-off'}`}>
						{isActive ? __('On', 'analogwp-site-notes') : __('Off', 'analogwp-site-notes')}
					</span>
				</span>
			</button>

			<button
				onClick={() => setIsVisible(false)}
				className="sn-toggle-hide"
				data-sn-ignore="true"
				aria-label={__('Hide toggle button', 'analogwp-site-notes')}
			>
				<HideIcon className="sn-hide-icon" />
			</button>
		</div>
	);
};

export default CommentToggle;
