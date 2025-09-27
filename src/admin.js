/**
 * WordPress dependencies
 */
import { render } from '@wordpress/element';

/**
 * Internal dependencies
 */
import AdminApp from './admin/AdminApp';
import './styles/admin-new.scss';

// Initialize admin app
document.addEventListener('DOMContentLoaded', function() {
    const adminContainer = document.getElementById('cht-admin-root');
    if (adminContainer) {
        render(<AdminApp />, adminContainer);
    }
});