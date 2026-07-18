/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { showToast } from '../ToastProvider';
import { useSettings } from '../settings/SettingsProvider';
import logger from '../../../shared/utils/logger';
import { CloseIcon } from '../../../shared/icons';
import TaskSidebarDetailsFields from './TaskSidebarDetailsFields';
import TaskSidebarTimesheetTab from './TaskSidebarTimesheetTab';
import TaskSidebarTabs from './TaskSidebarTabs';
import TaskSidebarFooter from './TaskSidebarFooter';
import {
	EMPTY_TASK_FORM,
	buildTaskPayload,
	buildTimeEntry,
	buildTimesheetData,
	getDefaultPriorityOptions,
	getPriorityBadgeStyle,
	getStatusBadgeStyle,
} from './taskSidebarUtils';

const AddTaskSidebar = ({ onClose, onSave, users, pages, statuses = [], onNavigateToSettingsTab }) => {
	const { categories, priorities } = useSettings();
	const [formData, setFormData] = useState(EMPTY_TASK_FORM);
	const [activeTab, setActiveTab] = useState('details');
	const [pendingTimeEntries, setPendingTimeEntries] = useState([]);

	const priorityOptions = getDefaultPriorityOptions(priorities);

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleAddTime = (hoursOverride, minutesOverride) => {
		const hours = hoursOverride !== undefined
			? parseInt(hoursOverride, 10) || 0
			: parseInt(formData.timeHours, 10) || 0;
		const minutes = minutesOverride !== undefined
			? parseInt(minutesOverride, 10) || 0
			: parseInt(formData.timeMinutes, 10) || 0;

		if (hours <= 0 && minutes <= 0) {
			showToast.error(__('Please enter hours or minutes', 'analogwp-site-notes'));
			return;
		}

		if (hours < 0 || minutes < 0 || minutes >= 60) {
			showToast.error(__('Please enter valid time values', 'analogwp-site-notes'));
			return;
		}

		setPendingTimeEntries((prev) => [
			...prev,
			buildTimeEntry(
				hours,
				minutes,
				__('Initial time entry', 'analogwp-site-notes')
			),
		]);

		setFormData((prev) => ({
			...prev,
			timeHours: '',
			timeMinutes: '',
		}));
	};

	const resetForm = () => {
		setFormData(EMPTY_TASK_FORM);
		setActiveTab('details');
		setPendingTimeEntries([]);
	};

	const handleSave = async () => {
		if (!formData.taskTitle.trim() && !formData.description.trim()) {
			showToast.error(__('Please enter a task title or description', 'analogwp-site-notes'));
			return;
		}

		if (!formData.pageId || formData.pageId === '') {
			showToast.error(__('Please select a page for this task', 'analogwp-site-notes'));
			return;
		}

		const timesheetData = buildTimesheetData(
			pendingTimeEntries,
			formData,
			[],
			__('Initial time entry', 'analogwp-site-notes')
		);
		const taskData = buildTaskPayload(formData, pages, timesheetData);

		try {
			await onSave(taskData);
			resetForm();
			onClose();

			if (timesheetData) {
				showToast.success(__('Task created and time entry added to timesheet', 'analogwp-site-notes'));
			} else {
				showToast.success(__('Task created successfully', 'analogwp-site-notes'));
			}
		} catch (err) {
			logger.error('Error saving task:', err);
			showToast.error(__('Error saving task. Please try again.', 'analogwp-site-notes'));
		}
	};

	const handleCancel = () => {
		resetForm();
		onClose();
	};

	return (
		<div className="sn-task-sidebar">
			<div className="sn-task-sidebar__header">
				<div className="sn-task-sidebar__header-row">
					<input
						type="text"
						value={formData.taskTitle}
						onChange={(e) => handleInputChange('taskTitle', e.target.value)}
						placeholder={__('Add task Name', 'analogwp-site-notes')}
						className="sn-task-sidebar__title-input"
					/>
					<div className="sn-task-sidebar__header-actions">
						<button
							type="button"
							className="sn-task-sidebar__header-action"
							onClick={handleCancel}
							title={__('Close', 'analogwp-site-notes')}
						>
							<CloseIcon size="xl" />
						</button>
					</div>
				</div>
			</div>

			<TaskSidebarTabs activeTab={activeTab} onTabChange={setActiveTab} />

			<div className={`sn-task-sidebar__body${activeTab === 'timesheet' ? ' sn-task-sidebar__body--timesheet' : ''}`}>
				{activeTab === 'details' ? (
					<TaskSidebarDetailsFields
						formData={formData}
						onInputChange={handleInputChange}
						statuses={statuses}
						priorityOptions={priorityOptions}
						users={users}
						pages={pages}
						categories={categories}
						getStatusBadgeStyle={getStatusBadgeStyle}
						getPriorityBadgeStyle={getPriorityBadgeStyle}
						onNavigateToSettingsTab={onNavigateToSettingsTab}
					/>
				) : (
					<TaskSidebarTimesheetTab
						entries={pendingTimeEntries}
						onAddTime={handleAddTime}
					/>
				)}
			</div>

			<TaskSidebarFooter
				primaryLabel={__('Create Task', 'analogwp-site-notes')}
				onSave={handleSave}
				onCancel={handleCancel}
			/>
		</div>
	);
};

export default AddTaskSidebar;
