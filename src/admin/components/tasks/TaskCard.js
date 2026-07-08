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

const TaskCard = ({
	comment,
	user,
	onDelete,
	onEdit,
	onCardClick,
	formatDate,
	priorities = [],
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

	const getPriorityColor = (priority) => {
		const priorityObj = priorities.find(p => p.key === priority);
		if (priorityObj && priorityObj.color) {
			return priorityObj.color;
		}

		switch (priority) {
			case 'high': return '#ef4444';
			case 'medium': return '#f59e0b';
			case 'low': return '#10b981';
			default: return '#6b7280';
		}
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
					<div
						className="sn-priority-dot"
						style={{ backgroundColor: getPriorityColor(comment.priority) }}
					/>
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
							onEdit && onEdit(comment);
						}}
						className="sn-icon-action"
						title={__('Edit', 'analogwp-site-notes')}
					>
						<svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
							<path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708L4.5 15.207l-4 1a.5.5 0 0 1-.606-.606l1-4L12.146.146zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175l-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
						</svg>
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onDelete(comment.id);
						}}
						className="sn-icon-action sn-icon-action--danger"
						title={__('Delete', 'analogwp-site-notes')}
					>
						<svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
							<path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5zM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11z" />
						</svg>
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
						<svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16" className="sn-mr-1">
							<path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 0 1-.597-.933A9.268 9.268 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 2.472zM3.82 11a13.652 13.652 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0 0 13.745 12H11.91a9.27 9.27 0 0 1-.64 1.539 6.688 6.688 0 0 1-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 0 1-.312 2.5zm.312-3.5h2.49c-.062-.89-.291-1.733-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.024 7.024 0 0 0-3.072-2.472c.218.284.418.598.597.933zM10.855 4a7.966 7.966 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4h2.355z" />
						</svg>
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
							<span className="sn-text-s sn-text-primary">
								{user?.name || __('Unknown User', 'analogwp-site-notes')}
							</span>
						</div>
					</div>
					{comment.assignee && (
						<div className="sn-kanban-card-user-field">
							<small className="sn-kanban-card-user-label">{__('Assigned to', 'analogwp-site-notes')}</small>
							<div className="sn-kanban-card-user-row">
								{renderAvatar(comment.assignee)}
								<span className="sn-text-s sn-text-primary">
									{comment.assignee?.name || __('Unknown User', 'analogwp-site-notes')}
								</span>
							</div>
						</div>
					)}
				</div>
				<div className="sn-kanban-card-date">
					{formatDate(comment.created_at)}
				</div>
			</div>
		</div>
	);
};

export default TaskCard;
