/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { useSettings } from './settings/SettingsProvider';
import ExtensionsProvider from './extensions/ExtensionsProvider';
import SettingsHeader from './settings/SettingsHeader';
import GeneralSettings from './settings/GeneralSettings';
import AccessControlSettings from './settings/AccessControlSettings';
import LabelsAndFiltersSettings from './settings/LabelsAndFiltersSettings';
import AdvancedSettings from './settings/AdvancedSettings';
import { Button } from './ui';

const TAB_META = {
    general: {
        title: __('General Settings', 'analogwp-site-notes'),
        description: __('Set up core behavior and defaults used throughout Site Notes.', 'analogwp-site-notes')
    },
    'access-control': {
        title: __('Access Control', 'analogwp-site-notes'),
        description: __('Define who can access and manage notes within your WordPress admin.', 'analogwp-site-notes')
    },
    'labels-filters': {
        title: __('Labels & Filters', 'analogwp-site-notes'),
        description: __('Organize workflows with custom priorities and categories.', 'analogwp-site-notes')
    },
    advanced: {
        title: __('Advanced Settings', 'analogwp-site-notes'),
        description: __('Configure debugging, import/export, and advanced plugin controls.', 'analogwp-site-notes')
    }
};

const ModernSettings = () => {
    const [activeTab, setActiveTab] = useState('general');

    // Prevent users from leaving with unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            // This will be managed by the SettingsProvider context
            // through hasUnsavedChanges state
        };

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
    const { hasUnsavedChanges, saving, lastSaved, saveSettings } = useSettings();

    const renderTabContent = () => {

        switch (activeTab) {
            case 'general':
                return <GeneralSettings />;
            case 'access-control':
                return <AccessControlSettings />;
            case 'labels-filters':
                return <LabelsAndFiltersSettings />;
            case 'advanced':
                return <AdvancedSettings />;
            default:
                return <GeneralSettings />;
        }
    };

    const activeTabMeta = TAB_META[activeTab] || TAB_META.general;

    const getLastSavedLabel = () => {
        if (!lastSaved) {
            return __('Not saved yet', 'analogwp-site-notes');
        }

        return lastSaved.toLocaleTimeString();
    };

    const handleSaveSettings = async () => {
        await saveSettings();
    };

    return (
        <div className="space-y-6">
            <SettingsHeader 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
            />
            
            <div className="flex flex-col lg:flex-row gap-10 items-start w-full">
                <div className="bg-white border border-gray-200 rounded-xl w-full lg:flex-1 lg:min-w-0">
                    <div className='px-3'>
											{renderTabContent()}
										</div>

                    <div className="px-8 py-4 border-t border-gray-200 flex">
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

                <aside className="w-full lg:basis-[450px] lg:w-[450px] lg:flex-shrink-0 lg:sticky lg:top-10 space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-8">
											<div className="flex gap-3 items-center border-b border-gray-200 mb-4 pb-6">
												<span className='block w-10 h-10 rounded-full overflow-hidden'>
													<svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
														<rect width="256" height="256" fill="#3858E9"/>
														<path d="M100.178 128.163L128.163 156.147L184.132 100.178M72.1938 128.163L100.178 156.147M128.163 128.163L156.147 100.178" stroke="white" strokeWidth="5.33764" strokeLinecap="round" strokeLinejoin="round"/>
												</svg>
												</span>
												<div>
													<h2 className="text-lg !font-medium text-gray-900 m-0">
														Site Notes
													</h2>
												</div>
											</div>

											<ul className="pt-3 space-y-3 text-sm">
												<li><a href="https://analogwp.com/docs-home/" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Documentation</a></li>
											</ul>
										</div>

										<div className="bg-gray-200 p-8 rounded-lg border border-gray-200">
												<h3 className="!text-lg text-gray-800 m-0 mb-3">
														{__('🙋 We\'re looking for your feedback and feature requests!', 'analogwp-site-notes')}
												</h3>
												<p className="text-gray-600 mb-6">
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