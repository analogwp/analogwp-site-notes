/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Button } from '../ui';

const ViewToggle = ({ activeView, onViewChange }) => {
	return (
		<div className="sn-view-toggle">
			<Button
				variant={activeView === 'kanban' ? 'primary' : 'secondary'}
				onClick={() => onViewChange('kanban')}
			>
				{__('Kanban', 'analogwp-site-notes')}
			</Button>
			<Button
				variant={activeView === 'list' ? 'primary' : 'secondary'}
				onClick={() => onViewChange('list')}
			>
				{__('List', 'analogwp-site-notes')}
			</Button>
		</div>
	);
};

export default ViewToggle;
