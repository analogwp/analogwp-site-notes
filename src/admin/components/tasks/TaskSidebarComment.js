/**
 * WordPress dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { renderUserAvatar } from './taskSidebarUserUtils';

const TASK_COMMENT_AVATAR_CLASS = 'sn-avatar sn-avatar--xs sn-task-comment__avatar';

const TaskSidebarComment = ({
	user,
	authorName,
	metaText,
	variant = 'default',
	headerAction = null,
	children,
	className = '',
}) => (
	<div className={classnames('sn-task-timeline__item', className)}>
		<article className="sn-task-comment">
			<header
				className={classnames('sn-task-comment__header', {
					'sn-task-comment__header--opener': variant === 'opener',
					'sn-task-comment__header--author': variant === 'author',
				})}
			>
				<div className="sn-task-comment__header-main">
					{renderUserAvatar(user, TASK_COMMENT_AVATAR_CLASS)}
					<span className="sn-task-comment__author">{authorName}</span>
					{metaText && (
						<span className="sn-task-comment__meta">{metaText}</span>
					)}
				</div>
				{headerAction && (
					<div className="sn-task-comment__header-action">
						{headerAction}
					</div>
				)}
			</header>
			<div className="sn-task-comment__body">
				{children}
			</div>
		</article>
	</div>
);

export default TaskSidebarComment;
