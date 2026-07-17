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
import AddTaskSidebar from './AddTaskSidebar';
import ManageTaskSidebar from './ManageTaskSidebar';
import TaskSidebarBackdropClose from './TaskSidebarBackdropClose';
import TasksControls from './TasksControls';
import { TrashOutlineIcon, EditIcon } from '../../../shared/icons';

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
    handleUpdateTask,
    liveEditingTask,
    onAddReply,
    onDeleteReply,
    pages,
    handleStatusChange,
    handleEditTask,
    handleDelete,
    activeView,
    onNavigateToSettingsTab,
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
                                                <EditIcon size="sm" />
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
                                                <TrashOutlineIcon size="sm" />
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

                    <TaskSidebarBackdropClose
                        onClose={onCloseModal}
                        isManage={Boolean(editingTask)}
                    />

                    <div className={`sn-kanban-sidebar${editingTask ? ' sn-kanban-sidebar--manage' : ''}`}>
                        {editingTask ? (
                            <ManageTaskSidebar
                                task={liveEditingTask || editingTask}
                                onClose={onCloseModal}
                                onUpdate={handleUpdateTask}
                                onDelete={onDelete}
                                onAddReply={onAddReply}
                                onDeleteReply={onDeleteReply}
                                users={users}
                                pages={pages || []}
                                statuses={statuses}
                                onNavigateToSettingsTab={onNavigateToSettingsTab}
                            />
                        ) : (
                            <AddTaskSidebar
                                onClose={onCloseModal}
                                onSave={onSaveTask}
                                users={users}
                                pages={pages || []}
                                statuses={statuses}
                                onNavigateToSettingsTab={onNavigateToSettingsTab}
                            />
                        )}
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
                            user={draggedItem?.user || getUserById(draggedItem?.user_id)}
                            onCardClick={() => {}}
                            onDelete={() => {}}
                            formatDate={formatDate}
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </>
    );
};

export default TasksListView;
