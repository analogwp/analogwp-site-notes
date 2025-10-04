/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * External dependencies
 */
import { 
    Cog6ToothIcon, 
    UserGroupIcon, 
    BellIcon, 
    ShieldCheckIcon, 
    PaintBrushIcon, 
    CommandLineIcon,
    TagIcon,
    ArrowPathIcon,
    ArrowUpTrayIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

/**
 * Internal dependencies
 */
import { useSettings } from './SettingsProvider';
import { useExtensions } from '../extensions/ExtensionsProvider';

const SettingsHeader = ({ activeTab, onTabChange }) => {
    const { saving, hasUnsavedChanges, lastSaved, saveSettings } = useSettings();
    const { registeredTabs, isProActive } = useExtensions();

    // Base tabs available in free version
    const baseTabs = [
        { 
            id: 'general', 
            label: __('General', 'analogwp-client-handoff'),
            icon: Cog6ToothIcon,
            description: __('Basic plugin configuration', 'analogwp-client-handoff'),
            isPro: false
        },
        { 
            id: 'categories', 
            label: __('Categories', 'analogwp-client-handoff'),
            icon: TagIcon,
            description: __('Manage comment categories', 'analogwp-client-handoff'),
            isPro: false
        },
        { 
            id: 'advanced', 
            label: __('Advanced', 'analogwp-client-handoff'),
            icon: CommandLineIcon,
            description: __('Advanced configuration options', 'analogwp-client-handoff'),
            isPro: false
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
            return __('Just now', 'analogwp-client-handoff');
        } else if (minutes < 60) {
            return sprintf(__('%d minutes ago', 'analogwp-client-handoff'), minutes);
        } else {
            return date.toLocaleTimeString();
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg mb-6 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-gray-900 m-0">{__('Settings', 'analogwp-client-handoff')}</h1>
                    <div className="mt-1">
                        {hasUnsavedChanges && (
                            <span className="inline-flex items-center text-sm text-amber-600">
                                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                                {__('Unsaved changes', 'analogwp-client-handoff')}
                            </span>
                        )}
                        {lastSaved && !hasUnsavedChanges && (
                            <span className="inline-flex items-center text-sm text-green-600">
                                <CheckCircleIcon className="w-4 h-4 mr-1" />
                                {sprintf(__('Last saved: %s', 'analogwp-client-handoff'), formatLastSaved(lastSaved))}
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="flex">
                    <button
                        className={`inline-flex items-center px-4 py-2 text-sm font-medium border rounded-md transition-all duration-200 ${
                            saving || !hasUnsavedChanges 
                                ? 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed' 
                                : 'text-white bg-indigo-600 border-indigo-600 hover:bg-indigo-700 cursor-pointer'
                        }`}
                        onClick={handleSave}
                        disabled={saving || !hasUnsavedChanges}
                    >
                        {saving ? (
                            <>
                                <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                                {__('Saving...', 'analogwp-client-handoff')}
                            </>
                        ) : (
                            <>
                                <CheckCircleIcon className="w-4 h-4 mr-2" />
                                {__('Save Changes', 'analogwp-client-handoff')}
                            </>
                        )}
                    </button>
                </div>
            </div>

            <nav className="p-0">
                <div className="flex border-b border-gray-200">
                    {tabs.map(tab => {
                        const IconComponent = tab.icon;
                        
                        return (
                            <button
                                key={tab.id}
                                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer ${
                                    activeTab === tab.id 
                                        ? 'text-indigo-600 border-indigo-500 bg-indigo-50' 
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