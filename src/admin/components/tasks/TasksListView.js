/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * dnd-kit dependencies
 */
import { DragOverlay } from '@dnd-kit/core';

/**
 * Internal dependencies
 */
import TaskCard from './TaskCard';
import TaskDetail from './TaskDetail';
import AddTaskModal from './AddTaskModal';
import TasksControls from './TasksControls';

const TasksListView = ({
    comments,
    selectedTask,
    onCardClick,
    showAddModal,
    editingTask,
    activeId,
    draggedItem,
    onViewChange,
    filters,
    onFilterChange,
    sortBy,
    onSortChange,
    users,
    statuses,
    priorities = [],
    getUserById,
    formatDate,
    onUpdateComment,
    onDelete,
    onBack,
    onCloseModal,
    onSaveTask,
    pages,
    handleStatusChange,
    handleEditTask,
    handleDelete,
    activeView
}) => {
    const getPriorityColor = (priority) => {
        const priorityObj = priorities.find(p => p.key === priority);
        if (priorityObj && priorityObj.color) {
            return priorityObj.color;
        }

        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    return (
        <>
            {selectedTask && (
                <TaskDetail
                    comment={selectedTask}
                    user={selectedTask.user || getUserById(selectedTask.user_id)}
                    users={users}
                    onStatusChange={(id, status) => onUpdateComment(id, { status })}
                    onPriorityChange={(id, priority) => onUpdateComment(id, { priority })}
                    onUpdateComment={onUpdateComment}
                    onDelete={onDelete}
                    onBack={onBack}
                    formatDate={formatDate}
                />
            )}

            {!selectedTask && (
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
                        <div className="sn-tasks-list__header">
                            <div className="sn-tasks-list__title">{__('All Tasks', 'analogwp-site-notes')}</div>
                            <div className="sn-tasks-list__subtitle">{comments.length} {__('tasks', 'analogwp-site-notes')}</div>
                        </div>
                        <div className="sn-divide-y">
                            {comments.map(comment => (
                                <div
                                    key={comment.id}
                                    className="sn-tasks-list__row"
                                    onClick={() => onCardClick(comment)}
                                >
                                    <div className="sn-tasks-list__row-inner">
                                        <div className="sn-tasks-list__row-main">
                                            <div
                                                className="sn-priority-dot-sm"
                                                style={{ backgroundColor: getPriorityColor(comment.priority) }}
                                            />
                                            <div className="sn-tasks-list__row-content">
                                                <div className="sn-tasks-list__row-title sn-truncate">{comment.comment_title}</div>
                                                <div className="sn-tasks-list__row-meta">
                                                    <span>
                                                        {(comment.user && comment.user.name) || getUserById(comment.user_id)?.name || __('Unknown User', 'analogwp-site-notes')}
                                                    </span>
                                                    <span>{formatDate(comment.created_at)}</span>
                                                    {comment.categories && comment.categories.length > 0 && (
                                                        <div className="sn-flex sn-flex-wrap sn-gap-1">
                                                            {comment.categories.map((category, index) => (
                                                                <span key={index} className="sn-badge sn-badge--default sn-badge--small">
                                                                    {category}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {comment.page_url && (
                                                        <span className="sn-truncate">{comment.page_url}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="sn-tasks-list__row-actions">
                                            <select
                                                value={comment.status}
                                                onChange={(e) => handleStatusChange(comment.id, e.target.value)}
                                                className="sn-tasks-list__status-select"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {statuses.map(status => (
                                                    <option key={status.key} value={status.key}>
                                                        {status.title}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditTask(comment);
                                                }}
                                                className="sn-icon-action"
                                                title={__('Edit', 'analogwp-site-notes')}
                                            >
                                                <svg className="sn-icon sn-icon--sm" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708L4.5 15.207l-4 1a.5.5 0 0 1-.606-.606l1-4L12.146.146zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175l-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(comment.id);
                                                }}
                                                className="sn-icon-action sn-icon-action--danger"
                                                title={__('Delete', 'analogwp-site-notes')}
                                            >
                                                <svg className="sn-icon sn-icon--sm" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5zM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11z"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {showAddModal && (
                <>
                    <div
                        className="sn-kanban-sidebar-backdrop"
                        onClick={onCloseModal}
                        role="presentation"
                    />

                    <div className="sn-kanban-sidebar">
                        <AddTaskModal
                            isOpen={true}
                            onClose={onCloseModal}
                            onSave={onSaveTask}
                            users={users}
                            pages={pages || []}
                            editTask={editingTask}
                            statuses={statuses}
                            isSidebar={true}
                        />
                    </div>
                </>
            )}

            <DragOverlay>
                {activeId ? (
                    <div
                        className="sn-tasks-list__drag-preview"
                        style={{ pointerEvents: 'none' }}
                    >
                        <TaskCard
                            comment={draggedItem}
                            onCardClick={() => {}}
                            onStatusChange={() => {}}
                            onEdit={() => {}}
                            onDelete={() => {}}
                            statuses={statuses}
                            priorities={priorities}
                            getUserById={getUserById}
                            formatDate={formatDate}
                            isDragging={false}
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </>
    );
};

export default TasksListView;
