/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';

const SettingsHeader = ({ activeTab, onTabChange }) => {
	const tabs = [
		{ id: 'general', label: __('General', 'analogwp-site-notes') },
		{ id: 'access-control', label: __('Access Control', 'analogwp-site-notes') },
		// Keep id "task-priorities" — settings URL/tab key; renaming would break bookmarks (not a DB migration but stable API).
		{ id: 'task-priorities', label: __('Priorities', 'analogwp-site-notes') },
		{ id: 'categories', label: __('Categories', 'analogwp-site-notes') },
		{ id: 'advanced', label: __('Advanced', 'analogwp-site-notes') },
	];

	return (
		<div className="sn-settings-header">
			<nav className="sn-settings-tabs">
				{tabs.map(tab => (
					<button
						key={tab.id}
						type="button"
						className={classnames('sn-settings-tab', {
							'sn-settings-tab--active': activeTab === tab.id,
							'sn-settings-tab--inactive': activeTab !== tab.id,
						})}
						onClick={() => onTabChange(tab.id)}
					>
						<span>{tab.label}</span>
					</button>
				))}
			</nav>
		</div>
	);
};

export default SettingsHeader;
