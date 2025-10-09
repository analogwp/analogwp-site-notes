/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Button } from '../ui';
import { showConfirmation, showToast } from '../ToastProvider';
import { TASK_STATUSES, getStatusByKey } from '../../constants/taskStatuses';
import { useSettings } from '../settings/SettingsProvider';

const TaskDetail = ({ 
    comment, 
    user, 
    users = [],
    onStatusChange, 
    onDelete, 
    onBack,
    onPriorityChange,
    onUpdateComment,
    formatDate
}) => {
    const { priorities } = useSettings();
    const [status, setStatus] = useState(comment.status);
    const [priority, setPriority] = useState(comment.priority || 'medium');
    const [isUpdating, setIsUpdating] = useState(false);
    const [editingTitle, setEditingTitle] = useState(false);
    const [editingText, setEditingText] = useState(false);
    const [tempTitle, setTempTitle] = useState(comment.comment_title || '');
    const [tempText, setTempText] = useState(comment.comment_text || '');
    // Initialize timesheet from comment data or empty array
    const [timeEntries, setTimeEntries] = useState(() => {
        try {
            return comment.timesheet ? JSON.parse(comment.timesheet) : [];
        } catch {
            return [];
        }
    });
    const [newTimeEntry, setNewTimeEntry] = useState({ hours: '', minutes: '', description: '' });

    // Update local state when comment changes (e.g., navigating between tasks)
    useEffect(() => {
        setStatus(comment.status);
        setPriority(comment.priority || 'medium');
        setTempTitle(comment.comment_title || '');
        setTempText(comment.comment_text || '');
        setEditingTitle(false);
        setEditingText(false);
        try {
            setTimeEntries(comment.timesheet ? JSON.parse(comment.timesheet) : []);
        } catch {
            setTimeEntries([]);
        }
    }, [comment.id, comment.status, comment.priority, comment.timesheet, comment.comment_title, comment.comment_text]);

    const getUserInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
    };

    const getPriorityColor = (priority) => {
        // Find priority in the priorities array from settings
        const priorityObj = priorities.find(p => p.key === priority);
        if (priorityObj && priorityObj.color) {
            return priorityObj.color;
        }
        
        // Fallback to hardcoded colors if not found in settings
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getStatusLabel = (status) => {
        const statusObj = getStatusByKey(status);
        return statusObj ? statusObj.title : status;
    };

    const getStatusIcon = (status) => {
        const statusObj = getStatusByKey(status);
        return statusObj ? statusObj.icon : '📋';
    };

    const handleStatusChange = async (newStatus) => {
        setIsUpdating(true);
        try {
            await onStatusChange(comment.id, newStatus);
            setStatus(newStatus);
        } catch (error) {
            console.error('Failed to update status:', error);
        }
        setIsUpdating(false);
    };

    const handlePriorityChange = async (newPriority) => {
        setIsUpdating(true);
        try {
            if (onPriorityChange) {
                await onPriorityChange(comment.id, newPriority);
                setPriority(newPriority);
            }
        } catch (error) {
            console.error('Failed to update priority:', error);
        }
        setIsUpdating(false);
    };

    const handleDelete = async () => {
        const confirmed = await showConfirmation(
            __('Delete Comment', 'analogwp-client-handoff'),
            __('Are you sure you want to delete this comment? This action cannot be undone.', 'analogwp-client-handoff')
        );
        
        if (confirmed) {
            onDelete(comment.id);
        }
    };

    const addTimeEntry = async () => {
        if (!newTimeEntry.hours && !newTimeEntry.minutes) {
            showToast.error(__('Please enter hours or minutes', 'analogwp-client-handoff'));
            return;
        }
        
        const hours = parseInt(newTimeEntry.hours) || 0;
        const minutes = parseInt(newTimeEntry.minutes) || 0;
        
        if (hours < 0 || minutes < 0 || minutes >= 60) {
            showToast.error(__('Please enter valid time values', 'analogwp-client-handoff'));
            return;
        }
        
        const newEntry = {
            id: Date.now(),
            hours,
            minutes,
            description: newTimeEntry.description || __('Time entry', 'analogwp-client-handoff'),
            date: new Date().toISOString().split('T')[0]
        };
        
        const updatedEntries = [...timeEntries, newEntry];
        setTimeEntries(updatedEntries);
        
        // Persist to database
        try {
            if (!onUpdateComment) {
                throw new Error('Update function not available');
            }
            
            await onUpdateComment(comment.id, { 
                timesheet: JSON.stringify(updatedEntries) 
            });
            setNewTimeEntry({ hours: '', minutes: '', description: '' });
            showToast.success(__('Time entry added successfully', 'analogwp-client-handoff'));
        } catch (error) {
            console.error('Error saving time entry:', error);
            // Revert the local state if saving failed
            setTimeEntries(timeEntries);
            showToast.error(__('Failed to save time entry. Please try again.', 'analogwp-client-handoff'));
        }
    };

    const removeTimeEntry = async (entryId) => {
        const updatedEntries = timeEntries.filter(entry => entry.id !== entryId);
        const originalEntries = [...timeEntries];
        setTimeEntries(updatedEntries);
        
        // Persist to database
        try {
            if (!onUpdateComment) {
                throw new Error('Update function not available');
            }
            
            await onUpdateComment(comment.id, { 
                timesheet: JSON.stringify(updatedEntries) 
            });
            showToast.success(__('Time entry removed', 'analogwp-client-handoff'));
        } catch (error) {
            console.error('Error removing time entry:', error);
            // Revert the local state if saving failed
            setTimeEntries(originalEntries);
            showToast.error(__('Failed to remove time entry. Please try again.', 'analogwp-client-handoff'));
        }
    };

    const handleSaveTitle = async () => {
        try {
            await onUpdateComment(comment.id, { comment_title: tempTitle });
            setEditingTitle(false);
            showToast.success(__('Title updated successfully', 'analogwp-client-handoff'));
        } catch (error) {
            console.error('Error updating title:', error);
            showToast.error(__('Failed to update title', 'analogwp-client-handoff'));
        }
    };

    const handleSaveText = async () => {
        try {
            await onUpdateComment(comment.id, { comment_text: tempText });
            setEditingText(false);
            showToast.success(__('Content updated successfully', 'analogwp-client-handoff'));
        } catch (error) {
            console.error('Error updating content:', error);
            showToast.error(__('Failed to update content', 'analogwp-client-handoff'));
        }
    };

    const handleCancelTitleEdit = () => {
        setTempTitle(comment.comment_title || '');
        setEditingTitle(false);
    };

    const handleCancelTextEdit = () => {
        setTempText(comment.comment_text || '');
        setEditingText(false);
    };

    const getTotalTime = () => {
        const totalMinutes = timeEntries.reduce((total, entry) => {
            return total + (entry.hours * 60) + entry.minutes;
        }, 0);
        
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        return { hours, minutes, totalMinutes };
    };

    return (
        <div className="bg-white min-h-screen rounded-lg">
            <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-lg px-6 py-4 flex items-center justify-between shadow-sm z-10">
                <Button 
                    onClick={onBack}
                    variant="link"
                    size="medium"
                    icon={
                        <svg className="fill-current! w-4!" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                        </svg>
                    }
                >
                    {__('Back', 'analogwp-client-handoff')}
                </Button>
                
                <div className="flex items-center space-x-3!">
                    <select 
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={isUpdating}
                        className="px-3! py-1.5! border border-gray-200! rounded-md! text-sm focus:ring-2 focus:ring-gray-500! focus:border-gray-500! min-w-40!"
                    >
                        {TASK_STATUSES.map(statusOption => (
                            <option key={statusOption.key} value={statusOption.key}>
                                {statusOption.icon} {statusOption.title}
                            </option>
                        ))}
                    </select>
                    
                    <select 
                        value={priority}
                        onChange={(e) => handlePriorityChange(e.target.value)}
                        disabled={isUpdating}
                        className="px-3! py-1.5! border border-gray-200! rounded-md! text-sm focus:ring-2 focus:ring-gray-500! focus:border-gray-500! min-w-40!"
                    >
                        {priorities && priorities.length > 0 ? (
                            priorities.map(priorityOption => (
                                <option key={priorityOption.id} value={priorityOption.key}>
                                    {priorityOption.name}
                                </option>
                            ))
                        ) : (
                            <>
                                <option value="low">{__('Low Priority', 'analogwp-client-handoff')}</option>
                                <option value="medium">{__('Medium Priority', 'analogwp-client-handoff')}</option>
                                <option value="high">{__('High Priority', 'analogwp-client-handoff')}</option>
                            </>
                        )}
                    </select>
                    
                    <Button 
                        onClick={handleDelete}
                        variant="link"
                        size="default"
												className="hover:text-red-600! focus:text-red-600!"
                        icon={
                            <svg className="w-4! fill-current!" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5zM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11z"/>
                            </svg>
                        }
                        title={__('Delete comment', 'analogwp-client-handoff')}
                    >
                        {__('Delete', 'analogwp-client-handoff')}
                    </Button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-gray-200 rounded-lg py-4! px-6! shadow-sm">
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="flex items-center space-x-2">
																		<div 
																			className="w-3 h-3 rounded-full"
																			style={{ backgroundColor: getPriorityColor(priority) }}
																	/>
																	<span 
																	className="text-sm font-medium"
																	style={{ color: getPriorityColor(priority) }}
																	>
																			{priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : __('Normal', 'analogwp-client-handoff')}
																	</span>
																</div>
																<div>
																	<span className="mr-2">{getStatusIcon(status)}</span>
                                {getStatusLabel(status)}
																</div>
                            </div>

                            {/* Title Section */}
                            <div className="mb-1 flex gap-4 w-full">
                                {editingTitle ? (
                                    <div className="space-y-2! w-full">
                                        <input
                                            type="text"
                                            value={tempTitle}
                                            onChange={(e) => setTempTitle(e.target.value)}
                                            className="w-full text-lg font-semibold border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder={__('Enter task title', 'analogwp-client-handoff')}
                                        />
                                        <div className="flex space-x-2!">
                                            <Button 
                                                onClick={handleSaveTitle}
                                                variant="primary"
                                                size="small"
                                            >
                                                {__('Save', 'analogwp-client-handoff')}
                                            </Button>
                                            <Button 
                                                onClick={handleCancelTitleEdit}
                                                variant="secondary"
                                                size="small"
                                            >
                                                {__('Cancel', 'analogwp-client-handoff')}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="group flex w-full items-start justify-between">
																				<div className="flex w-full items-start gap-4">
																					<h2 className="text-lg font-semibold text-gray-900">#{comment.id}</h2>
																					<h2 className="text-lg font-semibold text-gray-900 flex-1">
																							{comment.comment_title || __('No title', 'analogwp-client-handoff')}
																					</h2>
																				</div>
                                        <Button
                                            onClick={() => setEditingTitle(true)}
                                            variant="tertiary"
                                            size="small"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            {__('Edit', 'analogwp-client-handoff')}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="mb-3">
                                {editingText ? (
                                    <div className="space-y-2">
                                        <textarea
                                            value={tempText}
                                            onChange={(e) => setTempText(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-vertical"
                                            rows="4"
                                            placeholder={__('Enter task description', 'analogwp-client-handoff')}
                                        />
                                        <div className="flex space-x-2!">
                                            <Button 
                                                onClick={handleSaveText}
                                                variant="primary"
                                                size="small"
                                            >
                                                {__('Save', 'analogwp-client-handoff')}
                                            </Button>
                                            <Button 
                                                onClick={handleCancelTextEdit}
                                                variant="secondary"
                                                size="small"
                                            >
                                                {__('Cancel', 'analogwp-client-handoff')}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="group">
                                        <div className="flex items-start space-x-2">
                                            <div className="text-gray-700 leading-relaxed flex-1">
                                                {comment.comment_text || __('No description', 'analogwp-client-handoff')}
                                            </div>
                                            <Button
                                                onClick={() => setEditingText(true)}
                                                variant="tertiary"
                                                size="small"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                {__('Edit', 'analogwp-client-handoff')}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>


														{comment.categories && comment.categories.length > 0 && (
															<div className="flex flex-wrap gap-1 mb-4">
																{comment.categories.map((category, index) => (
																	<span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
																		{category}
																	</span>
																))}
															</div>
														)}

                            {/* Task Details Section - moved from Details card */}
                            <div className="border-t border-gray-100 pt-4 space-y-4">
                                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        <div 
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white bg-gray-500 border-2 border-white shadow-sm"
                                            style={{ 
                                                backgroundImage: user?.avatar ? `url(${user.avatar})` : 'none',
                                                backgroundColor: user?.avatar ? 'transparent' : '#6b7280',
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat'
                                            }}
                                        >
                                            {!user?.avatar && getUserInitials(user?.name || 'Unknown')}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900">
                                            {user?.name || __('Unknown User', 'analogwp-client-handoff')}
                                        </div>
                                        <div className="text-xs text-gray-500">{__('Added by', 'analogwp-client-handoff')}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 uppercase tracking-wide">{__('Added on', 'analogwp-client-handoff')}</div>
                                        <div className="text-sm text-gray-900 font-medium">{formatDate(comment.created_at)}</div>
                                    </div>
                                </div>
                                
                                {/* Assigned To Section */}
                                {comment.assignee && (
                                    <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                        <div className="flex-shrink-0">
                                            <div 
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white bg-blue-500 border-2 border-white shadow-sm"
                                                style={{ 
                                                    backgroundImage: comment.assignee?.avatar ? `url(${comment.assignee.avatar})` : 'none',
                                                    backgroundColor: comment.assignee?.avatar ? 'transparent' : '#3b82f6',
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    backgroundRepeat: 'no-repeat'
                                                }}
                                            >
                                                {!comment.assignee?.avatar && getUserInitials(comment.assignee?.name || 'Unknown')}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-blue-900">
                                                {comment.assignee?.name || __('Unknown User', 'analogwp-client-handoff')}
                                            </div>
                                            <div className="text-xs text-blue-600">{__('Assigned to', 'analogwp-client-handoff')}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-blue-600 uppercase tracking-wide">{__('Assignee', 'analogwp-client-handoff')}</div>
                                            <div className="text-sm text-blue-900 font-medium">
                                                <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {comment.page_url && (
                            <div className="border-t border-gray-100 pt-4">
                                <h3 className="text-sm font-medium text-gray-900 mb-2">{__('Page URL', 'analogwp-client-handoff')}</h3>
                                <a href={comment.page_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-500 transition-colors duration-200 text-sm">
                                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 0 1-.597-.933A9.268 9.268 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 2.472zM3.82 11a13.652 13.652 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0 0 13.745 12H11.91a9.27 9.27 0 0 1-.64 1.539 6.688 6.688 0 0 1-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 0 1-.312 2.5zm.312-3.5h2.49c-.062-.89-.291-1.733-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.024 7.024 0 0 0-3.072-2.472c.218.284.418.598.597.933zM10.855 4a7.966 7.966 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4h2.355z"/>
                                    </svg>
                                    {new URL(comment.page_url).pathname}
                                </a>
                            </div>
                        )}

                        {/* Screenshot section - after comment content, before replies */}
                        {comment.screenshot_url && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">{__('Screenshot', 'analogwp-client-handoff')}</h3>
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200">
                                    <img 
                                        src={comment.screenshot_url} 
                                        alt={__('Task screenshot', 'analogwp-client-handoff')}
                                        onClick={() => window.open(comment.screenshot_url, '_blank')}
                                        className="w-full h-auto"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Replies Section - moved to bottom of left column */}
                        {comment.replies && comment.replies.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">{__('Replies', 'analogwp-client-handoff')} ({comment.replies.length})</h3>
                                <div className="space-y-4">
                                    {comment.replies.map((reply, index) => (
                                        <div key={reply.id || index} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                                            <div className="flex items-start space-x-3">
                                                <div 
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white bg-gray-500 flex-shrink-0 border-2 border-white shadow-sm"
                                                    style={{ 
                                                        backgroundImage: reply.avatar ? `url(${reply.avatar})` : 'none',
                                                        backgroundColor: reply.avatar ? 'transparent' : '#6b7280',
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center',
                                                        backgroundRepeat: 'no-repeat'
                                                    }}
                                                >
                                                    {!reply.avatar && getUserInitials(reply.display_name || 'Unknown')}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {reply.display_name || __('Unknown User', 'analogwp-client-handoff')}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {formatDate(reply.created_at)}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-700">
                                                        {reply.reply_text}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Right Column - Timesheet only */}
                    <div className="space-y-6">
                        {/* Timesheet Card */}
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 flex! items-center">
                                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {__('Timesheet', 'analogwp-client-handoff')}
                                    {timeEntries.length > 0 && (
                                        <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full font-medium">
                                            {getTotalTime().hours}h {getTotalTime().minutes}m
                                        </span>
                                    )}
                                </h3>
                            </div>
                            
                                {/* Add Time Entry Form */}
                                <div className="space-y-4">
                                    <div className="rounded-lg p-4">
                                        <h4 className="text-sm font-medium text-gray-900 mb-3 flex! items-center">
                                            {__('Time Entry', 'analogwp-client-handoff')}
                                        </h4>
                                        
                                        <div className="space-y-3!">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                                                    <input
                                                        type="number"
                                                        value={newTimeEntry.hours}
                                                        onChange={(e) => setNewTimeEntry(prev => ({...prev, hours: e.target.value}))}
                                                        placeholder="0"
                                                        className="w-16 text-center border-0 outline-none text-sm font-medium"
                                                        min="0"
                                                        max="23"
                                                    />
                                                    <span className="text-xs text-gray-500 ml-1">{__('HH', 'analogwp-client-handoff')}</span>
                                                </div>
                                                
                                                <span className="text-gray-400 font-medium">:</span>
                                                
                                                <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                                                    <input
                                                        type="number"
                                                        value={newTimeEntry.minutes}
                                                        onChange={(e) => setNewTimeEntry(prev => ({...prev, minutes: e.target.value}))}
                                                        placeholder="00"
                                                        className="w-16 text-center border-0 outline-none text-sm font-medium"
                                                        min="0"
                                                        max="59"
                                                    />
                                                    <span className="text-xs text-gray-500 ml-1">{__('MM', 'analogwp-client-handoff')}</span>
                                                </div>
                                            </div>
                                            
                                            <input
                                                type="text"
                                                value={newTimeEntry.description}
                                                onChange={(e) => setNewTimeEntry(prev => ({...prev, description: e.target.value}))}
                                                placeholder={__('What did you work on? (optional)', 'analogwp-client-handoff')}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
                                            />
                                            
                                            <div>
																							<Button 
                                                onClick={addTimeEntry}
                                                variant="primary"
                                                icon={
                                                    <svg className="fill-current! w-4! h-4" fill="currentColor" viewBox="0 0 16 16">
                                                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                                    </svg>
                                                }
                                                disabled={!newTimeEntry.hours && !newTimeEntry.minutes}
                                            >
                                                {__('Add Time Entry', 'analogwp-client-handoff')}
                                            </Button>
																						</div>
                                        </div>
                                    </div>
                                
                                {/* Time Entries List */}
                                {timeEntries.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 border-t border-gray-100">
                                            <h4 className="text-sm font-medium text-gray-900 flex! items-center">
                                                <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                {__('Time Entries', 'analogwp-client-handoff')} ({timeEntries.length})
                                            </h4>
                                            <div className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                                                {__('Total: ', 'analogwp-client-handoff')}
                                                {getTotalTime().hours}h {getTotalTime().minutes}m
                                            </div>
                                        </div>
                                        
                                        <div className="p-4 space-y-3">
                                            {timeEntries.map((entry, index) => (
                                                <div key={entry.id} className="group bg-white border border-gray-200 rounded-md p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 space-y-2">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-3 py-1">
                                                                    <svg className="w-4 h-4 text-blue-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    <span className="text-sm font-medium text-blue-800">
                                                                        {entry.hours}h {entry.minutes}m
                                                                    </span>
                                                                </div>
                                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                                    {formatDate(entry.date)}
                                                                </span>
                                                            </div>
                                                            
                                                            {entry.description && (
                                                                <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2">
                                                                    {entry.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <Button 
                                                            onClick={() => removeTimeEntry(entry.id)}
                                                            variant="destructive"
                                                            size="small"
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-3 flex-shrink-0"
                                                            title={__('Remove time entry', 'analogwp-client-handoff')}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 border-t border-gray-100">
                                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-gray-500">{__('No time entries yet. Add your first entry above.', 'analogwp-client-handoff')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetail;