/**
 * WordPress dependencies
 */
import { useState, useRef, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Draggable from 'react-draggable';

const CommentMarker = ({ 
    comment, 
    isSelected, 
    onSelect, 
    onAddReply, 
    onUpdateStatus, 
    canManageComments 
}) => {
    const [replyText, setReplyText] = useState('');
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const popupRef = useRef(null);

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                onSelect();
            }
        };

        if (isSelected) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isSelected, onSelect]);

    // Handle reply submission
    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setIsSubmittingReply(true);
        try {
            await onAddReply(comment.id, replyText.trim());
            setReplyText('');
            setShowReplyForm(false);
        } catch (error) {
            console.error('Error submitting reply:', error);
        } finally {
            setIsSubmittingReply(false);
        }
    };

    // Handle status change
    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        onUpdateStatus(comment.id, newStatus);
    };

    // Scroll to element when marker is clicked
    const scrollToElement = () => {
        try {
            const element = document.querySelector(comment.element_selector);
            if (element) {
                element.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                
                // Add temporary highlight
                const originalBorder = element.style.border;
                const originalTransition = element.style.transition;
                
                element.style.transition = 'border 0.3s ease';
                element.style.border = '3px solid #ff6b35';
                
                setTimeout(() => {
                    element.style.border = originalBorder;
                    element.style.transition = originalTransition;
                }, 2000);
            }
        } catch (error) {
            console.error('Error finding element:', error);
        }
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
            case 'open': return __('Open', 'analogwp-client-handoff');
            case 'in_progress': return __('In Progress', 'analogwp-client-handoff');
            case 'resolved': return __('Resolved', 'analogwp-client-handoff');
            default: return status;
        }
    };

    return (
        <>
            <div
                className={`cht-comment-marker ${isSelected ? 'selected' : ''} ${comment.status}`}
                style={{
                    position: 'absolute',
                    left: `${comment.x_position}px`,
                    top: `${comment.y_position}px`,
                    zIndex: 10000,
                    transform: 'translate(-50%, -50%)', // Center the marker on the exact point
                    pointerEvents: 'auto'
                }}
                onClick={onSelect}
                title={comment.comment_text}
            >
                <div 
                    className="cht-marker-dot"
                    style={{ backgroundColor: getStatusColor(comment.status) }}
                >
                    <span className="cht-marker-number">{comment.id}</span>
                </div>
                
                <div className="cht-marker-pulse"></div>
            </div>

            {isSelected && (
                <Draggable 
                    handle=".cht-popup-header"
                    onStart={() => setIsDragging(true)}
                    onStop={() => setTimeout(() => setIsDragging(false), 100)}
                >
                    <div
                        ref={popupRef}
                        className="cht-comment-detail-popup"
                        data-cht-ignore="true"
                        data-dragging={isDragging}
                        style={{
                            position: 'fixed',
                            left: `${Math.min(comment.x_position - window.pageXOffset + 30, window.innerWidth - 400)}px`,
                            top: `${Math.max(20, comment.y_position - window.pageYOffset - 100)}px`,
                            zIndex: 100001
                        }}
                    >
                        <div className="cht-popup-header">
                            <div className="cht-popup-title">
                                <strong>{__('Comment', 'analogwp-client-handoff')} #{comment.id}</strong>
                                <span 
                                    className="cht-status-badge"
                                    style={{ backgroundColor: getStatusColor(comment.status) }}
                                >
                                    {getStatusLabel(comment.status)}
                                </span>
                            </div>
                            <button onClick={onSelect} className="cht-popup-close">×</button>
                        </div>

                        <div className="cht-popup-content">
                            {/* Screenshot */}
                            {comment.screenshot_url && (
                                <div className="cht-comment-screenshot">
                                    <img 
                                        src={comment.screenshot_url} 
                                        alt={__('Comment Screenshot', 'analogwp-client-handoff')}
                                        onClick={() => window.open(comment.screenshot_url, '_blank')}
                                    />
                                </div>
                            )}

                            {/* Main Comment */}
                            <div className="cht-comment-content">
                                <div className="cht-comment-meta">
                                    <strong>{comment.display_name}</strong>
                                    <span className="cht-comment-date">
                                        {new Date(comment.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <p className="cht-comment-text">{comment.comment_text}</p>
                                
                                {comment.element_selector && (
                                    <div className="cht-element-info">
                                        <small>
                                            {__('Element:', 'analogwp-client-handoff')} 
                                            <code>{comment.element_selector}</code>
                                            <button 
                                                onClick={scrollToElement}
                                                className="cht-goto-element"
                                            >
                                                {__('Go to', 'analogwp-client-handoff')}
                                            </button>
                                        </small>
                                    </div>
                                )}
                            </div>

                            {/* Status Management */}
                            {canManageComments && (
                                <div className="cht-status-controls">
                                    <label>
                                        {__('Status:', 'analogwp-client-handoff')}
                                        <select 
                                            value={comment.status} 
                                            onChange={handleStatusChange}
                                            className="cht-status-select"
                                        >
                                            <option value="open">{__('Open', 'analogwp-client-handoff')}</option>
                                            <option value="in_progress">{__('In Progress', 'analogwp-client-handoff')}</option>
                                            <option value="resolved">{__('Resolved', 'analogwp-client-handoff')}</option>
                                        </select>
                                    </label>
                                </div>
                            )}

                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                                <div className="cht-replies">
                                    <h5>{__('Replies:', 'analogwp-client-handoff')}</h5>
                                    {comment.replies.map((reply) => (
                                        <div key={reply.id} className="cht-reply">
                                            <div className="cht-reply-meta">
                                                <strong>{reply.display_name}</strong>
                                                <span className="cht-reply-date">
                                                    {new Date(reply.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <p>{reply.reply_text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Reply Form */}
                            {showReplyForm ? (
                                <form onSubmit={handleReplySubmit} className="cht-reply-form">
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder={__('Type your reply...', 'analogwp-client-handoff')}
                                        rows="3"
                                        disabled={isSubmittingReply}
                                    />
                                    <div className="cht-reply-actions">
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setShowReplyForm(false);
                                                setReplyText('');
                                            }}
                                            disabled={isSubmittingReply}
                                            className="cht-btn cht-btn-secondary"
                                        >
                                            {__('Cancel', 'analogwp-client-handoff')}
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={isSubmittingReply || !replyText.trim()}
                                            className="cht-btn cht-btn-primary"
                                        >
                                            {isSubmittingReply ? 
                                                __('Replying...', 'analogwp-client-handoff') : 
                                                __('Reply', 'analogwp-client-handoff')
                                            }
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="cht-comment-actions">
                                    <button 
                                        onClick={() => setShowReplyForm(true)}
                                        className="cht-btn cht-btn-secondary"
                                    >
                                        {__('Reply', 'analogwp-client-handoff')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </Draggable>
            )}
        </>
    );
};

export default CommentMarker;