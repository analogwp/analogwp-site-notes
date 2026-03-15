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
    const [replyHoney, setReplyHoney] = useState({});

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
            await onAddReply(commentId, replyText.trim(), replyHoney[commentId] || '');
            setReplyTexts(prev => ({ ...prev, [commentId]: '' }));
            setReplyHoney(prev => ({ ...prev, [commentId]: '' }));
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
                className={`sn-sidebar-close ${!isVisible ? 'sn-sidebar-hidden' : ''}`}
                onClick={onClose}
                ariaLabel={__('Toggle Sidebar', 'analogwp-site-notes')}
                icon={isVisible ? <ChevronRightIcon className="sn-icon" /> : <ChevronLeftIcon className="sn-icon" />}
                iconPosition="left"
            />
            
            {/* Sidebar content - only visible when isVisible is true */}
            {isVisible && (
                <div className="sn-comment-sidebar">
                <div className="sn-sidebar-header">
                    <h3>{__('Page Tasks & Comments', 'analogwp-site-notes')}</h3>
                    <div className="sn-comments-count">
                        {comments.length} {comments.length === 1 ? __('comment', 'analogwp-site-notes') : __('comments', 'analogwp-site-notes')}
                    </div>
                </div>

            <div className="sn-sidebar-content">
                {comments.length === 0 ? (
                    <div className="sn-no-comments-sidebar">
                        <p>{__('No comments on this page yet.', 'analogwp-site-notes')}</p>
                        <p className="sn-instruction">{__('Click on any element to add a comment.', 'analogwp-site-notes')}</p>
                    </div>
                ) : (
                    <div className="sn-comments-list">
                        {['open', 'in_progress', 'resolved'].map(status => {
                            const statusComments = groupedComments[status];
                            if (statusComments.length === 0) return null;

                            return (
                                <div key={status} className="sn-status-group">
                                <div 
                                    className="sn-status-header"
                                    onClick={() => toggleStatusGroup(status)}
                                >
                                    <span className="sn-status-icon">
                                        {getStatusIcon(status)}
                                    </span>
                                    <h4>{getStatusLabel(status)} ({statusComments.length})</h4>
                                    <button className="sn-toggle-arrow">
                                        {collapsedGroups[status] ? <ChevronDownIcon className="sn-icon" /> : <ChevronUpIcon className="sn-icon" />}
                                    </button>
                                </div>                                    {!collapsedGroups[status] && (
                                        <div className="sn-status-content">

                                    {statusComments.map(comment => (
                                        <div key={comment.id} className={`sn-comment-task ${selectedComment === comment.id ? 'selected' : ''}`}>
                                            <div className="sn-task-header">
                                                <div className="sn-task-info">
                                                    <span className="sn-task-id">#{comment.id}</span>
                                                    <span className="sn-task-author">{comment.display_name}</span>
                                                    <span className="sn-task-date">{formatDate(comment.created_at)}</span>
                                                </div>
                                                <button
                                                    className="sn-locate-btn"
                                                    onClick={() => scrollToElement(comment)}
                                                    title={__('Locate element', 'analogwp-site-notes')}
                                                >
                                                    🎯
                                                </button>
                                            </div>

                                            <div className="sn-task-content">
                                                {comment.comment_title && (
                                                    <h5 className="sn-task-title">{comment.comment_title}</h5>
                                                )}
                                                <p className="sn-task-text">{comment.comment_text}</p>
                                                
                                                <div className="sn-task-meta">
                                                    <span className={`sn-priority-badge sn-priority-${comment.priority || 'medium'}`}>
                                                        {comment.priority ? comment.priority.charAt(0).toUpperCase() + comment.priority.slice(1) : 'Medium'}
                                                    </span>
                                                </div>

                                                {comment.screenshot_url && (
                                                    <div className="sn-task-screenshot">
                                                        <img 
                                                            src={comment.screenshot_url} 
                                                            alt={__('Comment screenshot', 'analogwp-site-notes')}
                                                            onClick={() => window.open(comment.screenshot_url, '_blank')}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {canManageComments && (
                                                <div className="sn-task-status">
                                                    <select
                                                        value={comment.status}
                                                        onChange={(e) => onUpdateStatus(comment.id, e.target.value)}
                                                        className="sn-status-select"
                                                    >
                                                        <option value="open">{__('Open', 'analogwp-site-notes')}</option>
                                                        <option value="in_progress">{__('In Progress', 'analogwp-site-notes')}</option>
                                                        <option value="resolved">{__('Resolved', 'analogwp-site-notes')}</option>
                                                    </select>
                                                </div>
                                            )}

                                            {comment.replies && comment.replies.length > 0 && (
                                                <div className="sn-task-replies">
                                                    <div className="sn-replies-header">
                                                        <strong>{__('Replies:', 'analogwp-site-notes')}</strong>
                                                    </div>
                                                    {comment.replies.map(reply => (
                                                        <div key={reply.id} className="sn-task-reply">
                                                            <div className="sn-reply-header">
                                                                <strong>{reply.display_name}</strong>
                                                                <span className="sn-reply-date">{formatDate(reply.created_at)}</span>
                                                            </div>
                                                            <p className="sn-reply-text">{reply.reply_text}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="sn-task-actions">
                                                {!showReplyForms[comment.id] ? (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => setShowReplyForms(prev => ({ ...prev, [comment.id]: true }))}
                                                    >
                                                        {__('Reply', 'analogwp-site-notes')}
                                                    </Button>
                                                ) : (
                                                    <form onSubmit={(e) => handleReplySubmit(comment.id, e)} className="sn-reply-form">
                                                        <textarea
                                                            value={replyTexts[comment.id] || ''}
                                                            onChange={(e) => setReplyTexts(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                                            placeholder={__('Add a reply...', 'analogwp-site-notes')}
                                                            className="sn-reply-textarea"
                                                            rows="3"
                                                        />
                                                <input
                                                    type="text"
                                                    name="website"
                                                    value={replyHoney[comment.id] || ''}
                                                    onChange={(e) => setReplyHoney(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                                    tabIndex="-1"
                                                    autoComplete="off"
                                                    style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
                                                    aria-hidden="true"
                                                />
                                                        <div className="sn-reply-actions">
                                                            <Button
                                                                type="submit"
                                                                variant="primary"
                                                                disabled={isSubmittingReply[comment.id]}
                                                                loading={isSubmittingReply[comment.id]}
                                                                size="sm"
                                                            >
                                                                {isSubmittingReply[comment.id] ? __('Submitting...', 'analogwp-site-notes') : __('Reply', 'analogwp-site-notes')}
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setShowReplyForms(prev => ({ ...prev, [comment.id]: false }));
                                                                    setReplyTexts(prev => ({ ...prev, [comment.id]: '' }));
                                                                }}
                                                            >
                                                                {__('Cancel', 'analogwp-site-notes')}
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