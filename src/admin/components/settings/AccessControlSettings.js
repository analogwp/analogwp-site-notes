/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { useSettings } from './SettingsProvider';
import { 
    SettingsSection, 
    SettingsCard, 
    ToggleField, 
    FieldDescription 
} from './FieldComponents';

const AccessControlSettings = () => {
    const { settings, updateSetting } = useSettings();

    const roleOptions = [
        { value: 'administrator', label: __('Administrator', 'analogwp-client-handoff') },
        { value: 'editor', label: __('Editor', 'analogwp-client-handoff') },
        { value: 'author', label: __('Author', 'analogwp-client-handoff') },
        { value: 'contributor', label: __('Contributor', 'analogwp-client-handoff') },
        { value: 'subscriber', label: __('Subscriber', 'analogwp-client-handoff') }
    ];

    // Custom role selector that always includes administrator
    const handleRoleChange = (roleValue) => {
        const currentRoles = settings.general?.allowed_roles || [];
        
        // Administrator cannot be removed
        if (roleValue === 'administrator') {
            return;
        }

        const newRoles = currentRoles.includes(roleValue)
            ? currentRoles.filter(r => r !== roleValue)
            : [...currentRoles, roleValue];
        
        // Ensure administrator is always included
        if (!newRoles.includes('administrator')) {
            newRoles.push('administrator');
        }
        
        updateSetting('general.allowed_roles', newRoles);
    };

    // Ensure administrator is always in the roles array
    const allowedRoles = settings.general?.allowed_roles || [];
    if (!allowedRoles.includes('administrator')) {
        allowedRoles.push('administrator');
        updateSetting('general.allowed_roles', allowedRoles);
    }

    return (
        <div className="p-6 max-w-4xl">
            <SettingsSection
                title={__('Access Control', 'analogwp-client-handoff')}
                description={__('Manage user permissions and access to the Client Handoff functionality.', 'analogwp-client-handoff')}
            >
                <SettingsCard title={__('User Roles & Permissions', 'analogwp-client-handoff')}>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">{__('Allowed User Roles', 'analogwp-client-handoff')}</label>
                        <div className="space-y-2">
                            {roleOptions.map(option => (
                                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={allowedRoles.includes(option.value)}
                                        onChange={() => handleRoleChange(option.value)}
                                        disabled={option.value === 'administrator'}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50"
                                    />
                                    <span className="text-sm text-gray-700">
                                        {option.label}
                                        {option.value === 'administrator' && (
                                            <span className="text-gray-500"> ({__('Always allowed', 'analogwp-client-handoff')})</span>
                                        )}
                                    </span>
                                </label>
                            ))}
                        </div>
                        <div className="text-sm text-gray-500">
                            {__('Select which user roles can access the client handoff functionality. Administrator role is always allowed to prevent lockouts.', 'analogwp-client-handoff')}
                        </div>
                    </div>

                    <ToggleField
                        id="enable_frontend_comments"
                        label={__('Enable Frontend Comments', 'analogwp-client-handoff')}
                        description={__('Allow users to add comments directly on the frontend of your website.', 'analogwp-client-handoff')}
                        checked={settings.general?.enable_frontend_comments ?? true}
                        onChange={(value) => updateSetting('general.enable_frontend_comments', value)}
                    />
                </SettingsCard>
            </SettingsSection>
        </div>
    );
};

export default AccessControlSettings;
