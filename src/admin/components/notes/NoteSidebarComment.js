/**
 * WordPress dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { renderUserAvatar } from './noteSidebarUserUtils';

const NOTE_COMMENT_AVATAR_CLASS = 'sn-avatar sn-avatar--xs sn-note-comment__avatar';

const NoteSidebarComment = ({
	user,
	authorName,
	metaText,
	variant = 'default',
	headerAction = null,
	children,
	className = '',
}) => (
	<div className={classnames('sn-note-timeline__item', className)}>
		<article className="sn-note-comment">
			<header
				className={classnames('sn-note-comment__header', {
					'sn-note-comment__header--opener': variant === 'opener',
					'sn-note-comment__header--author': variant === 'author',
				})}
			>
				<div className="sn-note-comment__header-main">
					{renderUserAvatar(user, NOTE_COMMENT_AVATAR_CLASS)}
					<span className="sn-note-comment__author">{authorName}</span>
					{metaText && (
						<span className="sn-note-comment__meta">{metaText}</span>
					)}
				</div>
				{headerAction && (
					<div className="sn-note-comment__header-action">
						{headerAction}
					</div>
				)}
			</header>
			<div className="sn-note-comment__body">
				{children}
			</div>
		</article>
	</div>
);

export default NoteSidebarComment;
