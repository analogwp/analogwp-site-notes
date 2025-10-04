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
    Toggle, 
    Select, 
    NumberInput, 
    MultiSelect,
    FieldDescription 
} from './FieldComponents';

const GeneralSettings = () => {
    const { settings, updateSetting } = useSettings();

    const roleOptions = [
        { value: 'administrator', label: __('Administrator', 'analogwp-client-handoff') },
        { value: 'editor', label: __('Editor', 'analogwp-client-handoff') },
        { value: 'author', label: __('Author', 'analogwp-client-handoff') },
        { value: 'contributor', label: __('Contributor', 'analogwp-client-handoff') },
        { value: 'subscriber', label: __('Subscriber', 'analogwp-client-handoff') }
    ];

    const themeModeOptions = [
        { value: 'auto', label: __('Auto (Follow system)', 'analogwp-client-handoff') },
        { value: 'light', label: __('Light', 'analogwp-client-handoff') },
        { value: 'dark', label: __('Dark', 'analogwp-client-handoff') }
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
        <div className="p-6">
            <SettingsSection
                title={__('General Configuration', 'analogwp-client-handoff')}
                description={__('Basic settings for the Client Handoff plugin functionality.', 'analogwp-client-handoff')}
            >
                <SettingsCard title={__('Access Control', 'analogwp-client-handoff')}>
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

                    <Toggle
                        id="enable_frontend_comments"
                        label={__('Enable Frontend Comments', 'analogwp-client-handoff')}
                        description={__('Allow users to add comments directly on the frontend of your website.', 'analogwp-client-handoff')}
                        checked={settings.general?.enable_frontend_comments ?? true}
                        onChange={(value) => updateSetting('general.enable_frontend_comments', value)}
                    />

                    <Toggle
                        id="require_approval"
                        label={__('Require Comment Approval', 'analogwp-client-handoff')}
                        description={__('New comments will need to be approved before being visible to others.', 'analogwp-client-handoff')}
                        checked={settings.general?.require_approval ?? false}
                        onChange={(value) => updateSetting('general.require_approval', value)}
                    />
                </SettingsCard>

                <SettingsCard title={__('Screenshot Settings', 'analogwp-client-handoff')}>
                    <Toggle
                        id="auto_screenshot"
                        label={__('Enable Automatic Screenshots', 'analogwp-client-handoff')}
                        description={__('Automatically capture screenshots when comments are created to provide visual context.', 'analogwp-client-handoff')}
                        checked={settings.general?.auto_screenshot ?? true}
                        onChange={(value) => updateSetting('general.auto_screenshot', value)}
                    />

                    <NumberInput
                        id="screenshot_quality"
                        label={__('Screenshot Quality', 'analogwp-client-handoff')}
                        description={__('Higher quality results in larger file sizes. Range: 0.1 (lowest) to 1.0 (highest).', 'analogwp-client-handoff')}
                        value={settings.general?.screenshot_quality ?? 0.8}
                        onChange={(value) => updateSetting('general.screenshot_quality', value)}
                        min={0.1}
                        max={1.0}
                        step={0.1}
                        unit="%"
                    />
                </SettingsCard>

                <SettingsCard title={__('Display Settings', 'analogwp-client-handoff')}>
                    <NumberInput
                        id="comments_per_page"
                        label={__('Comments Per Page', 'analogwp-client-handoff')}
                        description={__('Number of comments to display per page in the admin dashboard.', 'analogwp-client-handoff')}
                        value={settings.general?.comments_per_page ?? 20}
                        onChange={(value) => updateSetting('general.comments_per_page', value)}
                        min={5}
                        max={100}
                        step={5}
                    />

                    <Select
                        id="theme_mode"
                        label={__('Theme Mode', 'analogwp-client-handoff')}
                        description={__('Choose the color scheme for the admin interface.', 'analogwp-client-handoff')}
                        value={settings.general?.theme_mode ?? 'auto'}
                        onChange={(value) => updateSetting('general.theme_mode', value)}
                        options={themeModeOptions}
                    />
                </SettingsCard>

                <SettingsCard title={__('Auto-save Settings', 'analogwp-client-handoff')}>
                    <Toggle
                        id="auto_save_drafts"
                        label={__('Enable Auto-save', 'analogwp-client-handoff')}
                        description={__('Automatically save settings changes every 5 seconds to prevent data loss.', 'analogwp-client-handoff')}
                        checked={settings.general?.auto_save_drafts ?? true}
                        onChange={(value) => updateSetting('general.auto_save_drafts', value)}
                    />
                </SettingsCard>
            </SettingsSection>
        </div>
    );
};

export default GeneralSettings;