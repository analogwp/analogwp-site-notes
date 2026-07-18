/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * dnd-kit dependencies
 */
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import classnames from 'classnames';
import { TrashOutlineIcon, LinkIcon } from '../../../shared/icons';

const NoteCard = ({
	comment,
	user,
	onDelete,
	onCardClick,
	formatDate,
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		isDragging: isActiveDrag,
	} = useDraggable({
		id: comment.id,
		data: {
			comment: comment,
		},
	});

	const style = {
		transform: CSS.Translate.toString(transform),
	};

	const getUserInitials = (name) => {
		return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
	};

	const truncateWords = (text, maxWords = 40) => {
		if (!text) return '';
		const words = text.trim().split(/\s+/);
		if (words.length <= maxWords) return text;
		return words.slice(0, maxWords).join(' ') + '...';
	};

	const renderAvatar = (avatarUser, className = 'sn-avatar sn-avatar--xs') => (
		<div
			className={className}
			style={{
				backgroundImage: avatarUser?.avatar ? `url(${avatarUser.avatar})` : 'none',
				backgroundColor: avatarUser?.avatar ? 'transparent' : undefined,
			}}
		>
			{!avatarUser?.avatar && getUserInitials(avatarUser?.name || 'Unknown')}
		</div>
	);

	const creator = user || comment.creator || comment.user || {
		name: comment.display_name || comment.user_name || __('Unknown User', 'analogwp-site-notes'),
		avatar: comment.avatar || '',
	};

	const assignees = comment.assignees?.length
		? comment.assignees
		: (comment.assignee ? [comment.assignee] : []);

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
			className={classnames('sn-kanban-card', {
				'sn-kanban-card--dragging': isActiveDrag,
			})}
			onClick={() => onCardClick && onCardClick(comment)}
		>
			<div className="sn-kanban-card-header">
				<div className="sn-kanban-card-title-row">
					{comment.id && (
						<span className="sn-note-id">{comment.id}</span>
					)}
					{comment.comment_title && (
						<h4 className="sn-kanban-card-title" title={comment.comment_title}>
							{truncateWords(comment.comment_title, 30)}
						</h4>
					)}
				</div>
				<div className="sn-kanban-card-actions">
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onDelete(comment.id);
						}}
						className="sn-icon-action sn-icon-action--danger"
						title={__('Delete', 'analogwp-site-notes')}
					>
						<TrashOutlineIcon size="md" />
					</button>
				</div>
			</div>

			<div className="sn-kanban-card-body">
				{comment.page_url && (
					<div className="sn-kanban-card-meta">
						<LinkIcon size={12} className="sn-mr-1" />
						<span className="sn-truncate">{new URL(comment.page_url).pathname}</span>
					</div>
				)}
				<div className="sn-kanban-card-creator">
					<div className="sn-kanban-card-creator-user">
						{renderAvatar(creator)}
						<span className="sn-kanban-card-creator-name">
							{creator?.name || __('Unknown User', 'analogwp-site-notes')}
						</span>
					</div>
					{comment.created_at && formatDate && (
						<span className="sn-kanban-card-date">
							{formatDate(comment.created_at)}
						</span>
					)}
				</div>
			</div>

			{assignees.length > 0 && (
				<div className="sn-kanban-card-footer">
					<div className="sn-kanban-card-users">
						<div className="sn-kanban-card-user-field">
							<small className="sn-kanban-card-user-label">{__('Assignees', 'analogwp-site-notes')}</small>
							<div className="sn-kanban-card-user-row sn-kanban-card-user-row--assignees">
								{assignees.map((assignee) => (
									<div key={assignee.id} className="sn-kanban-card-assignee">
										{renderAvatar(assignee)}
										<span className="sn-kanban-card-user-name">
											{assignee?.name || __('Unknown User', 'analogwp-site-notes')}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default NoteCard;
