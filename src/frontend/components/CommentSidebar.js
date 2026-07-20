/**
 * WordPress dependencies
 */
import { useState, useEffect, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
	ArrowLeftIcon,
	ArrowUpIcon,
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	EllipsisVerticalIcon,
	EyeIcon,
	TrashOutlineIcon,
} from '../../shared/icons';
import { getStatusByKey } from '../constants/noteStatuses';
import { formatRelativeTime } from '../utils/formatRelativeTime';
import { Button } from './ui';
import StatusSelect from './StatusSelect';
import logger from '../../shared/utils/logger';
import ScreenshotSelectionFrame from './ScreenshotSelectionFrame';

const FILTER_CURRENT = 'current';
const FILTER_ALL = 'all';

/**
 * Render a note's main content block (badge, title, body, author).
 *
 * @param {Object}   props
 * @param {Object}   props.comment          Note data.
 * @param {string}   props.statusDotColor   Status indicator color.
 * @param {Function} props.onScrollTo       Optional "view on page" handler.
 * @param {Function} props.onMenuToggle     Optional menu toggle handler.
 * @param {boolean}  props.menuOpen         Whether the actions menu is open.
 * @param {Object}   props.menuRef          Ref for open menu click-outside.
 * @param {Array}    props.menuItems        Optional menu item nodes.
 * @param {boolean}  props.showActions      Whether to show eye/menu actions.
 * @return {JSX.Element}
 */
const NoteMainContent = ({
	comment,
	statusDotColor,
	onScrollTo,
	onMenuToggle,
	menuOpen = false,
	menuRef = null,
	menuItems = null,
	showActions = true,
}) => {
	const title = (comment.comment_title || '').trim();
	const description = (comment.comment_text || '').trim();

	return (
		<div className="sn-note-item__main">
			<div className="sn-note-item__header">
				<div className="sn-note-item__badge" aria-hidden="true">
					{comment.id}
				</div>

				<div className="sn-note-item__meta">
					<div className="sn-note-item__meta-left">
						{statusDotColor && (
							<span
								className="sn-note-item__status-dot"
								style={{ backgroundColor: statusDotColor }}
								aria-hidden="true"
							/>
						)}
						{title ? (
							<h4 className="sn-note-item__title">{title}</h4>
						) : (
							<span className="sn-note-item__title sn-note-item__title--empty">
								{__('Untitled note', 'analogwp-site-notes')}
							</span>
						)}
					</div>

					{showActions && (
						<div className="sn-note-item__actions">
							{onScrollTo && (
								<button
									type="button"
									className="sn-note-item__icon-btn"
									onClick={(event) => {
										event.stopPropagation();
										onScrollTo();
									}}
									title={__('View on page', 'analogwp-site-notes')}
									aria-label={__('View on page', 'analogwp-site-notes')}
								>
									<EyeIcon className="sn-icon" size="sm" />
								</button>
							)}

							{menuItems && (
								<div
									className="sn-note-item__menu-wrap"
									ref={menuOpen ? menuRef : null}
								>
									<button
										type="button"
										className="sn-note-item__icon-btn"
										onClick={(event) => {
											event.stopPropagation();
											onMenuToggle?.();
										}}
										aria-expanded={menuOpen}
										aria-haspopup="menu"
										aria-label={__('More options', 'analogwp-site-notes')}
									>
										<EllipsisVerticalIcon className="sn-icon" size="sm" />
									</button>

									{menuOpen && (
										<ul className="sn-note-item__menu" role="menu">
											{menuItems}
										</ul>
									)}
								</div>
							)}
						</div>
					)}
				</div>
			</div>

			<div className="sn-note-item__body">
				{description ? (
					<p className="sn-note-item__text">{description}</p>
				) : (
					!title && (
						<p className="sn-note-item__text">
							{__('(No content)', 'analogwp-site-notes')}
						</p>
					)
				)}

				<div className="sn-note-item__author-row">
					{comment.avatar ? (
						<img
							className="sn-note-item__avatar"
							src={comment.avatar}
							alt=""
							width={32}
							height={32}
						/>
					) : (
						<span
							className="sn-note-item__avatar sn-note-item__avatar--fallback"
							aria-hidden="true"
						>
							{(comment.display_name || '?').charAt(0).toUpperCase()}
						</span>
					)}
					<span className="sn-note-item__author">{comment.display_name}</span>
					<span className="sn-note-item__time">
						{formatRelativeTime(comment.created_at)}
					</span>
				</div>
			</div>
		</div>
	);
};

/**
 * Reply block styled like the main note body.
 *
 * @param {Object}   props
 * @param {Object}   props.reply
 * @param {boolean}  props.canDelete
 * @param {Function} props.onDelete
 * @return {JSX.Element}
 */
const NoteReplyItem = ({ reply, canDelete = false, onDelete }) => {
	const text = (reply.reply_text || '').trim();
	if (!text) {
		return null;
	}

	return (
		<div className="sn-note-detail__reply">
			<p className="sn-note-item__text">{text}</p>
			<div className="sn-note-item__author-row">
				{reply.avatar ? (
					<img
						className="sn-note-item__avatar"
						src={reply.avatar}
						alt=""
						width={32}
						height={32}
					/>
				) : (
					<span
						className="sn-note-item__avatar sn-note-item__avatar--fallback"
						aria-hidden="true"
					>
						{(reply.display_name || '?').charAt(0).toUpperCase()}
					</span>
				)}
				<span className="sn-note-item__author">{reply.display_name}</span>
				<span className="sn-note-item__time">
					{formatRelativeTime(reply.created_at)}
				</span>
				{canDelete && onDelete && (
					<button
						type="button"
						className="sn-note-detail__reply-delete"
						onClick={onDelete}
						aria-label={__('Delete reply', 'analogwp-site-notes')}
						title={__('Delete reply', 'analogwp-site-notes')}
					>
						<TrashOutlineIcon size="sm" />
					</button>
				)}
			</div>
		</div>
	);
};

const CommentSidebar = ({
	comments,
	pageFilter = FILTER_CURRENT,
	onPageFilterChange,
	onAddReply,
	onUpdateStatus,
	onDelete,
	onDeleteReply,
	canManageComments,
	isVisible,
	onClose,
	pageUrl = '',
	adminDashboardUrl = '',
}) => {
	const [selectedCommentId, setSelectedCommentId] = useState(null);
	const [openMenuId, setOpenMenuId] = useState(null);
	const [filterOpen, setFilterOpen] = useState(false);
	const [replyText, setReplyText] = useState('');
	const [replyHoney, setReplyHoney] = useState('');
	const [isSubmittingReply, setIsSubmittingReply] = useState(false);
	const [highlightPosition, setHighlightPosition] = useState(null);
	const filterRef = useRef(null);
	const menuRef = useRef(null);
	const highlightTimerRef = useRef(null);

	const selectedComment = comments.find(
		(comment) => comment.id === selectedCommentId
	);

	useEffect(() => {
		if (selectedCommentId && !selectedComment) {
			setSelectedCommentId(null);
		}
	}, [selectedCommentId, selectedComment]);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (filterRef.current && !filterRef.current.contains(event.target)) {
				setFilterOpen(false);
			}
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setOpenMenuId(null);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	useEffect(() => {
		return () => {
			if (highlightTimerRef.current) {
				clearTimeout(highlightTimerRef.current);
			}
		};
	}, []);

	useEffect(() => {
		setReplyText('');
		setReplyHoney('');
		setIsSubmittingReply(false);
		setOpenMenuId(null);
	}, [selectedCommentId]);

	const clearScreenshotHighlight = () => {
		if (highlightTimerRef.current) {
			clearTimeout(highlightTimerRef.current);
			highlightTimerRef.current = null;
		}
		setHighlightPosition(null);
	};

	const showScreenshotHighlight = (position) => {
		clearScreenshotHighlight();

		// Wait for smooth scroll to settle so the frame lands on the capture area.
		highlightTimerRef.current = setTimeout(() => {
			setHighlightPosition(position);
			highlightTimerRef.current = setTimeout(() => {
				setHighlightPosition(null);
				highlightTimerRef.current = null;
			}, 3500);
		}, 350);
	};

	const getCommentCapturePosition = (comment) => {
		const x = Number(comment?.x_position);
		const y = Number(comment?.y_position);

		if (!Number.isFinite(x) || !Number.isFinite(y)) {
			return null;
		}

		// Default DB zeros mean "no stored capture point".
		if (x === 0 && y === 0) {
			return null;
		}

		return { x, y };
	};

	const filterLabel =
		pageFilter === FILTER_ALL
			? __('All Notes', 'analogwp-site-notes')
			: __('Current Page', 'analogwp-site-notes');

	const handleReplySubmit = async (commentId, event) => {
		event.preventDefault();
		if (!replyText.trim() || isSubmittingReply) {
			return;
		}

		setIsSubmittingReply(true);
		try {
			await onAddReply(commentId, replyText.trim(), replyHoney);
			setReplyText('');
			setReplyHoney('');
		} catch (error) {
			logger.error('Error submitting reply:', error);
		} finally {
			setIsSubmittingReply(false);
		}
	};

	const isOnCurrentPage = (comment) => {
		if (!comment?.page_url || !pageUrl) {
			return true;
		}
		return comment.page_url === pageUrl;
	};

	const scrollToElement = (comment) => {
		if (!isOnCurrentPage(comment) && comment.page_url) {
			window.location.href = comment.page_url;
			return;
		}

		const capturePosition = getCommentCapturePosition(comment);

		if (capturePosition) {
			window.scrollTo({
				left: Math.max(0, capturePosition.x - window.innerWidth / 2),
				top: Math.max(0, capturePosition.y - window.innerHeight / 2),
				behavior: 'smooth',
			});
			showScreenshotHighlight(capturePosition);
			return;
		}

		// Fallback for older notes without stored capture coordinates.
		const element = document.querySelector(comment.element_selector);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'center' });
			element.style.outline = '3px solid #3858e9';
			element.style.outlineOffset = '2px';
			setTimeout(() => {
				element.style.outline = '';
				element.style.outlineOffset = '';
			}, 2000);
		}
	};

	const handleOpenNote = (commentId) => {
		setSelectedCommentId(commentId);
		setOpenMenuId(null);
		setFilterOpen(false);
	};

	const handleBackToList = () => {
		setSelectedCommentId(null);
		setOpenMenuId(null);
	};

	const handleViewAtAdmin = (comment) => {
		setOpenMenuId(null);
		if (!adminDashboardUrl) {
			return;
		}
		const url = new URL(adminDashboardUrl, window.location.origin);
		// Keep query param "task" — deep-link URL contract; renaming needs a compat alias (no DB change, but leave as-is).
		url.searchParams.set('task', String(comment.id));
		window.open(url.toString(), '_blank', 'noopener,noreferrer');
	};

	const handleDelete = async (comment) => {
		setOpenMenuId(null);
		if (!onDelete) {
			return;
		}

		const confirmed = window.confirm(
			__('Are you sure you want to delete this note?', 'analogwp-site-notes')
		);
		if (!confirmed) {
			return;
		}

		try {
			await onDelete(comment.id);
			if (selectedCommentId === comment.id) {
				setSelectedCommentId(null);
			}
		} catch (error) {
			logger.error('Error deleting note:', error);
		}
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

	const getStatusDotColor = (status) => {
		const statusObj = getStatusByKey(status);
		return statusObj?.color || null;
	};

	const emptyMessage =
		pageFilter === FILTER_ALL
			? __('No notes yet.', 'analogwp-site-notes')
			: __('No notes on this page yet.', 'analogwp-site-notes');

	const renderNoteMenuItems = (comment) => (
		<>
			{canManageComments && adminDashboardUrl && (
				<li role="none">
					<button
						type="button"
						role="menuitem"
						onClick={(event) => {
							event.stopPropagation();
							handleViewAtAdmin(comment);
						}}
					>
						{__('View at Dashboard', 'analogwp-site-notes')}
					</button>
				</li>
			)}
			{canManageComments && onDelete && (
				<li role="none">
					<button
						type="button"
						role="menuitem"
						className="sn-note-item__menu-danger"
						onClick={(event) => {
							event.stopPropagation();
							handleDelete(comment);
						}}
					>
						{__('Delete', 'analogwp-site-notes')}
					</button>
				</li>
			)}
		</>
	);

	const hasMenuItems = (comment) =>
		(canManageComments && adminDashboardUrl) || (canManageComments && onDelete);

	return (
		<>
			{highlightPosition && (
				<ScreenshotSelectionFrame
					position={highlightPosition}
					className="sn-screenshot-frame--sidebar-highlight"
					withOverlay
					portal
					onDismiss={clearScreenshotHighlight}
				/>
			)}

			<Button
				variant={isVisible ? 'primary' : 'secondary'}
				className={`sn-sidebar-close ${!isVisible ? 'sn-sidebar-hidden' : ''}`}
				onClick={onClose}
				ariaLabel={__('Toggle Sidebar', 'analogwp-site-notes')}
				icon={isVisible ? <ChevronRightIcon className="sn-icon" /> : <ChevronLeftIcon className="sn-icon" />}
				iconPosition="left"
			/>

			{isVisible && (
				<div className="sn-comment-sidebar">
					{selectedComment ? (
						<>
							<div className="sn-sidebar-header sn-sidebar-header--detail">
								<button
									type="button"
									className="sn-sidebar-back"
									onClick={handleBackToList}
									aria-label={__('Back to notes', 'analogwp-site-notes')}
								>
									<ArrowLeftIcon className="sn-icon" size="sm" />
									<span>{__('Back', 'analogwp-site-notes')}</span>
								</button>
							</div>

							<div className="sn-sidebar-content sn-sidebar-content--detail">
								<div className="sn-note-detail">
									<div className="sn-note-detail__note">
										<NoteMainContent
											comment={selectedComment}
											statusDotColor={getStatusDotColor(selectedComment.status)}
											onScrollTo={() => scrollToElement(selectedComment)}
											onMenuToggle={() =>
												setOpenMenuId((id) =>
													id === selectedComment.id ? null : selectedComment.id
												)
											}
											menuOpen={openMenuId === selectedComment.id}
											menuRef={menuRef}
											menuItems={
												hasMenuItems(selectedComment)
													? renderNoteMenuItems(selectedComment)
													: null
											}
										/>

										{canManageComments && onUpdateStatus && (
											<div className="sn-note-detail__status">
												<StatusSelect
													value={selectedComment.status}
													onChange={(status) =>
														onUpdateStatus(selectedComment.id, status)
													}
												/>
											</div>
										)}
									</div>

									{(selectedComment.replies || []).length > 0 && (
										<div className="sn-note-detail__replies">
											{selectedComment.replies.map((reply) => (
												<NoteReplyItem
													key={reply.id}
													reply={reply}
													canDelete={canManageComments && !!onDeleteReply}
													onDelete={() => handleDeleteReply(reply.id)}
												/>
											))}
										</div>
									)}

									<form
										className="sn-note-thread__composer sn-note-detail__composer"
										onSubmit={(event) =>
											handleReplySubmit(selectedComment.id, event)
										}
									>
										<textarea
											value={replyText}
											onChange={(event) => setReplyText(event.target.value)}
											placeholder={__('Add your reply', 'analogwp-site-notes')}
											rows={3}
											disabled={isSubmittingReply}
										/>
										<input
											type="text"
											name="website"
											value={replyHoney}
											onChange={(event) => setReplyHoney(event.target.value)}
											tabIndex="-1"
											autoComplete="off"
											className="sn-note-detail__honeypot"
											aria-hidden="true"
										/>
										<button
											type="submit"
											className="sn-note-thread__send"
											disabled={isSubmittingReply || !replyText.trim()}
											aria-label={
												isSubmittingReply
													? __('Submitting...', 'analogwp-site-notes')
													: __('Send reply', 'analogwp-site-notes')
											}
										>
											{isSubmittingReply ? (
												<span className="sn-spinner" />
											) : (
												<ArrowUpIcon size="md" />
											)}
										</button>
									</form>
								</div>
							</div>
						</>
					) : (
						<>
							<div className="sn-sidebar-header">
								<h3>{__('Page Notes', 'analogwp-site-notes')}</h3>

								<div className="sn-sidebar-filter" ref={filterRef}>
									<button
										type="button"
										className="sn-sidebar-filter__trigger"
										onClick={() => setFilterOpen((open) => !open)}
										aria-expanded={filterOpen}
										aria-haspopup="listbox"
									>
										<span>{filterLabel}</span>
										<ChevronDownIcon className="sn-icon" size="sm" />
									</button>

									{filterOpen && (
										<ul className="sn-sidebar-filter__menu" role="listbox">
											<li role="option" aria-selected={pageFilter === FILTER_CURRENT}>
												<button
													type="button"
													className={
														pageFilter === FILTER_CURRENT
															? 'sn-sidebar-filter__option sn-sidebar-filter__option--selected'
															: 'sn-sidebar-filter__option'
													}
													onClick={() => {
														onPageFilterChange?.(FILTER_CURRENT);
														setFilterOpen(false);
													}}
												>
													{__('Current Page', 'analogwp-site-notes')}
												</button>
											</li>
											<li role="option" aria-selected={pageFilter === FILTER_ALL}>
												<button
													type="button"
													className={
														pageFilter === FILTER_ALL
															? 'sn-sidebar-filter__option sn-sidebar-filter__option--selected'
															: 'sn-sidebar-filter__option'
													}
													onClick={() => {
														onPageFilterChange?.(FILTER_ALL);
														setFilterOpen(false);
													}}
												>
													{__('All Notes', 'analogwp-site-notes')}
												</button>
											</li>
										</ul>
									)}
								</div>
							</div>

							<div className="sn-sidebar-content">
								{comments.length === 0 ? (
									<div className="sn-no-comments-sidebar">
										<p>{emptyMessage}</p>
										<p className="sn-instruction">
											{__('Click on any element to add a comment.', 'analogwp-site-notes')}
										</p>
									</div>
								) : (
									<ul className="sn-notes-list">
										{comments.map((comment) => {
											const statusDotColor = getStatusDotColor(comment.status);

											return (
												<li
													key={comment.id}
													className="sn-note-item sn-note-item--clickable"
													onClick={() => handleOpenNote(comment.id)}
												>
													<NoteMainContent
														comment={comment}
														statusDotColor={statusDotColor}
														onScrollTo={() => scrollToElement(comment)}
														onMenuToggle={() =>
															setOpenMenuId((id) =>
																id === comment.id ? null : comment.id
															)
														}
														menuOpen={openMenuId === comment.id}
														menuRef={menuRef}
														menuItems={
															hasMenuItems(comment)
																? renderNoteMenuItems(comment)
																: null
														}
													/>
												</li>
											);
										})}
									</ul>
								)}
							</div>
						</>
					)}
				</div>
			)}
		</>
	);
};

export default CommentSidebar;
