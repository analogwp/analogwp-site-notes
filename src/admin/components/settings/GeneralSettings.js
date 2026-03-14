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
    NumberInput
} from './FieldComponents';

const GeneralSettings = () => {
    const { settings, updateSetting } = useSettings();

    return (
        <div className="p-6 max-w-4xl">
            <SettingsSection
                title={__('General Configuration', 'analogwp-site-notes')}
                description={__('Basic settings for the Site Notes plugin functionality.', 'analogwp-site-notes')}
            >
                <SettingsCard title={__('Screenshot Settings', 'analogwp-site-notes')}>
                    <ToggleField
                        id="auto_screenshot"
                        label={__('Enable Automatic Screenshots', 'analogwp-site-notes')}
                        description={__('Automatically capture screenshots when comments are created to provide visual context.', 'analogwp-site-notes')}
                        checked={settings.general?.auto_screenshot ?? true}
                        onChange={(value) => updateSetting('general.auto_screenshot', value)}
                    />

                    <NumberInput
                        id="screenshot_quality"
                        label={__('Screenshot Quality', 'analogwp-site-notes')}
                        description={__('Higher quality results in larger file sizes. Range: 0.1 (lowest) to 1.0 (highest).', 'analogwp-site-notes')}
                        value={settings.general?.screenshot_quality ?? 0.8}
                        onChange={(value) => updateSetting('general.screenshot_quality', value)}
                        min={0.1}
                        max={1.0}
                        step={0.1}
                    />
                </SettingsCard>

                <SettingsCard title={__('Display Settings', 'analogwp-site-notes')}>
                    <NumberInput
                        id="comments_per_page"
                        label={__('Comments Per Page', 'analogwp-site-notes')}
                        description={__('Number of comments to display per page in the admin dashboard.', 'analogwp-site-notes')}
                        value={settings.general?.comments_per_page ?? 20}
                        onChange={(value) => updateSetting('general.comments_per_page', value)}
                        min={5}
                        max={100}
                        step={5}
                    />
                </SettingsCard>
            </SettingsSection>
        </div>
    );
};

export default GeneralSettings;