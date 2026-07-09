/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

const TaskSidebarTabs = ({ activeTab, onTabChange }) => (
	<div className="sn-task-sidebar__tabs">
		<button
			type="button"
			className={`sn-task-sidebar__tab ${activeTab === 'details' ? 'sn-task-sidebar__tab--active' : 'sn-task-sidebar__tab--inactive'}`}
			onClick={() => onTabChange('details')}
		>
			{__('Details', 'analogwp-site-notes')}
		</button>
		<button
			type="button"
			className={`sn-task-sidebar__tab ${activeTab === 'timesheet' ? 'sn-task-sidebar__tab--active' : 'sn-task-sidebar__tab--inactive'}`}
			onClick={() => onTabChange('timesheet')}
		>
			{__('Timesheet', 'analogwp-site-notes')}
		</button>
	</div>
);

export default TaskSidebarTabs;
