/**
 * WordPress dependencies
 */
import { useState, useEffect, useRef, useCallback } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { showConfirmation, showToast } from '../ToastProvider';
import { useSettings } from '../settings/SettingsProvider';
import logger from '../../../shared/utils/logger';
import { CheckmarkIcon, CloseIcon, PencilIcon } from '../../../shared/icons';
import TaskSidebarDetailsFields from './TaskSidebarDetailsFields';
import TaskSidebarQuickFields from './TaskSidebarQuickFields';
import TaskSidebarDiscussion from './TaskSidebarDiscussion';
import TaskSidebarComment from './TaskSidebarComment';
import TaskSidebarTimeline from './TaskSidebarTimeline';
import TaskSidebarReplyForm from './TaskSidebarReplyForm';
import TaskSidebarFooter from './TaskSidebarFooter';
import TaskSidebarTabs from './TaskSidebarTabs';
import TaskSidebarTimesheetTab from './TaskSidebarTimesheetTab';
import {
	buildTimeEntry,
	buildFieldUpdatePayload,
	getDefaultPriorityOptions,
	getPriorityBadgeStyle,
	getStatusBadgeStyle,
	mapTaskToFormData,
	parseTimesheetEntries,
	formatOpenedDate,
} from './taskSidebarUtils';

const TEXT_SAVE_FIELDS = ['taskTitle', 'description'];
const TEXT_SAVE_DELAY = 600;

const getSavedFieldValue = (field, taskData) => {
	if (!taskData) {
		return '';
	}

	switch (field) {
		case 'taskTitle':
			return taskData.comment_title || '';
		case 'description':
			return taskData.comment_text || '';
		default:
			return '';
	}
};

const ManageTaskSidebar = ({
	task,
	onClose,
	onUpdate,
	onDelete,
	onAddReply,
	onDeleteReply,
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
	const [activeAsideTab, setActiveAsideTab] = useState('details');
	const formDataRef = useRef(formData);
	const debounceRefs = useRef({});
	const taskRef = useRef(task);
	const pagesRef = useRef(pages);
	const onUpdateRef = useRef(onUpdate);
	const priorityOptions = getDefaultPriorityOptions(priorities);

	taskRef.current = task;
	pagesRef.current = pages;
	onUpdateRef.current = onUpdate;
	const existingTimeEntries = parseTimesheetEntries(task.timesheet);

	useEffect(() => {
		formDataRef.current = formData;
	}, [formData]);

	useEffect(() => {
		setFormData(mapTaskToFormData(task, pages));
		setIsTitleEditing(false);
		setIsDescriptionEditing(false);
		setActiveAsideTab('details');
	}, [task?.id, pages]);

	useEffect(() => {
		if (isTitleEditing && titleInputRef.current) {
			titleInputRef.current.focus();
			const { length } = titleInputRef.current.value;
			titleInputRef.current.setSelectionRange(length, length);
		}
	}, [isTitleEditing]);

	useEffect(() => {
		if (isDescriptionEditing && descriptionInputRef.current) {
			descriptionInputRef.current.focus();
		}
	}, [isDescriptionEditing]);

	useEffect(() => () => {
		TEXT_SAVE_FIELDS.forEach((field) => {
			if (!debounceRefs.current[field]) {
				return;
			}

			clearTimeout(debounceRefs.current[field]);
			debounceRefs.current[field] = null;

			const value = formDataRef.current[field] ?? '';
			if (value === getSavedFieldValue(field, taskRef.current)) {
				return;
			}

			const updates = buildFieldUpdatePayload(
				field,
				value,
				formDataRef.current,
				pagesRef.current
			);

			if (updates && onUpdateRef.current) {
				onUpdateRef.current(updates, { silent: true });
			}
		});
	}, []);

	const persistUpdate = useCallback(async (updates) => {
		if (!updates || !onUpdateRef.current) {
			return false;
		}

		return onUpdateRef.current(updates, { silent: true });
	}, []);

	const clearPendingTextSave = (field) => {
		clearTimeout(debounceRefs.current[field]);
		debounceRefs.current[field] = null;
	};

	const flushFieldSave = (field) => {
		clearPendingTextSave(field);

		const value = formDataRef.current[field] ?? '';
		if (value === getSavedFieldValue(field, taskRef.current)) {
			return;
		}

		const updates = buildFieldUpdatePayload(
			field,
			value,
			formDataRef.current,
			pagesRef.current
		);

		if (!updates) {
			return;
		}

		persistUpdate(updates);
	};

	const handleAutoFieldChange = (field, value) => {
		setFormData((prev) => {
			const next = { ...prev, [field]: value };
			formDataRef.current = next;
			return next;
		});

		if (TEXT_SAVE_FIELDS.includes(field)) {
			clearPendingTextSave(field);
			debounceRefs.current[field] = setTimeout(() => {
				debounceRefs.current[field] = null;
				flushFieldSave(field);
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

	const handleTitleSave = () => {
		flushFieldSave('taskTitle');
		setIsTitleEditing(false);
	};

	const handleTitleCancel = () => {
		clearPendingTextSave('taskTitle');
		const savedTitle = getSavedFieldValue('taskTitle', taskRef.current);
		setFormData((prev) => {
			const next = { ...prev, taskTitle: savedTitle };
			formDataRef.current = next;
			return next;
		});
		setIsTitleEditing(false);
	};

	const handleDescriptionBlur = () => {
		flushFieldSave('description');
		setIsDescriptionEditing(false);
	};

	const handleDescriptionSave = () => {
		flushFieldSave('description');
		setIsDescriptionEditing(false);
	};

	const handleDescriptionCancel = () => {
		clearPendingTextSave('description');
		const savedDescription = getSavedFieldValue('description', taskRef.current);
		setFormData((prev) => {
			const next = { ...prev, description: savedDescription };
			formDataRef.current = next;
			return next;
		});
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

	const handleDeleteReply = async (replyId) => {
		if (!onDeleteReply) {
			return;
		}

		const confirmed = await showConfirmation(
			__('Are you sure you want to delete this comment?', 'analogwp-site-notes'),
			{ confirmText: __('Delete', 'analogwp-site-notes') }
		);

		if (!confirmed) {
			return;
		}

		try {
			await onDeleteReply(task.id, replyId);
		} catch (err) {
			logger.error('Error deleting reply:', err);
			showToast.error(__('Error deleting comment. Please try again.', 'analogwp-site-notes'));
		}
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

	const creator = task.creator || task.user || {};
	const creatorName = creator.name || __('Unknown User', 'analogwp-site-notes');
	const openedMeta = task.created_at
		? sprintf(
			/* translators: %s: formatted date */
			__('opened on %s', 'analogwp-site-notes'),
			formatOpenedDate(task.created_at)
		)
		: '';

	const descriptionEditAction = isDescriptionEditing ? (
		<>
			<button
				type="button"
				className="sn-task-comment__edit-btn"
				onMouseDown={(event) => event.preventDefault()}
				onClick={handleDescriptionSave}
				title={__('Save description', 'analogwp-site-notes')}
			>
				<CheckmarkIcon size="md" />
			</button>
			<button
				type="button"
				className="sn-task-comment__edit-btn"
				onMouseDown={(event) => event.preventDefault()}
				onClick={handleDescriptionCancel}
				title={__('Close description editor', 'analogwp-site-notes')}
			>
				<CloseIcon size="md" />
			</button>
		</>
	) : (
		<button
			type="button"
			className="sn-task-comment__edit-btn"
			onMouseDown={(event) => event.preventDefault()}
			onClick={() => setIsDescriptionEditing(true)}
			title={__('Edit description', 'analogwp-site-notes')}
		>
			<PencilIcon size="md" />
		</button>
	);

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
								{isTitleEditing ? (
									<>
										<button
											type="button"
											className="sn-task-sidebar__header-action"
											onMouseDown={(event) => event.preventDefault()}
											onClick={handleTitleSave}
											title={__('Save task title', 'analogwp-site-notes')}
										>
											<CheckmarkIcon size="xl" />
										</button>
										<button
											type="button"
											className="sn-task-sidebar__header-action"
											onMouseDown={(event) => event.preventDefault()}
											onClick={handleTitleCancel}
											title={__('Close title editor', 'analogwp-site-notes')}
										>
											<CloseIcon size="xl" />
										</button>
									</>
								) : (
									<button
										type="button"
										className="sn-task-sidebar__header-action"
										onMouseDown={(event) => event.preventDefault()}
										onClick={() => setIsTitleEditing(true)}
										title={__('Edit task title', 'analogwp-site-notes')}
									>
										<PencilIcon size="xl" />
									</button>
								)}
							</div>
						</div>

						<TaskSidebarQuickFields
							formData={formData}
							onInputChange={handleAutoFieldChange}
							statuses={statuses}
							priorityOptions={priorityOptions}
							getStatusBadgeStyle={getStatusBadgeStyle}
							getPriorityBadgeStyle={getPriorityBadgeStyle}
						/>

						<TaskSidebarTimeline>
							<TaskSidebarComment
								user={creator}
								authorName={creatorName}
								metaText={openedMeta}
								variant="opener"
								headerAction={descriptionEditAction}
							>
								{isDescriptionEditing ? (
									<textarea
										ref={descriptionInputRef}
										value={formData.description}
										onChange={(event) => handleAutoFieldChange('description', event.target.value)}
										onBlur={handleDescriptionBlur}
										placeholder={__('Add a task description here (optional)', 'analogwp-site-notes')}
										className="sn-task-comment__description-input"
										rows="4"
									/>
								) : (
									<div
										className={classnames('sn-task-comment__description-text', {
											'sn-task-comment__description-text--placeholder': !formData.description.trim(),
										})}
									>
										{formData.description.trim() || __('Add a task description here (optional)', 'analogwp-site-notes')}
									</div>
								)}
							</TaskSidebarComment>

							<TaskSidebarDiscussion
								replies={task.replies || []}
								onDeleteReply={onDeleteReply ? handleDeleteReply : undefined}
							/>
						</TaskSidebarTimeline>
					</div>

					<TaskSidebarReplyForm onSubmit={handleReplySubmit} />
				</div>

				<aside className="sn-task-sidebar__aside">
					<div
						className={`sn-task-sidebar__aside-body${
							activeAsideTab === 'timesheet' ? ' sn-task-sidebar__aside-body--timesheet' : ''
						}`}
					>
						{activeAsideTab === 'details' ? (
							<>
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
										getStatusBadgeStyle={getStatusBadgeStyle}
										getPriorityBadgeStyle={getPriorityBadgeStyle}
										onNavigateToSettingsTab={onNavigateToSettingsTab}
										showDescription={false}
										hideQuickFields
									/>
								</div>
							</>
						) : (
							<TaskSidebarTimesheetTab
								entries={existingTimeEntries}
								onAddTime={handleAddTime}
							/>
						)}
					</div>

					<TaskSidebarFooter
						deleteOnly
						onDelete={onDelete ? handleDelete : undefined}
						tabs={(
							<TaskSidebarTabs
								activeTab={activeAsideTab}
								onTabChange={setActiveAsideTab}
							/>
						)}
					/>
				</aside>
			</div>
		</div>
	);
};

export default ManageTaskSidebar;
