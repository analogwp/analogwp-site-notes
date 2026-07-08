/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Button } from './ui';
import { SettingsIcon, TasksIcon } from '../../shared/icons';

const AdminHeader = ({
	currentPage = 'dashboard',
	onNavigate
}) => {
	return (
		<header className="sn-admin-header">
			<div className="sn-admin-header__brand">
				<h1
					className="sn-admin-header__title"
					onClick={() => onNavigate && onNavigate('dashboard')}
				>
					{__('Site Notes', 'analogwp-site-notes')}
				</h1>
			</div>
			<nav className="sn-admin-header__nav">
				<Button
					variant={currentPage === 'dashboard' ? 'primary' : 'secondary'}
					onClick={() => onNavigate && onNavigate('dashboard')}
					icon={<TasksIcon size="md" />}
				>
					{__('Tasks', 'analogwp-site-notes')}
				</Button>

				<Button
					variant={currentPage === 'settings' ? 'primary' : 'secondary'}
					onClick={() => onNavigate && onNavigate('settings')}
					icon={<SettingsIcon size="md" />}
				>
					{__('Settings', 'analogwp-site-notes')}
				</Button>
			</nav>
		</header>
	);
};

export default AdminHeader;
