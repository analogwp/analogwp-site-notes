/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { BadgeSelect, FieldSelect } from '../ui';

const getUserInitials = (name) => {
	if (!name) {
		return '?';
	}

	return name
		.split(' ')
		.map((part) => part[0])
		.join('')
		.toUpperCase();
};

const renderUserAvatar = (user, className = 'sn-avatar sn-avatar--xs') => (
	<div
		className={className}
		style={{
			backgroundImage: user?.avatar ? `url(${user.avatar})` : 'none',
			backgroundColor: user?.avatar ? 'transparent' : undefined,
		}}
	>
		{!user?.avatar && getUserInitials(user?.name || user?.label || '')}
	</div>
);

const TaskSidebarQuickFields = ({
	formData,
	onInputChange,
	statuses,
	priorityOptions,
	users,
	getStatusBadgeStyle,
	getPriorityBadgeStyle,
}) => (
	<div className="sn-task-sidebar__quick-fields">
		<div className="sn-task-sidebar__quick-field">
			<label className="sn-task-sidebar__quick-field-label">{__('Assign', 'analogwp-site-notes')}</label>
			<div className="sn-task-sidebar__quick-field-control">
				<FieldSelect
					value={formData.assignedUser}
					onChange={(value) => onInputChange('assignedUser', value)}
					placeholder={__('Select User', 'analogwp-site-notes')}
					clearable
					clearLabel={__('Unassigned', 'analogwp-site-notes')}
					options={users.map((user) => ({
						value: String(user.id),
						label: user.name,
						avatar: user.avatar,
						name: user.name,
					}))}
					renderLeading={(option) => renderUserAvatar(option)}
				/>
			</div>
		</div>

		<div className="sn-task-sidebar__quick-field">
			<label className="sn-task-sidebar__quick-field-label">{__('Status', 'analogwp-site-notes')}</label>
			<div className="sn-task-sidebar__quick-field-control">
				<BadgeSelect
					value={formData.status}
					onChange={(value) => onInputChange('status', value)}
					options={statuses.map((status) => ({
						value: status.key,
						label: status.title,
					}))}
					getOptionStyle={getStatusBadgeStyle}
				/>
			</div>
		</div>

		<div className="sn-task-sidebar__quick-field">
			<label className="sn-task-sidebar__quick-field-label">{__('Priority', 'analogwp-site-notes')}</label>
			<div className="sn-task-sidebar__quick-field-control">
				<BadgeSelect
					value={formData.priority}
					onChange={(value) => onInputChange('priority', value)}
					options={priorityOptions.map((priority) => ({
						value: priority.key,
						label: priority.name,
					}))}
					getOptionStyle={(value) => getPriorityBadgeStyle(value, priorityOptions)}
				/>
			</div>
		</div>
	</div>
);

export default TaskSidebarQuickFields;
