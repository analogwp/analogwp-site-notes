/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { BadgeSelect, FieldSelect, FieldMultiSelect, FieldDate, FieldTime, parseTimeInput } from '../ui';
import { showToast } from '../ToastProvider';

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

const TaskSidebarDetailsFields = ({
	formData,
	onInputChange,
	statuses,
	priorityOptions,
	users,
	pages,
	categories,
	onAddTime,
	getStatusBadgeStyle,
	getPriorityBadgeStyle,
	onNavigateToSettingsTab,
	showDescription = true,
	hideQuickFields = false,
}) => {
	const [timeInput, setTimeInput] = useState('');

	const handleLogTime = () => {
		const parsed = parseTimeInput(timeInput);

		if (!parsed.valid) {
			showToast.error(__('Please enter time as HH:MM', 'analogwp-site-notes'));
			return;
		}

		onAddTime(parsed.hours, parsed.minutes);
		setTimeInput('');
	};

	const categoryOptions = categories.map((category) => ({
		value: category.name,
		label: category.name,
	}));

	return (
		<>
			{!hideQuickFields && (
				<>
					<div className="sn-task-sidebar__row">
						<label className="sn-task-sidebar__row-label">{__('Status', 'analogwp-site-notes')}</label>
						<div className="sn-task-sidebar__row-control">
							<div className="sn-task-sidebar__row-field">
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
					</div>

					<div className="sn-task-sidebar__row">
						<label className="sn-task-sidebar__row-label">{__('Priority', 'analogwp-site-notes')}</label>
						<div className="sn-task-sidebar__row-control">
							<div className="sn-task-sidebar__row-field">
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
							{onNavigateToSettingsTab && (
								<button
									type="button"
									className="sn-task-sidebar__field-link"
									onClick={() => onNavigateToSettingsTab('task-priorities')}
								>
									{__('Manage Priorities', 'analogwp-site-notes')}
								</button>
							)}
						</div>
					</div>

					<div className="sn-task-sidebar__row">
						<label className="sn-task-sidebar__row-label">{__('Assign', 'analogwp-site-notes')}</label>
						<div className="sn-task-sidebar__row-control">
							<div className="sn-task-sidebar__row-field">
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
					</div>
				</>
			)}

			<div className="sn-task-sidebar__row">
				<label className="sn-task-sidebar__row-label">{__('Category', 'analogwp-site-notes')}</label>
				<div className="sn-task-sidebar__row-control">
					<div className="sn-task-sidebar__row-field">
						<FieldMultiSelect
							value={formData.categories}
							onChange={(selected) => onInputChange('categories', selected)}
							placeholder={__('Select Category', 'analogwp-site-notes')}
							disabled={categoryOptions.length === 0}
							options={categoryOptions}
						/>
					</div>
					{onNavigateToSettingsTab && (
						<button
							type="button"
							className="sn-task-sidebar__field-link"
							onClick={() => onNavigateToSettingsTab('categories')}
						>
							{__('Manage Categories', 'analogwp-site-notes')}
						</button>
					)}
				</div>
			</div>

			<div className="sn-task-sidebar__row">
				<label className="sn-task-sidebar__row-label">{__('Page', 'analogwp-site-notes')}</label>
				<div className="sn-task-sidebar__row-control">
					<div className="sn-task-sidebar__row-field">
						<FieldSelect
							value={formData.pageId}
							onChange={(value) => onInputChange('pageId', value)}
							placeholder={__('Select Page', 'analogwp-site-notes')}
							disabled={pages.length === 0}
							options={pages.map((page) => ({
								value: String(page.id),
								label: page.title,
							}))}
						/>
					</div>
				</div>
			</div>

			<div className="sn-task-sidebar__row">
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

			<div className="sn-task-sidebar__row">
				<label className="sn-task-sidebar__row-label">{__('Add time', 'analogwp-site-notes')}</label>
				<div className="sn-task-sidebar__row-control">
					<div className="sn-task-sidebar__row-field">
						<div className="sn-task-sidebar__time-row">
							<FieldTime
								value={timeInput}
								onChange={setTimeInput}
								placeholder="HH:MM"
							/>
							<button
								type="button"
								className="sn-task-sidebar__time-log-btn"
								onClick={handleLogTime}
							>
								{__('Log', 'analogwp-site-notes')}
							</button>
						</div>
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
