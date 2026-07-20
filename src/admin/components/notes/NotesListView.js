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
import NotesInfiniteScrollSentinel from './NotesInfiniteScrollSentinel';

const NotesListView = ({
	comments,
	showAddModal,
	editingNote,
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
	onNavigateToSettingsTab,
	pagination = {},
	loadingMore = {},
	onLoadMore,
}) => {
	const hasMore = Boolean(pagination?.list?.hasMore);
	const isLoadingMore = Boolean(loadingMore?.list);

	return (
		<>
			<div className="sn-notes-list">
				{comments.length === 0 && !isLoadingMore ? (
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

				<NotesInfiniteScrollSentinel
					enabled={hasMore}
					loading={isLoadingMore}
					onLoadMore={() => onLoadMore?.()}
					className="sn-notes-list__infinite-scroll"
				/>
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
