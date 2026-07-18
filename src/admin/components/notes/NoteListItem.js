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
 * Resolve assignees for list display.
 *
 * @param {Object} comment Note/comment object.
 * @return {Array} Assignee users.
 */
const getAssignees = (comment) => {
	if (comment?.assignees?.length) {
		return comment.assignees;
	}

	if (comment?.assignee) {
		return [comment.assignee];
	}

	return [];
};

/**
 * Resolve the note creator for list display.
 *
 * @param {Object} comment Note/comment object.
 * @return {Object} Creator user-like object.
 */
const getCreator = (comment) => {
	if (comment?.creator) {
		return comment.creator;
	}

	if (comment?.user) {
		return comment.user;
	}

	return {
		id: comment?.user_id || 0,
		name: comment?.display_name || comment?.user_name || __('Guest', 'analogwp-site-notes'),
		avatar: comment?.avatar || '',
	};
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
	const creator = getCreator(comment);
	const assignees = getAssignees(comment);
	const title = comment.comment_title || '';

	return (
		<button
			type="button"
			className="sn-notes-list__item"
			onClick={() => onClick && onClick(comment)}
		>
			<span className="sn-notes-list__main">
				<span className="sn-notes-list__title-row">
					{comment.id && (
						<span className="sn-note-id">{comment.id}</span>
					)}
					<span className="sn-notes-list__title sn-truncate" title={title}>
						{title}
					</span>
					<span
						className="sn-notes-list__status"
						style={statusStyle}
					>
						{statusLabel}
					</span>
				</span>
			</span>

			<span className="sn-notes-list__meta">
				{renderUserAvatar(creator, 'sn-avatar sn-avatar--xs sn-notes-list__avatar')}
				<span className="sn-notes-list__on">
					{__('on', 'analogwp-site-notes')}
				</span>
				<span className="sn-notes-list__date">
					{formatListDate(comment.created_at, formatDate)}
				</span>
				{assignees.length > 0 && (
					<>
						<span className="sn-notes-list__to">
							{__('to', 'analogwp-site-notes')}
						</span>
						<span className="sn-notes-list__assignees">
							{assignees.map((assignee) => (
								<span
									key={assignee.id || assignee.name}
									className="sn-notes-list__assignee-avatar"
									title={assignee.name}
								>
									{renderUserAvatar(assignee, 'sn-avatar sn-avatar--xs')}
								</span>
							))}
						</span>
					</>
				)}
			</span>
		</button>
	);
};

export default NoteListItem;
