/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import NoteListItem from './NoteListItem';
import AddNoteSidebar from './AddNoteSidebar';
import ManageNoteSidebar from './ManageNoteSidebar';
import NoteSidebarBackdropClose from './NoteSidebarBackdropClose';
import NotesControls from './NotesControls';

const NotesListView = ({
	comments,
	showAddModal,
	editingNote,
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
	handleSaveNote,
	handleUpdateNote,
	handleEditNote,
	liveEditingNote,
	onAddReply,
	onDeleteReply,
	pages,
	activeView,
	onNavigateToSettingsTab,
}) => {
	return (
		<>
			<NotesControls
				activeView={activeView}
				onViewChange={onViewChange}
				filters={filters}
				onFilterChange={onFilterChange}
				sortBy={sortBy}
				onSortChange={onSortChange}
				users={users}
			/>

			<div className="sn-notes-list">
				{comments.length === 0 ? (
					<div className="sn-notes-list__empty">
						{__('No notes found.', 'analogwp-site-notes')}
					</div>
				) : (
					comments.map((comment) => (
						<NoteListItem
							key={comment.id}
							comment={comment}
							onClick={handleEditNote}
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
								onDelete={onDelete}
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
		</>
	);
};

export default NotesListView;
