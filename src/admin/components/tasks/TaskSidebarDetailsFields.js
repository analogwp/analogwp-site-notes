/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
	CalendarIcon,
	ClockCircleIcon,
	CloseSmallIcon,
} from '../../../shared/icons';
import { BadgeSelect } from '../ui';

const TaskSidebarDetailsFields = ({
	formData,
	onInputChange,
	statuses,
	priorityOptions,
	users,
	pages,
	availableCategories,
	onCategorySelect,
	onCategoryToggle,
	onAddTime,
	getStatusBadgeStyle,
	getPriorityBadgeStyle,
}) => (
	<>
		<div className="sn-task-sidebar__row">
			<label className="sn-task-sidebar__row-label">{__('Status', 'analogwp-site-notes')}</label>
			<div className="sn-task-sidebar__row-control">
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

		<div className="sn-task-sidebar__row">
			<label className="sn-task-sidebar__row-label">{__('Priority', 'analogwp-site-notes')}</label>
			<div className="sn-task-sidebar__row-control">
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

		<div className="sn-task-sidebar__row">
			<label className="sn-task-sidebar__row-label">{__('Assign', 'analogwp-site-notes')}</label>
			<div className="sn-task-sidebar__row-control">
				<select
					value={formData.assignedUser}
					onChange={(e) => onInputChange('assignedUser', e.target.value)}
					className="sn-input sn-task-sidebar__select"
				>
					<option value="">{__('Select User', 'analogwp-site-notes')}</option>
					{users.map((user) => (
						<option key={user.id} value={user.id}>{user.name}</option>
					))}
				</select>
			</div>
		</div>

		<div className="sn-task-sidebar__row">
			<label className="sn-task-sidebar__row-label">{__('Category', 'analogwp-site-notes')}</label>
			<div className="sn-task-sidebar__row-control">
				<select
					value=""
					onChange={(e) => onCategorySelect(e.target.value)}
					className="sn-input sn-task-sidebar__select"
					disabled={availableCategories.length === 0}
				>
					<option value="">{__('Select Category', 'analogwp-site-notes')}</option>
					{availableCategories.map((category) => (
						<option key={category.id} value={category.name}>
							{category.name}
						</option>
					))}
				</select>
			</div>
		</div>

		{formData.categories.length > 0 && (
			<div className="sn-task-sidebar__category-tags">
				{formData.categories.map((categoryName, index) => (
					<span key={index} className="sn-tag-removable">
						{categoryName}
						<button
							type="button"
							onClick={() => onCategoryToggle(categoryName)}
							className="sn-tag-remove-btn"
						>
							<CloseSmallIcon size="sm" />
						</button>
					</span>
				))}
			</div>
		)}

		<div className="sn-task-sidebar__row">
			<label className="sn-task-sidebar__row-label">{__('Page', 'analogwp-site-notes')}</label>
			<div className="sn-task-sidebar__row-control">
				<select
					value={formData.pageId}
					onChange={(e) => onInputChange('pageId', e.target.value)}
					className="sn-input sn-task-sidebar__select"
				>
					<option value="">{__('Select Page', 'analogwp-site-notes')}</option>
					{pages.map((page) => (
						<option key={page.id} value={page.id}>{page.title}</option>
					))}
				</select>
			</div>
		</div>

		<div className="sn-task-sidebar__row">
			<label className="sn-task-sidebar__row-label">{__('Due Date', 'analogwp-site-notes')}</label>
			<div className="sn-task-sidebar__row-control">
				<div className="sn-task-sidebar__date-wrap">
					<input
						type="date"
						value={formData.dueDate}
						onChange={(e) => onInputChange('dueDate', e.target.value)}
						className="sn-input sn-task-sidebar__select"
					/>
					<CalendarIcon size="sm" className="sn-task-sidebar__date-icon" />
				</div>
			</div>
		</div>

		<div className="sn-task-sidebar__row">
			<label className="sn-task-sidebar__row-label">{__('Add time', 'analogwp-site-notes')}</label>
			<div className="sn-task-sidebar__row-control">
				<div className="sn-task-sidebar__time-row">
					<ClockCircleIcon size="sm" className="sn-text-secondary" />
					<input
						type="number"
						value={formData.timeHours}
						onChange={(e) => onInputChange('timeHours', e.target.value)}
						placeholder="HH"
						className="sn-input sn-task-sidebar__time-input"
						min="0"
						max="23"
					/>
					<span className="sn-text-m sn-text-secondary">/</span>
					<input
						type="number"
						value={formData.timeMinutes}
						onChange={(e) => onInputChange('timeMinutes', e.target.value)}
						placeholder="MM"
						className="sn-input sn-task-sidebar__time-input"
						min="0"
						max="59"
					/>
					<button
						type="button"
						className="sn-task-sidebar__time-add-btn"
						onClick={onAddTime}
					>
						{__('Add', 'analogwp-site-notes')}
					</button>
				</div>
			</div>
		</div>

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
	</>
);

export default TaskSidebarDetailsFields;
