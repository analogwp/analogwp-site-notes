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
    ColorInput, 
    NumberInput,
    FieldDescription 
} from './FieldComponents';

const AppearanceSettings = () => {
    const { settings, updateSetting } = useSettings();

    const themeStyleOptions = [
        { value: 'modern', label: __('Modern', 'analogwp-client-handoff') },
        { value: 'classic', label: __('Classic', 'analogwp-client-handoff') },
        { value: 'minimal', label: __('Minimal', 'analogwp-client-handoff') }
    ];

    const fontSizeOptions = [
        { value: 'small', label: __('Small', 'analogwp-client-handoff') },
        { value: 'medium', label: __('Medium', 'analogwp-client-handoff') },
        { value: 'large', label: __('Large', 'analogwp-client-handoff') }
    ];

    return (
        <div className="cht-settings-tab-content">
            <SettingsSection
                title={__('Visual Appearance', 'analogwp-client-handoff')}
                description={__('Customize the visual appearance of the comment system and admin interface.', 'analogwp-client-handoff')}
            >
                <SettingsCard title={__('Theme & Style', 'analogwp-client-handoff')}>
                    <Select
                        id="theme_style"
                        label={__('Theme Style', 'analogwp-client-handoff')}
                        description={__('Choose the overall visual style for the comment interface.', 'analogwp-client-handoff')}
                        value={settings.appearance?.theme_style ?? 'modern'}
                        onChange={(value) => updateSetting('appearance.theme_style', value)}
                        options={themeStyleOptions}
                    />

                    <Select
                        id="font_size"
                        label={__('Font Size', 'analogwp-client-handoff')}
                        description={__('Adjust the default font size for better readability.', 'analogwp-client-handoff')}
                        value={settings.appearance?.font_size ?? 'medium'}
                        onChange={(value) => updateSetting('appearance.font_size', value)}
                        options={fontSizeOptions}
                    />

                    <Toggle
                        id="compact_mode"
                        label={__('Compact Mode', 'analogwp-client-handoff')}
                        description={__('Use smaller spacing and compact layout to fit more content on screen.', 'analogwp-client-handoff')}
                        checked={settings.appearance?.compact_mode ?? false}
                        onChange={(value) => updateSetting('appearance.compact_mode', value)}
                    />
                </SettingsCard>

                <SettingsCard title={__('Color Scheme', 'analogwp-client-handoff')}>
                    <ColorInput
                        id="primary_color"
                        label={__('Primary Color', 'analogwp-client-handoff')}
                        description={__('Main brand color used for buttons and active states.', 'analogwp-client-handoff')}
                        value={settings.appearance?.primary_color ?? '#3498db'}
                        onChange={(value) => updateSetting('appearance.primary_color', value)}
                    />

                    <ColorInput
                        id="secondary_color"
                        label={__('Secondary Color', 'analogwp-client-handoff')}
                        description={__('Secondary color used for completed tasks and success states.', 'analogwp-client-handoff')}
                        value={settings.appearance?.secondary_color ?? '#2ecc71'}
                        onChange={(value) => updateSetting('appearance.secondary_color', value)}
                    />

                    <ColorInput
                        id="accent_color"
                        label={__('Accent Color', 'analogwp-client-handoff')}
                        description={__('Accent color used for warnings, high priority items, and alerts.', 'analogwp-client-handoff')}
                        value={settings.appearance?.accent_color ?? '#e74c3c'}
                        onChange={(value) => updateSetting('appearance.accent_color', value)}
                    />
                </SettingsCard>

                <SettingsCard title={__('Layout Options', 'analogwp-client-handoff')}>
                    <NumberInput
                        id="border_radius"
                        label={__('Border Radius', 'analogwp-client-handoff')}
                        description={__('Roundness of corners for UI elements. 0 = sharp corners, 20 = very rounded.', 'analogwp-client-handoff')}
                        value={settings.appearance?.border_radius ?? 8}
                        onChange={(value) => updateSetting('appearance.border_radius', value)}
                        min={0}
                        max={20}
                        step={1}
                        unit="px"
                    />

                    <Toggle
                        id="show_avatars"
                        label={__('Show User Avatars', 'analogwp-client-handoff')}
                        description={__('Display user profile pictures in comments and task assignments.', 'analogwp-client-handoff')}
                        checked={settings.appearance?.show_avatars ?? true}
                        onChange={(value) => updateSetting('appearance.show_avatars', value)}
                    />
                </SettingsCard>
            </SettingsSection>

            <SettingsSection
                title={__('Live Preview', 'analogwp-client-handoff')}
                description={__('See how your appearance settings will look.', 'analogwp-client-handoff')}
            >
                <SettingsCard>
                    <div className="cht-appearance-preview">
                        <div 
                            className={`cht-preview-container ${settings.appearance?.theme_style ?? 'modern'} ${settings.appearance?.compact_mode ? 'compact' : ''}`}
                            style={{
                                '--cht-primary': settings.appearance?.primary_color ?? '#3498db',
                                '--cht-secondary': settings.appearance?.secondary_color ?? '#2ecc71',
                                '--cht-accent': settings.appearance?.accent_color ?? '#e74c3c',
                                '--cht-border-radius': `${settings.appearance?.border_radius ?? 8}px`,
                                fontSize: settings.appearance?.font_size === 'small' ? '14px' : 
                                         settings.appearance?.font_size === 'large' ? '18px' : '16px'
                            }}
                        >
                            <div className="cht-preview-comment">
                                <div className="cht-comment-header">
                                    {settings.appearance?.show_avatars && (
                                        <div className="cht-avatar"></div>
                                    )}
                                    <div className="cht-comment-meta">
                                        <strong>{__('John Doe', 'analogwp-client-handoff')}</strong>
                                        <span className="cht-comment-time">{__('2 hours ago', 'analogwp-client-handoff')}</span>
                                    </div>
                                </div>
                                <div className="cht-comment-content">
                                    {__('This is a preview of how comments will appear with your current settings.', 'analogwp-client-handoff')}
                                </div>
                                <div className="cht-comment-actions">
                                    <button className="cht-btn cht-btn-primary cht-btn-sm">
                                        {__('Reply', 'analogwp-client-handoff')}
                                    </button>
                                    <button className="cht-btn cht-btn-secondary cht-btn-sm">
                                        {__('Resolve', 'analogwp-client-handoff')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </SettingsCard>
            </SettingsSection>
        </div>
    );
};

export default AppearanceSettings;