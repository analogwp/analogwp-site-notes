/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { TrashOutlineIcon } from '../../../shared/icons';

const TaskSidebarFooter = ({ primaryLabel, onSave, onCancel, onDelete }) => (
	<div className="sn-task-sidebar__footer">
		<div className="sn-task-sidebar__footer-actions">
			<button
				type="button"
				className="sn-btn-primary-solid"
				onClick={onSave}
			>
				{primaryLabel}
			</button>
			<button
				type="button"
				className="sn-btn-secondary-solid"
				onClick={onCancel}
			>
				{__('Cancel', 'analogwp-site-notes')}
			</button>
			{onDelete && (
				<button
					type="button"
					className="sn-task-sidebar__footer-delete"
					onClick={onDelete}
					title={__('Delete task', 'analogwp-site-notes')}
				>
					<TrashOutlineIcon size="md" />
				</button>
			)}
		</div>
	</div>
);

export default TaskSidebarFooter;
