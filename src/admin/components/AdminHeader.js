/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Button } from './ui';

const AdminHeader = ({
    currentPage = 'dashboard',
    onNavigate
}) => {
    const logoUrl = window.agwp_sn_ajax?.pluginUrl ? `${window.agwp_sn_ajax.pluginUrl}assets/images/analog-logo.svg` : '';

    return (
        <div className="mb-5 border-b border-b-gray-300">
            <div className="flex items-center justify-between py-6">
                <div className="flex items-center gap-4">
                    <h1 
                        className="text-3xl font-semibold! text-gray-900 m-0 p-0! tracking-tight cursor-pointer"
                        onClick={() => onNavigate && onNavigate('dashboard')}
                    >
                        {__('Site Notes', 'analogwp-site-notes')}
                    </h1>
										<svg 
                        className="w-4! h-4! text-gray-700" 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    {logoUrl && (
                        <img 
                            src={logoUrl} 
                            alt="Analog Logo" 
                            className="h-6! w-auto"
                        />
                    )}
                </div>
                <div className="flex gap-3 text-base">
                    <Button 
                        variant={currentPage === 'dashboard' ? 'primary' : 'secondary'}
                        onClick={() => onNavigate && onNavigate('dashboard')}
                        icon={
                            <svg className="w-4!" width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.09092 8.77304L9.27274 10.9549L15.0909 5.13667M15.0909 9.50031V13.8639C15.0909 14.2497 14.9377 14.6197 14.6649 14.8925C14.3921 15.1652 14.0221 15.3185 13.6364 15.3185H4.9091C4.52334 15.3185 4.15337 15.1652 3.88059 14.8925C3.60781 14.6197 3.45456 14.2497 3.45456 13.8639V5.13667C3.45456 4.7509 3.60781 4.38094 3.88059 4.10816C4.15337 3.83538 4.52334 3.68213 4.9091 3.68213H11.4546" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        }
                    >
                        {__('Tasks', 'analogwp-site-notes')}
                    </Button>
                    
                    <Button 
                        variant={currentPage === 'settings' ? 'primary' : 'secondary'}
                        onClick={() => onNavigate && onNavigate('settings')}
                        icon={
                            <svg className="fill-current! w-4!" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                            </svg>
                        }
                    >
                        {__('Settings', 'analogwp-site-notes')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AdminHeader;