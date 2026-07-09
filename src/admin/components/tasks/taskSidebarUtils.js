/**
 * Shared helpers for add/edit task sidebars.
 */
import { __ } from '@wordpress/i18n';
import { getStatusByKey } from '../../../shared/constants/taskStatuses';

export const EMPTY_TASK_FORM = {
	taskTitle: '',
	status: 'open',
	assignedUser: '',
	categories: [],
	pageId: '',
	dueDate: '',
	timeHours: '',
	timeMinutes: '',
	priority: 'medium',
	description: '',
};

export const getDefaultPriorityOptions = (priorities) => {
	if (priorities && priorities.length > 0) {
		return priorities;
	}

	return [
		{ id: 1, key: 'high', name: __('High', 'analogwp-site-notes'), color: '#ef4444' },
		{ id: 2, key: 'medium', name: __('Medium', 'analogwp-site-notes'), color: '#f59e0b' },
		{ id: 3, key: 'low', name: __('Low', 'analogwp-site-notes'), color: '#10b981' },
	];
};

export const getStatusBadgeStyle = (statusKey) => {
	const status = getStatusByKey(statusKey);
	if (!status) {
		return {};
	}

	return {
		backgroundColor: status.color,
		color: status.textColor,
	};
};

export const getPriorityBadgeStyle = (priorityKey, priorityOptions) => {
	const priority = priorityOptions.find((item) => item.key === priorityKey);
	const color = priority?.color || '#6b7280';

	return {
		backgroundColor: `color-mix(in srgb, ${color} 22%, white)`,
		color,
	};
};

export const normalizePageUrl = (url) => {
	if (!url) {
		return '';
	}

	let normalized = url.replace(/^https?:\/\/(www\.)?/, '');
	normalized = normalized.replace(/\/$/, '');
	return normalized.toLowerCase();
};

export const mapTaskToFormData = (task, pages) => {
	let assignedUserId = '';

	if (task.assigned_to) {
		assignedUserId = task.assigned_to;
	} else if (task.assignee?.id) {
		assignedUserId = task.assignee.id;
	} else if (task.user_id) {
		assignedUserId = task.user_id;
	}

	let pageId = '';

	if (task.page_url && pages.length > 0) {
		const normalizedTaskUrl = normalizePageUrl(task.page_url);
		const matchingPage = pages.find((page) => {
			return normalizePageUrl(page.url) === normalizedTaskUrl;
		});

		if (matchingPage) {
			pageId = String(matchingPage.id);
		}
	}

	if (!pageId && task.post_id && task.post_id !== '0' && task.post_id !== 0) {
		pageId = String(task.post_id);
	}

	return {
		taskTitle: task.comment_title || '',
		status: task.status || 'open',
		assignedUser: assignedUserId,
		categories: task.categories || [],
		pageId,
		dueDate: task.due_date || '',
		timeHours: '',
		timeMinutes: '',
		priority: task.priority || 'medium',
		description: task.comment_text || '',
	};
};

export const parseTimesheetEntries = (timesheet) => {
	if (!timesheet) {
		return [];
	}

	try {
		return JSON.parse(timesheet);
	} catch {
		return [];
	}
};

export const buildTimeEntry = (hours, minutes, description) => ({
	id: Date.now() + Math.random(),
	hours,
	minutes,
	description,
	date: new Date().toISOString().split('T')[0],
});

export const buildTimesheetData = (pendingTimeEntries, formData, existingEntries, timeEntryDescription) => {
	const entries = [...pendingTimeEntries];
	const hours = parseInt(formData.timeHours, 10) || 0;
	const minutes = parseInt(formData.timeMinutes, 10) || 0;

	if ((hours > 0 || minutes > 0) && hours >= 0 && minutes >= 0 && minutes < 60) {
		entries.push(buildTimeEntry(hours, minutes, timeEntryDescription));
	}

	if (entries.length === 0) {
		return null;
	}

	return JSON.stringify([...existingEntries, ...entries]);
};

export const buildTaskPayload = (formData, pages, timesheetData) => {
	const selectedPage = pages.find((page) => String(page.id) === String(formData.pageId));
	const pageUrl = selectedPage ? selectedPage.url : '';

	let postId = 0;
	if (formData.pageId && formData.pageId !== '') {
		const numericId = parseInt(formData.pageId, 10);
		if (!isNaN(numericId)) {
			postId = numericId;
		}
	}

	const taskData = {
		comment_title: formData.taskTitle || formData.description,
		comment_text: formData.description,
		post_id: postId,
		page_url: pageUrl,
		assigned_to: formData.assignedUser || 0,
		priority: formData.priority,
		status: formData.status,
		categories: formData.categories,
		due_date: formData.dueDate,
		time_estimation: formData.timeHours && formData.timeMinutes
			? `${formData.timeHours}:${String(formData.timeMinutes).padStart(2, '0')}`
			: '',
	};

	if (timesheetData) {
		taskData.timesheet = timesheetData;
	}

	return taskData;
};
