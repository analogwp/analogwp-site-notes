/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Select } from '../ui';
import { useSettings } from '../settings/SettingsProvider';
import { TASK_STATUSES } from '../../constants/taskStatuses';

const TaskFilters = ({ filters, onFilterChange, sortBy, onSortChange, users }) => {
	const { categories } = useSettings();

	return (
		<div className="sn-task-filters">
			<Select
				value={filters.status}
				onChange={(value) => onFilterChange({ status: value })}
				options={[
					{ value: '', label: __('Filter by Status', 'analogwp-site-notes') },
					...TASK_STATUSES.map(status => ({
						value: status.key,
						label: status.title
					}))
				]}
			/>

			<Select
				value={filters.user}
				onChange={(value) => onFilterChange({ user: value })}
				options={[
					{ value: '', label: __('Filter by User', 'analogwp-site-notes') },
					...users.map(user => ({
						value: user.id.toString(),
						label: user.name
					}))
				]}
			/>

			<Select
				value={sortBy}
				onChange={(value) => onSortChange(value)}
				options={[
					{ value: 'created_at', label: __('Sort by Date', 'analogwp-site-notes') },
					{ value: 'updated_at', label: __('Sort by Updated', 'analogwp-site-notes') },
					{ value: 'priority', label: __('Sort by Priority', 'analogwp-site-notes') }
				]}
			/>

			<Select
				value={filters.category}
				onChange={(value) => onFilterChange({ category: value })}
				options={[
					{ value: '', label: __('Filter by Category', 'analogwp-site-notes') },
					...(categories && categories.length > 0
						? categories.map(category => ({
							value: category.name,
							label: category.name
						}))
						: [{ value: '', label: __('No categories available', 'analogwp-site-notes'), disabled: true }]
					)
				]}
			/>
		</div>
	);
};

export default TaskFilters;
