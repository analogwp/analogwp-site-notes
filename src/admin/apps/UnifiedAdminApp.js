/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import TasksView from '../components/TasksView';
import AdminHeader from '../components/AdminHeader';
import Settings from '../components/Settings';
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
    const [currentPage, setCurrentPage] = useState(initialPage);
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
            const response = await fetch(agwpChtAjax.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'agwp_cht_get_pages',
                    nonce: agwpChtAjax.nonce
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
            const response = await fetch(agwpChtAjax.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'agwp_cht_get_admin_data',
                    nonce: agwpChtAjax.nonce
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
            const response = await fetch(agwpChtAjax.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'agwp_cht_add_comment',
                    nonce: agwpChtAjax.nonce,
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
            const response = await fetch(agwpChtAjax.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'agwp_cht_add_new_task',
                    nonce: agwpChtAjax.nonce,
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

    const handleUpdateComment = async (commentId, updates) => {
        logger.debug('Updating comment with ID:', commentId);
        logger.debug('Updates to apply:', updates);
        try {
            const response = await fetch(agwpChtAjax.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'agwp_cht_update_comment',
                    nonce: agwpChtAjax.nonce,
                    comment_id: commentId,
                    updates: JSON.stringify(updates)
                })
            });

            const data = await response.json();
            logger.debug('Server response:', data);
            if (data.success) {
                setComments(comments.map(comment => {
                    if (comment.id === commentId) {
                        const updatedComment = { ...comment, ...updates };
                        
                        // If assigned_to is being updated, we need to resolve the assignee object
                        if (updates.assigned_to !== undefined) {
                            if (updates.assigned_to && updates.assigned_to !== '0' && updates.assigned_to !== 0) {
                                const assignedUser = users.find(user => String(user.id) === String(updates.assigned_to));
                                updatedComment.assignee = assignedUser || null;
                            } else {
                                updatedComment.assignee = null;
                            }
                        }
                        
                        return updatedComment;
                    }
                    return comment;
                }));
                showToast.success(__('Task updated successfully!', 'analogwp-client-handoff'));
            } else {
                const errorMessage = data.data?.message || data.message || 'Unknown error';
                logger.error('Error updating comment:', errorMessage);
                logger.error('Full response:', data);
                showToast.error(__('Error updating task. Please try again.', 'analogwp-client-handoff'));
            }
        } catch (err) {
            logger.error('Error updating comment:', err);
            showToast.error(__('Error updating task. Please try again.', 'analogwp-client-handoff'));
        }
    };

    const handleDelete = async (commentId) => {
        // Show modern confirmation dialog
        const confirmed = await showConfirmation(
            __('Are you sure you want to delete this task? This action cannot be undone.', 'analogwp-client-handoff'),
            { confirmText: __('Delete', 'analogwp-client-handoff') }
        );
        
        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(agwpChtAjax.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'agwp_cht_delete_comment',
                    nonce: agwpChtAjax.nonce,
                    comment_id: commentId
                })
            });

            const data = await response.json();
            if (data.success) {
                // Remove the task from the state
                setComments(comments.filter(comment => comment.id !== commentId));
                showToast.success(__('Task deleted successfully!', 'analogwp-client-handoff'));
            } else {
                logger.error('Error deleting comment:', data.message);
                showToast.error(__('Error deleting task. Please try again.', 'analogwp-client-handoff'));
            }
        } catch (err) {
            logger.error('Error deleting comment:', err);
            showToast.error(__('Error deleting task. Please try again.', 'analogwp-client-handoff'));
        }
    };

    // Navigation handler
    const handleNavigation = (page) => {
        setCurrentPage(page);
        
        // Update URL without reloading the page if we're in WordPress admin
        try {
            const currentUrl = new URL(window.location.href);
            const baseParams = new URLSearchParams(currentUrl.search);
            
            if (page === 'settings') {
                baseParams.set('page', 'agwp-cht-settings');
            } else {
                baseParams.set('page', 'agwp-cht-dashboard');
            }
            
            const newUrl = `${currentUrl.origin}${currentUrl.pathname}?${baseParams.toString()}`;
            window.history.pushState({ page }, '', newUrl);
            
            // Update document title
            document.title = page === 'settings' 
                ? `${__('Settings', 'analogwp-client-handoff')} - Analog Client Handoff`
                : `${__('Tasks', 'analogwp-client-handoff')} - Analog Client Handoff`;
        } catch (error) {
            // Fallback if URL manipulation fails
            logger.navigation('Navigation:', page);
        }
    };

    // Handle browser back/forward buttons
    useEffect(() => {
        const handlePopState = (event) => {
            if (event.state && event.state.page) {
                setCurrentPage(event.state.page);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Render current page content
    const renderPageContent = () => {
        if (loading && currentPage === 'dashboard') {
            return (
                <div className="cht-admin-loading">
                    <div className="cht-spinner"></div>
                    <p>{__('Loading dashboard...', 'analogwp-client-handoff')}</p>
                </div>
            );
        }

        switch (currentPage) {
            case 'settings':
                return <Settings />;
            case 'dashboard':
            default:
                return (
                    <TasksView 
                        comments={filteredComments}
                        onUpdateComment={handleUpdateComment}
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
                    />
                );
        }
    };

    return (
        <div className="cht-admin-app-wp">
            {/* Global Admin Header */}
            <AdminHeader 
                currentPage={currentPage}
                onNavigate={handleNavigation}
            />

            {/* Page Content */}
            <div className="cht-page-content">
                {renderPageContent()}
            </div>
        </div>
    );
};

export default UnifiedAdminApp;