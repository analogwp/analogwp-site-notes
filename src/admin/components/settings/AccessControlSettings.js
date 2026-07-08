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

	const handleRoleChange = (roleValue) => {
		const currentRoles = settings.general?.allowed_roles || [];

		if (roleValue === 'administrator') {
			return;
		}

		const newRoles = currentRoles.includes(roleValue)
			? currentRoles.filter(r => r !== roleValue)
			: [...currentRoles, roleValue];

		if (!newRoles.includes('administrator')) {
			newRoles.push('administrator');
		}

		updateSetting('general.allowed_roles', newRoles);
	};

	const allowedRoles = settings.general?.allowed_roles || [];
	if (!allowedRoles.includes('administrator')) {
		allowedRoles.push('administrator');
		updateSetting('general.allowed_roles', allowedRoles);
	}

	return (
		<SettingsSection
			title={__('Access Control', 'analogwp-site-notes')}
			description={__('Manage user permissions and access to the Site Notes functionality.', 'analogwp-site-notes')}
		>
			<SettingsCard title={__('User Roles & Permissions', 'analogwp-site-notes')}>
				<div className="sn-settings-fields">
					<label className="sn-label">{__('Allowed User Roles', 'analogwp-site-notes')}</label>
					<div className="sn-settings-checkbox-list">
							{roleOptions.map(option => (
								<label key={option.value} className="sn-settings-role-item">
									<input
										type="checkbox"
										checked={allowedRoles.includes(option.value)}
										onChange={() => handleRoleChange(option.value)}
										disabled={option.value === 'administrator'}
										className="sn-checkbox"
									/>
									<span className="sn-text-m sn-text-primary">
										{option.label}
										{option.value === 'administrator' && (
											<span className="sn-text-secondary"> ({__('Always allowed', 'analogwp-site-notes')})</span>
										)}
									</span>
								</label>
							))}
					</div>
					<p className="sn-text-m sn-text-secondary">
						{__('Select which user roles can access the site notes functionality. Administrator role is always allowed to prevent lockouts.', 'analogwp-site-notes')}
					</p>
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
	);
};

export default AccessControlSettings;
