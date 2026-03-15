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
        { value: 'administrator', label: __('Administrator', 'analogwp-site-notes') },
        { value: 'editor', label: __('Editor', 'analogwp-site-notes') },
        { value: 'author', label: __('Author', 'analogwp-site-notes') },
        { value: 'contributor', label: __('Contributor', 'analogwp-site-notes') },
        { value: 'subscriber', label: __('Subscriber', 'analogwp-site-notes') }
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
                title={__('Access Control', 'analogwp-site-notes')}
                description={__('Manage user permissions and access to the Site Notes functionality.', 'analogwp-site-notes')}
            >
                <SettingsCard title={__('User Roles & Permissions', 'analogwp-site-notes')}>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">{__('Allowed User Roles', 'analogwp-site-notes')}</label>
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
                                            <span className="text-gray-500"> ({__('Always allowed', 'analogwp-site-notes')})</span>
                                        )}
                                    </span>
                                </label>
                            ))}
                        </div>
                        <div className="text-sm text-gray-500">
                            {__('Select which user roles can access the site notes functionality. Administrator role is always allowed to prevent lockouts.', 'analogwp-site-notes')}
                        </div>
                    </div>

                    <ToggleField
                        id="enable_frontend_comments"
                        label={__('Enable Frontend Comments', 'analogwp-site-notes')}
                        description={__('Allow users to add comments directly on the frontend of your website.', 'analogwp-site-notes')}
                        checked={settings.general?.enable_frontend_comments ?? false}
                        onChange={(value) => updateSetting('general.enable_frontend_comments', value)}
                    />

                    <ToggleField
                        id="allow_anonymous_frontend_comments"
                        label={__('Allow Anonymous Frontend Comments', 'analogwp-site-notes')}
                        description={__('Let visitors who are not logged in, or who do not have Site Notes access, view and add frontend comments.', 'analogwp-site-notes')}
                        checked={settings.general?.allow_anonymous_frontend_comments ?? false}
                        onChange={(value) => updateSetting('general.allow_anonymous_frontend_comments', value)}
                    />

                    <FieldDescription>
                        {__('Keep anonymous comments disabled if frontend comments should remain limited to the allowed WordPress roles above. And is also recommended to be only used for internal testing or specific scenarios.', 'analogwp-site-notes')}
                    </FieldDescription>
                </SettingsCard>
            </SettingsSection>
        </div>
    );
};

export default AccessControlSettings;
