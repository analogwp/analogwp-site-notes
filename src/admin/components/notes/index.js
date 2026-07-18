/**
 * Admin notes board UI.
 *
 * Deep-link URL param (?task=) and settings tab key (task-priorities) stay
 * unchanged for bookmark/compat stability. AJAX uses agwp_sn_add_new_note.
 */
export { default } from './NotesView';
export { default as NotesView } from './NotesView';
export { default as NotesKanbanView } from './NotesKanbanView';
export { default as NotesListView } from './NotesListView';
export { default as NoteCard } from './NoteCard';
export { default as NoteListItem } from './NoteListItem';
export { default as AddNoteSidebar } from './AddNoteSidebar';
export { default as ManageNoteSidebar } from './ManageNoteSidebar';
