/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { CloseIcon } from '../../../shared/icons';

const TaskSidebarBackdropClose = ({ onClose, isManage = false }) => (
	<button
		type="button"
		className={`sn-kanban-sidebar-close${isManage ? ' sn-kanban-sidebar-close--manage' : ''}`}
		onClick={(event) => {
			event.stopPropagation();
			onClose();
		}}
		aria-label={__('Close', 'analogwp-site-notes')}
	>
		<CloseIcon size="md" />
	</button>
);

export default TaskSidebarBackdropClose;
