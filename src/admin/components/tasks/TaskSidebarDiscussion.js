/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { TrashOutlineIcon } from '../../../shared/icons';
import { formatRelativeTime } from './taskSidebarUtils';
import TaskSidebarComment from './TaskSidebarComment';

const TaskSidebarDiscussion = ({ replies = [], onDeleteReply }) => {
	const currentUserId = window.agwp_sn_ajax?.currentUser?.id;

	if (!replies.length) {
		return null;
	}

	return replies.map((reply) => {
		const isCurrentUser = currentUserId && String(reply.user_id) === String(currentUserId);
		const authorName = reply.display_name || __('Unknown User', 'analogwp-site-notes');

		const deleteAction = onDeleteReply ? (
			<button
				type="button"
				className="sn-task-comment__edit-btn sn-task-comment__edit-btn--danger"
				onClick={() => onDeleteReply(reply.id)}
				title={__('Delete comment', 'analogwp-site-notes')}
			>
				<TrashOutlineIcon size="md" />
			</button>
		) : null;

		return (
			<TaskSidebarComment
				key={reply.id}
				user={{
					display_name: reply.display_name,
					avatar: reply.avatar,
				}}
				authorName={authorName}
				metaText={formatRelativeTime(reply.created_at)}
				variant={isCurrentUser ? 'author' : 'default'}
				headerAction={deleteAction}
			>
				{reply.reply_text}
			</TaskSidebarComment>
		);
	});
};

export default TaskSidebarDiscussion;
