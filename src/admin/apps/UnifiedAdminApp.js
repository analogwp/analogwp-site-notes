/**
 * WordPress dependencies
 */
import { useState, useEffect, useRef, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import NotesView from '../components/notes';
import AdminHeader from '../components/AdminHeader';
import Settings from '../components/settings';
import { ToastProvider, showToast, showConfirmation } from '../components/ToastProvider';
import SettingsProvider, { useSettings } from '../components/settings/SettingsProvider';
import logger from '../../shared/utils/logger';

const emptyPagination = () => ({
	open: { total: 0, loaded: 0, hasMore: false },
	in_progress: { total: 0, loaded: 0, hasMore: false },
	resolved: { total: 0, loaded: 0, hasMore: false },
	list: { total: 0, loaded: 0, hasMore: false },
});

const UnifiedAdminApp = ({ initialPage = 'dashboard' }) => {
	return (
		<ToastProvider>
			<SettingsProvider>
				<UnifiedAdminAppContent initialPage={initialPage} />
			</SettingsProvider>
		</ToastProvider>
	);
};

const UnifiedAdminAppContent = ({ initialPage = 'dashboard' }) => {
	const { priorities } = useSettings();
	const getInitialSettingsTab = () => {
		try {
			const tab = new URLSearchParams(window.location.search).get('tab');
			// Keep "task-priorities" — settings URL/tab key; renaming would break bookmarks (not a DB migration but stable API).
			const validTabs = ['general', 'access-control', 'task-priorities', 'categories', 'advanced'];

			return validTabs.includes(tab) ? tab : 'general';
		} catch (error) {
			return 'general';
		}
	};
	const [currentPage, setCurrentPage] = useState(initialPage);
	const [settingsTab, setSettingsTab] = useState(getInitialSettingsTab);
	const [comments, setComments] = useState([]);
	const [users, setUsers] = useState([]);
	const [categories, setCategories] = useState([]);
	const [pages, setPages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState({});
	const [notesPerLoad, setNotesPerLoad] = useState(10);
	const [pagination, setPagination] = useState(emptyPagination);
	const [activeView, setActiveView] = useState('kanban'); // kanban, list
	const [filters, setFilters] = useState({
		status: '',
		user: '',
		category: ''
	});
	const [sortBy, setSortBy] = useState('created_at');
	const skipNextNotesReload = useRef(true);
	const filtersRef = useRef(filters);
	const sortByRef = useRef(sortBy);
	const activeViewRef = useRef(activeView);

	filtersRef.current = filters;
	sortByRef.current = sortBy;
	activeViewRef.current = activeView;

	const buildNotesParams = useCallback((view, extra = {}) => {
		const currentFilters = filtersRef.current;
		const params = {
			nonce: agwp_sn_ajax.nonce,
			view,
			sort_by: sortByRef.current,
			status: currentFilters.status || '',
			user: currentFilters.user || '',
			category: currentFilters.category || '',
			...extra,
		};

		return params;
	}, []);

	const loadPages = async () => {
		try {
			const response = await fetch(agwp_sn_ajax.ajaxUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					action: 'agwp_sn_get_pages',
					nonce: agwp_sn_ajax.nonce
				})
			});

			const data = await response.json();
			if (data.success) {
				setPages(data.data.pages || []);
			}
		} catch (error) {
			logger.error('Error loading pages', error);
		}
	};

	const loadAdminData = useCallback(async (view = activeViewRef.current) => {
		setLoading(true);
		try {
			const response = await fetch(agwp_sn_ajax.ajaxUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					action: 'agwp_sn_get_admin_data',
					...buildNotesParams(view),
				})
			});

			const data = await response.json();
			if (data.success) {
				setComments(data.data.comments || []);
				setUsers(data.data.users || []);
				setCategories(data.data.categories || []);
				setNotesPerLoad(data.data.notes_per_load || 10);
				setPagination({
					...emptyPagination(),
					...(data.data.pagination || {}),
				});
			} else {
				logger.error('Error loading admin data', data.message);
			}
		} catch (error) {
			logger.error('Error loading admin data', error);
		} finally {
			setLoading(false);
		}
	}, [buildNotesParams]);

	useEffect(() => {
		loadAdminData('kanban');
		loadPages();
	}, [loadAdminData]);

	useEffect(() => {
		if (skipNextNotesReload.current) {
			skipNextNotesReload.current = false;
			return;
		}

		loadAdminData(activeView);
	}, [filters, sortBy, activeView, loadAdminData]);

	const handleFilterChange = (newFilters) => {
		setFilters({ ...filters, ...newFilters });
	};

	const handleSortChange = (newSortBy) => {
		setSortBy(newSortBy);
	};

	const handleViewChange = (view) => {
		setActiveView(view);
	};

	const adjustPaginationTotal = (statusKey, delta) => {
		if (!statusKey) {
			return;
		}

		setPagination((prev) => {
			const bucket = prev[statusKey] || { total: 0, loaded: 0, hasMore: false };
			const list = prev.list || { total: 0, loaded: 0, hasMore: false };
			const nextTotal = Math.max(0, (bucket.total || 0) + delta);
			const nextLoaded = Math.max(0, Math.min((bucket.loaded || 0) + delta, nextTotal));
			const nextListTotal = Math.max(0, (list.total || 0) + delta);
			const nextListLoaded = Math.max(0, Math.min((list.loaded || 0) + delta, nextListTotal));

			return {
				...prev,
				[statusKey]: {
					...bucket,
					total: nextTotal,
					loaded: nextLoaded,
					hasMore: nextLoaded < nextTotal,
				},
				list: {
					...list,
					total: nextListTotal,
					loaded: nextListLoaded,
					hasMore: nextListLoaded < nextListTotal,
				},
			};
		});
	};

	const handleLoadMore = async (statusKey = null) => {
		const loadingKey = statusKey || 'list';
		if (loadingMore[loadingKey]) {
			return;
		}

		const offset = statusKey
			? comments.filter((comment) => comment.status === statusKey).length
			: comments.length;

		setLoadingMore((prev) => ({ ...prev, [loadingKey]: true }));

		try {
			const response = await fetch(agwp_sn_ajax.ajaxUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					action: 'agwp_sn_load_more_notes',
					...buildNotesParams(activeViewRef.current, {
						offset: String(offset),
						...(statusKey ? { status: statusKey } : {}),
					}),
				})
			});

			const data = await response.json();
			if (data.success) {
				const incoming = data.data.comments || [];
				setComments((prev) => {
					const existingIds = new Set(prev.map((comment) => String(comment.id)));
					const unique = incoming.filter((comment) => !existingIds.has(String(comment.id)));
					return [...prev, ...unique];
				});

				setPagination((prev) => {
					const key = statusKey || 'list';
					const total = data.data.total ?? (prev[key] && prev[key].total) ?? 0;
					const loaded = data.data.loaded ?? offset + incoming.length;
					return {
						...prev,
						[key]: {
							total,
							loaded,
							hasMore: Boolean(data.data.hasMore),
						},
					};
				});

				if (data.data.notes_per_load) {
					setNotesPerLoad(data.data.notes_per_load);
				}
			} else {
				logger.error('Error loading more notes', data.message);
				showToast.error(__('Error loading more notes. Please try again.', 'analogwp-site-notes'));
			}
		} catch (error) {
			logger.error('Error loading more notes', error);
			showToast.error(__('Error loading more notes. Please try again.', 'analogwp-site-notes'));
		} finally {
			setLoadingMore((prev) => ({ ...prev, [loadingKey]: false }));
		}
	};

	const handleAddComment = async (newComment) => {
		try {
			const response = await fetch(agwp_sn_ajax.ajaxUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					action: 'agwp_sn_add_comment',
					nonce: agwp_sn_ajax.nonce,
					comment: JSON.stringify(newComment)
				})
			});

			const data = await response.json();
			if (data.success) {
				setComments([data.data.comment, ...comments]);
				adjustPaginationTotal(data.data.comment?.status || 'open', 1);
			} else {
				logger.error('Error adding comment:', data.message);
			}
		} catch (error) {
			logger.error('Error adding comment:', error);
		}
	};

	const handleAddNote = async (taskData) => {
		try {
			const response = await fetch(agwp_sn_ajax.ajaxUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					action: 'agwp_sn_add_new_note',
					nonce: agwp_sn_ajax.nonce,
					...taskData
				})
			});

			const data = await response.json();
			if (data.success) {
				await loadAdminData(activeViewRef.current);
			} else {
				logger.error('Error adding note:', data.message);
				throw new Error(data.message);
			}
		} catch (error) {
			logger.error('Error adding note:', error);
			throw error;
		}
	};

	const handleUpdateComment = async (commentId, updates, options = {}) => {
		logger.debug('Updating comment with ID:', commentId);
		logger.debug('Updates to apply:', updates);
		const previous = comments.find((comment) => String(comment.id) === String(commentId));
		try {
			const response = await fetch(agwp_sn_ajax.ajaxUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					action: 'agwp_sn_update_comment',
					nonce: agwp_sn_ajax.nonce,
					comment_id: commentId,
					updates: JSON.stringify(updates)
				})
			});

			const data = await response.json();
			logger.debug('Server response:', data);
			if (data.success) {
				setComments((prevComments) => prevComments.map(comment => {
					if (String(comment.id) !== String(commentId)) {
						return comment;
					}

					const updatedComment = { ...comment, ...updates };

					if (updates.assigned_users !== undefined) {
						const assignees = (updates.assigned_users || [])
							.filter((userId) => parseInt(userId, 10) > 0)
							.map((userId) => users.find((user) => String(user.id) === String(userId)))
							.filter(Boolean);
						updatedComment.assignees = assignees;
						updatedComment.assignee = assignees[0] || null;
						updatedComment.assigned_to = assignees[0]?.id || 0;
					} else if (updates.assigned_to !== undefined) {
						if (updates.assigned_to && updates.assigned_to !== '0' && updates.assigned_to !== 0) {
							const assignedUser = users.find(user => String(user.id) === String(updates.assigned_to));
							updatedComment.assignees = assignedUser ? [assignedUser] : [];
							updatedComment.assignee = assignedUser || null;
						} else {
							updatedComment.assignees = [];
							updatedComment.assignee = null;
						}
					}

					return updatedComment;
				}));

				if (previous && updates.status && updates.status !== previous.status) {
					setPagination((prev) => {
						const from = prev[previous.status] || { total: 0, loaded: 0, hasMore: false };
						const to = prev[updates.status] || { total: 0, loaded: 0, hasMore: false };
						const fromTotal = Math.max(0, (from.total || 0) - 1);
						const fromLoaded = Math.max(0, (from.loaded || 0) - 1);
						const toTotal = (to.total || 0) + 1;
						const toLoaded = (to.loaded || 0) + 1;
						return {
							...prev,
							[previous.status]: {
								...from,
								total: fromTotal,
								loaded: fromLoaded,
								hasMore: fromLoaded < fromTotal,
							},
							[updates.status]: {
								...to,
								total: toTotal,
								loaded: toLoaded,
								hasMore: toLoaded < toTotal,
							},
						};
					});
				}

				if (!options.silent) {
					showToast.success(__('Note updated successfully!', 'analogwp-site-notes'));
				}
				return true;
			} else {
				const errorMessage = data.data?.message || data.message || 'Unknown error';
				logger.error('Error updating comment:', errorMessage);
				logger.error('Full response:', data);
				if (!options.silent) {
					showToast.error(__('Error updating note. Please try again.', 'analogwp-site-notes'));
				}
				return false;
			}
		} catch (err) {
			logger.error('Error updating comment:', err);
			if (!options.silent) {
				showToast.error(__('Error updating note. Please try again.', 'analogwp-site-notes'));
			}
			return false;
		}
	};

	const handleAddReply = async (commentId, replyText) => {
		try {
			const response = await fetch(agwp_sn_ajax.ajaxUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					action: 'agwp_sn_admin_add_reply',
					nonce: agwp_sn_ajax.nonce,
					comment_id: commentId,
					reply_text: replyText,
				}),
			});

			const data = await response.json();

			if (data.success && data.data?.reply) {
				setComments(comments.map((comment) => {
					if (comment.id !== commentId) {
						return comment;
					}

					const existingReplies = Array.isArray(comment.replies) ? comment.replies : [];

					return {
						...comment,
						replies: [...existingReplies, data.data.reply],
					};
				}));
				return data.data.reply;
			}

			showToast.error(data.data?.message || __('Error adding reply', 'analogwp-site-notes'));
			return null;
		} catch (err) {
			logger.error('Error adding reply:', err);
			showToast.error(__('Error adding reply', 'analogwp-site-notes'));
			return null;
		}
	};

	const handleDeleteReply = async (commentId, replyId) => {
		try {
			const response = await fetch(agwp_sn_ajax.ajaxUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					action: 'agwp_sn_admin_delete_reply',
					nonce: agwp_sn_ajax.nonce,
					reply_id: replyId,
				}),
			});

			const data = await response.json();

			if (data.success) {
				setComments(comments.map((comment) => {
					if (comment.id !== commentId) {
						return comment;
					}

					const existingReplies = Array.isArray(comment.replies) ? comment.replies : [];

					return {
						...comment,
						replies: existingReplies.filter(
							(reply) => String(reply.id) !== String(replyId)
						),
					};
				}));
				return true;
			}

			showToast.error(data.data?.message || __('Error deleting comment', 'analogwp-site-notes'));
			return false;
		} catch (err) {
			logger.error('Error deleting reply:', err);
			showToast.error(__('Error deleting comment', 'analogwp-site-notes'));
			return false;
		}
	};

	const handleDelete = async (commentId) => {
		const confirmed = await showConfirmation(
			__('Are you sure you want to delete this note? This action cannot be undone.', 'analogwp-site-notes'),
			{ confirmText: __('Delete', 'analogwp-site-notes') }
		);

		if (!confirmed) {
			return;
		}

		const existing = comments.find((comment) => String(comment.id) === String(commentId));

		try {
			const response = await fetch(agwp_sn_ajax.ajaxUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					action: 'agwp_sn_delete_comment',
					nonce: agwp_sn_ajax.nonce,
					comment_id: commentId
				})
			});

			const data = await response.json();
			if (data.success) {
				setComments(comments.filter(comment => String(comment.id) !== String(commentId)));
				adjustPaginationTotal(existing?.status, -1);
				showToast.success(__('Note deleted successfully!', 'analogwp-site-notes'));
			} else {
				logger.error('Error deleting comment:', data.message);
				showToast.error(__('Error deleting note. Please try again.', 'analogwp-site-notes'));
			}
		} catch (err) {
			logger.error('Error deleting comment:', err);
			showToast.error(__('Error deleting note. Please try again.', 'analogwp-site-notes'));
		}
	};

	const handleNavigation = (page, options = {}) => {
		setCurrentPage(page);

		if (page === 'settings' && options.tab) {
			setSettingsTab(options.tab);
		}

		try {
			const currentUrl = new URL(window.location.href);
			const baseParams = new URLSearchParams(currentUrl.search);

			if (page === 'settings') {
				baseParams.set('page', 'agwp-sn-settings');

				if (options.tab) {
					baseParams.set('tab', options.tab);
				}
			} else {
				baseParams.set('page', 'agwp-sn-dashboard');
				baseParams.delete('tab');
			}

			const newUrl = `${currentUrl.origin}${currentUrl.pathname}?${baseParams.toString()}`;
			window.history.pushState({ page, tab: options.tab || null }, '', newUrl);

			document.title = page === 'settings'
				? `${__('Settings', 'analogwp-site-notes')} - Analog Site Notes`
				: `${__('Notes', 'analogwp-site-notes')} - Analog Site Notes`;
		} catch (error) {
			logger.navigation('Navigation:', page);
		}
	};

	const handleNavigateToSettingsTab = (tab) => {
		handleNavigation('settings', { tab });
	};

	useEffect(() => {
		const handlePopState = () => {
			const urlParams = new URLSearchParams(window.location.search);
			const page = urlParams.get('page');

			if (page && page.includes('settings')) {
				setCurrentPage('settings');
				setSettingsTab(getInitialSettingsTab());
				return;
			}

			setCurrentPage('dashboard');
		};

		window.addEventListener('popstate', handlePopState);
		return () => window.removeEventListener('popstate', handlePopState);
	}, []);

	const renderPageContent = () => {
		if (loading && currentPage === 'dashboard') {
			return (
				<div className="sn-admin-loading">
					<div className="sn-spinner"></div>
					<p>{__('Loading dashboard...', 'analogwp-site-notes')}</p>
				</div>
			);
		}

		switch (currentPage) {
			case 'settings':
				return <Settings initialTab={settingsTab} />;
			case 'dashboard':
			default:
				return (
					<NotesView
						comments={comments}
						onUpdateComment={handleUpdateComment}
						onAddReply={handleAddReply}
						onDeleteReply={handleDeleteReply}
						onDelete={handleDelete}
						onAddNote={handleAddNote}
						users={users}
						categories={categories}
						priorities={priorities}
						pages={pages}
						onAddComment={handleAddComment}
						activeView={activeView}
						onViewChange={handleViewChange}
						filters={filters}
						onFilterChange={handleFilterChange}
						sortBy={sortBy}
						onSortChange={handleSortChange}
						onNavigateToSettingsTab={handleNavigateToSettingsTab}
						pagination={pagination}
						loadingMore={loadingMore}
						onLoadMore={handleLoadMore}
						notesPerLoad={notesPerLoad}
					/>
				);
		}
	};

	return (
		<div className="sn-admin-app-wp">
			<AdminHeader
				currentPage={currentPage}
				onNavigate={handleNavigation}
			/>

			<div className="sn-page-content">
				{renderPageContent()}
			</div>
		</div>
	);
};

export default UnifiedAdminApp;
