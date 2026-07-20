/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

const NoteSidebarTabs = ({ activeTab, onTabChange, showTimesheet = true }) => (
	<div className="sn-note-sidebar__tabs">
		<button
			type="button"
			className={`sn-note-sidebar__tab ${activeTab === 'details' ? 'sn-note-sidebar__tab--active' : 'sn-note-sidebar__tab--inactive'}`}
			onClick={() => onTabChange('details')}
		>
			{__('Details', 'analogwp-site-notes')}
		</button>
		{showTimesheet && (
			<button
				type="button"
				className={`sn-note-sidebar__tab ${activeTab === 'timesheet' ? 'sn-note-sidebar__tab--active' : 'sn-note-sidebar__tab--inactive'}`}
				onClick={() => onTabChange('timesheet')}
			>
				{__('Timesheet', 'analogwp-site-notes')}
			</button>
		)}
	</div>
);

export default NoteSidebarTabs;
