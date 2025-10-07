/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Select } from './ui';
import { useSettings } from './settings/SettingsProvider';

const TaskFilters = ({ filters, onFilterChange, sortBy, onSortChange, users }) => {
    const { categories } = useSettings();

    return (
        <div className="flex gap-3 items-center">
            <Select
                value={filters.status}
                onChange={(value) => onFilterChange({status: value})}
                options={[
                    { value: '', label: __('Filter by Status', 'analogwp-client-handoff') },
                    { value: 'open', label: __('Open', 'analogwp-client-handoff') },
                    { value: 'in_progress', label: __('In Progress', 'analogwp-client-handoff') },
                    { value: 'resolved', label: __('Resolved', 'analogwp-client-handoff') }
                ]}
            />
            
            <Select
                value={filters.user}
                onChange={(value) => onFilterChange({user: value})}
                options={[
                    { value: '', label: __('Filter by User', 'analogwp-client-handoff') },
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
                    { value: 'created_at', label: __('Sort by Date', 'analogwp-client-handoff') },
                    { value: 'updated_at', label: __('Sort by Updated', 'analogwp-client-handoff') },
                    { value: 'priority', label: __('Sort by Priority', 'analogwp-client-handoff') }
                ]}
            />
            
            <Select
                value={filters.category}
                onChange={(value) => onFilterChange({category: value})}
                options={[
                    { value: '', label: __('Filter by Category', 'analogwp-client-handoff') },
                    ...(categories && categories.length > 0 
                        ? categories.map(category => ({
                            value: category.name,
                            label: category.name
                        }))
                        : [{ value: '', label: __('No categories available', 'analogwp-client-handoff'), disabled: true }]
                    )
                ]}
            />
        </div>
    );
};

export default TaskFilters;