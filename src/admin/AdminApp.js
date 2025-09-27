/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import TasksKanban from './components/TasksKanban';
import AdminHeader from './components/AdminHeader';

const AdminApp = () => {
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
            const response = await fetch(chtAdmin.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'cht_get_pages',
                    nonce: chtAdmin.nonce
                })
            });

            const data = await response.json();
            if (data.success) {
                setPages(data.data.pages || []);
            }
        } catch (error) {
            console.error('Error loading pages:', error);
        }
    };

    const loadAdminData = async () => {
        try {
            const response = await fetch(chtAdmin.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'cht_get_admin_data',
                    nonce: chtAdmin.nonce
                })
            });

            const data = await response.json();
            if (data.success) {
                setComments(data.data.comments || []);
                setUsers(data.data.users || []);
                setCategories(data.data.categories || []);
            }
        } catch (error) {
            console.error('Error loading admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateCommentStatus = async (commentId, newStatus) => {
        try {
            const response = await fetch(chtAdmin.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'cht_update_comment_status',
                    nonce: chtAdmin.nonce,
                    comment_id: commentId,
                    status: newStatus
                })
            });

            const data = await response.json();
            if (data.success) {
                setComments(prevComments =>
                    prevComments.map(comment =>
                        comment.id === commentId
                            ? { ...comment, status: newStatus }
                            : comment
                    )
                );
            }
        } catch (error) {
            console.error('Error updating comment status:', error);
        }
    };

    const deleteComment = async (commentId) => {
        if (!confirm(__('Are you sure you want to delete this comment? This action cannot be undone.', 'client-handoff-toolkit'))) {
            return;
        }

        try {
            const response = await fetch(chtAdmin.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'cht_delete_comment',
                    nonce: chtAdmin.nonce,
                    comment_id: commentId
                })
            });

            const data = await response.json();
            if (data.success) {
                setComments(prevComments =>
                    prevComments.filter(comment => comment.id !== commentId)
                );
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const addNewTask = async (taskData) => {
        try {
            const response = await fetch(chtAdmin.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'cht_save_comment',
                    nonce: chtAdmin.nonce,
                    ...taskData
                })
            });

            const data = await response.json();
            if (data.success) {
                // Refresh the data to get the new task
                await loadAdminData();
            }
        } catch (error) {
            console.error('Error adding new task:', error);
            throw error;
        }
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const getFilteredComments = () => {
        let filtered = [...comments];

        if (filters.status) {
            filtered = filtered.filter(comment => comment.status === filters.status);
        }

        if (filters.user) {
            filtered = filtered.filter(comment => comment.user_id === parseInt(filters.user));
        }

        if (filters.category) {
            filtered = filtered.filter(comment => comment.page_url === filters.category);
        }

        // Sort comments
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'created_at':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'updated_at':
                    return new Date(b.updated_at) - new Date(a.updated_at);
                case 'priority':
                    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                    return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
                default:
                    return 0;
            }
        });

        return filtered;
    };

    if (loading) {
        return (
            <div className="cht-admin-loading">
                <div className="cht-spinner"></div>
                <p>{__('Loading...', 'client-handoff-toolkit')}</p>
            </div>
        );
    }

    return (
        <div className="cht-admin-app-wp">
            <AdminHeader
                activeView={activeView}
                onViewChange={setActiveView}
                filters={filters}
                onFilterChange={handleFilterChange}
                sortBy={sortBy}
                onSortChange={setSortBy}
                users={users}
                categories={categories}
            />
            <div className="cht-admin-content">
                <TasksKanban
                    comments={getFilteredComments()}
                    onStatusChange={updateCommentStatus}
                    onDelete={deleteComment}
                    onAddTask={addNewTask}
                    users={users}
                    pages={pages}
                    view={activeView}
                />
            </div>
        </div>
    );
};

export default AdminApp;