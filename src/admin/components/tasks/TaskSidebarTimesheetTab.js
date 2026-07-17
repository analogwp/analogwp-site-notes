/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { formatOpenedDate } from './taskSidebarUtils';

const getTotalLoggedTime = (entries) => {
	const totalMinutes = entries.reduce((total, entry) => (
		total + (parseInt(entry.hours, 10) || 0) * 60 + (parseInt(entry.minutes, 10) || 0)
	), 0);

	return {
		hours: Math.floor(totalMinutes / 60),
		minutes: totalMinutes % 60,
	};
};

const TaskSidebarTimesheetTab = ({ entries }) => {
	const totalTime = getTotalLoggedTime(entries);

	return (
		<div className="sn-task-sidebar__timesheet">
			<div className="sn-task-sidebar__timesheet-total">
				<span className="sn-task-sidebar__timesheet-total-label">
					{__('Total Logged Time:', 'analogwp-site-notes')}
				</span>
				<span className="sn-task-sidebar__timesheet-total-value">
					{totalTime.hours}h {String(totalTime.minutes).padStart(2, '0')}m
				</span>
			</div>

			{entries.length === 0 ? (
				<p className="sn-text-m sn-text-secondary">
					{__('No time entries yet.', 'analogwp-site-notes')}
				</p>
			) : (
				<div className="sn-task-sidebar__timesheet-list">
					{entries.map((entry) => (
						<div key={entry.id} className="sn-task-sidebar__timesheet-entry">
							<div className="sn-task-sidebar__timesheet-entry-main">
								<span className="sn-task-sidebar__timesheet-duration">
									{entry.hours}h {String(entry.minutes).padStart(2, '0')}m
								</span>
								{entry.description && (
									<span className="sn-task-sidebar__timesheet-description">
										{entry.description}
									</span>
								)}
							</div>
							{entry.date && (
								<span className="sn-text-s sn-text-secondary">
									{formatOpenedDate(entry.date)}
								</span>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default TaskSidebarTimesheetTab;
