/**
 * WordPress dependencies
 */
import { 
	__,
	sprintf
} from '@wordpress/i18n';

/**
 * External dependencies
 */
import { 
    Cog6ToothIcon,
    ShieldCheckIcon,
    CommandLineIcon,
    TagIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

/**
 * Internal dependencies
 */
import { Button } from '../ui';
import { useSettings } from './SettingsProvider';
import { useExtensions } from '../extensions/ExtensionsProvider';

const SettingsHeader = ({ activeTab, onTabChange }) => {
    const { saving, hasUnsavedChanges, lastSaved, saveSettings } = useSettings();
    const { registeredTabs, isExtActive } = useExtensions();

    // Base tabs available in free version
    const baseTabs = [
        { 
            id: 'general', 
            label: __('General', 'analogwp-site-notes'),
            icon: Cog6ToothIcon,
            description: __('Basic plugin configuration', 'analogwp-site-notes'),
            isExt: false
        },
        { 
            id: 'access-control', 
            label: __('Access Control', 'analogwp-site-notes'),
            icon: ShieldCheckIcon,
            description: __('Manage user permissions and access', 'analogwp-site-notes'),
            isExt: false
        },
        { 
            id: 'labels-filters', 
            label: __('Labels & Filters', 'analogwp-site-notes'),
            icon: TagIcon,
            description: __('Manage categories and priorities', 'analogwp-site-notes'),
            isExt: false
        },
        { 
            id: 'advanced', 
            label: __('Advanced', 'analogwp-site-notes'),
            icon: CommandLineIcon,
            description: __('Advanced configuration options', 'analogwp-site-notes'),
            isExt: false
        }
    ];

    // Combine all tabs (removed pro tabs for simplified settings)
    const tabs = [
        ...baseTabs,
        ...registeredTabs
    ];

    const handleSave = async () => {
        await saveSettings();
    };

    const formatLastSaved = (date) => {
        if (!date) return null;
        
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) {
            return __('Just now', 'analogwp-site-notes');
        } else if (minutes < 60) {
            return sprintf(__('%d minutes ago', 'analogwp-site-notes'), minutes);
        } else {
            return date.toLocaleTimeString();
        }
    };

    return (
        <div className="rounded-t-lg mb-6">
            <nav className="p-0">
                <div className="flex gap-4">
                    {tabs.map(tab => {
                        const IconComponent = tab.icon;
                        
                        return (
                            <button
                                key={tab.id}
                                className={`flex items-center px-4 py-2 text-sm transition-all duration-200 cursor-pointer rounded-full ${
                                    activeTab === tab.id 
                                        ? 'text-white bg-blue-600' 
                                        : 'text-black bg-white hover:text-blue-600'
                                }`}
                                onClick={() => onTabChange(tab.id)}
                                title={tab.description}
                            >
                                {/* <IconComponent className="w-5 h-5 mr-2" /> */}
                                <span>
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default SettingsHeader;