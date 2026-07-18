/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ViewToggle from './ViewToggle';
import NoteFilters from './NoteFilters';

const NotesControls = ({
	activeView,
	onViewChange,
	filters,
	onFilterChange,
	sortBy,
	onSortChange,
	users
}) => {
	return (
		<div className="sn-notes-controls">
			<div className="sn-notes-controls__inner">
				<div className="sn-notes-controls__row">
					<ViewToggle
						activeView={activeView}
						onViewChange={onViewChange}
					/>

					<NoteFilters
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

export default NotesControls;
