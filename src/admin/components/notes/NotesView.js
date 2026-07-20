/**
 * WordPress dependencies
 */
import { useState, useCallback } from '@wordpress/element';

/**
 * dnd-kit dependencies
 */
import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

/**
 * Internal dependencies
 */
import NotesListView from './NotesListView';
import NotesKanbanView from './NotesKanbanView';
import { NOTE_STATUSES } from '../../constants/noteStatuses';

const NotesView = ({
	comments,
	onUpdateComment,
	onAddReply,
	onDeleteReply,
	onDelete,
	onAddNote,
	users,
	pages,
	activeView = 'kanban',
	onViewChange,
	filters,
	onFilterChange,
	sortBy,
	onSortChange,
	onNavigateToSettingsTab,
	pagination = {},
	loadingMore = {},
	onLoadMore,
	notesPerLoad = 10,
}) => {
	const [draggedItem, setDraggedItem] = useState(null);
	const [activeId, setActiveId] = useState(null);
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingNote, setEditingNote] = useState(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		})
	);

	const handleAddNew = () => {
		setEditingNote(null);
		setShowAddModal(true);
	};

	const handleEditNote = (note) => {
		setEditingNote(note);
		setShowAddModal(true);
	};

	const handleCloseModal = () => {
		setShowAddModal(false);
		setEditingNote(null);
	};

	const handleSaveNote = async (taskData) => {
		if (editingNote) {
			if (onUpdateComment) {
				await onUpdateComment(editingNote.id, taskData);
			}
		} else if (onAddNote) {
			await onAddNote(taskData);
		}

		handleCloseModal();
	};

	const handleUpdateNote = useCallback(async (taskData, options = {}) => {
		if (!editingNote || !onUpdateComment) {
			return false;
		}

		return onUpdateComment(editingNote.id, taskData, options);
	}, [editingNote, onUpdateComment]);

	const liveEditingNote = editingNote
		? comments.find((comment) => String(comment.id) === String(editingNote.id)) || editingNote
		: null;

	const handleDelete = (id) => {
		if (onDelete) {
			onDelete(id);
		}
	};

	const getCommentsByStatus = (status) => {
		return comments.filter((comment) => comment.status === status);
	};

	const getStatusTotal = (status) => {
		return pagination?.[status]?.total ?? getCommentsByStatus(status).length;
	};

	const getUserById = (userId) => {
		return users.find((user) => user.id === parseInt(userId, 10));
	};

	const handleDragStart = (event) => {
		const { active } = event;
		setActiveId(active.id);
		setDraggedItem(active.data.current?.comment);
	};

	const handleDragEnd = (event) => {
		const { active, over } = event;

		setActiveId(null);
		setDraggedItem(null);

		if (!over) {
			return;
		}

		const comment = active.data.current?.comment;
		const newStatus = over.data.current?.status;

		if (comment && newStatus && comment.status !== newStatus) {
			onUpdateComment(comment.id, { status: newStatus });
		}
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		}).format(date);
	};

	const commonProps = {
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
		statuses: NOTE_STATUSES,
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
		comments,
		activeView,
		onViewChange,
		onNavigateToSettingsTab,
		pagination,
		loadingMore,
		onLoadMore,
		notesPerLoad,
	};

	if (activeView === 'list') {
		return <NotesListView {...commonProps} />;
	}

	return <NotesKanbanView {...commonProps} />;
};

export default NotesView;
