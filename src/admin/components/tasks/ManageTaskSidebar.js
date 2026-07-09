/**
 * WordPress dependencies
 */
import { useState, useEffect, useRef, useCallback } from '@wordpress/element';
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
import TaskSidebarQuickFields from './TaskSidebarQuickFields';
import TaskSidebarDiscussion from './TaskSidebarDiscussion';
import TaskSidebarReplyForm from './TaskSidebarReplyForm';
import TaskSidebarFooter from './TaskSidebarFooter';
import {
	buildTimeEntry,
	buildFieldUpdatePayload,
	getDefaultPriorityOptions,
	getPriorityBadgeStyle,
	getStatusBadgeStyle,
	mapTaskToFormData,
	parseTimesheetEntries,
} from './taskSidebarUtils';

const TEXT_SAVE_FIELDS = ['taskTitle', 'description'];
const TEXT_SAVE_DELAY = 600;

const ManageTaskSidebar = ({
	task,
	onClose,
	onUpdate,
	onDelete,
	onAddReply,
	users,
	pages,
	statuses = [],
	onNavigateToSettingsTab,
}) => {
	const { categories, priorities } = useSettings();
	const titleInputRef = useRef(null);
	const descriptionInputRef = useRef(null);
	const [formData, setFormData] = useState(() => mapTaskToFormData(task, pages));
	const [isTitleEditing, setIsTitleEditing] = useState(false);
	const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
	const formDataRef = useRef(formData);
	const debounceRefs = useRef({});
	const priorityOptions = getDefaultPriorityOptions(priorities);
	const existingTimeEntries = parseTimesheetEntries(task.timesheet);

	useEffect(() => {
		formDataRef.current = formData;
	}, [formData]);

	useEffect(() => {
		setFormData(mapTaskToFormData(task, pages));
		setIsTitleEditing(false);
		setIsDescriptionEditing(false);
	}, [task, pages]);

	useEffect(() => {
		if (isTitleEditing && titleInputRef.current) {
			titleInputRef.current.focus();
			titleInputRef.current.select();
		}
	}, [isTitleEditing]);

	useEffect(() => {
		if (isDescriptionEditing && descriptionInputRef.current) {
			descriptionInputRef.current.focus();
		}
	}, [isDescriptionEditing]);

	useEffect(() => () => {
		Object.values(debounceRefs.current).forEach(clearTimeout);
	}, []);

	const persistUpdate = useCallback(async (updates) => {
		if (!updates || !onUpdate) {
			return false;
		}

		return onUpdate(updates, { silent: true });
	}, [onUpdate]);

	const flushFieldSave = (field) => {
		clearTimeout(debounceRefs.current[field]);
		const updates = buildFieldUpdatePayload(
			field,
			formDataRef.current[field],
			formDataRef.current,
			pages
		);
		persistUpdate(updates);
	};

	const handleAutoFieldChange = (field, value) => {
		setFormData((prev) => {
			const next = { ...prev, [field]: value };
			formDataRef.current = next;
			return next;
		});

		if (TEXT_SAVE_FIELDS.includes(field)) {
			clearTimeout(debounceRefs.current[field]);
			debounceRefs.current[field] = setTimeout(() => {
				const updates = buildFieldUpdatePayload(
					field,
					formDataRef.current[field],
					formDataRef.current,
					pages
				);
				persistUpdate(updates);
			}, TEXT_SAVE_DELAY);
			return;
		}

		const updates = buildFieldUpdatePayload(field, value, { ...formDataRef.current, [field]: value }, pages);
		persistUpdate(updates);
	};

	const handleTitleBlur = () => {
		flushFieldSave('taskTitle');
		setIsTitleEditing(false);
	};

	const handleDescriptionBlur = () => {
		flushFieldSave('description');
		setIsDescriptionEditing(false);
	};

	const handleAddTime = async (hoursOverride, minutesOverride) => {
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

		const newEntry = buildTimeEntry(
			hours,
			minutes,
			__('Time entry from task update', 'analogwp-site-notes')
		);
		const updatedEntries = [...existingTimeEntries, newEntry];

		const saved = await persistUpdate({
			timesheet: JSON.stringify(updatedEntries),
		});

		if (saved) {
			setFormData((prev) => ({
				...prev,
				timeHours: '',
				timeMinutes: '',
			}));
		}
	};

	const handleReplySubmit = async (replyText) => {
		if (!onAddReply) {
			return false;
		}

		const reply = await onAddReply(task.id, replyText);
		return Boolean(reply);
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
		<div className="sn-task-sidebar sn-task-sidebar--manage">
			<div className="sn-task-sidebar__layout">
				<div className="sn-task-sidebar__main">
					<div className="sn-task-sidebar__main-scroll">
						<div className="sn-task-sidebar__header-row sn-task-sidebar__header-row--manage">
							{isTitleEditing ? (
								<input
									ref={titleInputRef}
									type="text"
									value={formData.taskTitle}
									onChange={(event) => handleAutoFieldChange('taskTitle', event.target.value)}
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
									onMouseDown={(event) => event.preventDefault()}
									onClick={() => {
										if (isTitleEditing) {
											handleTitleBlur();
										} else {
											setIsTitleEditing(true);
										}
									}}
									title={isTitleEditing
										? __('Close title editor', 'analogwp-site-notes')
										: __('Edit task title', 'analogwp-site-notes')}
								>
									{isTitleEditing ? (
										<CloseIcon size="xl" />
									) : (
										<PencilIcon size="xl" />
									)}
								</button>
							</div>
						</div>

						<TaskSidebarQuickFields
							formData={formData}
							onInputChange={handleAutoFieldChange}
							statuses={statuses}
							priorityOptions={priorityOptions}
							users={users}
							getStatusBadgeStyle={getStatusBadgeStyle}
							getPriorityBadgeStyle={getPriorityBadgeStyle}
						/>

						<div className="sn-task-sidebar__editable-group">
							{isDescriptionEditing ? (
								<textarea
									ref={descriptionInputRef}
									value={formData.description}
									onChange={(event) => handleAutoFieldChange('description', event.target.value)}
									onBlur={handleDescriptionBlur}
									placeholder={__('Add a task description here (optional)', 'analogwp-site-notes')}
									className="sn-input sn-task-sidebar__description-input sn-task-sidebar__description-input--manage"
									rows="4"
								/>
							) : (
								<div
									className={classnames('sn-task-sidebar__description-display', {
										'sn-task-sidebar__description-display--placeholder': !formData.description.trim(),
									})}
								>
									{formData.description.trim() || __('Add a task description here (optional)', 'analogwp-site-notes')}
								</div>
							)}
							<button
								type="button"
								className="sn-task-sidebar__float-edit-btn"
								onMouseDown={(event) => event.preventDefault()}
								onClick={() => {
									if (isDescriptionEditing) {
										handleDescriptionBlur();
									} else {
										setIsDescriptionEditing(true);
									}
								}}
								title={isDescriptionEditing
									? __('Close description editor', 'analogwp-site-notes')
									: __('Edit description', 'analogwp-site-notes')}
							>
								{isDescriptionEditing ? (
									<CloseIcon size="md" />
								) : (
									<PencilIcon size="md" />
								)}
							</button>
						</div>

						<TaskSidebarDiscussion replies={task.replies || []} />
					</div>

					<TaskSidebarReplyForm onSubmit={handleReplySubmit} />
				</div>

				<aside className="sn-task-sidebar__aside">
					<div className="sn-task-sidebar__aside-body">
						{task.screenshot_url && (
							<div className="sn-task-sidebar__screenshot">
								<img
									src={task.screenshot_url}
									alt={__('Task screenshot', 'analogwp-site-notes')}
								/>
							</div>
						)}

						<div className="sn-task-sidebar__aside-fields">
							<TaskSidebarDetailsFields
								formData={formData}
								onInputChange={handleAutoFieldChange}
								statuses={statuses}
								priorityOptions={priorityOptions}
								users={users}
								pages={pages}
								categories={categories}
								onAddTime={handleAddTime}
								getStatusBadgeStyle={getStatusBadgeStyle}
								getPriorityBadgeStyle={getPriorityBadgeStyle}
								onNavigateToSettingsTab={onNavigateToSettingsTab}
								showDescription={false}
								hideQuickFields
							/>
						</div>
					</div>

					<TaskSidebarFooter
						deleteOnly
						onDelete={onDelete ? handleDelete : undefined}
					/>
				</aside>
			</div>
		</div>
	);
};

export default ManageTaskSidebar;
