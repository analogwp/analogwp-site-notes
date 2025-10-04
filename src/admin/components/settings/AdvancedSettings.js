/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { useSettings } from './SettingsProvider';
import { useExtensions } from '../extensions/ExtensionsProvider';
import { 
    SettingsSection, 
    SettingsCard, 
    Toggle, 
    Select, 
    TextAreaInput,
    FileUpload,
    FieldDescription 
} from './FieldComponents';

const AdvancedSettings = () => {
    const { settings, updateSetting, exportSettings, importSettings } = useSettings();
    const { isFeatureAvailable } = useExtensions();

    const logLevelOptions = [
        { value: 'error', label: __('Error', 'analogwp-client-handoff') },
        { value: 'warning', label: __('Warning', 'analogwp-client-handoff') },
        { value: 'info', label: __('Info', 'analogwp-client-handoff') },
        { value: 'debug', label: __('Debug', 'analogwp-client-handoff') }
    ];

    const handleImport = async (file) => {
        const success = await importSettings(file);
        if (success) {
            // Settings are automatically updated by the provider
        }
    };

    return (
        <div className="cht-settings-tab-content">
            <SettingsSection
                title={__('Debug & Logging', 'analogwp-client-handoff')}
                description={__('Configure debugging and logging settings for troubleshooting.', 'analogwp-client-handoff')}
            >
                <SettingsCard title={__('Debug Settings', 'analogwp-client-handoff')}>
                        <Toggle
                            id="enable_debug_mode"
                            label={__('Enable Debug Mode', 'analogwp-client-handoff')}
                            description={__('Show detailed error messages and debug information. Disable in production.', 'analogwp-client-handoff')}
                            checked={settings.advanced?.enable_debug_mode ?? false}
                            onChange={(value) => updateSetting('advanced.enable_debug_mode', value)}
                        />

                    {settings.advanced?.enable_debug_mode && (
                        <FieldDescription type="warning">
                            {__('Debug mode should not be enabled on production sites as it may expose sensitive information.', 'analogwp-client-handoff')}
                        </FieldDescription>
                    )}

                        <Select
                            id="log_level"
                            label={__('Log Level', 'analogwp-client-handoff')}
                            description={__('Minimum level of messages to log. Debug logs the most, Error logs the least.', 'analogwp-client-handoff')}
                            value={settings.advanced?.log_level ?? 'error'}
                            onChange={(value) => updateSetting('advanced.log_level', value)}
                            options={logLevelOptions}
                        />
                </SettingsCard>
            </SettingsSection>

            <SettingsSection
                title={__('Data Management', 'analogwp-client-handoff')}
                description={__('Import and export settings, manage plugin data.', 'analogwp-client-handoff')}
            >
                <SettingsCard title={__('Import/Export Settings', 'analogwp-client-handoff')}>
                    <div className="cht-data-management">
                        <div className="cht-export-section">
                            <h4>{__('Export Settings', 'analogwp-client-handoff')}</h4>
                            <p>{__('Download all your settings as a JSON file for backup or transfer to another site.', 'analogwp-client-handoff')}</p>
                            <button
                                className="cht-btn cht-btn-secondary"
                                onClick={exportSettings}
                            >
                                {__('Download Settings', 'analogwp-client-handoff')}
                            </button>
                        </div>

                        <div className="cht-import-section">
                            <h4>{__('Import Settings', 'analogwp-client-handoff')}</h4>
                            <p>{__('Upload a settings file to restore or transfer settings from another installation.', 'analogwp-client-handoff')}</p>
                            <FileUpload
                                id="import_settings"
                                accept=".json"
                                onChange={handleImport}
                                description={__('Select a JSON settings file to import.', 'analogwp-client-handoff')}
                            />
                        </div>
                    </div>
                </SettingsCard>

                <SettingsCard title={__('System Information', 'analogwp-client-handoff')}>
                    <div className="cht-system-info">
                        <div className="cht-info-row">
                            <strong>{__('Plugin Version:', 'analogwp-client-handoff')}</strong>
                            <span>{window.agwpChtAjax?.pluginVersion || 'Unknown'}</span>
                        </div>
                        <div className="cht-info-row">
                            <strong>{__('WordPress Version:', 'analogwp-client-handoff')}</strong>
                            <span>{window.agwpChtAjax?.wpVersion || 'Unknown'}</span>
                        </div>
                        <div className="cht-info-row">
                            <strong>{__('PHP Version:', 'analogwp-client-handoff')}</strong>
                            <span>{window.agwpChtAjax?.phpVersion || 'Unknown'}</span>
                        </div>
                    </div>
                </SettingsCard>
            </SettingsSection>
        </div>
    );
};

export default AdvancedSettings;