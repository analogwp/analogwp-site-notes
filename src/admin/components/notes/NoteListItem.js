/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { getStatusByKey } from '../../constants/noteStatuses';
import { getStatusBadgeStyle } from './noteSidebarUtils';
import { renderUserAvatar } from './noteSidebarUserUtils';

/**
 * Resolve the primary assignee for list display.
 *
 * @param {Object} comment Note/comment object.
 * @return {Object|null} Assignee user or null.
 */
const getPrimaryAssignee = (comment) => {
	if (comment?.assignees?.length) {
		return comment.assignees[0];
	}

	if (comment?.assignee) {
		return comment.assignee;
	}

	return null;
};

/**
 * Format date for list cards (e.g. "March 23, 2024").
 *
 * @param {string} dateString ISO date string.
 * @param {Function} formatDate Optional shared formatter fallback.
 * @return {string} Formatted date.
 */
const formatListDate = (dateString, formatDate) => {
	if (!dateString) {
		return '';
	}

	try {
		return new Intl.DateTimeFormat('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		}).format(new Date(dateString));
	} catch (error) {
		return formatDate ? formatDate(dateString) : '';
	}
};

/**
 * Single note row for the admin list view (Figma card layout).
 */
const NoteListItem = ({
	comment,
	onClick,
	formatDate,
}) => {
	const status = getStatusByKey(comment.status);
	const statusLabel = status?.title || comment.status;
	const statusStyle = getStatusBadgeStyle(comment.status);
	const assignee = getPrimaryAssignee(comment);
	const assigneeName = assignee?.name || __('Unassigned', 'analogwp-site-notes');

	return (
		<button
			type="button"
			className="sn-notes-list__item"
			onClick={() => onClick && onClick(comment)}
		>
			<span className="sn-notes-list__status-col">
				<span
					className="sn-notes-list__status"
					style={statusStyle}
				>
					{statusLabel}
				</span>
			</span>

			<span className="sn-notes-list__title sn-truncate" title={comment.comment_title}>
				{comment.comment_title}
			</span>

			<span className="sn-notes-list__date">
				{formatListDate(comment.created_at, formatDate)}
			</span>

			<span className="sn-notes-list__assignee">
				<span className="sn-notes-list__assignee-name sn-truncate">
					{assigneeName}
				</span>
				{renderUserAvatar(assignee, 'sn-avatar sn-avatar--xs sn-notes-list__assignee-avatar')}
			</span>
		</button>
	);
};

export default NoteListItem;
