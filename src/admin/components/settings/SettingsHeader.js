/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

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
        <div className="bg-white rounded-t-lg mb-6 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-gray-900 m-0">{__('Settings', 'analogwp-site-notes')}</h1>
                    <div className="mt-1">
                        {hasUnsavedChanges && (
                            <span className="inline-flex items-center text-sm text-amber-600">
                                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                                {__('Unsaved changes', 'analogwp-site-notes')}
                            </span>
                        )}
                        {lastSaved && !hasUnsavedChanges && (
                            <span className="inline-flex items-center text-sm text-blue-600">
                                <CheckCircleIcon className="w-4 h-4 mr-1" />
                                {sprintf(__('Last saved: %s', 'analogwp-site-notes'), formatLastSaved(lastSaved))}
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="flex">
                    <Button
                        onClick={handleSave}
                        disabled={saving || !hasUnsavedChanges}
                        loading={saving}
                        variant="primary"
                        size="default"
                        icon={saving ? null : <CheckCircleIcon className="w-6!" />}
                    >
                        {saving ? __('Saving...', 'analogwp-site-notes') : __('Save Changes', 'analogwp-site-notes')}
                    </Button>
                </div>
            </div>

            <nav className="p-0">
                <div className="flex">
                    {tabs.map(tab => {
                        const IconComponent = tab.icon;
                        
                        return (
                            <button
                                key={tab.id}
                                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer ${
                                    activeTab === tab.id 
                                        ? 'text-blue-700 border-blue-700 bg-blue-50' 
                                        : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                                }`}
                                onClick={() => onTabChange(tab.id)}
                                title={tab.description}
                            >
                                <IconComponent className="w-5 h-5 mr-2" />
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