import React from 'react';
import classnames from 'classnames';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { __ } from '@wordpress/i18n';
import TaskCard from './TaskCard';
import TaskDetail from './TaskDetail';
import AddTaskSidebar from './AddTaskSidebar';
import ManageTaskSidebar from './ManageTaskSidebar';
import TaskSidebarBackdropClose from './TaskSidebarBackdropClose';
import TasksControls from './TasksControls';
import DroppableColumn from './DroppableColumn';
import { AddIcon } from '../../../shared/icons';
import StatusDot from '../../../shared/components/StatusDot';

const TasksKanbanView = ({
	selectedTask,
	onTaskDetailProps,
	sensors,
	activeId,
	draggedItem,
	handleDragStart,
	handleDragEnd,
	filters,
	onFilterChange,
	sortBy,
	onSortChange,
	users,
	statuses,
	priorities = [],
	getCommentsByStatus,
	getUserById,
	handleStatusChange,
	handleDelete,
	handleEditTask,
	handleCardClick,
	formatDate,
	handleAddNew,
	showAddModal,
	handleCloseModal,
	handleSaveTask,
	handleUpdateTask,
	liveEditingTask,
	onAddReply,
	onDeleteReply,
	pages,
	editingTask,
	activeView,
	onViewChange,
	onNavigateToSettingsTab,
}) => {
	return (
		<div>
			{selectedTask && (
				<TaskDetail
					{...onTaskDetailProps}
				/>
			)}

			{!selectedTask && (
				<DndContext
					sensors={sensors}
					onDragStart={handleDragStart}
					onDragEnd={handleDragEnd}
				>
					<TasksControls
						activeView={activeView}
						onViewChange={onViewChange}
						filters={filters}
						onFilterChange={onFilterChange}
						sortBy={sortBy}
						onSortChange={onSortChange}
						users={users}
					/>
					<div className="sn-kanban-board">
						{statuses.map(status => (
							<DroppableColumn key={status.key} id={status.key} status={status.key}>
								<div className="sn-kanban-column-header">
									<div className="sn-kanban-column-title">
										<StatusDot statusKey={status.key} size="md" />
										<span className="sn-kanban-column-name">{status.title}</span>
									</div>
									<div className="sn-kanban-column-count">
										{getCommentsByStatus(status.key).length}
									</div>
								</div>

								<div className="sn-kanban-cards">
									{getCommentsByStatus(status.key).map(comment => (
										<TaskCard
											key={comment.id}
											comment={comment}
											user={comment.user || getUserById(comment.user_id)}
											onDelete={handleDelete}
											onCardClick={handleEditTask}
											formatDate={formatDate}
										/>
									))}

									{status.key !== 'resolved' && (
										<button
											type="button"
											className="sn-kanban-add-btn"
											onClick={handleAddNew}
										>
											<AddIcon />
											<span className="sn-text-m sn-font-medium">{__('Add new', 'analogwp-site-notes')}</span>
										</button>
									)}
								</div>
							</DroppableColumn>
						))}
					</div>

					<DragOverlay>
						{activeId && draggedItem ? (
							<div className="sn-kanban-drag-overlay">
								<TaskCard
									comment={draggedItem}
									user={draggedItem.user || getUserById(draggedItem.user_id)}
									onDelete={() => {}}
									onCardClick={() => {}}
									formatDate={formatDate}
								/>
							</div>
						) : null}
					</DragOverlay>
				</DndContext>
			)}

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
								onDelete={handleDelete}
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
		</div>
	);
};

export default TasksKanbanView;
