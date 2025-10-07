/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

const ViewToggle = ({ activeView, onViewChange }) => {
    return (
        <div className="flex rounded-lg gap-2">
						<Button 
								isPrimary={activeView === 'kanban'}
								isSecondary={activeView !== 'kanban'}
								onClick={() => onViewChange('kanban')}
						>
								{__('Kanban', 'analogwp-client-handoff')}
						</Button>
						<Button 
								isPrimary={activeView === 'list'}
								isSecondary={activeView !== 'list'}
								onClick={() => onViewChange('list')}
						>
								{__('List', 'analogwp-client-handoff')}
						</Button>
        </div>
    );
};

export default ViewToggle;