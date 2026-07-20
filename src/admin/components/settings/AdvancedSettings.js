/**
 * WordPress dependencies
 */
import { useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { useSettings } from './SettingsProvider';
import {
	SettingsSection,
	SettingsCard,
	ToggleField,
	SelectField,
} from './FieldComponents';

const AdvancedSettings = () => {
	const { settings, updateSetting, exportSettings, importSettings } = useSettings();
	const importInputRef = useRef(null);

	const logLevelOptions = [
		{ value: 'error', label: __('Error', 'analogwp-site-notes') },
		{ value: 'warning', label: __('Warning', 'analogwp-site-notes') },
		{ value: 'info', label: __('Info', 'analogwp-site-notes') },
		{ value: 'debug', label: __('Debug', 'analogwp-site-notes') },
	];

	const handleImportFile = async (event) => {
		const file = event.target.files?.[0];
		if (!file) {
			return;
		}

		await importSettings(file);
		event.target.value = '';
	};

	return (
		<SettingsSection
			title={__('Advanced Settings', 'analogwp-site-notes')}
			description={__(
				'Configure debugging and data management for Site Notes.',
				'analogwp-site-notes'
			)}
		>
			<SettingsCard title={__('Debug Settings', 'analogwp-site-notes')}>
				<ToggleField
					id="enable_debug_mode"
					label={__('Enable Debug Mode', 'analogwp-site-notes')}
					description={__(
						'Show detailed error messages and debug information. Disable in production.',
						'analogwp-site-notes'
					)}
					checked={settings.advanced?.enable_debug_mode ?? false}
					onChange={(value) => updateSetting('advanced.enable_debug_mode', value)}
				/>

				<SelectField
					id="log_level"
					label={__('Log Level', 'analogwp-site-notes')}
					description={__(
						'Minimum level of messages to log. Debug logs the most, Error logs the least.',
						'analogwp-site-notes'
					)}
					value={settings.advanced?.log_level ?? 'error'}
					onChange={(value) => updateSetting('advanced.log_level', value)}
					options={logLevelOptions}
					variant="compact"
				/>
			</SettingsCard>

			<SettingsCard title={__('Import / Export Settings', 'analogwp-site-notes')}>
				<div className="sn-settings-grid-2">
					<div className="sn-settings-advanced-card">
						<h4 className="sn-settings-advanced-card__title">
							{__('Export Settings', 'analogwp-site-notes')}
						</h4>
						<p className="sn-settings-advanced-card__desc">
							{__(
								'Download all your settings as a JSON file for backup or transfer to another site.',
								'analogwp-site-notes'
							)}
						</p>
						<button
							type="button"
							className="sn-settings-outline-btn"
							onClick={exportSettings}
						>
							{__('Export Settings', 'analogwp-site-notes')}
						</button>
					</div>

					<div className="sn-settings-advanced-card">
						<h4 className="sn-settings-advanced-card__title">
							{__('Import Settings', 'analogwp-site-notes')}
						</h4>
						<p className="sn-settings-advanced-card__desc">
							{__(
								'Upload a settings file to restore or transfer settings from another installation.',
								'analogwp-site-notes'
							)}
						</p>
						<input
							ref={importInputRef}
							id="import_settings"
							type="file"
							className="sn-file-input--hidden"
							accept=".json,application/json"
							onChange={handleImportFile}
						/>
						<button
							type="button"
							className="sn-settings-outline-btn"
							onClick={() => importInputRef.current?.click()}
						>
							{__('Choose File', 'analogwp-site-notes')}
						</button>
					</div>
				</div>
			</SettingsCard>

			<SettingsCard title={__('System Info', 'analogwp-site-notes')}>
				<div className="sn-settings-grid-3">
					<div className="sn-settings-stat-card">
						<div className="sn-settings-stat-value">
							{window.agwp_sn_ajax?.pluginVersion || __('Unknown', 'analogwp-site-notes')}
						</div>
						<div className="sn-settings-stat-label">
							{__('Plugin Version', 'analogwp-site-notes')}
						</div>
					</div>
					<div className="sn-settings-stat-card">
						<div className="sn-settings-stat-value">
							{window.agwp_sn_ajax?.wpVersion || __('Unknown', 'analogwp-site-notes')}
						</div>
						<div className="sn-settings-stat-label">
							{__('WordPress Version', 'analogwp-site-notes')}
						</div>
					</div>
					<div className="sn-settings-stat-card">
						<div className="sn-settings-stat-value">
							{window.agwp_sn_ajax?.phpVersion || __('Unknown', 'analogwp-site-notes')}
						</div>
						<div className="sn-settings-stat-label">
							{__('PHP Version', 'analogwp-site-notes')}
						</div>
					</div>
				</div>
			</SettingsCard>
		</SettingsSection>
	);
};

export default AdvancedSettings;
