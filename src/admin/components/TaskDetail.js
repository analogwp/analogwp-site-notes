/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { showConfirmation, showToast } from './ToastProvider';
import { Button, IconButton } from './ui';

const TaskDetail = ({ 
    comment, 
    user, 
    onStatusChange, 
    onDelete, 
    onBack,
    onPriorityChange,
    onUpdateComment,
    formatDate
}) => {
    const [status, setStatus] = useState(comment.status);
    const [priority, setPriority] = useState(comment.priority || 'medium');
    const [isUpdating, setIsUpdating] = useState(false);
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
        try {
            setTimeEntries(comment.timesheet ? JSON.parse(comment.timesheet) : []);
        } catch {
            setTimeEntries([]);
        }
    }, [comment.id, comment.status, comment.priority, comment.timesheet]);

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

    const getStatusLabel = (status) => {
        switch (status) {
            case 'open': return __('Open', 'analogwp-client-handoff');
            case 'in_progress': return __('In Progress', 'analogwp-client-handoff');
            case 'resolved': return __('Resolved', 'analogwp-client-handoff');
            default: return status;
        }
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
                    variant="ghost"
                    size="medium"
                    icon={
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
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
                        <option value="open">{__('Open', 'analogwp-client-handoff')}</option>
                        <option value="in_progress">{__('In Progress', 'analogwp-client-handoff')}</option>
                        <option value="resolved">{__('Resolved', 'analogwp-client-handoff')}</option>
                    </select>
                    
                    <select 
                        value={priority}
                        onChange={(e) => handlePriorityChange(e.target.value)}
                        disabled={isUpdating}
                        className="px-3! py-1.5! border border-gray-200! rounded-md! text-sm focus:ring-2 focus:ring-gray-500! focus:border-gray-500! min-w-40!"
                    >
                        <option value="low">{__('Low Priority', 'analogwp-client-handoff')}</option>
                        <option value="medium">{__('Medium Priority', 'analogwp-client-handoff')}</option>
                        <option value="high">{__('High Priority', 'analogwp-client-handoff')}</option>
                    </select>
                    
                    <Button 
                        onClick={handleDelete}
                        variant="danger"
                        size="medium"
                        icon={
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5zM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11z"/>
                            </svg>
                        }
                        title={__('Delete comment', 'analogwp-client-handoff')}
                    >
                        {__('Delete', 'analogwp-client-handoff')}
                    </Button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center space-x-3 mb-4">
                                <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: getPriorityColor(priority) }}
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : __('Normal', 'analogwp-client-handoff')}
                                </span>
                            </div>
                            
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                                status === 'open' ? 'bg-amber-100 text-amber-800' :
                                status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                                {getStatusLabel(status)}
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">{__('Comment', 'analogwp-client-handoff')}</h2>
                            <p className="text-gray-700 leading-relaxed">{comment.comment_text}</p>
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
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white bg-gray-500"
                                                    style={{ backgroundColor: '#6b7280' }}
                                                >
                                                    {getUserInitials(reply.display_name || 'Unknown')}
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
                    
                    {/* Right Column - Details and Timesheet only */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm h-fit">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">{__('Details', 'analogwp-client-handoff')}</h3>
                                
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">{__('Created by:', 'analogwp-client-handoff')}</label>
                                    <div className="flex items-center space-x-2">
                                        <div 
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white bg-gray-500"
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
                                        <span className="text-sm text-gray-900">
                                            {user?.name || __('Unknown User', 'analogwp-client-handoff')}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">{__('Created:', 'analogwp-client-handoff')}</label>
                                    <span className="text-sm text-gray-900">{formatDate(comment.created_at)}</span>
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">{__('Comment ID:', 'analogwp-client-handoff')}</label>
                                    <span className="text-sm text-gray-900">#{comment.id}</span>
                                </div>
                            </div>
                            
                            {/* Timesheet Section */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">{__('Timesheet', 'analogwp-client-handoff')}</h3>
                                
                                {/* Add Time Entry */}
                                <div className="space-y-4">
                                    <div className="flex items-end space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex items-center space-x-1">
                                                <input
                                                    type="number"
                                                    value={newTimeEntry.hours}
                                                    onChange={(e) => setNewTimeEntry(prev => ({...prev, hours: e.target.value}))}
                                                    placeholder="0"
                                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                                                    min="0"
                                                    max="23"
                                                />
                                                <label className="text-sm text-gray-600">{__('h', 'analogwp-client-handoff')}</label>
                                            </div>
                                        </div>
                                        <div className="time-input-group">
                                            <input
                                                type="number"
                                                value={newTimeEntry.minutes}
                                                onChange={(e) => setNewTimeEntry(prev => ({...prev, minutes: e.target.value}))}
                                                placeholder="0"
                                                className="time-input"
                                                min="0"
                                                max="59"
                                            />
                                            <label>{__('m', 'analogwp-client-handoff')}</label>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        value={newTimeEntry.description}
                                        onChange={(e) => setNewTimeEntry(prev => ({...prev, description: e.target.value}))}
                                        placeholder={__('Description (optional)', 'analogwp-client-handoff')}
                                        className="time-description"
                                    />
                                    <Button 
                                        onClick={addTimeEntry}
                                        variant="primary"
                                        size="medium"
                                        icon={
                                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                            </svg>
                                        }
                                        disabled={!newTimeEntry.hours && !newTimeEntry.minutes}
                                    >
                                        {__('Add Time', 'analogwp-client-handoff')}
                                    </Button>
                                </div>
                                
                                {/* Time Entries List */}
                                {timeEntries.length > 0 && (
                                    <div className="time-entries">
                                        <div className="time-total">
                                            <strong>
                                                {__('Total: ', 'analogwp-client-handoff')}
                                                {getTotalTime().hours}h {getTotalTime().minutes}m
                                            </strong>
                                        </div>
                                        
                                        <div className="time-entries-list">
                                            {timeEntries.map(entry => (
                                                <div key={entry.id} className="time-entry-item">
                                                    <div className="time-entry-info">
                                                        <div className="time-entry-duration">
                                                            {entry.hours}h {entry.minutes}m
                                                        </div>
                                                        <div className="time-entry-desc">
                                                            {entry.description}
                                                        </div>
                                                        <div className="time-entry-date">
                                                            {formatDate(entry.date)}
                                                        </div>
                                                    </div>
                                                    <IconButton 
                                                        onClick={() => removeTimeEntry(entry.id)}
                                                        variant="danger"
                                                        size="small"
                                                        title={__('Remove time entry', 'analogwp-client-handoff')}
                                                    >
                                                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                                        </svg>
                                                    </IconButton>
                                                </div>
                                            ))}
                                        </div>
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