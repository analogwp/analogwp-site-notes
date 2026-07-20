import React from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { __ } from '@wordpress/i18n';
import NoteCard from './NoteCard';
import AddNoteSidebar from './AddNoteSidebar';
import ManageNoteSidebar from './ManageNoteSidebar';
import NoteSidebarBackdropClose from './NoteSidebarBackdropClose';
import DroppableColumn from './DroppableColumn';
import NotesInfiniteScrollSentinel from './NotesInfiniteScrollSentinel';
import { AddIcon } from '../../../shared/icons';
import StatusDot from '../../../shared/components/StatusDot';

const NotesKanbanView = ({
	sensors,
	activeId,
	draggedItem,
	handleDragStart,
	handleDragEnd,
	users,
	statuses,
	getCommentsByStatus,
	getStatusTotal,
	getUserById,
	handleDelete,
	handleEditNote,
	formatDate,
	handleAddNew,
	showAddModal,
	handleCloseModal,
	handleSaveNote,
	handleUpdateNote,
	liveEditingNote,
	onAddReply,
	onDeleteReply,
	pages,
	editingNote,
	onNavigateToSettingsTab,
	pagination = {},
	loadingMore = {},
	onLoadMore,
}) => {
	return (
		<div>
			<DndContext
				sensors={sensors}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				<div className="sn-kanban-board">
					{statuses.map((status) => {
						const columnNotes = getCommentsByStatus(status.key);
						const hasMore = Boolean(pagination?.[status.key]?.hasMore);
						const isLoadingMore = Boolean(loadingMore?.[status.key]);

						return (
							<DroppableColumn key={status.key} id={status.key} status={status.key}>
								<div className="sn-kanban-column-header">
									<div className="sn-kanban-column-title">
										<StatusDot statusKey={status.key} size="md" />
										<span className="sn-kanban-column-name">{status.title}</span>
									</div>
									<div className="sn-kanban-column-count">
										{getStatusTotal(status.key)}
									</div>
								</div>

								<div className="sn-kanban-cards">
									{columnNotes.map((comment) => (
										<NoteCard
											key={comment.id}
											comment={comment}
											user={comment.user || comment.creator || getUserById(comment.user_id)}
											onDelete={handleDelete}
											onCardClick={handleEditNote}
											formatDate={formatDate}
										/>
									))}

									<NotesInfiniteScrollSentinel
										enabled={hasMore}
										loading={isLoadingMore}
										onLoadMore={() => onLoadMore?.(status.key)}
									/>

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
						);
					})}
				</div>

				<DragOverlay>
					{activeId && draggedItem ? (
						<div className="sn-kanban-drag-overlay">
							<NoteCard
								comment={draggedItem}
								user={draggedItem.user || draggedItem.creator || getUserById(draggedItem.user_id)}
								onDelete={() => {}}
								onCardClick={() => {}}
								formatDate={formatDate}
							/>
						</div>
					) : null}
				</DragOverlay>
			</DndContext>

			{showAddModal && (
				<>
					<div
						className="sn-kanban-sidebar-backdrop"
						onClick={handleCloseModal}
						role="presentation"
					/>

					<NoteSidebarBackdropClose
						onClose={handleCloseModal}
						isManage={Boolean(editingNote)}
					/>

					<div className={`sn-kanban-sidebar${editingNote ? ' sn-kanban-sidebar--manage' : ''}`}>
						{editingNote ? (
							<ManageNoteSidebar
								note={liveEditingNote || editingNote}
								onClose={handleCloseModal}
								onUpdate={handleUpdateNote}
								onDelete={handleDelete}
								onAddReply={onAddReply}
								onDeleteReply={onDeleteReply}
								users={users}
								pages={pages || []}
								statuses={statuses}
								onNavigateToSettingsTab={onNavigateToSettingsTab}
							/>
						) : (
							<AddNoteSidebar
								onClose={handleCloseModal}
								onSave={handleSaveNote}
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

export default NotesKanbanView;
