/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { TrashOutlineIcon } from '../../../shared/icons';

const NoteSidebarFooter = ({
	primaryLabel,
	onSave,
	onCancel,
	onDelete,
	primaryDisabled = false,
	deleteOnly = false,
	tabs = null,
}) => (
	<div className={`sn-note-sidebar__footer${deleteOnly ? ' sn-note-sidebar__footer--delete-only' : ''}${tabs ? ' sn-note-sidebar__footer--with-tabs' : ''}`}>
		<div className="sn-note-sidebar__footer-bar">
			{tabs}
			<div className="sn-note-sidebar__footer-actions">
				{!deleteOnly && (
					<button
						type="button"
						className="sn-btn-primary-solid"
						onClick={onSave}
						disabled={primaryDisabled}
					>
						{primaryLabel}
					</button>
				)}
				{!deleteOnly && (
					<button
						type="button"
						className="sn-btn-secondary-solid"
						onClick={onCancel}
					>
						{__('Cancel', 'analogwp-site-notes')}
					</button>
				)}
				{onDelete && (
					<button
						type="button"
						className="sn-note-sidebar__footer-delete"
						onClick={onDelete}
						title={__('Delete note', 'analogwp-site-notes')}
					>
						<TrashOutlineIcon size="md" />
					</button>
				)}
			</div>
		</div>
	</div>
);

export default NoteSidebarFooter;
