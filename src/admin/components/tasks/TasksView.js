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
import TasksListView from './TasksListView';
import TasksKanbanView from './TasksKanbanView';
import { TASK_STATUSES } from '../../constants/taskStatuses';

const TasksView = ({
	comments,
	onUpdateComment,
	onAddReply,
	onDeleteReply,
	onDelete,
	onAddTask,
	users,
	pages,
	activeView = 'kanban',
	onViewChange,
	filters,
	onFilterChange,
	sortBy,
	onSortChange,
	onNavigateToSettingsTab,
}) => {
	const [draggedItem, setDraggedItem] = useState(null);
	const [activeId, setActiveId] = useState(null);
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingTask, setEditingTask] = useState(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		})
	);

	const handleAddNew = () => {
		setEditingTask(null);
		setShowAddModal(true);
	};

	const handleEditTask = (task) => {
		setEditingTask(task);
		setShowAddModal(true);
	};

	const handleCloseModal = () => {
		setShowAddModal(false);
		setEditingTask(null);
	};

	const handleSaveTask = async (taskData) => {
		if (editingTask) {
			if (onUpdateComment) {
				await onUpdateComment(editingTask.id, taskData);
			}
		} else if (onAddTask) {
			await onAddTask(taskData);
		}

		handleCloseModal();
	};

	const handleUpdateTask = useCallback(async (taskData, options = {}) => {
		if (!editingTask || !onUpdateComment) {
			return false;
		}

		return onUpdateComment(editingTask.id, taskData, options);
	}, [editingTask, onUpdateComment]);

	const liveEditingTask = editingTask
		? comments.find((comment) => String(comment.id) === String(editingTask.id)) || editingTask
		: null;

	const handleDelete = (id) => {
		if (onDelete) {
			onDelete(id);
		}
	};

	const getCommentsByStatus = (status) => {
		return comments.filter((comment) => comment.status === status);
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
		statuses: TASK_STATUSES,
		getCommentsByStatus,
		getUserById,
		handleDelete,
		handleEditTask,
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
		comments,
		activeView,
		onViewChange,
		onNavigateToSettingsTab,
	};

	if (activeView === 'list') {
		return <TasksListView {...commonProps} />;
	}

	return <TasksKanbanView {...commonProps} />;
};

export default TasksView;
