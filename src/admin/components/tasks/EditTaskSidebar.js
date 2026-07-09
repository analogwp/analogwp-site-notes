/**
 * WordPress dependencies
 */
import { useState, useEffect, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { showConfirmation, showToast } from '../ToastProvider';
import { useSettings } from '../settings/SettingsProvider';
import logger from '../../../shared/utils/logger';
import { CloseIcon, PencilIcon } from '../../../shared/icons';
import TaskSidebarDetailsFields from './TaskSidebarDetailsFields';
import TaskSidebarTimesheetTab from './TaskSidebarTimesheetTab';
import TaskSidebarTabs from './TaskSidebarTabs';
import TaskSidebarFooter from './TaskSidebarFooter';
import {
	buildTaskPayload,
	buildTimeEntry,
	buildTimesheetData,
	getDefaultPriorityOptions,
	getPriorityBadgeStyle,
	getStatusBadgeStyle,
	mapTaskToFormData,
	parseTimesheetEntries,
} from './taskSidebarUtils';

const EditTaskSidebar = ({ task, onClose, onSave, onDelete, users, pages, statuses = [] }) => {
	const { categories, priorities } = useSettings();
	const titleInputRef = useRef(null);
	const [formData, setFormData] = useState(() => mapTaskToFormData(task, pages));
	const [activeTab, setActiveTab] = useState('details');
	const [pendingTimeEntries, setPendingTimeEntries] = useState([]);
	const [isTitleEditing, setIsTitleEditing] = useState(false);

	const priorityOptions = getDefaultPriorityOptions(priorities);
	const availableCategories = categories.filter(
		(category) => !formData.categories.includes(category.name)
	);
	const existingTimeEntries = parseTimesheetEntries(task.timesheet);
	const allTimeEntries = [...existingTimeEntries, ...pendingTimeEntries];

	useEffect(() => {
		setFormData(mapTaskToFormData(task, pages));
		setActiveTab('details');
		setPendingTimeEntries([]);
		setIsTitleEditing(false);
	}, [task, pages]);

	useEffect(() => {
		if (!isTitleEditing || !titleInputRef.current) {
			return;
		}

		titleInputRef.current.focus();
		titleInputRef.current.select();
	}, [isTitleEditing]);

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleCategoryToggle = (categoryName) => {
		setFormData((prev) => {
			const currentCategories = prev.categories || [];
			const isSelected = currentCategories.includes(categoryName);

			return {
				...prev,
				categories: isSelected
					? currentCategories.filter((cat) => cat !== categoryName)
					: [...currentCategories, categoryName],
			};
		});
	};

	const handleCategorySelect = (categoryName) => {
		if (!categoryName || formData.categories.includes(categoryName)) {
			return;
		}

		setFormData((prev) => ({
			...prev,
			categories: [...prev.categories, categoryName],
		}));
	};

	const handleAddTime = () => {
		const hours = parseInt(formData.timeHours, 10) || 0;
		const minutes = parseInt(formData.timeMinutes, 10) || 0;

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
				__('Time entry from task update', 'analogwp-site-notes')
			),
		]);

		setFormData((prev) => ({
			...prev,
			timeHours: '',
			timeMinutes: '',
		}));
	};

	const handleEditTitle = () => {
		setIsTitleEditing(true);
	};

	const handleExitTitleEdit = () => {
		setIsTitleEditing(false);
		titleInputRef.current?.blur();
	};

	const handleTitleBlur = () => {
		setIsTitleEditing(false);
	};

	const handleSave = async () => {
		if (!formData.taskTitle.trim() && !formData.description.trim()) {
			showToast.error(__('Please enter a task title or description', 'analogwp-site-notes'));
			return;
		}

		const timesheetData = buildTimesheetData(
			pendingTimeEntries,
			formData,
			existingTimeEntries,
			__('Time entry from task update', 'analogwp-site-notes')
		);
		const taskData = buildTaskPayload(formData, pages, timesheetData);

		try {
			await onSave(taskData);
			onClose();

			if (timesheetData) {
				showToast.success(__('Task updated and time entry added to timesheet', 'analogwp-site-notes'));
			} else {
				showToast.success(__('Task updated successfully', 'analogwp-site-notes'));
			}
		} catch (err) {
			logger.error('Error saving task:', err);
			showToast.error(__('Error saving task. Please try again.', 'analogwp-site-notes'));
		}
	};

	const handleCancel = () => {
		onClose();
	};

	const handleDelete = async () => {
		if (!onDelete) {
			return;
		}

		const confirmed = await showConfirmation(
			__('Are you sure you want to delete this task? This action cannot be undone.', 'analogwp-site-notes'),
			{ confirmText: __('Delete', 'analogwp-site-notes') }
		);

		if (!confirmed) {
			return;
		}

		try {
			await onDelete(task.id);
			onClose();
		} catch (err) {
			logger.error('Error deleting task:', err);
			showToast.error(__('Error deleting task. Please try again.', 'analogwp-site-notes'));
		}
	};

	return (
		<div className="sn-task-sidebar">
			<div className="sn-task-sidebar__header">
				<div className="sn-task-sidebar__header-row">
					{isTitleEditing ? (
						<input
							ref={titleInputRef}
							type="text"
							value={formData.taskTitle}
							onChange={(e) => handleInputChange('taskTitle', e.target.value)}
							onBlur={handleTitleBlur}
							placeholder={__('Add task Name', 'analogwp-site-notes')}
							className="sn-task-sidebar__title-input"
						/>
					) : (
						<div
							className={classnames('sn-task-sidebar__title-display', {
								'sn-task-sidebar__title-display--placeholder': !formData.taskTitle.trim(),
							})}
						>
							{formData.taskTitle.trim() || __('Add task Name', 'analogwp-site-notes')}
						</div>
					)}
					<div className="sn-task-sidebar__header-actions">
						<button
							type="button"
							className="sn-task-sidebar__header-action"
							onMouseDown={(e) => e.preventDefault()}
							onClick={isTitleEditing ? handleExitTitleEdit : handleEditTitle}
							title={isTitleEditing
								? __('Close title editor', 'analogwp-site-notes')
								: __('Edit task title', 'analogwp-site-notes')
							}
						>
							{isTitleEditing ? (
								<CloseIcon size="xl" />
							) : (
								<PencilIcon size="xl" />
							)}
						</button>
					</div>
				</div>
			</div>

			<TaskSidebarTabs activeTab={activeTab} onTabChange={setActiveTab} />

			<div className="sn-task-sidebar__body">
				{activeTab === 'details' ? (
					<TaskSidebarDetailsFields
						formData={formData}
						onInputChange={handleInputChange}
						statuses={statuses}
						priorityOptions={priorityOptions}
						users={users}
						pages={pages}
						availableCategories={availableCategories}
						onCategorySelect={handleCategorySelect}
						onCategoryToggle={handleCategoryToggle}
						onAddTime={handleAddTime}
						getStatusBadgeStyle={getStatusBadgeStyle}
						getPriorityBadgeStyle={getPriorityBadgeStyle}
					/>
				) : (
					<TaskSidebarTimesheetTab entries={allTimeEntries} />
				)}
			</div>

			<TaskSidebarFooter
				primaryLabel={__('Update Task', 'analogwp-site-notes')}
				onSave={handleSave}
				onCancel={handleCancel}
				onDelete={onDelete ? handleDelete : undefined}
			/>
		</div>
	);
};

export default EditTaskSidebar;
