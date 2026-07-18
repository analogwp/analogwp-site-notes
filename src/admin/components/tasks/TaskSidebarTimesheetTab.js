/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { FieldTime, parseTimeInput } from '../ui';
import { showToast } from '../ToastProvider';
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

const TaskSidebarTimesheetTab = ({ entries = [], onAddTime }) => {
	const [timeInput, setTimeInput] = useState('');
	const totalTime = getTotalLoggedTime(entries);

	const handleLogTime = () => {
		if (!onAddTime) {
			return;
		}

		const parsed = parseTimeInput(timeInput);

		if (!parsed.valid) {
			showToast.error(__('Please enter time as HH:MM', 'analogwp-site-notes'));
			return;
		}

		onAddTime(parsed.hours, parsed.minutes);
		setTimeInput('');
	};

	return (
		<div className="sn-task-sidebar__timesheet">
			<div className="sn-task-sidebar__timesheet-scroll">
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

			{onAddTime && (
				<div className="sn-task-sidebar__timesheet-add">
					<label className="sn-task-sidebar__timesheet-add-label">
						{__('Add time', 'analogwp-site-notes')}
					</label>
					<div className="sn-task-sidebar__time-row">
						<FieldTime
							value={timeInput}
							onChange={setTimeInput}
							placeholder="HH:MM"
						/>
						<button
							type="button"
							className="sn-task-sidebar__time-log-btn"
							onClick={handleLogTime}
						>
							{__('Log', 'analogwp-site-notes')}
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default TaskSidebarTimesheetTab;
