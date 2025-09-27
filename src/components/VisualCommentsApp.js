/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import CommentToggle from './CommentToggle';
import CommentOverlay from './CommentOverlay';
import CommentPopup from './CommentPopup';
import CommentSidebar from './CommentSidebar';

const VisualCommentsApp = () => {
    const [isActive, setIsActive] = useState(false);
    const [comments, setComments] = useState([]);
    const [selectedElement, setSelectedElement] = useState(null);
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });

    // Load existing comments on mount and when page changes
    useEffect(() => {
        if (isActive) {
            loadComments();
        }
    }, [isActive]);

    // Handle element clicking when comments mode is active
    useEffect(() => {
        if (!isActive) return;

        const handleElementClick = (e) => {
            // Prevent creating popups when clicking specific UI elements
            if (
                e.target.closest('.cht-comment-popup') ||
                e.target.closest('.cht-comment-sidebar') ||
                e.target.closest('.cht-toggle-button') ||
                e.target.closest('#wp-admin-bar-cht-toggle') ||
                e.target.closest('.cht-admin-bar-item') ||
                e.target.closest('.cht-overlay') ||
                e.target.closest('#wpadminbar') ||
                e.target.hasAttribute('data-cht-ignore') ||
                e.target.closest('[data-cht-ignore]') ||
                e.target.closest('.react-draggable') ||
                e.target.closest('[class*="draggable"]') ||
                e.target.classList.contains('cht-close-btn') ||
                e.target.closest('.cht-close-btn') ||
                e.target.classList.contains('cht-popup-close') ||
                e.target.closest('.cht-popup-close') ||
                e.target.classList.contains('cht-sidebar-close') ||
                e.target.closest('.cht-sidebar-close')
            ) {
                return;
            }

            // Prevent event if we're currently dragging
            if (e.target.closest('[data-dragging="true"]')) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            const element = e.target;
            const rect = element.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

            // Calculate exact click position relative to the document
            const exactClickX = e.clientX + scrollLeft;
            const exactClickY = e.clientY + scrollTop;

            setSelectedElement({
                element: element,
                selector: generateSelector(element),
                x: exactClickX,
                y: exactClickY,
                width: rect.width,
                height: rect.height
            });

            setClickPosition({
                x: exactClickX,
                y: exactClickY
            });

            setShowCommentForm(true);
        };

        document.addEventListener('click', handleElementClick, true);

        return () => {
            document.removeEventListener('click', handleElementClick, true);
        };
    }, [isActive]);

    // Generate unique CSS selector for element
    const generateSelector = (element) => {
        if (element.id) {
            return `#${element.id}`;
        }
        
        let selector = element.tagName.toLowerCase();
        
        if (element.className && typeof element.className === 'string') {
            const classes = element.className.trim().split(/\s+/)
                .filter(cls => cls && !cls.startsWith('cht-'))
                .slice(0, 3); // Limit to first 3 classes
            if (classes.length > 0) {
                selector += '.' + classes.join('.');
            }
        }

        // Add nth-child if needed for uniqueness
        const parent = element.parentElement;
        if (parent) {
            const siblings = Array.from(parent.children).filter(el => 
                el.tagName.toLowerCase() === element.tagName.toLowerCase()
            );
            if (siblings.length > 1) {
                const index = siblings.indexOf(element) + 1;
                selector += `:nth-child(${index})`;
            }
        }

        return selector;
    };

    // Load comments from server
    const loadComments = async () => {
        try {
            const response = await fetch(chtAjax.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'cht_get_comments',
                    nonce: chtAjax.nonce,
                    page_url: window.location.href
                })
            });

            const data = await response.json();
            if (data.success) {
                setComments(data.data);
            }
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    };

    // Save new comment
    const saveComment = async (commentText, screenshotUrl = '', priority = 'medium') => {
        if (!selectedElement) return;

        try {
            const response = await fetch(chtAjax.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'cht_save_comment',
                    nonce: chtAjax.nonce,
                    post_id: chtAjax.postId || 0,
                    comment_text: commentText,
                    element_selector: selectedElement.selector,
                    screenshot_url: screenshotUrl,
                    x_position: Math.round(selectedElement.x),
                    y_position: Math.round(selectedElement.y),
                    page_url: window.location.href,
                    priority: priority
                })
            });

            const data = await response.json();
            if (data.success) {
                await loadComments(); // Reload comments
                setShowCommentForm(false);
                setSelectedElement(null);
                
                // Show success message
                showNotification(__('Comment saved successfully!', 'client-handoff-toolkit'), 'success');
            } else {
                showNotification(__('Error saving comment', 'client-handoff-toolkit'), 'error');
            }
        } catch (error) {
            console.error('Error saving comment:', error);
            showNotification(__('Error saving comment', 'client-handoff-toolkit'), 'error');
        }
    };

    // Add reply to comment
    const addReply = async (commentId, replyText) => {
        try {
            const response = await fetch(chtAjax.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'cht_add_reply',
                    nonce: chtAjax.nonce,
                    comment_id: commentId,
                    reply_text: replyText
                })
            });

            const data = await response.json();
            if (data.success) {
                await loadComments(); // Reload comments
                showNotification(__('Reply added successfully!', 'client-handoff-toolkit'), 'success');
            } else {
                showNotification(__('Error adding reply', 'client-handoff-toolkit'), 'error');
            }
        } catch (error) {
            console.error('Error adding reply:', error);
            showNotification(__('Error adding reply', 'client-handoff-toolkit'), 'error');
        }
    };

    // Update comment status
    const updateCommentStatus = async (commentId, status) => {
        if (!chtAjax.canManageComments) return;

        try {
            const response = await fetch(chtAjax.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'cht_update_comment_status',
                    nonce: chtAjax.nonce,
                    comment_id: commentId,
                    status: status
                })
            });

            const data = await response.json();
            if (data.success) {
                await loadComments(); // Reload comments
                showNotification(__('Status updated successfully!', 'client-handoff-toolkit'), 'success');
            } else {
                showNotification(__('Error updating status', 'client-handoff-toolkit'), 'error');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showNotification(__('Error updating status', 'client-handoff-toolkit'), 'error');
        }
    };

    // Show notification
    const showNotification = (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `cht-notification cht-notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#00a32a' : type === 'error' ? '#d63638' : '#2271b1'};
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 100000;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 4000);
    };

    return (
        <div className="cht-visual-comments">
            <CommentToggle 
                isActive={isActive} 
                onToggle={setIsActive}
                commentsCount={comments.length}
            />
            
            {isActive && (
                <>
                    <CommentOverlay />
                    
                    <CommentSidebar
                        comments={comments}
                        onAddReply={addReply}
                        onUpdateStatus={updateCommentStatus}
                        canManageComments={chtAjax.canManageComments}
                        isVisible={isActive}
                        onClose={() => setIsActive(false)}
                    />
                    
                    {showCommentForm && selectedElement && (
                        <CommentPopup
                            position={clickPosition}
                            selectedElement={selectedElement}
                            onSave={saveComment}
                            onCancel={() => {
                                setShowCommentForm(false);
                                setSelectedElement(null);
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default VisualCommentsApp;