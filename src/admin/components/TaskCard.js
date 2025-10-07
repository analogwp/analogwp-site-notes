/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const TaskCard = ({ 
    comment, 
    user, 
    onStatusChange, 
    onDelete, 
    onEdit,
    onDragStart, 
    onCardClick,
    formatDate 
}) => {

    const getUserInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    const truncateText = (text, maxLength = 100) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div 
            className="cht-kanban-card relative pl-10! bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            draggable
            onDragStart={(e) => onDragStart(e, comment)}
            onClick={() => onCardClick && onCardClick(comment)}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                    <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: getPriorityColor(comment.priority) }}
                    />
					{/* ID - prominently displayed */}
					{comment.id && (
						<h4 className="text-gray-900 text-base font-medium my-0!">
							#{comment.id}
						</h4>
					)}
					{/* Title - prominently displayed */}
					{comment.comment_title && (
						<h4 className="text-gray-900 text-base font-medium my-0!">
							{comment.comment_title}
						</h4>
					)}
                </div>
                <div className="flex gap-1">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit && onEdit(comment);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors duration-200"
                        title={__('Edit', 'analogwp-client-handoff')}
                    >
                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708L4.5 15.207l-4 1a.5.5 0 0 1-.606-.606l1-4L12.146.146zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175l-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                        </svg>
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(comment.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors duration-200"
                        title={__('Delete', 'analogwp-client-handoff')}
                    >
                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5zM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11z"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div className="mb-4">
				{/* Comment Text - secondary display */}
				{comment.comment_text && (
					<div className="text-gray-600 text-sm my-2">
						{comment.comment_text.length > 100 
							? comment.comment_text.substring(0, 100) + '...' 
							: comment.comment_text}
					</div>
				)}
                
                {/* Hiding selector details as requested */}
                {/* {comment.element_selector && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono text-gray-600">
                        <code>{comment.element_selector}</code>
                    </div>
                )} */}
                
                {comment.page_url && (
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16" className="mr-1">
                            <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 0 1-.597-.933A9.268 9.268 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 2.472zM3.82 11a13.652 13.652 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0 0 13.745 12H11.91a9.27 9.27 0 0 1-.64 1.539 6.688 6.688 0 0 1-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 0 1-.312 2.5zm.312-3.5h2.49c-.062-.89-.291-1.733-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.024 7.024 0 0 0-3.072-2.472c.218.284.418.598.597.933zM10.855 4a7.966 7.966 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4h2.355z"/>
                        </svg>
                        <span className="truncate">{new URL(comment.page_url).pathname}</span>
                    </div>
                )}
            </div>
            
            <div className="border-t border-gray-100 pt-3">
                <div className="space-y-3">
                    <div className="flex flex-col">
                        <small className="text-xs text-gray-500 mb-1">{__('Added by', 'analogwp-client-handoff')}</small>
                        <div className="flex items-center">
                            <div 
                                className="w-6 h-6 rounded-full mr-2 flex items-center justify-center text-xs font-medium text-white"
                                style={{ 
                                    backgroundImage: user?.avatar ? `url(${user.avatar})` : 'none',
                                    backgroundColor: user?.avatar ? 'transparent' : '#6b7280',
																		backgroundSize: 'contain',
																		backgroundPosition: 'center',
																		backgroundRepeat: 'no-repeat'
                                }}
                            >
                                {!user?.avatar && getUserInitials(user?.name || 'Unknown')}
                            </div>
                            <span className="text-xs text-gray-700">
                                {user?.name || __('Unknown User', 'analogwp-client-handoff')}
                            </span>
                        </div>
                    </div>
                    {comment.assignee && (
                        <div className="flex flex-col">
                            <small className="text-xs text-gray-500 mb-1">{__('Assigned to', 'analogwp-client-handoff')}</small>
                            <div className="flex items-center">
                                <div 
                                    className="w-6 h-6 rounded-full mr-2 flex items-center justify-center text-xs font-medium text-white"
                                    style={{ 
                                        backgroundImage: comment.assignee?.avatar ? `url(${comment.assignee.avatar})` : 'none',
                                        backgroundColor: comment.assignee?.avatar ? 'transparent' : '#6b7280',
																				backgroundSize: 'contain',
																				backgroundPosition: 'center',
																				backgroundRepeat: 'no-repeat'
                                    }}
                                >
                                    {!comment.assignee?.avatar && getUserInitials(comment.assignee?.name || 'Unknown')}
                                </div>
                                <span className="text-xs text-gray-700">
                                    {comment.assignee?.name || __('Unknown User', 'analogwp-client-handoff')}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="text-xs text-gray-500 mt-3">
                    {formatDate(comment.created_at)}
                </div>
            </div>
        </div>
    );
};

export default TaskCard;