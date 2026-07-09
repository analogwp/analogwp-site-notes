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
import { TrashOutlineIcon, GlobeIcon } from '../../../shared/icons';

const TaskCard = ({
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
						<h4 className="sn-kanban-card-id">
							#{comment.id}
						</h4>
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
				{comment.categories && comment.categories.length > 0 && (
					<div className="sn-flex sn-flex-wrap sn-gap-1 sn-mb-2">
						{comment.categories.map((category, index) => (
							<span key={index} className="sn-badge sn-badge--default sn-badge--small">
								{category}
							</span>
						))}
					</div>
				)}
				{comment.page_url && (
					<div className="sn-kanban-card-meta">
						<GlobeIcon size={12} className="sn-mr-1" />
						<span className="sn-truncate">{new URL(comment.page_url).pathname}</span>
					</div>
				)}
			</div>

			<div className="sn-kanban-card-footer">
				<div className="sn-kanban-card-users">
					<div className="sn-kanban-card-user-field">
						<small className="sn-kanban-card-user-label">{__('Added by', 'analogwp-site-notes')}</small>
						<div className="sn-kanban-card-user-row">
							{renderAvatar(user)}
							<span className="sn-kanban-card-user-name">
								{user?.name || __('Unknown User', 'analogwp-site-notes')}
							</span>
							<span className="sn-kanban-card-date">
								{formatDate(comment.created_at)}
							</span>
						</div>
					</div>
					{comment.assignee && (
						<div className="sn-kanban-card-user-field">
							<small className="sn-kanban-card-user-label">{__('Assigned to', 'analogwp-site-notes')}</small>
							<div className="sn-kanban-card-user-row">
								{renderAvatar(comment.assignee)}
								<span className="sn-kanban-card-user-name">
									{comment.assignee?.name || __('Unknown User', 'analogwp-site-notes')}
								</span>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default TaskCard;
