/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import TaskCard from './TaskCard';
import TaskDetail from './TaskDetail';
import AddTaskModal from './AddTaskModal';

const TasksKanban = ({ comments, onStatusChange, onDelete, onAddTask, users, view, pages }) => {
    const [draggedItem, setDraggedItem] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const handleAddNew = () => {
        setShowAddModal(true);
    };

    const handleSaveTask = async (taskData) => {
        if (onAddTask) {
            await onAddTask(taskData);
        }
        setShowAddModal(false);
    };

    const statuses = [
        { 
            key: 'open', 
            title: __('Todo', 'client-handoff-toolkit'),
            color: '#f59e0b',
            icon: '📋'
        },
        { 
            key: 'in_progress', 
            title: __('In Progress', 'client-handoff-toolkit'),
            color: '#3b82f6',
            icon: '⏳'
        },
        { 
            key: 'resolved', 
            title: __('Completed', 'client-handoff-toolkit'),
            color: '#10b981',
            icon: '✅'
        }
    ];

    const getCommentsByStatus = (status) => {
        return comments.filter(comment => comment.status === status);
    };

    const getUserById = (userId) => {
        return users.find(user => user.id === parseInt(userId));
    };

    const handleDragStart = (e, comment) => {
        setDraggedItem(comment);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, newStatus) => {
        e.preventDefault();
        if (draggedItem && draggedItem.status !== newStatus) {
            onStatusChange(draggedItem.id, newStatus);
        }
        setDraggedItem(null);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    const handleCardClick = (comment) => {
        setSelectedTask(comment);
    };

    const handleBackToList = () => {
        setSelectedTask(null);
    };

    // Show detail view if a task is selected
    if (selectedTask) {
        return (
            <TaskDetail
                comment={selectedTask}
                user={getUserById(selectedTask.user_id)}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
                onBack={handleBackToList}
                formatDate={formatDate}
            />
        );
    }

    // Render add task modal
    const renderAddTaskModal = () => (
        <AddTaskModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSave={handleSaveTask}
            users={users}
            pages={pages || []}
        />
    );

    if (view === 'list') {
        return (
            <div className="cht-tasks-list">
                <div className="cht-list-header">
                    <div className="cht-list-title">{__('All Tasks', 'client-handoff-toolkit')}</div>
                    <div className="cht-list-count">{comments.length} {__('tasks', 'client-handoff-toolkit')}</div>
                </div>
                <div className="cht-list-content">
                    {comments.map(comment => (
                        <div 
                            key={comment.id} 
                            className="cht-list-item"
                            onClick={() => handleCardClick(comment)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="cht-list-status">
                                <span className={`cht-status-badge cht-status-${comment.status}`}>
                                    {statuses.find(s => s.key === comment.status)?.icon}
                                </span>
                            </div>
                            <div className="cht-list-content-area">
                                <div className="cht-list-title">{comment.comment_text}</div>
                                <div className="cht-list-meta">
                                    <span className="cht-list-user">
                                        {getUserById(comment.user_id)?.name || __('Unknown User', 'client-handoff-toolkit')}
                                    </span>
                                    <span className="cht-list-date">{formatDate(comment.created_at)}</span>
                                    {comment.page_url && (
                                        <span className="cht-list-page">{comment.page_url}</span>
                                    )}
                                </div>
                            </div>
                            <div className="cht-list-actions">
                                <select 
                                    value={comment.status}
                                    onChange={(e) => onStatusChange(comment.id, e.target.value)}
                                    className="cht-status-select"
                                >
                                    {statuses.map(status => (
                                        <option key={status.key} value={status.key}>
                                            {status.title}
                                        </option>
                                    ))}
                                </select>
                                <button 
                                    onClick={() => onDelete(comment.id)}
                                    className="cht-delete-btn"
                                    title={__('Delete', 'client-handoff-toolkit')}
                                >
                                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5zM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="cht-kanban-board">
            {statuses.map(status => (
                <div 
                    key={status.key}
                    className="cht-kanban-column"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, status.key)}
                >
                    <div className="cht-column-header">
                        <div className="cht-column-title">
                            <span className="cht-column-icon" style={{ color: status.color }}>
                                {status.icon}
                            </span>
                            <span className="cht-column-text">{status.title}</span>
                        </div>
                        <div className="cht-column-count">
                            {getCommentsByStatus(status.key).length}
                        </div>
                    </div>
                    
                    <div className="cht-column-content">
                        {getCommentsByStatus(status.key).map(comment => (
                            <TaskCard
                                key={comment.id}
                                comment={comment}
                                user={getUserById(comment.user_id)}
                                onStatusChange={onStatusChange}
                                onDelete={onDelete}
                                onDragStart={handleDragStart}
                                onCardClick={handleCardClick}
                                formatDate={formatDate}
                            />
                        ))}
                        
                        {status.key !== 'resolved' && (
                            <button 
                                className="cht-add-task-btn"
                                onClick={handleAddNew}
                            >
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                </svg>
                                {__('Add new', 'client-handoff-toolkit')}
                            </button>
                        )}
                    </div>
                </div>
            ))}
            {renderAddTaskModal()}
        </div>
    );
};

export default TasksKanban;