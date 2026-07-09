/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

const TaskSidebarTimesheetTab = ({ entries }) => (
	<div className="sn-task-sidebar__timesheet">
		{entries.length === 0 ? (
			<p className="sn-text-m sn-text-secondary">
				{__('No time entries yet.', 'analogwp-site-notes')}
			</p>
		) : (
			<div className="sn-task-sidebar__timesheet-list">
				{entries.map((entry) => (
					<div key={entry.id} className="sn-task-sidebar__timesheet-entry">
						<span className="sn-task-sidebar__timesheet-duration">
							{entry.hours}h {String(entry.minutes).padStart(2, '0')}m
						</span>
						{entry.date && (
							<span className="sn-text-s sn-text-secondary">{entry.date}</span>
						)}
					</div>
				))}
			</div>
		)}
	</div>
);

export default TaskSidebarTimesheetTab;
