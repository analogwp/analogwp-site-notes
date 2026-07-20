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
import NoteSidebarDetailsFields from './NoteSidebarDetailsFields';
import NoteSidebarTimesheetTab from './NoteSidebarTimesheetTab';
import NoteSidebarTabs from './NoteSidebarTabs';
import NoteSidebarFooter from './NoteSidebarFooter';
import {
	EMPTY_NOTE_FORM,
	buildNotePayload,
	buildTimeEntry,
	buildTimesheetData,
	getDefaultPriorityOptions,
	getPriorityBadgeStyle,
	getStatusBadgeStyle,
} from './noteSidebarUtils';

const AddNoteSidebar = ({ onClose, onSave, users, pages, statuses = [], onNavigateToSettingsTab }) => {
	const { categories, priorities, settings } = useSettings();
	const [formData, setFormData] = useState(EMPTY_NOTE_FORM);
	const [activeTab, setActiveTab] = useState('details');
	const [pendingTimeEntries, setPendingTimeEntries] = useState([]);

	const priorityOptions = getDefaultPriorityOptions(priorities);
	const enableTimeTracking = settings.general?.enable_time_tracking ?? true;

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handlePageChange = ({ pageId, pageUrl }) => {
		setFormData((prev) => ({
			...prev,
			pageId,
			pageUrl,
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
		setFormData(EMPTY_NOTE_FORM);
		setActiveTab('details');
		setPendingTimeEntries([]);
	};

	const handleSave = async () => {
		if (!formData.noteTitle.trim() && !formData.description.trim()) {
			showToast.error(__('Please enter a note title or description', 'analogwp-site-notes'));
			return;
		}

		if (!formData.pageUrl) {
			showToast.error(__('Please select a page for this note', 'analogwp-site-notes'));
			return;
		}

		const timesheetData = enableTimeTracking
			? buildTimesheetData(
				pendingTimeEntries,
				formData,
				[],
				__('Initial time entry', 'analogwp-site-notes')
			)
			: null;
		const taskData = buildNotePayload(formData, pages, timesheetData);

		try {
			await onSave(taskData);
			resetForm();
			onClose();

			if (timesheetData) {
				showToast.success(__('Note created and time entry added to timesheet', 'analogwp-site-notes'));
			} else {
				showToast.success(__('Note created successfully', 'analogwp-site-notes'));
			}
		} catch (err) {
			logger.error('Error saving note:', err);
			showToast.error(__('Error saving note. Please try again.', 'analogwp-site-notes'));
		}
	};

	const handleCancel = () => {
		resetForm();
		onClose();
	};

	return (
		<div className="sn-note-sidebar">
			<div className="sn-note-sidebar__header">
				<div className="sn-note-sidebar__header-row">
					<input
						type="text"
						value={formData.noteTitle}
						onChange={(e) => handleInputChange('noteTitle', e.target.value)}
						placeholder={__('Add note title', 'analogwp-site-notes')}
						className="sn-note-sidebar__title-input"
					/>
					<div className="sn-note-sidebar__header-actions">
						<button
							type="button"
							className="sn-note-sidebar__header-action"
							onClick={handleCancel}
							title={__('Close', 'analogwp-site-notes')}
						>
							<CloseIcon size="xl" />
						</button>
					</div>
				</div>
			</div>

			<NoteSidebarTabs
				activeTab={activeTab}
				onTabChange={setActiveTab}
				showTimesheet={enableTimeTracking}
			/>

			<div
				className={`sn-note-sidebar__body${
					enableTimeTracking && activeTab === 'timesheet' ? ' sn-note-sidebar__body--timesheet' : ''
				}`}
			>
				{!enableTimeTracking || activeTab === 'details' ? (
					<NoteSidebarDetailsFields
						formData={formData}
						onInputChange={handleInputChange}
						onPageChange={handlePageChange}
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
					<NoteSidebarTimesheetTab
						entries={pendingTimeEntries}
						onAddTime={handleAddTime}
					/>
				)}
			</div>

			<NoteSidebarFooter
				primaryLabel={__('Create Note', 'analogwp-site-notes')}
				onSave={handleSave}
				onCancel={handleCancel}
			/>
		</div>
	);
};

export default AddNoteSidebar;
