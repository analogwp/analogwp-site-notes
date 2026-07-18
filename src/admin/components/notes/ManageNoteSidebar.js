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
import NoteSidebarDetailsFields from './NoteSidebarDetailsFields';
import NoteSidebarQuickFields from './NoteSidebarQuickFields';
import NoteSidebarDiscussion from './NoteSidebarDiscussion';
import NoteSidebarComment from './NoteSidebarComment';
import NoteSidebarTimeline from './NoteSidebarTimeline';
import NoteSidebarReplyForm from './NoteSidebarReplyForm';
import NoteSidebarFooter from './NoteSidebarFooter';
import NoteSidebarTabs from './NoteSidebarTabs';
import NoteSidebarTimesheetTab from './NoteSidebarTimesheetTab';
import {
	buildTimeEntry,
	buildFieldUpdatePayload,
	getDefaultPriorityOptions,
	getPriorityBadgeStyle,
	getStatusBadgeStyle,
	mapNoteToFormData,
	parseTimesheetEntries,
	formatOpenedDate,
} from './noteSidebarUtils';

const TEXT_SAVE_FIELDS = ['noteTitle', 'description'];
const TEXT_SAVE_DELAY = 600;

const getSavedFieldValue = (field, noteData) => {
	if (!noteData) {
		return '';
	}

	switch (field) {
		case 'noteTitle':
			return noteData.comment_title || '';
		case 'description':
			return noteData.comment_text || '';
		default:
			return '';
	}
};

const ManageNoteSidebar = ({
	note,
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
	const [formData, setFormData] = useState(() => mapNoteToFormData(note, pages));
	const [isTitleEditing, setIsTitleEditing] = useState(false);
	const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
	const [activeAsideTab, setActiveAsideTab] = useState('details');
	const formDataRef = useRef(formData);
	const debounceRefs = useRef({});
	const noteRef = useRef(note);
	const pagesRef = useRef(pages);
	const onUpdateRef = useRef(onUpdate);
	const priorityOptions = getDefaultPriorityOptions(priorities);

	noteRef.current = note;
	pagesRef.current = pages;
	onUpdateRef.current = onUpdate;
	const existingTimeEntries = parseTimesheetEntries(note.timesheet);

	useEffect(() => {
		formDataRef.current = formData;
	}, [formData]);

	useEffect(() => {
		setFormData(mapNoteToFormData(note, pages));
		setIsTitleEditing(false);
		setIsDescriptionEditing(false);
		setActiveAsideTab('details');
	}, [note?.id, pages]);

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
			if (value === getSavedFieldValue(field, noteRef.current)) {
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
		if (value === getSavedFieldValue(field, noteRef.current)) {
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

	const handlePageChange = ({ pageId, pageUrl }) => {
		setFormData((prev) => {
			const next = { ...prev, pageId, pageUrl };
			formDataRef.current = next;
			return next;
		});

		const updates = buildFieldUpdatePayload(
			'pageTarget',
			{ pageId, pageUrl },
			{ ...formDataRef.current, pageId, pageUrl },
			pages
		);
		persistUpdate(updates);
	};

	const handleTitleBlur = () => {
		flushFieldSave('noteTitle');
		setIsTitleEditing(false);
	};

	const handleTitleSave = () => {
		flushFieldSave('noteTitle');
		setIsTitleEditing(false);
	};

	const handleTitleCancel = () => {
		clearPendingTextSave('noteTitle');
		const savedTitle = getSavedFieldValue('noteTitle', noteRef.current);
		setFormData((prev) => {
			const next = { ...prev, noteTitle: savedTitle };
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
		const savedDescription = getSavedFieldValue('description', noteRef.current);
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
			__('Time entry from note update', 'analogwp-site-notes')
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

		const reply = await onAddReply(note.id, replyText);
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
			await onDeleteReply(note.id, replyId);
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
			__('Are you sure you want to delete this note? This action cannot be undone.', 'analogwp-site-notes'),
			{ confirmText: __('Delete', 'analogwp-site-notes') }
		);

		if (!confirmed) {
			return;
		}

		try {
			await onDelete(note.id);
			onClose();
		} catch (err) {
			logger.error('Error deleting note:', err);
			showToast.error(__('Error deleting note. Please try again.', 'analogwp-site-notes'));
		}
	};

	const creator = note.creator || note.user || {};
	const creatorName = creator.name || __('Unknown User', 'analogwp-site-notes');
	const openedMeta = note.created_at
		? sprintf(
			/* translators: %s: formatted date */
			__('opened on %s', 'analogwp-site-notes'),
			formatOpenedDate(note.created_at)
		)
		: '';

	const descriptionEditAction = isDescriptionEditing ? (
		<>
			<button
				type="button"
				className="sn-note-comment__edit-btn"
				onMouseDown={(event) => event.preventDefault()}
				onClick={handleDescriptionSave}
				title={__('Save description', 'analogwp-site-notes')}
			>
				<CheckmarkIcon size="md" />
			</button>
			<button
				type="button"
				className="sn-note-comment__edit-btn"
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
			className="sn-note-comment__edit-btn"
			onMouseDown={(event) => event.preventDefault()}
			onClick={() => setIsDescriptionEditing(true)}
			title={__('Edit description', 'analogwp-site-notes')}
		>
			<PencilIcon size="md" />
		</button>
	);

	return (
		<div className="sn-note-sidebar sn-note-sidebar--manage">
			<div className="sn-note-sidebar__layout">
				<div className="sn-note-sidebar__main">
					<div className="sn-note-sidebar__main-scroll">
						<div className="sn-note-sidebar__header-row sn-note-sidebar__header-row--manage">
							{note?.id ? (
								<span className="sn-note-sidebar__note-id">{note.id}</span>
							) : null}
							{isTitleEditing ? (
								<input
									ref={titleInputRef}
									type="text"
									value={formData.noteTitle}
									onChange={(event) => handleAutoFieldChange('noteTitle', event.target.value)}
									onBlur={handleTitleBlur}
									placeholder={__('Add note title', 'analogwp-site-notes')}
									className="sn-note-sidebar__title-input"
								/>
							) : (
								<div
									className={classnames('sn-note-sidebar__title-display', {
										'sn-note-sidebar__title-display--placeholder': !formData.noteTitle.trim(),
									})}
								>
									{formData.noteTitle.trim() || __('Add note title', 'analogwp-site-notes')}
								</div>
							)}
							<div className="sn-note-sidebar__header-actions">
								{isTitleEditing ? (
									<>
										<button
											type="button"
											className="sn-note-sidebar__header-action"
											onMouseDown={(event) => event.preventDefault()}
											onClick={handleTitleSave}
											title={__('Save note title', 'analogwp-site-notes')}
										>
											<CheckmarkIcon size="xl" />
										</button>
										<button
											type="button"
											className="sn-note-sidebar__header-action"
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
										className="sn-note-sidebar__header-action"
										onMouseDown={(event) => event.preventDefault()}
										onClick={() => setIsTitleEditing(true)}
										title={__('Edit note title', 'analogwp-site-notes')}
									>
										<PencilIcon size="xl" />
									</button>
								)}
							</div>
						</div>

						<NoteSidebarQuickFields
							formData={formData}
							onInputChange={handleAutoFieldChange}
							statuses={statuses}
							priorityOptions={priorityOptions}
							getStatusBadgeStyle={getStatusBadgeStyle}
							getPriorityBadgeStyle={getPriorityBadgeStyle}
						/>

						<NoteSidebarTimeline>
							<NoteSidebarComment
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
										placeholder={__('Add a note description here (optional)', 'analogwp-site-notes')}
										className="sn-note-comment__description-input"
										rows="4"
									/>
								) : (
									<div
										className={classnames('sn-note-comment__description-text', {
											'sn-note-comment__description-text--placeholder': !formData.description.trim(),
										})}
									>
										{formData.description.trim() || __('Add a note description here (optional)', 'analogwp-site-notes')}
									</div>
								)}
							</NoteSidebarComment>

							<NoteSidebarDiscussion
								replies={note.replies || []}
								onDeleteReply={onDeleteReply ? handleDeleteReply : undefined}
							/>
						</NoteSidebarTimeline>
					</div>

					<NoteSidebarReplyForm onSubmit={handleReplySubmit} />
				</div>

				<aside className="sn-note-sidebar__aside">
					<div
						className={`sn-note-sidebar__aside-body${
							activeAsideTab === 'timesheet' ? ' sn-note-sidebar__aside-body--timesheet' : ''
						}`}
					>
						{activeAsideTab === 'details' ? (
							<>
								{note.screenshot_url && (
									<div className="sn-note-sidebar__screenshot">
										<img
											src={note.screenshot_url}
											alt={__('Note screenshot', 'analogwp-site-notes')}
										/>
									</div>
								)}

								<div className="sn-note-sidebar__aside-fields">
									<NoteSidebarDetailsFields
										formData={formData}
										onInputChange={handleAutoFieldChange}
										onPageChange={handlePageChange}
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
							<NoteSidebarTimesheetTab
								entries={existingTimeEntries}
								onAddTime={handleAddTime}
							/>
						)}
					</div>

					<NoteSidebarFooter
						deleteOnly
						onDelete={onDelete ? handleDelete : undefined}
						tabs={(
							<NoteSidebarTabs
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

export default ManageNoteSidebar;
