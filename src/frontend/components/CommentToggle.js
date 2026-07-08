/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { CommentCursorIcon, HideIcon } from '../../shared/icons';

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
                    <CommentCursorIcon />
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
                <HideIcon className="sn-hide-icon" />
            </button>
        </div>
    );
};

export default CommentToggle;
