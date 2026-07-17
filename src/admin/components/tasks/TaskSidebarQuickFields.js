/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { SidebarSelect } from '../ui';

const TaskSidebarQuickFields = ({
	formData,
	onInputChange,
	statuses,
	priorityOptions,
	getStatusBadgeStyle,
	getPriorityBadgeStyle,
}) => (
	<div className="sn-task-sidebar__quick-fields">
		<SidebarSelect
			label={__('Status', 'analogwp-site-notes')}
			emptyText={__('No status', 'analogwp-site-notes')}
			value={formData.status}
			onChange={(value) => onInputChange('status', value)}
			options={statuses.map((status) => ({
				value: status.key,
				label: status.title,
			}))}
			getOptionStyle={getStatusBadgeStyle}
		/>

		<SidebarSelect
			label={__('Priority', 'analogwp-site-notes')}
			emptyText={__('No priority', 'analogwp-site-notes')}
			value={formData.priority}
			onChange={(value) => onInputChange('priority', value)}
			options={priorityOptions.map((priority) => ({
				value: priority.key,
				label: priority.name,
			}))}
			getOptionStyle={(value) => getPriorityBadgeStyle(value, priorityOptions)}
		/>
	</div>
);

export default TaskSidebarQuickFields;
