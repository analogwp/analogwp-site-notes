/**
 * Admin notes board UI.
 *
 * AJAX actions and URL params that form the public contract still use "task"
 * (e.g. agwp_sn_add_new_task, ?task=). Settings tab key task-priorities is also
 * left unchanged for bookmark/compat stability.
 */
export { default } from './NotesView';
export { default as NotesView } from './NotesView';
export { default as NotesKanbanView } from './NotesKanbanView';
export { default as NotesListView } from './NotesListView';
export { default as NoteCard } from './NoteCard';
export { default as NoteListItem } from './NoteListItem';
export { default as AddNoteSidebar } from './AddNoteSidebar';
export { default as ManageNoteSidebar } from './ManageNoteSidebar';
