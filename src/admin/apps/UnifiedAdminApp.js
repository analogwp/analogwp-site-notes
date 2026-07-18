/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import TasksView from '../components/tasks';
import AdminHeader from '../components/AdminHeader';
import Settings from '../components/settings';
import { ToastProvider, showToast, showConfirmation } from '../components/ToastProvider';
import SettingsProvider, { useSettings } from '../components/settings/SettingsProvider';
import logger from '../../shared/utils/logger';

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
    const [activeView, setActiveView] = useState('kanban'); // kanban, list
    const [filters, setFilters] = useState({
        status: '',
        user: '',
        category: ''
    });
    const [sortBy, setSortBy] = useState('created_at');

    useEffect(() => {
        loadAdminData();
        loadPages();
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

    const loadAdminData = async () => {
        setLoading(true);
        try {
            const response = await fetch(agwp_sn_ajax.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'agwp_sn_get_admin_data',
                    nonce: agwp_sn_ajax.nonce
                })
            });

            const data = await response.json();
            if (data.success) {
                setComments(data.data.comments || []);
                setUsers(data.data.users || []);
                setCategories(data.data.categories || []);
            } else {
                logger.error('Error loading admin data', data.message);
            }
        } catch (error) {
            logger.error('Error loading admin data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters });
    };

    const handleSortChange = (newSortBy) => {
        setSortBy(newSortBy);
    };

    const handleViewChange = (view) => {
        setActiveView(view);
    };

    // Filter and sort comments
    const filteredComments = comments
        .filter(comment => {
            if (filters.status && comment.status !== filters.status) return false;
            if (filters.user && comment.user_id !== filters.user) return false;
            if (filters.category && comment.category !== filters.category) return false;
            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'created_at':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'updated_at':
                    return new Date(b.updated_at) - new Date(a.updated_at);
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
                default:
                    return 0;
            }
        });

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
            } else {
                logger.error('Error adding comment:', data.message);
            }
        } catch (error) {
            logger.error('Error adding comment:', error);
        }
    };

    const handleAddTask = async (taskData) => {
        try {
            const response = await fetch(agwp_sn_ajax.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'agwp_sn_add_new_task',
                    nonce: agwp_sn_ajax.nonce,
                    ...taskData
                })
            });

            const data = await response.json();
            if (data.success) {
                // Reload admin data to get the latest tasks
                loadAdminData();
            } else {
                logger.error('Error adding task:', data.message);
                throw new Error(data.message);
            }
        } catch (error) {
            logger.error('Error adding task:', error);
            throw error;
        }
    };

    const handleUpdateComment = async (commentId, updates, options = {}) => {
        logger.debug('Updating comment with ID:', commentId);
        logger.debug('Updates to apply:', updates);
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
                        
                        // If assignees are being updated, resolve the assignee objects.
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
                if (!options.silent) {
                    showToast.success(__('Task updated successfully!', 'analogwp-site-notes'));
                }
                return true;
            } else {
                const errorMessage = data.data?.message || data.message || 'Unknown error';
                logger.error('Error updating comment:', errorMessage);
                logger.error('Full response:', data);
                if (!options.silent) {
                    showToast.error(__('Error updating task. Please try again.', 'analogwp-site-notes'));
                }
                return false;
            }
        } catch (err) {
            logger.error('Error updating comment:', err);
            if (!options.silent) {
                showToast.error(__('Error updating task. Please try again.', 'analogwp-site-notes'));
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
        // Show modern confirmation dialog
        const confirmed = await showConfirmation(
            __('Are you sure you want to delete this task? This action cannot be undone.', 'analogwp-site-notes'),
            { confirmText: __('Delete', 'analogwp-site-notes') }
        );
        
        if (!confirmed) {
            return;
        }

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
                // Remove the task from the state
                setComments(comments.filter(comment => comment.id !== commentId));
                showToast.success(__('Task deleted successfully!', 'analogwp-site-notes'));
            } else {
                logger.error('Error deleting comment:', data.message);
                showToast.error(__('Error deleting task. Please try again.', 'analogwp-site-notes'));
            }
        } catch (err) {
            logger.error('Error deleting comment:', err);
            showToast.error(__('Error deleting task. Please try again.', 'analogwp-site-notes'));
        }
    };

    // Navigation handler
    const handleNavigation = (page, options = {}) => {
        setCurrentPage(page);

        if (page === 'settings' && options.tab) {
            setSettingsTab(options.tab);
        }
        
        // Update URL without reloading the page if we're in WordPress admin
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
            
            // Update document title
            document.title = page === 'settings' 
                ? `${__('Settings', 'analogwp-site-notes')} - Analog Site Notes`
                : `${__('Notes', 'analogwp-site-notes')} - Analog Site Notes`;
        } catch (error) {
            // Fallback if URL manipulation fails
            logger.navigation('Navigation:', page);
        }
    };

    const handleNavigateToSettingsTab = (tab) => {
        handleNavigation('settings', { tab });
    };

    // Handle browser back/forward buttons
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

    // Render current page content
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
                    <TasksView 
                        comments={filteredComments}
                        onUpdateComment={handleUpdateComment}
                        onAddReply={handleAddReply}
                        onDeleteReply={handleDeleteReply}
                        onDelete={handleDelete}
                        onAddTask={handleAddTask}
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
                    />
                );
        }
    };

    return (
        <div className="sn-admin-app-wp">
            {/* Global Admin Header */}
            <AdminHeader 
                currentPage={currentPage}
                onNavigate={handleNavigation}
            />

            {/* Page Content */}
            <div className="sn-page-content">
                {renderPageContent()}
            </div>
        </div>
    );
};

export default UnifiedAdminApp;