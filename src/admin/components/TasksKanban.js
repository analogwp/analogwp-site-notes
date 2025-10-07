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
import TasksControls from './TasksControls';

const TasksKanban = ({ 
    comments, 
    onUpdateComment, 
    onDelete, 
    onAddTask, 
    users, 
    categories, 
    pages, 
    onAddComment, 
    activeView = 'kanban',
    onViewChange,
    filters,
    onFilterChange,
    sortBy,
    onSortChange
}) => {
    const [draggedItem, setDraggedItem] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const handleAddNew = () => {
        setEditingTask(null);
        setShowAddModal(true);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setShowAddModal(true);
    };

    const handleSaveTask = async (taskData) => {
        if (editingTask) {
            // Update existing task
            if (onUpdateComment) {
                await onUpdateComment(editingTask.id, taskData);
            }
        } else {
            // Create new task
            if (onAddTask) {
                await onAddTask(taskData);
            }
        }
        setShowAddModal(false);
        setEditingTask(null);
    };

    const handleStatusChange = (id, status) => {
        if (onUpdateComment) {
            onUpdateComment(id, { status });
        }
    };

    const handleDelete = (id) => {
        if (onDelete) {
            onDelete(id);
        }
    };

    const statuses = [
        { 
            key: 'open', 
            title: __('Open', 'analogwp-client-handoff'),
            color: '#f59e0b',
            icon: '📋'
        },
        { 
            key: 'in_progress', 
            title: __('In Progress', 'analogwp-client-handoff'),
            color: '#3b82f6',
            icon: '⏳'
        },
        { 
            key: 'resolved', 
            title: __('Resolved', 'analogwp-client-handoff'),
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
            onUpdateComment(draggedItem.id, { status: newStatus });
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

    const handleDeleteAndClose = async (id) => {
        if (onDelete) {
            await onDelete(id);
            // Close the detail view after successful deletion
            setSelectedTask(null);
        }
    };

    const handleBackToList = () => {
        setSelectedTask(null);
    };

    if (activeView === 'list') {
        return (
            <>
                {/* Task Detail View - Full Page for List View */}
                {selectedTask && (
                    <TaskDetail
                        comment={selectedTask}
                        user={selectedTask.user || getUserById(selectedTask.user_id)}
                        onStatusChange={(id, status) => onUpdateComment(id, { status })}
                        onPriorityChange={(id, priority) => onUpdateComment(id, { priority })}
                        onUpdateComment={onUpdateComment}
                        onDelete={handleDeleteAndClose}
                        onBack={handleBackToList}
                        formatDate={formatDate}
                    />
                )}

                {/* List View - only show when no task is selected */}
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
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div className="text-lg font-semibold text-gray-900">{__('All Tasks', 'analogwp-client-handoff')}</div>
                            <div className="text-sm text-gray-500">{comments.length} {__('tasks', 'analogwp-client-handoff')}</div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {comments.map(comment => (
                                <div 
                                    key={comment.id} 
                                    className="p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                                    onClick={() => handleCardClick(comment)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3 flex-1">
                                            <span className="text-lg">
                                                {statuses.find(s => s.key === comment.status)?.icon}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">{comment.comment_text}</div>
                                                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                                    <span>
                                                        {(comment.user && comment.user.name) || getUserById(comment.user_id)?.name || __('Unknown User', 'analogwp-client-handoff')}
                                                    </span>
                                                    <span>{formatDate(comment.created_at)}</span>
                                                    {comment.page_url && (
                                                        <span className="truncate max-w-48">{comment.page_url}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                            <select 
                                                value={comment.status}
                                                onChange={(e) => handleStatusChange(comment.id, e.target.value)}
                                                className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {statuses.map(status => (
                                                    <option key={status.key} value={status.key}>
                                                        {status.title}
                                                    </option>
                                                ))}
                                            </select>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditTask(comment);
                                                }}
                                                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors duration-200"
                                                title={__('Edit', 'analogwp-client-handoff')}
                                            >
                                                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708L4.5 15.207l-4 1a.5.5 0 0 1-.606-.606l1-4L12.146.146zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175l-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(comment.id);
                                                }}
                                                className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors duration-200"
                                                title={__('Delete', 'analogwp-client-handoff')}
                                            >
                                                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
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

                {/* Add/Edit Task Sidebar for List View */}
                {showAddModal && (
                    <>
                        {/* Backdrop */}
                        <div 
                            className="fixed inset-0 bg-transparent z-40"
                            onClick={() => {
                                setShowAddModal(false);
                                setEditingTask(null);
                            }}
                        />
                        
                        {/* Sidebar */}
                        <div className="fixed top-[32px] right-0 w-96 h-[calc(100vh-32px)] bg-white shadow-xl z-50 overflow-y-auto">
                            <AddTaskModal
                                isOpen={true}
                                onClose={() => {
                                    setShowAddModal(false);
                                    setEditingTask(null);
                                }}
                                onSave={handleSaveTask}
                                users={users}
                                pages={pages || []}
                                editTask={editingTask}
                                statuses={statuses}
                                isSidebar={true}
                            />
                        </div>
                    </>
                )}
            </>
        );
    }

    return (
        <div>
            {/* Task Detail View - Full Page */}
            {selectedTask && (
                <TaskDetail
                    comment={selectedTask}
                    user={selectedTask.user || getUserById(selectedTask.user_id)}
                    onStatusChange={(id, status) => onUpdateComment(id, { status })}
                    onPriorityChange={(id, priority) => onUpdateComment(id, { priority })}
                    onUpdateComment={onUpdateComment}
                    onDelete={handleDeleteAndClose}
                    onBack={handleBackToList}
                    formatDate={formatDate}
                />
            )}

            {/* Main Kanban Board */}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {statuses.map(status => (
                        <div 
                            key={status.key}
                            className="bg-gray-50 rounded-lg p-4 min-h-96"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, status.key)}
                        >
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                                <div className="flex items-center space-x-2">
                                    <span className="text-lg" style={{ color: status.color }}>
                                        {status.icon}
                                    </span>
                                    <span className="font-semibold text-gray-900">{status.title}</span>
                                </div>
                                <div className="bg-white text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                                    {getCommentsByStatus(status.key).length}
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                {getCommentsByStatus(status.key).map(comment => (
                                    <TaskCard
                                        key={comment.id}
                                        comment={comment}
                                        user={comment.user || getUserById(comment.user_id)}
                                        onStatusChange={handleStatusChange}
                                        onDelete={handleDelete}
                                        onEdit={handleEditTask}
                                        onDragStart={handleDragStart}
                                        onCardClick={handleCardClick}
                                        formatDate={formatDate}
                                    />
                                ))}
                                
                                {status.key !== 'resolved' && (
                                    <button 
                                        className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors duration-200"
                                        onClick={handleAddNew}
                                    >
                                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                        </svg>
                                        <span className="text-sm font-medium">{__('Add new', 'analogwp-client-handoff')}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                </>
            )}

            {/* Add/Edit Task Sidebar */}
            {showAddModal && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-transparent z-40"
                        onClick={() => {
                            setShowAddModal(false);
                            setEditingTask(null);
                        }}
                    />
                    
                    {/* Sidebar */}
                    <div className="fixed top-[32px] right-0 w-96 h-[calc(100vh-32px)] bg-white shadow-xl z-50 overflow-y-auto">
                        <AddTaskModal
                            isOpen={true}
                            onClose={() => {
                                setShowAddModal(false);
                                setEditingTask(null);
                            }}
                            onSave={handleSaveTask}
                            users={users}
                            pages={pages || []}
                            editTask={editingTask}
                            statuses={statuses}
                            isSidebar={true}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default TasksKanban;