/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const CommentSidebar = ({ comments, onAddReply, onUpdateStatus, canManageComments, isVisible, onClose }) => {
    const [selectedComment, setSelectedComment] = useState(null);
    const [replyTexts, setReplyTexts] = useState({});
    const [showReplyForms, setShowReplyForms] = useState({});
    const [isSubmittingReply, setIsSubmittingReply] = useState({});
    const [collapsedGroups, setCollapsedGroups] = useState({});

    // Group comments by status
    const groupedComments = {
        open: comments.filter(comment => comment.status === 'open'),
        in_progress: comments.filter(comment => comment.status === 'in_progress'),
        resolved: comments.filter(comment => comment.status === 'resolved')
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return '#d63638';
            case 'in_progress': return '#dba617';
            case 'resolved': return '#00a32a';
            default: return '#646970';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'open': return __('Open', 'client-handoff-toolkit');
            case 'in_progress': return __('In Progress', 'client-handoff-toolkit');
            case 'resolved': return __('Resolved', 'client-handoff-toolkit');
            default: return status;
        }
    };

    const handleReplySubmit = async (commentId, e) => {
        e.preventDefault();
        const replyText = replyTexts[commentId];
        if (!replyText?.trim()) return;

        setIsSubmittingReply(prev => ({ ...prev, [commentId]: true }));
        try {
            await onAddReply(commentId, replyText.trim());
            setReplyTexts(prev => ({ ...prev, [commentId]: '' }));
            setShowReplyForms(prev => ({ ...prev, [commentId]: false }));
        } catch (error) {
            console.error('Error submitting reply:', error);
        } finally {
            setIsSubmittingReply(prev => ({ ...prev, [commentId]: false }));
        }
    };

    const scrollToElement = (comment) => {
        // Highlight the element on the page
        const element = document.querySelector(comment.element_selector);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add temporary highlight
            element.style.outline = '3px solid #2271b1';
            element.style.outlineOffset = '2px';
            setTimeout(() => {
                element.style.outline = '';
                element.style.outlineOffset = '';
            }, 2000);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const toggleStatusGroup = (status) => {
        setCollapsedGroups(prev => ({
            ...prev,
            [status]: !prev[status]
        }));
    };

    if (!isVisible) {
        return null;
    }

    return (
        <>
            {/* Toggle button positioned outside the sidebar */}
            <button 
                className="cht-sidebar-close"
                onClick={onClose}
                title={__('Toggle Sidebar', 'client-handoff-toolkit')}
            >
                {isVisible ? '‹' : '›'}
            </button>
            
            <div className="cht-comment-sidebar">
            <div className="cht-sidebar-header">
                <h3>{__('Page Tasks & Comments', 'client-handoff-toolkit')}</h3>
                <div className="cht-comments-count">
                    {comments.length} {comments.length === 1 ? __('comment', 'client-handoff-toolkit') : __('comments', 'client-handoff-toolkit')}
                </div>
            </div>

            <div className="cht-sidebar-content">
                {comments.length === 0 ? (
                    <div className="cht-no-comments-sidebar">
                        <p>{__('No comments on this page yet.', 'client-handoff-toolkit')}</p>
                        <p className="cht-instruction">{__('Click on any element to add a comment.', 'client-handoff-toolkit')}</p>
                    </div>
                ) : (
                    <div className="cht-comments-list">
                        {['open', 'in_progress', 'resolved'].map(status => {
                            const statusComments = groupedComments[status];
                            if (statusComments.length === 0) return null;

                            return (
                                <div key={status} className="cht-status-group">
                                    <div 
                                        className="cht-status-header"
                                        onClick={() => toggleStatusGroup(status)}
                                    >
                                        <div 
                                            className="cht-status-indicator"
                                            style={{ backgroundColor: getStatusColor(status) }}
                                        ></div>
                                        <h4>{getStatusLabel(status)} ({statusComments.length})</h4>
                                        <button className="cht-toggle-arrow">
                                            {collapsedGroups[status] ? '▼' : '▲'}
                                        </button>
                                    </div>

                                    {!collapsedGroups[status] && (
                                        <div className="cht-status-content">

                                    {statusComments.map(comment => (
                                        <div key={comment.id} className={`cht-comment-task ${selectedComment === comment.id ? 'selected' : ''}`}>
                                            <div className="cht-task-header">
                                                <div className="cht-task-info">
                                                    <span className="cht-task-id">#{comment.id}</span>
                                                    <span className="cht-task-author">{comment.display_name}</span>
                                                    <span className="cht-task-date">{formatDate(comment.created_at)}</span>
                                                </div>
                                                <button
                                                    className="cht-locate-btn"
                                                    onClick={() => scrollToElement(comment)}
                                                    title={__('Locate element', 'client-handoff-toolkit')}
                                                >
                                                    🎯
                                                </button>
                                            </div>

                                            <div className="cht-task-content">
                                                <p className="cht-task-text">{comment.comment_text}</p>
                                                
                                                <div className="cht-task-meta">
                                                    <span className={`cht-priority-badge cht-priority-${comment.priority || 'medium'}`}>
                                                        {comment.priority ? comment.priority.charAt(0).toUpperCase() + comment.priority.slice(1) : 'Medium'}
                                                    </span>
                                                </div>

                                                {comment.screenshot_url && (
                                                    <div className="cht-task-screenshot">
                                                        <img 
                                                            src={comment.screenshot_url} 
                                                            alt={__('Comment screenshot', 'client-handoff-toolkit')}
                                                            onClick={() => window.open(comment.screenshot_url, '_blank')}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {canManageComments && (
                                                <div className="cht-task-status">
                                                    <select
                                                        value={comment.status}
                                                        onChange={(e) => onUpdateStatus(comment.id, e.target.value)}
                                                        className="cht-status-select"
                                                    >
                                                        <option value="open">{__('Open', 'client-handoff-toolkit')}</option>
                                                        <option value="in_progress">{__('In Progress', 'client-handoff-toolkit')}</option>
                                                        <option value="resolved">{__('Resolved', 'client-handoff-toolkit')}</option>
                                                    </select>
                                                </div>
                                            )}

                                            {comment.replies && comment.replies.length > 0 && (
                                                <div className="cht-task-replies">
                                                    <div className="cht-replies-header">
                                                        <strong>{__('Replies:', 'client-handoff-toolkit')}</strong>
                                                    </div>
                                                    {comment.replies.map(reply => (
                                                        <div key={reply.id} className="cht-task-reply">
                                                            <div className="cht-reply-header">
                                                                <strong>{reply.display_name}</strong>
                                                                <span className="cht-reply-date">{formatDate(reply.created_at)}</span>
                                                            </div>
                                                            <p className="cht-reply-text">{reply.reply_text}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="cht-task-actions">
                                                {!showReplyForms[comment.id] ? (
                                                    <button
                                                        className="cht-reply-btn"
                                                        onClick={() => setShowReplyForms(prev => ({ ...prev, [comment.id]: true }))}
                                                    >
                                                        {__('Reply', 'client-handoff-toolkit')}
                                                    </button>
                                                ) : (
                                                    <form onSubmit={(e) => handleReplySubmit(comment.id, e)} className="cht-reply-form">
                                                        <textarea
                                                            value={replyTexts[comment.id] || ''}
                                                            onChange={(e) => setReplyTexts(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                                            placeholder={__('Add a reply...', 'client-handoff-toolkit')}
                                                            className="cht-reply-textarea"
                                                            rows="3"
                                                        />
                                                        <div className="cht-reply-actions">
                                                            <button
                                                                type="submit"
                                                                disabled={isSubmittingReply[comment.id]}
                                                                className="cht-reply-submit"
                                                            >
                                                                {isSubmittingReply[comment.id] ? __('Submitting...', 'client-handoff-toolkit') : __('Reply', 'client-handoff-toolkit')}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setShowReplyForms(prev => ({ ...prev, [comment.id]: false }));
                                                                    setReplyTexts(prev => ({ ...prev, [comment.id]: '' }));
                                                                }}
                                                                className="cht-reply-cancel"
                                                            >
                                                                {__('Cancel', 'client-handoff-toolkit')}
                                                            </button>
                                                        </div>
                                                    </form>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
        </>
    );
};

export default CommentSidebar;