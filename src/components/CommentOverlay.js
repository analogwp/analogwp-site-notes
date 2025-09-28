/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const CommentOverlay = () => {
    const [isVisible, setIsVisible] = useState(true);

    // Hide overlay after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) {
        return null;
    }

    return (
        <div className="cht-overlay" onClick={() => setIsVisible(false)}>
            <div className="cht-overlay-message">
                <div className="cht-overlay-content">
                    <button 
                        className="cht-overlay-close"
                        onClick={() => setIsVisible(false)}
                        aria-label={__('Close overlay', 'analogwp-client-handoff')}
                    >
                        ×
                    </button>
                    <h3>{__('Visual Comments Mode Active', 'analogwp-client-handoff')}</h3>
                    <p>{__('Click on any element to add a comment', 'analogwp-client-handoff')}</p>
                    <div className="cht-overlay-instructions">
                        <div className="cht-instruction-item">
                            <span className="cht-instruction-icon">👆</span>
                            <span>{__('Click elements to comment', 'analogwp-client-handoff')}</span>
                        </div>
                        <div className="cht-instruction-item">
                            <span className="cht-instruction-icon">📸</span>
                            <span>{__('Screenshots auto-captured', 'analogwp-client-handoff')}</span>
                        </div>
                        <div className="cht-instruction-item">
                            <span className="cht-instruction-icon">💬</span>
                            <span>{__('Reply and track progress', 'analogwp-client-handoff')}</span>
                        </div>
                    </div>
                    <div className="cht-overlay-hint">
                        <small>{__('This message will disappear in 3 seconds', 'analogwp-client-handoff')}</small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommentOverlay;