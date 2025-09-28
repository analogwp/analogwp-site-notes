/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const CommentToggle = ({ isActive, onToggle, commentsCount }) => {
    const [isVisible, setIsVisible] = useState(true);

    // Update admin bar toggle status
    useEffect(() => {
        const adminBarToggle = document.getElementById('cht-admin-bar-toggle');
        if (adminBarToggle) {
            const statusSpan = adminBarToggle.querySelector('.cht-toggle-status');
            if (statusSpan) {
                statusSpan.textContent = isActive ? 'ON' : 'OFF';
                statusSpan.className = `cht-toggle-status ${isActive ? 'active' : ''}`;
            }
        }
    }, [isActive]);

    // Handle admin bar click
    useEffect(() => {
        const adminBarItem = document.querySelector('.cht-admin-bar-item');
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
        <div className={`cht-toggle-button ${isActive ? 'active' : ''}`} data-cht-ignore="true">
            <button 
                onClick={() => onToggle(!isActive)}
                className="cht-toggle-btn"
                data-cht-ignore="true"
                aria-label={isActive ? 
                    __('Disable Visual Comments', 'analogwp-client-handoff') : 
                    __('Enable Visual Comments', 'analogwp-client-handoff')
                }
            >
                <span className="cht-toggle-icon">
                    {isActive ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-1 8H4V9h16v5z"/>
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-1 8H4V9h16v5z"/>
                            <circle cx="12" cy="12" r="2"/>
                        </svg>
                    )}
                </span>
                
                <span className="cht-toggle-text">
                    {isActive ? 
                        __('Comments ON', 'analogwp-client-handoff') : 
                        __('Comments OFF', 'analogwp-client-handoff')
                    }
                    {commentsCount > 0 && (
                        <span className="cht-comments-count">
                            ({commentsCount})
                        </span>
                    )}
                </span>
            </button>
            
            <button 
                onClick={() => setIsVisible(false)}
                className="cht-toggle-hide"
                data-cht-ignore="true"
                aria-label={__('Hide toggle button', 'analogwp-client-handoff')}
            >
                ×
            </button>
        </div>
    );
};

export default CommentToggle;