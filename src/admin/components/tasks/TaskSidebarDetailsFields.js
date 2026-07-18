/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { SidebarSelect, SidebarMultiSelect, FieldDate } from '../ui';
import { buildUserSelectOptions } from './taskSidebarUtils';
import PageTargetSelect from './PageTargetSelect';

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

const renderUserPill = (user) => (
	<span className="sn-sidebar-field__user-pill">
		{renderUserAvatar(user)}
		<span className="sn-sidebar-field__user-pill-name">{user.label}</span>
	</span>
);

const TaskSidebarDetailsFields = ({
	formData,
	onInputChange,
	onPageChange,
	statuses,
	priorityOptions,
	users,
	pages,
	categories,
	getStatusBadgeStyle,
	getPriorityBadgeStyle,
	onNavigateToSettingsTab,
	showDescription = true,
	hideQuickFields = false,
}) => {
	const categoryOptions = categories.map((category) => ({
		value: category.name,
		label: category.name,
	}));
	const userOptions = buildUserSelectOptions(users);

	const handlePageChange = (target) => {
		if (onPageChange) {
			onPageChange(target);
			return;
		}

		onInputChange('pageId', target.pageId);
		onInputChange('pageUrl', target.pageUrl);
	};

	return (
		<>
			{!hideQuickFields && (
				<>
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
						footerLink={onNavigateToSettingsTab && (
							<button
								type="button"
								className="sn-task-sidebar__field-link"
								onClick={() => onNavigateToSettingsTab('task-priorities')}
							>
								{__('Manage Priorities', 'analogwp-site-notes')}
							</button>
						)}
					/>
				</>
			)}

			<SidebarMultiSelect
				label={__('Assignees', 'analogwp-site-notes')}
				emptyText={__('No one assigned', 'analogwp-site-notes')}
				value={formData.assignedUsers}
				onChange={(value) => onInputChange('assignedUsers', value)}
				options={userOptions}
				renderOptionLeading={(option) => renderUserAvatar(option)}
				renderPill={renderUserPill}
			/>

			<SidebarMultiSelect
				label={__('Categories', 'analogwp-site-notes')}
				emptyText={__('No categories', 'analogwp-site-notes')}
				value={formData.categories}
				onChange={(selected) => onInputChange('categories', selected)}
				disabled={categoryOptions.length === 0}
				options={categoryOptions}
				footerLink={onNavigateToSettingsTab && (
					<button
						type="button"
						className="sn-task-sidebar__field-link"
						onClick={() => onNavigateToSettingsTab('categories')}
					>
						{__('Manage Categories', 'analogwp-site-notes')}
					</button>
				)}
			/>

			<PageTargetSelect
				value={formData.pageId}
				pageUrl={formData.pageUrl}
				specialPages={pages}
				onChange={handlePageChange}
			/>

			<div className="sn-task-sidebar__row sn-task-sidebar__row--spaced">
				<label className="sn-task-sidebar__row-label">{__('Due Date', 'analogwp-site-notes')}</label>
				<div className="sn-task-sidebar__row-control">
					<div className="sn-task-sidebar__row-field">
						<FieldDate
							value={formData.dueDate}
							onChange={(value) => onInputChange('dueDate', value)}
							placeholder={__('Select date', 'analogwp-site-notes')}
						/>
					</div>
				</div>
			</div>

			{showDescription && (
				<div className="sn-task-sidebar__description">
					<label className="sn-task-sidebar__description-label">
						{__('Description', 'analogwp-site-notes')}
					</label>
					<textarea
						value={formData.description}
						onChange={(e) => onInputChange('description', e.target.value)}
						placeholder={__('Add a task description here (optional)', 'analogwp-site-notes')}
						className="sn-input sn-task-sidebar__description-input"
						rows="4"
					/>
				</div>
			)}
		</>
	);
};

export default TaskSidebarDetailsFields;
