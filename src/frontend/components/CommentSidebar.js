/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * External dependencies
 */
import { ChevronRightIcon, ChevronLeftIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

/**
 * Internal dependencies
 */
import { TASK_STATUSES, getStatusByKey } from '../constants/taskStatuses';
import { Button } from './ui';
import logger from '../../shared/utils/logger';

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

    const getStatusIcon = (status) => {
        const statusObj = getStatusByKey(status);
        return statusObj ? statusObj.icon : '📋';
    };

    const getStatusLabel = (status) => {
        const statusObj = getStatusByKey(status);
        return statusObj ? statusObj.title : status;
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
            logger.error('Error submitting reply:', error);
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

    // Don't render anything if no comments
    // Always show sidebar when commenting is active, even with no comments

    return (
        <>
            {/* Toggle button always visible when commenting is active */}
            <Button
                variant={isVisible ? 'primary' : 'secondary'}
                className={`cht-sidebar-close ${!isVisible ? 'cht-sidebar-hidden' : ''}`}
                onClick={onClose}
                ariaLabel={__('Toggle Sidebar', 'analogwp-client-handoff')}
                icon={isVisible ? <ChevronRightIcon className="cht-icon" /> : <ChevronLeftIcon className="cht-icon" />}
                iconPosition="left"
            />
            
            {/* Sidebar content - only visible when isVisible is true */}
            {isVisible && (
                <div className="cht-comment-sidebar">
                <div className="cht-sidebar-header">
                    <h3>{__('Page Tasks & Comments', 'analogwp-client-handoff')}</h3>
                    <div className="cht-comments-count">
                        {comments.length} {comments.length === 1 ? __('comment', 'analogwp-client-handoff') : __('comments', 'analogwp-client-handoff')}
                    </div>
                </div>

            <div className="cht-sidebar-content">
                {comments.length === 0 ? (
                    <div className="cht-no-comments-sidebar">
                        <p>{__('No comments on this page yet.', 'analogwp-client-handoff')}</p>
                        <p className="cht-instruction">{__('Click on any element to add a comment.', 'analogwp-client-handoff')}</p>
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
                                    <span className="cht-status-icon">
                                        {getStatusIcon(status)}
                                    </span>
                                    <h4>{getStatusLabel(status)} ({statusComments.length})</h4>
                                    <button className="cht-toggle-arrow">
                                        {collapsedGroups[status] ? <ChevronDownIcon className="cht-icon" /> : <ChevronUpIcon className="cht-icon" />}
                                    </button>
                                </div>                                    {!collapsedGroups[status] && (
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
                                                    title={__('Locate element', 'analogwp-client-handoff')}
                                                >
                                                    🎯
                                                </button>
                                            </div>

                                            <div className="cht-task-content">
                                                {comment.comment_title && (
                                                    <h5 className="cht-task-title">{comment.comment_title}</h5>
                                                )}
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
                                                            alt={__('Comment screenshot', 'analogwp-client-handoff')}
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
                                                        <option value="open">{__('Open', 'analogwp-client-handoff')}</option>
                                                        <option value="in_progress">{__('In Progress', 'analogwp-client-handoff')}</option>
                                                        <option value="resolved">{__('Resolved', 'analogwp-client-handoff')}</option>
                                                    </select>
                                                </div>
                                            )}

                                            {comment.replies && comment.replies.length > 0 && (
                                                <div className="cht-task-replies">
                                                    <div className="cht-replies-header">
                                                        <strong>{__('Replies:', 'analogwp-client-handoff')}</strong>
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
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => setShowReplyForms(prev => ({ ...prev, [comment.id]: true }))}
                                                    >
                                                        {__('Reply', 'analogwp-client-handoff')}
                                                    </Button>
                                                ) : (
                                                    <form onSubmit={(e) => handleReplySubmit(comment.id, e)} className="cht-reply-form">
                                                        <textarea
                                                            value={replyTexts[comment.id] || ''}
                                                            onChange={(e) => setReplyTexts(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                                            placeholder={__('Add a reply...', 'analogwp-client-handoff')}
                                                            className="cht-reply-textarea"
                                                            rows="3"
                                                        />
                                                        <div className="cht-reply-actions">
                                                            <Button
                                                                type="submit"
                                                                variant="primary"
                                                                disabled={isSubmittingReply[comment.id]}
                                                                loading={isSubmittingReply[comment.id]}
                                                                size="sm"
                                                            >
                                                                {isSubmittingReply[comment.id] ? __('Submitting...', 'analogwp-client-handoff') : __('Reply', 'analogwp-client-handoff')}
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setShowReplyForms(prev => ({ ...prev, [comment.id]: false }));
                                                                    setReplyTexts(prev => ({ ...prev, [comment.id]: '' }));
                                                                }}
                                                            >
                                                                {__('Cancel', 'analogwp-client-handoff')}
                                                            </Button>
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
            )}
        </>
    );
};

export default CommentSidebar;