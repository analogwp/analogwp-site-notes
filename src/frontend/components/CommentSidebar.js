/**
 * WordPress dependencies
 */
import { useState, useEffect, useRef } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	EllipsisVerticalIcon,
	EyeIcon,
} from '../../shared/icons';
import { getStatusByKey } from '../constants/taskStatuses';
import { Button } from './ui';
import logger from '../../shared/utils/logger';
import ScreenshotSelectionFrame from './ScreenshotSelectionFrame';

const FILTER_CURRENT = 'current';
const FILTER_ALL = 'all';

/**
 * Format a timestamp as a relative phrase (e.g. "3 hours ago").
 *
 * @param {string} dateString Date string from the API.
 * @return {string} Relative time label.
 */
const formatRelativeTime = (dateString) => {
	if (!dateString) {
		return '';
	}

	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now - date;
	const diffMinutes = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMinutes / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffMinutes < 1) {
		return __('Just now', 'analogwp-site-notes');
	}

	if (diffMinutes === 1) {
		return __('1 minute ago', 'analogwp-site-notes');
	}

	if (diffMinutes < 60) {
		return sprintf(
			/* translators: %d: number of minutes */
			__('%d minutes ago', 'analogwp-site-notes'),
			diffMinutes
		);
	}

	if (diffHours === 1) {
		return __('1 hour ago', 'analogwp-site-notes');
	}

	if (diffHours < 24) {
		return sprintf(
			/* translators: %d: number of hours */
			__('%d hours ago', 'analogwp-site-notes'),
			diffHours
		);
	}

	if (diffDays === 1) {
		return __('1 day ago', 'analogwp-site-notes');
	}

	if (diffDays < 7) {
		return sprintf(
			/* translators: %d: number of days */
			__('%d days ago', 'analogwp-site-notes'),
			diffDays
		);
	}

	return new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
		year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
	}).format(date);
};

const CommentSidebar = ({
	comments,
	pageFilter = FILTER_CURRENT,
	onPageFilterChange,
	onAddReply,
	onUpdateStatus,
	onDelete,
	canManageComments,
	isVisible,
	onClose,
	pageUrl = '',
	adminDashboardUrl = '',
}) => {
	const [selectedComment, setSelectedComment] = useState(null);
	const [openMenuId, setOpenMenuId] = useState(null);
	const [filterOpen, setFilterOpen] = useState(false);
	const [replyTexts, setReplyTexts] = useState({});
	const [isSubmittingReply, setIsSubmittingReply] = useState({});
	const [replyHoney, setReplyHoney] = useState({});
	const [highlightPosition, setHighlightPosition] = useState(null);
	const filterRef = useRef(null);
	const menuRef = useRef(null);
	const highlightTimerRef = useRef(null);

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

	const handleReplySubmit = async (commentId, e) => {
		e.preventDefault();
		const replyText = replyTexts[commentId];
		if (!replyText?.trim()) {
			return;
		}

		setIsSubmittingReply((prev) => ({ ...prev, [commentId]: true }));
		try {
			await onAddReply(commentId, replyText.trim(), replyHoney[commentId] || '');
			setReplyTexts((prev) => ({ ...prev, [commentId]: '' }));
			setReplyHoney((prev) => ({ ...prev, [commentId]: '' }));
		} catch (error) {
			logger.error('Error submitting reply:', error);
		} finally {
			setIsSubmittingReply((prev) => ({ ...prev, [commentId]: false }));
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

		// Fallback for older tasks without stored capture coordinates.
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

	const handleViewDetails = (commentId) => {
		setSelectedComment((prev) => (prev === commentId ? null : commentId));
		setOpenMenuId(null);
	};

	const handleViewAtAdmin = (comment) => {
		setOpenMenuId(null);
		if (!adminDashboardUrl) {
			return;
		}
		const url = new URL(adminDashboardUrl, window.location.origin);
		url.searchParams.set('task', String(comment.id));
		window.open(url.toString(), '_blank', 'noopener,noreferrer');
	};

	const handleDelete = async (comment) => {
		setOpenMenuId(null);
		if (!onDelete) {
			return;
		}

		const confirmed = window.confirm(
			__('Are you sure you want to delete this task?', 'analogwp-site-notes')
		);
		if (!confirmed) {
			return;
		}

		try {
			await onDelete(comment.id);
			if (selectedComment === comment.id) {
				setSelectedComment(null);
			}
		} catch (error) {
			logger.error('Error deleting task:', error);
		}
	};

	const getStatusDotColor = (status) => {
		const statusObj = getStatusByKey(status);
		return statusObj?.color || null;
	};

	const emptyMessage =
		pageFilter === FILTER_ALL
			? __('No tasks yet.', 'analogwp-site-notes')
			: __('No tasks on this page yet.', 'analogwp-site-notes');

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
									const isExpanded = selectedComment === comment.id;
									const statusDotColor = getStatusDotColor(comment.status);
									const title = (comment.comment_title || '').trim();
									const description = (comment.comment_text || '').trim();

									return (
										<li
											key={comment.id}
											className={`sn-note-item${isExpanded ? ' sn-note-item--expanded' : ''}`}
										>
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
																	{__('Untitled task', 'analogwp-site-notes')}
																</span>
															)}
														</div>

														<div className="sn-note-item__actions">
															<button
																type="button"
																className="sn-note-item__icon-btn"
																onClick={() => scrollToElement(comment)}
																title={__('View on page', 'analogwp-site-notes')}
																aria-label={__('View on page', 'analogwp-site-notes')}
															>
																<EyeIcon className="sn-icon" size="sm" />
															</button>

															<div
																className="sn-note-item__menu-wrap"
																ref={openMenuId === comment.id ? menuRef : null}
															>
																<button
																	type="button"
																	className="sn-note-item__icon-btn"
																	onClick={() =>
																		setOpenMenuId((id) =>
																			id === comment.id ? null : comment.id
																		)
																	}
																	aria-expanded={openMenuId === comment.id}
																	aria-haspopup="menu"
																	aria-label={__('More options', 'analogwp-site-notes')}
																>
																	<EllipsisVerticalIcon className="sn-icon" size="sm" />
																</button>

																{openMenuId === comment.id && (
																	<ul className="sn-note-item__menu" role="menu">
																		<li role="none">
																			<button
																				type="button"
																				role="menuitem"
																				onClick={() => handleViewDetails(comment.id)}
																			>
																				{__('View Details', 'analogwp-site-notes')}
																			</button>
																		</li>
																		{canManageComments && adminDashboardUrl && (
																			<li role="none">
																				<button
																					type="button"
																					role="menuitem"
																					onClick={() => handleViewAtAdmin(comment)}
																				>
																					{__('View at admin', 'analogwp-site-notes')}
																				</button>
																			</li>
																		)}
																		{canManageComments && onDelete && (
																			<li role="none">
																				<button
																					type="button"
																					role="menuitem"
																					className="sn-note-item__menu-danger"
																					onClick={() => handleDelete(comment)}
																				>
																					{__('Delete', 'analogwp-site-notes')}
																				</button>
																			</li>
																		)}
																	</ul>
																)}
															</div>
														</div>
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
															<span className="sn-note-item__avatar sn-note-item__avatar--fallback" aria-hidden="true">
																{(comment.display_name || '?').charAt(0).toUpperCase()}
															</span>
														)}
														<span className="sn-note-item__author">
															{comment.display_name}
														</span>
														<span className="sn-note-item__time">
															{formatRelativeTime(comment.created_at)}
														</span>
													</div>
												</div>
											</div>

											{isExpanded && (
												<div className="sn-note-item__details">
													{canManageComments && onUpdateStatus && (
														<div className="sn-note-item__status">
															<label htmlFor={`sn-note-status-${comment.id}`}>
																{__('Status', 'analogwp-site-notes')}
															</label>
															<select
																id={`sn-note-status-${comment.id}`}
																value={comment.status}
																onChange={(e) =>
																	onUpdateStatus(comment.id, e.target.value)
																}
																className="sn-status-select"
															>
																<option value="open">
																	{__('Open', 'analogwp-site-notes')}
																</option>
																<option value="in_progress">
																	{__('In Progress', 'analogwp-site-notes')}
																</option>
																<option value="resolved">
																	{__('Resolved', 'analogwp-site-notes')}
																</option>
															</select>
														</div>
													)}

													{comment.replies && comment.replies.length > 0 && (
														<div className="sn-note-item__replies">
															{comment.replies.map((reply) => (
																<div key={reply.id} className="sn-note-item__reply">
																	<div className="sn-note-item__reply-meta">
																		<strong>{reply.display_name}</strong>
																		<span>{formatRelativeTime(reply.created_at)}</span>
																	</div>
																	<p>{reply.reply_text}</p>
																</div>
															))}
														</div>
													)}

													<form
														onSubmit={(e) => handleReplySubmit(comment.id, e)}
														className="sn-note-item__reply-form"
													>
														<textarea
															value={replyTexts[comment.id] || ''}
															onChange={(e) =>
																setReplyTexts((prev) => ({
																	...prev,
																	[comment.id]: e.target.value,
																}))
															}
															placeholder={__('Add a reply...', 'analogwp-site-notes')}
															rows="3"
														/>
														<input
															type="text"
															name="website"
															value={replyHoney[comment.id] || ''}
															onChange={(e) =>
																setReplyHoney((prev) => ({
																	...prev,
																	[comment.id]: e.target.value,
																}))
															}
															tabIndex="-1"
															autoComplete="off"
															style={{
																position: 'absolute',
																left: '-9999px',
																opacity: 0,
																pointerEvents: 'none',
															}}
															aria-hidden="true"
														/>
														<div className="sn-note-item__reply-actions">
															<Button
																type="submit"
																variant="primary"
																disabled={isSubmittingReply[comment.id]}
																loading={isSubmittingReply[comment.id]}
																size="sm"
															>
																{isSubmittingReply[comment.id]
																	? __('Submitting...', 'analogwp-site-notes')
																	: __('Reply', 'analogwp-site-notes')}
															</Button>
															<Button
																variant="ghost"
																size="sm"
																onClick={() => setSelectedComment(null)}
															>
																{__('Close', 'analogwp-site-notes')}
															</Button>
														</div>
													</form>
												</div>
											)}
										</li>
									);
								})}
							</ul>
						)}
					</div>
				</div>
			)}
		</>
	);
};

export default CommentSidebar;
