/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import TaskListItem from './TaskListItem';
import AddTaskSidebar from './AddTaskSidebar';
import ManageTaskSidebar from './ManageTaskSidebar';
import TaskSidebarBackdropClose from './TaskSidebarBackdropClose';
import TasksControls from './TasksControls';

const TasksListView = ({
	comments,
	showAddModal,
	editingTask,
	onViewChange,
	filters,
	onFilterChange,
	sortBy,
	onSortChange,
	users,
	statuses,
	formatDate,
	onDelete,
	handleCloseModal,
	handleSaveTask,
	handleUpdateTask,
	handleEditTask,
	liveEditingTask,
	onAddReply,
	onDeleteReply,
	pages,
	activeView,
	onNavigateToSettingsTab,
}) => {
	return (
		<>
			<TasksControls
				activeView={activeView}
				onViewChange={onViewChange}
				filters={filters}
				onFilterChange={onFilterChange}
				sortBy={sortBy}
				onSortChange={onSortChange}
				users={users}
			/>

			<div className="sn-tasks-list">
				{comments.length === 0 ? (
					<div className="sn-tasks-list__empty">
						{__('No tasks found.', 'analogwp-site-notes')}
					</div>
				) : (
					comments.map((comment) => (
						<TaskListItem
							key={comment.id}
							comment={comment}
							onClick={handleEditTask}
							formatDate={formatDate}
						/>
					))
				)}
			</div>

			{showAddModal && (
				<>
					<div
						className="sn-kanban-sidebar-backdrop"
						onClick={handleCloseModal}
						role="presentation"
					/>

					<TaskSidebarBackdropClose
						onClose={handleCloseModal}
						isManage={Boolean(editingTask)}
					/>

					<div className={`sn-kanban-sidebar${editingTask ? ' sn-kanban-sidebar--manage' : ''}`}>
						{editingTask ? (
							<ManageTaskSidebar
								task={liveEditingTask || editingTask}
								onClose={handleCloseModal}
								onUpdate={handleUpdateTask}
								onDelete={onDelete}
								onAddReply={onAddReply}
								onDeleteReply={onDeleteReply}
								users={users}
								pages={pages || []}
								statuses={statuses}
								onNavigateToSettingsTab={onNavigateToSettingsTab}
							/>
						) : (
							<AddTaskSidebar
								onClose={handleCloseModal}
								onSave={handleSaveTask}
								users={users}
								pages={pages || []}
								statuses={statuses}
								onNavigateToSettingsTab={onNavigateToSettingsTab}
							/>
						)}
					</div>
				</>
			)}
		</>
	);
};

export default TasksListView;
