/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */

const CommentToggle = ({ isActive, onToggle, commentsCount }) => {
    const [isVisible, setIsVisible] = useState(true);

    // Update admin bar toggle status
    useEffect(() => {
        const adminBarToggle = document.getElementById('sn-admin-bar-toggle');
        if (adminBarToggle) {
            // Update the entire text content to show the action (not the current state)
            const actionText = isActive 
                ? __('Turn Comments OFF', 'analogwp-site-notes')
                : __('Turn Comments ON', 'analogwp-site-notes');
            
            adminBarToggle.textContent = actionText;
            
            // Add/remove active class for styling
            if (isActive) {
                adminBarToggle.classList.add('sn-comments-active');
            } else {
                adminBarToggle.classList.remove('sn-comments-active');
            }
        }
    }, [isActive]);

    // Handle admin bar click
    useEffect(() => {
        const adminBarItem = document.querySelector('.agwp-sn-admin-bar-toggle');
        if (adminBarItem) {
            const handleClick = (e) => {
                e.preventDefault();
                onToggle(!isActive);
            };
            
            adminBarItem.addEventListener('click', handleClick);
            
            return () => {
                adminBarItem.removeEventListener('click', handleClick);
            };
        }
    }, [isActive, onToggle]);

    if (!isVisible) {
        return null;
    }

    return (
        <div className={`sn-toggle-button ${isActive ? 'active' : ''}`} data-sn-ignore="true">
            <button 
                onClick={() => onToggle(!isActive)}
                className="sn-toggle-btn"
                data-sn-ignore="true"
                aria-label={isActive ? 
                    __('Disable Visual Comments', 'analogwp-site-notes') : 
                    __('Enable Visual Comments', 'analogwp-site-notes')
                }
            >
                <span className="sn-toggle-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
											<path fill-rule="evenodd" d="M12 1.5a.75.75 0 0 1 .75.75V4.5a.75.75 0 0 1-1.5 0V2.25A.75.75 0 0 1 12 1.5ZM5.636 4.136a.75.75 0 0 1 1.06 0l1.592 1.591a.75.75 0 0 1-1.061 1.06l-1.591-1.59a.75.75 0 0 1 0-1.061Zm12.728 0a.75.75 0 0 1 0 1.06l-1.591 1.592a.75.75 0 0 1-1.06-1.061l1.59-1.591a.75.75 0 0 1 1.061 0Zm-6.816 4.496a.75.75 0 0 1 .82.311l5.228 7.917a.75.75 0 0 1-.777 1.148l-2.097-.43 1.045 3.9a.75.75 0 0 1-1.45.388l-1.044-3.899-1.601 1.42a.75.75 0 0 1-1.247-.606l.569-9.47a.75.75 0 0 1 .554-.68ZM3 10.5a.75.75 0 0 1 .75-.75H6a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 10.5Zm14.25 0a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H18a.75.75 0 0 1-.75-.75Zm-8.962 3.712a.75.75 0 0 1 0 1.061l-1.591 1.591a.75.75 0 1 1-1.061-1.06l1.591-1.592a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
										</svg>
                </span>
                
                <span className="sn-toggle-text">
                    {isActive ? 
                        __('Comments ON', 'analogwp-site-notes') : 
                        __('Comments OFF', 'analogwp-site-notes')
                    }
                    {commentsCount > 0 && (
                        <span className="sn-comments-count">
                            ({commentsCount})
                        </span>
                    )}
                </span>
            </button>
            
            <button
                onClick={() => setIsVisible(false)}
                className="sn-toggle-hide"
                data-sn-ignore="true"
                aria-label={__('Hide toggle button', 'analogwp-site-notes')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="sn-hide-icon">
  <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
</svg>

            </button>
        </div>
    );
};

export default CommentToggle;