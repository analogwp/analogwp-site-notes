/**
 * Shared helpers for add/edit task sidebars.
 */
import { __ } from '@wordpress/i18n';
import { getStatusByKey } from '../../../shared/constants/taskStatuses';

export const CUSTOM_PAGE_ID = 'custom';

export const EMPTY_TASK_FORM = {
	taskTitle: '',
	status: 'open',
	assignedUsers: [],
	categories: [],
	pageId: '',
	pageUrl: '',
	dueDate: '',
	timeHours: '',
	timeMinutes: '',
	priority: 'medium',
	description: '',
};

export const buildUserSelectOptions = (users) => users.map((user) => ({
	value: String(user.id),
	label: user.name,
	avatar: user.avatar,
	name: user.name,
}));

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
		backgroundColor: 'transparent',
		border: `1px solid ${color}`,
		color,
	};
};

/**
 * Compare page URLs loosely for selector rematch (scheme/host/slash insensitive).
 *
 * @param {string} url
 * @return {string}
 */
export const normalizePageUrl = (url) => {
	if (!url) {
		return '';
	}

	let normalized = String(url).trim();

	try {
		const parsed = new URL(normalized);
		const path = parsed.pathname === '/' ? '/' : parsed.pathname.replace(/\/$/, '');
		normalized = `${parsed.host}${path}${parsed.search}`;
	} catch {
		normalized = normalized.replace(/^https?:\/\/(www\.)?/i, '');
		normalized = normalized.replace(/\/$/, '');
	}

	return normalized.toLowerCase();
};

/**
 * Resolve post_id only when pageId is a pure positive integer string.
 *
 * @param {string|number} pageId
 * @return {number}
 */
export const resolvePagePostId = (pageId) => {
	if (pageId === null || pageId === undefined || pageId === '') {
		return 0;
	}

	const asString = String(pageId);
	if (!/^\d+$/.test(asString)) {
		return 0;
	}

	const numericId = parseInt(asString, 10);
	return numericId > 0 ? numericId : 0;
};

const normalizeAssignedUsers = (value) => [...(value || [])].map(String).sort().join('\0');

export const isValidAssignedUserId = (userId) => {
	if (userId === null || userId === undefined || userId === '' || userId === 0 || userId === '0') {
		return false;
	}

	const parsed = parseInt(userId, 10);
	return !Number.isNaN(parsed) && parsed > 0;
};

export const normalizeAssignedUsersFormValue = (userIds) => [...(userIds || [])]
	.filter(isValidAssignedUserId)
	.map((userId) => String(userId));

const mapAssignedUsersToForm = (task) => {
	if (Array.isArray(task.assignees) && task.assignees.length > 0) {
		return normalizeAssignedUsersFormValue(task.assignees.map((assignee) => assignee.id));
	}

	if (Array.isArray(task.assigned_user_ids) && task.assigned_user_ids.length > 0) {
		return normalizeAssignedUsersFormValue(task.assigned_user_ids);
	}

	if (isValidAssignedUserId(task.assigned_to)) {
		return [String(task.assigned_to)];
	}

	return [];
};

export const mapTaskToFormData = (task, pages = []) => {
	let pageId = '';
	const pageUrl = task.page_url || '';

	if (pageUrl && pages.length > 0) {
		const normalizedTaskUrl = normalizePageUrl(pageUrl);
		const matchingPage = pages.find((page) => {
			return normalizePageUrl(page.url) === normalizedTaskUrl;
		});

		if (matchingPage) {
			pageId = String(matchingPage.id);
		}
	}

	if (!pageId && task.post_id && task.post_id !== '0' && task.post_id !== 0) {
		const postIdString = String(task.post_id);
		if (/^\d+$/.test(postIdString)) {
			pageId = postIdString;
		}
	}

	if (!pageId && pageUrl) {
		pageId = CUSTOM_PAGE_ID;
	}

	return {
		taskTitle: task.comment_title || '',
		status: task.status || 'open',
		assignedUsers: mapAssignedUsersToForm(task),
		categories: task.categories || [],
		pageId,
		pageUrl,
		dueDate: task.due_date || '',
		timeHours: '',
		timeMinutes: '',
		priority: task.priority || 'medium',
		description: task.comment_text || '',
	};
};

const normalizeCategories = (categories) => [...(categories || [])].sort().join('\0');

export const hasTaskFormChanges = (initialFormData, currentFormData, pendingTimeEntries = []) => {
	if (pendingTimeEntries.length > 0) {
		return true;
	}

	const scalarFields = ['taskTitle', 'status', 'pageId', 'pageUrl', 'dueDate', 'priority', 'description'];

	for (const field of scalarFields) {
		if ((initialFormData[field] || '') !== (currentFormData[field] || '')) {
			return true;
		}
	}

	if (normalizeAssignedUsers(initialFormData.assignedUsers) !== normalizeAssignedUsers(currentFormData.assignedUsers)) {
		return true;
	}

	return normalizeCategories(initialFormData.categories) !== normalizeCategories(currentFormData.categories);
};

const normalizeAssignedUserIds = (value) => normalizeAssignedUsersFormValue(value)
	.map((userId) => parseInt(userId, 10));

export const buildPageTargetPayload = (pageId, pageUrl, pages = []) => {
	let resolvedUrl = pageUrl || '';

	if (!resolvedUrl && pageId && pageId !== CUSTOM_PAGE_ID) {
		const selectedPage = pages.find((page) => String(page.id) === String(pageId));
		resolvedUrl = selectedPage ? selectedPage.url : '';
	}

	return {
		post_id: resolvePagePostId(pageId),
		page_url: resolvedUrl,
	};
};

export const buildFieldUpdatePayload = (field, value, formData, pages) => {
	switch (field) {
		case 'taskTitle':
			return { comment_title: value || formData.description };
		case 'description':
			return { comment_text: value };
		case 'status':
			return { status: value };
		case 'priority':
			return { priority: value };
		case 'assignedUsers':
			return { assigned_users: normalizeAssignedUserIds(value) };
		case 'categories':
			return { categories: value };
		case 'dueDate':
			return { due_date: value };
		case 'pageId':
			return buildPageTargetPayload(value, formData.pageUrl, pages);
		case 'pageTarget':
			return buildPageTargetPayload(value.pageId, value.pageUrl, pages);
		default:
			return null;
	}
};

export const formatRelativeTime = (dateString) => {
	if (!dateString) {
		return '';
	}

	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now - date;
	const diffMinutes = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMinutes / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffMinutes < 1) {
		return __('Just now', 'analogwp-site-notes');
	}

	if (diffMinutes < 60) {
		return `${diffMinutes}m ago`;
	}

	if (diffHours < 24) {
		return `${diffHours}h ago`;
	}

	if (diffDays < 7) {
		return `${diffDays}d ago`;
	}

	if (diffDays < 30) {
		const weeks = Math.floor(diffDays / 7);
		return `${weeks}w ago`;
	}

	return new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
		year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
	}).format(date);
};

export const formatOpenedDate = (dateString) => {
	if (!dateString) {
		return '';
	}

	const date = new Date(dateString);

	return new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(date);
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
	const pagePayload = buildPageTargetPayload(formData.pageId, formData.pageUrl, pages);
	const assignedUsers = normalizeAssignedUserIds(formData.assignedUsers);

	const taskData = {
		comment_title: formData.taskTitle || formData.description,
		comment_text: formData.description,
		post_id: pagePayload.post_id,
		page_url: pagePayload.page_url,
		assigned_users: JSON.stringify(assignedUsers),
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
