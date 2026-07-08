/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ViewToggle from './ViewToggle';
import TaskFilters from './TaskFilters';

const TasksControls = ({
	activeView,
	onViewChange,
	filters,
	onFilterChange,
	sortBy,
	onSortChange,
	users
}) => {
	return (
		<div className="sn-tasks-controls">
			<div className="sn-tasks-controls__inner">
				<div className="sn-tasks-controls__row">
					<ViewToggle
						activeView={activeView}
						onViewChange={onViewChange}
					/>

					<TaskFilters
						filters={filters}
						onFilterChange={onFilterChange}
						sortBy={sortBy}
						onSortChange={onSortChange}
						users={users}
					/>
				</div>
			</div>
		</div>
	);
};

export default TasksControls;
