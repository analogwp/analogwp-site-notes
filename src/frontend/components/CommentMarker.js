/**
 * WordPress dependencies
 */
import { useState, useRef, useEffect, createPortal } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { ArrowUpIcon, EllipsisVerticalIcon, NoteMarkerPinIcon, TrashOutlineIcon } from '../../shared/icons';
import { getStatusByKey } from '../constants/taskStatuses';
import { formatRelativeTime } from '../utils/formatRelativeTime';
import logger from '../../shared/utils/logger';

const Avatar = ({ name, src }) => {
	if (src) {
		return <img className="sn-note-thread__avatar" src={src} alt="" width={32} height={32} />;
	}

	return (
		<span className="sn-note-thread__avatar sn-note-thread__avatar--fallback" aria-hidden="true">
			{(name || '?').charAt(0).toUpperCase()}
		</span>
	);
};

const ThreadMessage = ({ name, avatar, date, text, onDelete, canDelete }) => {
	const body = (text || '').trim();
	if (!body) {
		return null;
	}

	return (
		<div className="sn-note-thread__message">
			<Avatar name={name} src={avatar} />
			<div className="sn-note-thread__message-body">
				<div className="sn-note-thread__meta">
					<span className="sn-note-thread__name">{name || __('Guest', 'analogwp-site-notes')}</span>
					<span className="sn-note-thread__time">{formatRelativeTime(date)}</span>
				</div>
				<p className="sn-note-thread__text">{body}</p>
			</div>
			{canDelete && onDelete && (
				<button
					type="button"
					className="sn-note-thread__reply-delete"
					onClick={onDelete}
					aria-label={__('Delete reply', 'analogwp-site-notes')}
					title={__('Delete reply', 'analogwp-site-notes')}
				>
					<TrashOutlineIcon size="sm" />
				</button>
			)}
		</div>
	);
};

const getStatusBadgeStyle = (statusKey) => {
	const status = getStatusByKey(statusKey);
	if (!status) {
		return {};
	}

	return {
		backgroundColor: status.color,
		color: status.textColor,
	};
};

const CommentMarker = ({
	comment,
	isSelected,
	onSelect,
	onAddReply,
	onDelete,
	onDeleteReply,
	canManageComments,
	adminDashboardUrl,
}) => {
	const [replyText, setReplyText] = useState('');
	const [isSubmittingReply, setIsSubmittingReply] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [, setViewportTick] = useState(0);
	const cardRef = useRef(null);
	const markerRef = useRef(null);
	const menuRef = useRef(null);

	const x = Number(comment?.x_position);
	const y = Number(comment?.y_position);
	const hasPosition = Number.isFinite(x) && Number.isFinite(y);

	useEffect(() => {
		if (!isSelected) {
			setMenuOpen(false);
			return;
		}

		const handleClickOutside = (event) => {
			if (
				cardRef.current?.contains(event.target) ||
				markerRef.current?.contains(event.target)
			) {
				return;
			}
			onSelect(null);
		};

		const handleKeyDown = (event) => {
			if (event.key === 'Escape') {
				if (menuOpen) {
					setMenuOpen(false);
					return;
				}
				onSelect(null);
			}
		};

		const handleViewportChange = () => setViewportTick((tick) => tick + 1);

		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('keydown', handleKeyDown);
		window.addEventListener('scroll', handleViewportChange, true);
		window.addEventListener('resize', handleViewportChange);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('scroll', handleViewportChange, true);
			window.removeEventListener('resize', handleViewportChange);
		};
	}, [isSelected, onSelect, menuOpen]);

	useEffect(() => {
		if (!menuOpen) {
			return;
		}

		const handleMenuOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setMenuOpen(false);
			}
		};

		document.addEventListener('mousedown', handleMenuOutside);
		return () => document.removeEventListener('mousedown', handleMenuOutside);
	}, [menuOpen]);

	if (!hasPosition) {
		return null;
	}

	const handleMarkerClick = (event) => {
		event.preventDefault();
		event.stopPropagation();
		onSelect(isSelected ? null : comment.id);
	};

	const handleReplySubmit = async (event) => {
		event.preventDefault();
		if (!replyText.trim() || isSubmittingReply) {
			return;
		}

		setIsSubmittingReply(true);
		try {
			await onAddReply(comment.id, replyText.trim());
			setReplyText('');
		} catch (error) {
			logger.error('Error submitting reply:', error);
		} finally {
			setIsSubmittingReply(false);
		}
	};

	const handleViewAtAdmin = () => {
		setMenuOpen(false);
		if (!adminDashboardUrl) {
			return;
		}
		const url = new URL(adminDashboardUrl, window.location.origin);
		url.searchParams.set('task', String(comment.id));
		window.open(url.toString(), '_blank', 'noopener,noreferrer');
	};

	const handleDelete = async () => {
		setMenuOpen(false);
		if (!onDelete) {
			return;
		}
		if (
			!window.confirm(
				__('Are you sure you want to delete this comment?', 'analogwp-site-notes')
			)
		) {
			return;
		}
		await onDelete(comment.id);
		onSelect(null);
	};

	const handleDeleteReply = async (replyId) => {
		if (!onDeleteReply) {
			return;
		}
		if (
			!window.confirm(
				__('Are you sure you want to delete this reply?', 'analogwp-site-notes')
			)
		) {
			return;
		}
		await onDeleteReply(replyId);
	};

	const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
	const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	const cardLeft = Math.min(x - scrollLeft + 40, window.innerWidth - 360);
	const cardTop = Math.max(16, y - scrollTop - 20);

	const title = (comment.comment_title || '').trim();
	const description = (comment.comment_text || '').trim();
	const status = getStatusByKey(comment.status);
	const statusLabel = status?.title || comment.status || __('Open', 'analogwp-site-notes');
	const currentUser = window.agwp_sn_ajax?.currentUser;
	const youLabel = __('You', 'analogwp-site-notes');

	const card = isSelected ? (
		<div
			ref={cardRef}
			className="sn-note-thread-card"
			data-sn-ignore="true"
			style={{
				left: `${Math.max(16, cardLeft)}px`,
				top: `${cardTop}px`,
			}}
			onClick={(event) => event.stopPropagation()}
		>
			<div className="sn-note-thread__header">
				<div className="sn-note-thread__header-main">
					<span className="sn-note-thread__status" style={getStatusBadgeStyle(comment.status)}>
						{statusLabel}
					</span>
					{title ? (
						<h4 className="sn-note-thread__title">{title}</h4>
					) : (
						<span className="sn-note-thread__title sn-note-thread__title--empty">
							{__('Untitled task', 'analogwp-site-notes')}
						</span>
					)}
				</div>

				<div className="sn-note-thread__menu-wrap" ref={menuRef}>
					<button
						type="button"
						className="sn-note-thread__menu-btn"
						onClick={() => setMenuOpen((open) => !open)}
						aria-expanded={menuOpen}
						aria-haspopup="menu"
						aria-label={__('More options', 'analogwp-site-notes')}
					>
						<EllipsisVerticalIcon size="sm" />
					</button>

					{menuOpen && (
						<ul className="sn-note-thread__menu" role="menu">
							{canManageComments && adminDashboardUrl && (
								<li role="none">
									<button type="button" role="menuitem" onClick={handleViewAtAdmin}>
										{__('View at Dashboard', 'analogwp-site-notes')}
									</button>
								</li>
							)}
							{canManageComments && onDelete && (
								<li role="none">
									<button
										type="button"
										role="menuitem"
										className="sn-note-thread__menu-danger"
										onClick={handleDelete}
									>
										{__('Delete', 'analogwp-site-notes')}
									</button>
								</li>
							)}
							{!(canManageComments && (adminDashboardUrl || onDelete)) && (
								<li role="none">
									<button
										type="button"
										role="menuitem"
										onClick={() => {
											setMenuOpen(false);
											onSelect(null);
										}}
									>
										{__('Close', 'analogwp-site-notes')}
									</button>
								</li>
							)}
						</ul>
					)}
				</div>
			</div>

			<div className="sn-note-thread__messages">
				<ThreadMessage
					name={comment.display_name}
					avatar={comment.avatar}
					date={comment.created_at}
					text={description}
				/>

				{(comment.replies || []).map((reply) => {
					const isCurrentUser =
						currentUser?.id && Number(reply.user_id) === Number(currentUser.id);
					return (
						<ThreadMessage
							key={reply.id}
							name={isCurrentUser ? youLabel : reply.display_name}
							avatar={reply.avatar || ''}
							date={reply.created_at}
							text={reply.reply_text}
							canDelete={canManageComments && !!onDeleteReply}
							onDelete={() => handleDeleteReply(reply.id)}
						/>
					);
				})}
			</div>

			<form className="sn-note-thread__composer" onSubmit={handleReplySubmit}>
				<textarea
					value={replyText}
					onChange={(event) => setReplyText(event.target.value)}
					placeholder={__('Add your reply', 'analogwp-site-notes')}
					rows={3}
					disabled={isSubmittingReply}
				/>
				<button
					type="submit"
					className="sn-note-thread__send"
					disabled={isSubmittingReply || !replyText.trim()}
					aria-label={__('Send reply', 'analogwp-site-notes')}
				>
					<ArrowUpIcon size="md" />
				</button>
			</form>
		</div>
	) : null;

	return (
		<>
			<button
				type="button"
				ref={markerRef}
				className={`sn-comment-marker${isSelected ? ' is-selected' : ''}`}
				style={{
					left: `${x}px`,
					top: `${y}px`,
				}}
				onClick={handleMarkerClick}
				aria-expanded={isSelected}
				aria-label={
					isSelected
						? __('Close note', 'analogwp-site-notes')
						: __('Open note', 'analogwp-site-notes')
				}
				data-sn-ignore="true"
			>
				{isSelected ? (
					<span className="sn-comment-marker__pin" aria-hidden="true">
						<NoteMarkerPinIcon />
						<span className="sn-comment-marker__number">{comment.id}</span>
					</span>
				) : (
					<span className="sn-comment-marker__dot" aria-hidden="true">
						<span className="sn-comment-marker__number">{comment.id}</span>
					</span>
				)}
			</button>

			{card && typeof document !== 'undefined' ? createPortal(card, document.body) : null}
		</>
	);
};

export default CommentMarker;
