/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { formatRelativeTime } from './taskSidebarUtils';

const getUserInitials = (name) => {
	if (!name) {
		return '?';
	}

	return name
		.split(' ')
		.map((part) => part[0])
		.join('')
		.toUpperCase();
};

const TaskSidebarDiscussion = ({ replies = [] }) => {
	const currentUserId = window.agwp_sn_ajax?.currentUser?.id;

	if (!replies.length) {
		return (
			<div className="sn-task-sidebar__discussion-empty">
				{__('No replies yet. Start the discussion below.', 'analogwp-site-notes')}
			</div>
		);
	}

	return (
		<div className="sn-task-sidebar__discussion">
			{replies.map((reply) => {
				const isCurrentUser = currentUserId && String(reply.user_id) === String(currentUserId);

				return (
					<div
						key={reply.id}
						className="sn-task-sidebar__discussion-item"
					>
						<div
							className="sn-avatar sn-avatar--sm"
							style={{
								backgroundImage: reply.avatar ? `url(${reply.avatar})` : 'none',
								backgroundColor: reply.avatar ? 'transparent' : undefined,
							}}
						>
							{!reply.avatar && getUserInitials(reply.display_name || '')}
						</div>
						<div className="sn-task-sidebar__discussion-content">
							<div className="sn-task-sidebar__discussion-meta">
								<span className="sn-task-sidebar__discussion-author">
									{isCurrentUser
										? __('You', 'analogwp-site-notes')
										: (reply.display_name || __('Unknown User', 'analogwp-site-notes'))}
								</span>
								<span className="sn-task-sidebar__discussion-time">
									{formatRelativeTime(reply.created_at)}
								</span>
							</div>
							<div className="sn-task-sidebar__discussion-message">
								{reply.reply_text}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default TaskSidebarDiscussion;
