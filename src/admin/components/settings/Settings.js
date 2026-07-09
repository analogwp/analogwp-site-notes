/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { useSettings } from './SettingsProvider';
import ExtensionsProvider from './extensions/ExtensionsProvider';
import SettingsHeader from './SettingsHeader';
import GeneralSettings from './GeneralSettings';
import AccessControlSettings from './AccessControlSettings';
import LabelsAndFiltersSettings from './LabelsAndFiltersSettings';
import CategoriesSettings from './CategoriesSettings';
import AdvancedSettings from './AdvancedSettings';
import { Button } from '../ui';
import { SiteNotesLogoIcon } from '../../../shared/icons';

const ModernSettings = ({ initialTab = 'general' }) => {
	const [activeTab, setActiveTab] = useState(initialTab);

	useEffect(() => {
		setActiveTab(initialTab);
	}, [initialTab]);

	useEffect(() => {
		const handleBeforeUnload = () => {};

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	}, []);

	return (
		<ExtensionsProvider>
			<SettingsContent activeTab={activeTab} setActiveTab={setActiveTab} />
		</ExtensionsProvider>
	);
};

const SettingsContent = ({ activeTab, setActiveTab }) => {
	const { hasUnsavedChanges, saving, saveSettings } = useSettings();

	const renderTabContent = () => {
		switch (activeTab) {
			case 'general':
				return <GeneralSettings />;
			case 'access-control':
				return <AccessControlSettings />;
			case 'task-priorities':
				return <LabelsAndFiltersSettings />;
			case 'categories':
				return <CategoriesSettings />;
			case 'advanced':
				return <AdvancedSettings />;
			default:
				return <GeneralSettings />;
		}
	};

	const handleSaveSettings = async () => {
		await saveSettings();
	};

	return (
		<div className="sn-settings">
			<SettingsHeader
				activeTab={activeTab}
				onTabChange={setActiveTab}
			/>

			<div className="sn-settings-layout">
				<div className="sn-settings-main">
					<div className="sn-settings-main__tabs">
						{renderTabContent()}
					</div>

					<div className="sn-settings-main__footer">
						<Button
							variant="primary"
							onClick={handleSaveSettings}
							loading={saving}
							disabled={!hasUnsavedChanges || saving}
						>
							{saving
								? __('Saving...', 'analogwp-site-notes')
								: __('Save Settings', 'analogwp-site-notes')}
						</Button>
					</div>
				</div>

				<aside className="sn-settings-aside">
					<div className="sn-settings-panel">
						<div className="sn-settings-panel__header">
							<span className="sn-settings-panel__avatar">
								<SiteNotesLogoIcon />
							</span>
							<div>
								<h2 className="sn-settings-panel__title">
									Site Notes
								</h2>
							</div>
						</div>

						<ul className="sn-settings-panel__links">
							<li>
								<a href="https://analogwp.com/docs-home/" target="_blank" rel="noopener noreferrer" className="sn-settings-panel__link">
									Documentation
								</a>
							</li>
						</ul>
					</div>

					<div className="sn-settings-promo">
						<h3 className="sn-settings-promo__title">
							{__('🙋 We\'re looking for your feedback and feature requests!', 'analogwp-site-notes')}
						</h3>
						<p className="sn-settings-promo__text">
							{__('As we build the next versions of Site Notes, we\'re always looking for ways to improve the plugin. If you have any suggestions, feedback, or feature requests, please let us know. Your input helps us make Site Notes better for everyone!', 'analogwp-site-notes')}
						</p>

						<Button
							variant="primary"
							href="admin.php?page=agwp-sn-dashboard-contact"
						>
							{__('Create a request', 'analogwp-site-notes')}
						</Button>
					</div>
				</aside>
			</div>
		</div>
	);
};

export default ModernSettings;
