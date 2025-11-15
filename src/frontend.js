/**
 * WordPress dependencies
 */
import { createRoot } from '@wordpress/element';

/**
 * Internal dependencies
 */
import VisualCommentsApp from './frontend/components/VisualCommentsApp';
import logger from './shared/utils/logger';
import './frontend/styles/frontend.scss';

// Debug logging
logger.debug('Frontend script loaded!');
logger.debug('Document ready state:', document.readyState);
logger.debug('agwp_sn_ajax available:', typeof agwp_sn_ajax !== 'undefined');

// Simple initialization function
function initVisualComments() {
    logger.info('Initializing Visual Comments');
    
    // Ensure agwp_sn_ajax is available
    if (typeof agwp_sn_ajax === 'undefined') {
        logger.error('agwp_sn_ajax object not found');
        return;
    }
    
    logger.debug('agwp_sn_ajax found:', agwp_sn_ajax);
    
    // Check if React is available
    if (typeof createRoot === 'undefined') {
        logger.error('createRoot not available');
        // Fallback to simple version
        createSimpleInterface();
        return;
    }
    
    // Create container for the visual comments app
    const appContainer = document.createElement('div');
    appContainer.id = 'sn-visual-comments-app';
    document.body.appendChild(appContainer);
    
    logger.debug('Container created, mounting React app');
    
    try {
        // Create root and render the React app
        const root = createRoot(appContainer);
        root.render(<VisualCommentsApp />);
        logger.info('React app mounted successfully');
    } catch (error) {
        logger.error('Error mounting React app:', error);
        // Fallback to simple version
        appContainer.remove();
        createSimpleInterface();
    }
}

// Fallback simple interface (like our test version)
function createSimpleInterface() {
    logger.debug('Creating simple interface fallback');
    
    const appContainer = document.createElement('div');
    appContainer.id = 'sn-visual-comments-app';
    appContainer.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        width: 300px;
        height: 300px;
        background: #ffffff;
        border: 2px solid #0073aa;
        border-radius: 5px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 999999;
        font-family: Arial, sans-serif;
        overflow-y: auto;
    `;
    
    appContainer.innerHTML = `
        <h3>SN Visual Comments (Fallback)</h3>
        <p>✅ JavaScript is working!</p>
        <p>⚠️ React fallback mode</p>
        <p><strong>Post ID:</strong> ${agwp_sn_ajax.postId}</p>
        <button onclick="this.parentNode.style.display='none'" style="float: right;">Close</button>
        <hr>
        <div>Basic visual commenting interface would appear here.</div>
    `;
    
    document.body.appendChild(appContainer);
}

// Multiple initialization strategies
if (document.readyState === 'loading') {
    logger.debug('DOM loading, adding DOMContentLoaded listener');
    document.addEventListener('DOMContentLoaded', initVisualComments);
} else {
    // DOM is already loaded
    logger.debug('DOM already loaded, initializing immediately');
    initVisualComments();
}

// Fallback - also try after window load
window.addEventListener('load', function() {
    if (!document.getElementById('sn-visual-comments-app')) {
        logger.debug('Fallback initialization');
        initVisualComments();
    } else {
        logger.debug('App already initialized');
    }
});