/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        open: 0,
        resolved: 0,
        total: 0
    });
    const [recentComments, setRecentComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // Load stats and recent comments
            const response = await fetch(chtAdmin.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'agwp_cht_get_dashboard_stats',
                    nonce: chtAdmin.nonce
                })
            });

            const data = await response.json();
            if (data.success) {
                setStats(data.data.stats);
                setRecentComments(data.data.recent_comments);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteComment = async (commentId) => {
        if (!confirm(__('Are you sure you want to delete this comment? This action cannot be undone.', 'analogwp-client-handoff'))) {
            return;
        }

        try {
            const response = await fetch(chtAdmin.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'agwp_cht_delete_comment',
                    comment_id: commentId,
                    nonce: chtAdmin.nonce
                })
            });

            const data = await response.json();
            if (data.success) {
                // Remove comment from state
                setRecentComments(prevComments => 
                    prevComments.filter(comment => comment.id !== commentId)
                );
                // Reload stats
                loadDashboardData();
            } else {
                alert(__('Error: ', 'analogwp-client-handoff') + data.data.message);
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert(__('An error occurred while deleting the comment.', 'analogwp-client-handoff'));
        }
    };

    if (isLoading) {
        return <div className="cht-loading">{__('Loading...', 'analogwp-client-handoff')}</div>;
    }

    return (
        <div className="cht-admin-dashboard-react">
            {/* Stats Cards */}
            <div className="cht-stats-grid">
                <div className="cht-stat-card open">
                    <div className="cht-stat-icon">🔴</div>
                    <div className="cht-stat-info">
                        <div className="cht-stat-number">{stats.open}</div>
                        <div className="cht-stat-label">{__('Open Comments', 'analogwp-client-handoff')}</div>
                    </div>
                </div>

                <div className="cht-stat-card resolved">
                    <div className="cht-stat-icon">✅</div>
                    <div className="cht-stat-info">
                        <div className="cht-stat-number">{stats.resolved}</div>
                        <div className="cht-stat-label">{__('Resolved Comments', 'analogwp-client-handoff')}</div>
                    </div>
                </div>

                <div className="cht-stat-card total">
                    <div className="cht-stat-icon">📊</div>
                    <div className="cht-stat-info">
                        <div className="cht-stat-number">{stats.total}</div>
                        <div className="cht-stat-label">{__('Total Comments', 'analogwp-client-handoff')}</div>
                    </div>
                </div>
            </div>

            {/* Recent Comments */}
            <div className="cht-recent-section">
                <h3>{__('Recent Comments', 'analogwp-client-handoff')}</h3>
                {recentComments.length === 0 ? (
                    <div className="cht-no-comments">
                        <p>{__('No comments yet. Enable visual comments on your pages to get started!', 'analogwp-client-handoff')}</p>
                    </div>
                ) : (
                    <div className="cht-recent-comments">
                        {recentComments.map((comment) => (
                            <div key={comment.id} className="cht-recent-comment">
                                <div className="cht-comment-avatar">
                                    <div className="cht-avatar-placeholder">
                                        {comment.display_name.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div className="cht-comment-content">
                                    <div className="cht-comment-header">
                                        <strong>{comment.display_name}</strong>
                                        <span className="cht-comment-time">
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </span>
                                        <span className={`cht-status-badge ${comment.status}`}>
                                            {comment.status}
                                        </span>
                                    </div>
                                    <div className="cht-comment-text">
                                        {comment.comment_text}
                                    </div>
                                    <div className="cht-comment-meta">
                                        <a href={comment.page_url} target="_blank" rel="noopener noreferrer">
                                            {comment.post_title || __('View Page', 'analogwp-client-handoff')}
                                        </a>
                                        <button 
                                            className="cht-delete-btn"
                                            onClick={() => deleteComment(comment.id)}
                                            title={__('Delete Comment', 'analogwp-client-handoff')}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;