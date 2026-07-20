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
		<SettingsSection
			title={__('General Settings', 'analogwp-site-notes')}
			description={__('Basic settings for the Site Notes plugin functionality.', 'analogwp-site-notes')}
		>
			<SettingsCard title={__('Screenshot settings', 'analogwp-site-notes')}>
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
					id="notes_per_load"
					label={__('Notes per load', 'analogwp-site-notes')}
					description={__('Number of notes loaded initially and each time you scroll to the bottom of the notes list or a kanban column.', 'analogwp-site-notes')}
					value={settings.general?.notes_per_load ?? 10}
					onChange={(value) => updateSetting('general.notes_per_load', value)}
					min={5}
					max={100}
					step={5}
				/>
			</SettingsCard>

			<SettingsCard title={__('Time tracking', 'analogwp-site-notes')}>
				<ToggleField
					id="enable_time_tracking"
					label={__('Enable time tracking', 'analogwp-site-notes')}
					description={__('Optionally add time entries to your notes', 'analogwp-site-notes')}
					checked={settings.general?.enable_time_tracking ?? true}
					onChange={(value) => updateSetting('general.enable_time_tracking', value)}
				/>
			</SettingsCard>
		</SettingsSection>
	);
};

export default GeneralSettings;
