/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Button } from '../ui';
import { useSettings } from './SettingsProvider';
import {
    SettingsSection,
    SettingsCard,
    ToggleField,
    SelectField,
    FileUpload,
    FieldDescription
} from './FieldComponents';

const AdvancedSettings = () => {
    const { settings, updateSetting, exportSettings, importSettings } = useSettings();

    const logLevelOptions = [
        { value: 'error', label: __('Error', 'analogwp-site-notes') },
        { value: 'warning', label: __('Warning', 'analogwp-site-notes') },
        { value: 'info', label: __('Info', 'analogwp-site-notes') },
        { value: 'debug', label: __('Debug', 'analogwp-site-notes') }
    ];

    const handleImport = async (file) => {
        const success = await importSettings(file);
        if (success) {
            // Settings are automatically updated by the provider
        }
    };

    return (
        <>
            <SettingsSection
                title={__('Debug & Logging', 'analogwp-site-notes')}
                description={__('Configure debugging and logging settings for troubleshooting.', 'analogwp-site-notes')}
            >
                <SettingsCard title={__('Debug Settings', 'analogwp-site-notes')}>
                    <ToggleField
                        id="enable_debug_mode"
                        label={__('Enable Debug Mode', 'analogwp-site-notes')}
                        description={__('Show detailed error messages and debug information. Disable in production.', 'analogwp-site-notes')}
                        checked={settings.advanced?.enable_debug_mode ?? false}
                        onChange={(value) => updateSetting('advanced.enable_debug_mode', value)}
                    />

                    {settings.advanced?.enable_debug_mode && (
                        <FieldDescription type="warning">
                            {__('Debug mode should not be enabled on production sites as it may expose sensitive information.', 'analogwp-site-notes')}
                        </FieldDescription>
                    )}

                    <SelectField
                        id="log_level"
                        label={__('Log Level', 'analogwp-site-notes')}
                        description={__('Minimum level of messages to log. Debug logs the most, Error logs the least.', 'analogwp-site-notes')}
                        value={settings.advanced?.log_level ?? 'error'}
                        onChange={(value) => updateSetting('advanced.log_level', value)}
                        options={logLevelOptions}
                    />
                </SettingsCard>
            </SettingsSection>

            <SettingsSection
                title={__('Data Management', 'analogwp-site-notes')}
                description={__('Import and export settings, manage plugin data.', 'analogwp-site-notes')}
            >
                <SettingsCard title={__('Import/Export Settings', 'analogwp-site-notes')}>
                    <div className="sn-settings-grid-2">
                        <div className="sn-settings-advanced-card">
                            <h4 className="sn-settings-advanced-card__title">{__('Export Settings', 'analogwp-site-notes')}</h4>
                            <p className="sn-settings-advanced-card__desc">{__('Download all your settings as a JSON file for backup or transfer to another site.', 'analogwp-site-notes')}</p>
                            <Button
                                onClick={exportSettings}
                                variant="default"
                                size="default"
                            >
                                {__('Export Settings', 'analogwp-site-notes')}
                            </Button>
                        </div>

                        <div className="sn-settings-advanced-card">
                            <h4 className="sn-settings-advanced-card__title">{__('Import Settings', 'analogwp-site-notes')}</h4>
                            <p className="sn-settings-advanced-card__desc">{__('Upload a settings file to restore or transfer settings from another installation.', 'analogwp-site-notes')}</p>
                            <FileUpload
                                id="import_settings"
                                accept=".json"
                                onChange={handleImport}
                                description={__('Select a JSON settings file to import.', 'analogwp-site-notes')}
                            />
                        </div>
                    </div>
                </SettingsCard>

                <SettingsCard title={__('System Information', 'analogwp-site-notes')}>
                    <div className="sn-settings-item-list">
                        <div className="sn-settings-grid-3">
                            <div className="sn-settings-stat-card">
                                <div className="sn-settings-stat-value">{window.agwp_sn_ajax?.pluginVersion || 'Unknown'}</div>
                                <div className="sn-settings-stat-label">{__('Plugin Version', 'analogwp-site-notes')}</div>
                            </div>
                            <div className="sn-settings-stat-card">
                                <div className="sn-settings-stat-value">{window.agwp_sn_ajax?.wpVersion || 'Unknown'}</div>
                                <div className="sn-settings-stat-label">{__('WordPress Version', 'analogwp-site-notes')}</div>
                            </div>
                            <div className="sn-settings-stat-card">
                                <div className="sn-settings-stat-value">{window.agwp_sn_ajax?.phpVersion || 'Unknown'}</div>
                                <div className="sn-settings-stat-label">{__('PHP Version', 'analogwp-site-notes')}</div>
                            </div>
                        </div>
                    </div>
                </SettingsCard>
            </SettingsSection>
        </>
    );
};

export default AdvancedSettings;
