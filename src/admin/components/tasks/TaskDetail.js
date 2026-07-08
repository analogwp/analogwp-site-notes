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
import logger from '../../../shared/utils/logger';

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
    const [timeEntries, setTimeEntries] = useState(() => {
        try {
            return comment.timesheet ? JSON.parse(comment.timesheet) : [];
        } catch {
            return [];
        }
    });
    const [newTimeEntry, setNewTimeEntry] = useState({ hours: '', minutes: '', description: '' });

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
            logger.error('Failed to update status:', error);
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
            logger.error('Failed to update priority:', error);
        }
        setIsUpdating(false);
    };

    const handleDelete = async () => {
        const confirmed = await showConfirmation(
            __('Delete Comment', 'analogwp-site-notes'),
            __('Are you sure you want to delete this comment? This action cannot be undone.', 'analogwp-site-notes')
        );

        if (confirmed) {
            onDelete(comment.id);
        }
    };

    const addTimeEntry = async () => {
        if (!newTimeEntry.hours && !newTimeEntry.minutes) {
            showToast.error(__('Please enter hours or minutes', 'analogwp-site-notes'));
            return;
        }

        const hours = parseInt(newTimeEntry.hours) || 0;
        const minutes = parseInt(newTimeEntry.minutes) || 0;

        if (hours < 0 || minutes < 0 || minutes >= 60) {
            showToast.error(__('Please enter valid time values', 'analogwp-site-notes'));
            return;
        }

        const newEntry = {
            id: Date.now(),
            hours,
            minutes,
            description: newTimeEntry.description || __('Time entry', 'analogwp-site-notes'),
            date: new Date().toISOString().split('T')[0]
        };

        const updatedEntries = [...timeEntries, newEntry];
        setTimeEntries(updatedEntries);

        try {
            if (!onUpdateComment) {
                throw new Error('Update function not available');
            }

            await onUpdateComment(comment.id, {
                timesheet: JSON.stringify(updatedEntries)
            });
            setNewTimeEntry({ hours: '', minutes: '', description: '' });
            showToast.success(__('Time entry added successfully', 'analogwp-site-notes'));
        } catch (error) {
            logger.error('Error saving time entry:', error);
            setTimeEntries(timeEntries);
            showToast.error(__('Failed to save time entry. Please try again.', 'analogwp-site-notes'));
        }
    };

    const removeTimeEntry = async (entryId) => {
        const updatedEntries = timeEntries.filter(entry => entry.id !== entryId);
        const originalEntries = [...timeEntries];
        setTimeEntries(updatedEntries);

        try {
            if (!onUpdateComment) {
                throw new Error('Update function not available');
            }

            await onUpdateComment(comment.id, {
                timesheet: JSON.stringify(updatedEntries)
            });
            showToast.success(__('Time entry removed', 'analogwp-site-notes'));
        } catch (error) {
            logger.error('Error removing time entry:', error);
            setTimeEntries(originalEntries);
            showToast.error(__('Failed to remove time entry. Please try again.', 'analogwp-site-notes'));
        }
    };

    const handleSaveTitle = async () => {
        try {
            await onUpdateComment(comment.id, { comment_title: tempTitle });
            setEditingTitle(false);
            showToast.success(__('Title updated successfully', 'analogwp-site-notes'));
        } catch (error) {
            logger.error('Error updating title:', error);
            showToast.error(__('Failed to update title', 'analogwp-site-notes'));
        }
    };

    const handleSaveText = async () => {
        try {
            await onUpdateComment(comment.id, { comment_text: tempText });
            setEditingText(false);
            showToast.success(__('Content updated successfully', 'analogwp-site-notes'));
        } catch (error) {
            logger.error('Error updating content:', error);
            showToast.error(__('Failed to update content', 'analogwp-site-notes'));
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

    const renderAvatar = (avatarUser, className = 'sn-avatar sn-avatar--lg', accent = false) => (
        <div
            className={accent ? `${className} sn-avatar--accent` : className}
            style={{
                backgroundImage: avatarUser?.avatar ? `url(${avatarUser.avatar})` : 'none',
                backgroundColor: avatarUser?.avatar ? 'transparent' : undefined,
            }}
        >
            {!avatarUser?.avatar && getUserInitials(avatarUser?.name || 'Unknown')}
        </div>
    );

    return (
        <div className="sn-task-detail">
            <div className="sn-task-detail__header">
                <Button
                    onClick={onBack}
                    variant="link"
                    size="medium"
                    icon={
                        <svg className="sn-icon sn-icon--fill-current" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                        </svg>
                    }
                >
                    {__('Back', 'analogwp-site-notes')}
                </Button>

                <div className="sn-task-detail__header-actions">
                    <select
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={isUpdating}
                        className="sn-task-detail__status-select"
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
                        className="sn-task-detail__status-select"
                    >
                        {priorities && priorities.length > 0 ? (
                            priorities.map(priorityOption => (
                                <option key={priorityOption.id} value={priorityOption.key}>
                                    {priorityOption.name}
                                </option>
                            ))
                        ) : (
                            <>
                                <option value="low">{__('Low Priority', 'analogwp-site-notes')}</option>
                                <option value="medium">{__('Medium Priority', 'analogwp-site-notes')}</option>
                                <option value="high">{__('High Priority', 'analogwp-site-notes')}</option>
                            </>
                        )}
                    </select>

                    <Button
                        onClick={handleDelete}
                        variant="destructive"
                        size="default"
                        icon={
                            <svg className="sn-icon sn-icon--fill-current" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5zM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11z"/>
                            </svg>
                        }
                        title={__('Delete comment', 'analogwp-site-notes')}
                    >
                        {__('Delete', 'analogwp-site-notes')}
                    </Button>
                </div>
            </div>

            <div className="sn-task-detail__content">
                <div className="sn-task-detail__grid">
                    <div className="sn-task-detail__main">
                        <div className="sn-task-detail__section">
                            <div className="sn-task-detail__meta-row">
                                <div className="sn-task-detail__priority-row">
                                    <div
                                        className="sn-priority-dot"
                                        style={{ backgroundColor: getPriorityColor(priority) }}
                                    />
                                    <span
                                        className="sn-text-m sn-font-medium"
                                        style={{ color: getPriorityColor(priority) }}
                                    >
                                        {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : __('Normal', 'analogwp-site-notes')}
                                    </span>
                                </div>
                                <div>
                                    <span className="sn-mr-2">{getStatusIcon(status)}</span>
                                    {getStatusLabel(status)}
                                </div>
                            </div>

                            <div className="sn-mb-1 sn-flex sn-gap-4 sn-w-full">
                                {editingTitle ? (
                                    <div className="sn-space-y-2 sn-w-full">
                                        <input
                                            type="text"
                                            value={tempTitle}
                                            onChange={(e) => setTempTitle(e.target.value)}
                                            className="sn-input sn-title-m"
                                            placeholder={__('Enter task title', 'analogwp-site-notes')}
                                        />
                                        <div className="sn-flex sn-gap-2">
                                            <Button
                                                onClick={handleSaveTitle}
                                                variant="primary"
                                                size="small"
                                            >
                                                {__('Save', 'analogwp-site-notes')}
                                            </Button>
                                            <Button
                                                onClick={handleCancelTitleEdit}
                                                variant="secondary"
                                                size="small"
                                            >
                                                {__('Cancel', 'analogwp-site-notes')}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="sn-task-detail__editable-group">
                                        <div className="sn-task-detail__editable-content">
                                            <h2 className="sn-title-m">#{comment.id}</h2>
                                            <h2 className="sn-title-m sn-flex-1">
                                                {comment.comment_title || __('No title', 'analogwp-site-notes')}
                                            </h2>
                                        </div>
                                        <Button
                                            onClick={() => setEditingTitle(true)}
                                            variant="tertiary"
                                            size="small"
                                            className="sn-task-detail__edit-btn"
                                        >
                                            {__('Edit', 'analogwp-site-notes')}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="sn-mb-3">
                                {editingText ? (
                                    <div className="sn-space-y-2">
                                        <textarea
                                            value={tempText}
                                            onChange={(e) => setTempText(e.target.value)}
                                            className="sn-input sn-textarea"
                                            rows="4"
                                            placeholder={__('Enter task description', 'analogwp-site-notes')}
                                        />
                                        <div className="sn-flex sn-gap-2">
                                            <Button
                                                onClick={handleSaveText}
                                                variant="primary"
                                                size="small"
                                            >
                                                {__('Save', 'analogwp-site-notes')}
                                            </Button>
                                            <Button
                                                onClick={handleCancelTextEdit}
                                                variant="secondary"
                                                size="small"
                                            >
                                                {__('Cancel', 'analogwp-site-notes')}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="sn-task-detail__editable-group">
                                        <div className="sn-task-detail__reply">
                                            <div className="sn-task-detail__reply-text">
                                                {comment.comment_text || __('No description', 'analogwp-site-notes')}
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => setEditingText(true)}
                                            variant="tertiary"
                                            size="small"
                                            className="sn-task-detail__edit-btn"
                                        >
                                            {__('Edit', 'analogwp-site-notes')}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {comment.categories && comment.categories.length > 0 && (
                                <div className="sn-flex sn-flex-wrap sn-gap-1 sn-mb-4">
                                    {comment.categories.map((category, index) => (
                                        <span key={index} className="sn-badge sn-badge--default sn-badge--small">
                                            {category}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="sn-border-t-light sn-pt-4 sn-space-y-4">
                                <div className="sn-task-detail__user-card">
                                    {renderAvatar(user)}
                                    <div className="sn-flex-1">
                                        <div className="sn-task-detail__user-name">
                                            {user?.name || __('Unknown User', 'analogwp-site-notes')}
                                        </div>
                                        <div className="sn-task-detail__user-meta">{__('Added by', 'analogwp-site-notes')}</div>
                                    </div>
                                    <div className="sn-text-right">
                                        <div className="sn-task-detail__user-meta sn-uppercase">{__('Added on', 'analogwp-site-notes')}</div>
                                        <div className="sn-task-detail__user-name">{formatDate(comment.created_at)}</div>
                                    </div>
                                </div>

                                {comment.assignee && (
                                    <div className="sn-task-detail__user-card sn-task-detail__user-card--accent">
                                        {renderAvatar(comment.assignee, 'sn-avatar sn-avatar--lg', true)}
                                        <div className="sn-flex-1">
                                            <div className="sn-task-detail__user-name sn-task-detail__user-name--accent">
                                                {comment.assignee?.name || __('Unknown User', 'analogwp-site-notes')}
                                            </div>
                                            <div className="sn-task-detail__user-meta sn-task-detail__user-meta--accent">{__('Assigned to', 'analogwp-site-notes')}</div>
                                        </div>
                                        <div className="sn-text-right">
                                            <div className="sn-task-detail__user-meta sn-task-detail__user-meta--accent sn-uppercase">{__('Assignee', 'analogwp-site-notes')}</div>
                                            <div className="sn-task-detail__user-name sn-task-detail__user-name--accent">
                                                <svg className="sn-icon sn-icon--sm" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {comment.page_url && (
                            <div className="sn-border-t-light sn-pt-4">
                                <h3 className="sn-title-s sn-mb-2">{__('Page URL', 'analogwp-site-notes')}</h3>
                                <a href={comment.page_url} target="_blank" rel="noopener noreferrer" className="sn-link-accent">
                                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 0 1-.597-.933A9.268 9.268 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 2.472zM3.82 11a13.652 13.652 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0 0 13.745 12H11.91a9.27 9.27 0 0 1-.64 1.539 6.688 6.688 0 0 1-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 0 1-.312 2.5zm.312-3.5h2.49c-.062-.89-.291-1.733-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.024 7.024 0 0 0-3.072-2.472c.218.284.418.598.597.933zM10.855 4a7.966 7.966 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4h2.355z"/>
                                    </svg>
                                    {new URL(comment.page_url).pathname}
                                </a>
                            </div>
                        )}

                        {comment.screenshot_url && (
                            <div className="sn-settings-item-list sn-p-4">
                                <h3 className="sn-title-m sn-mb-3">{__('Screenshot', 'analogwp-site-notes')}</h3>
                                <div
                                    className="sn-task-detail__screenshot"
                                    onClick={() => window.open(comment.screenshot_url, '_blank')}
                                    onKeyDown={(e) => e.key === 'Enter' && window.open(comment.screenshot_url, '_blank')}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <img
                                        src={comment.screenshot_url}
                                        alt={__('Task screenshot', 'analogwp-site-notes')}
                                    />
                                </div>
                            </div>
                        )}

                        {comment.replies && comment.replies.length > 0 && (
                            <div className="sn-task-detail__section">
                                <h3 className="sn-title-m sn-mb-4">{__('Replies', 'analogwp-site-notes')} ({comment.replies.length})</h3>
                                <div className="sn-space-y-4">
                                    {comment.replies.map((reply, index) => (
                                        <div key={reply.id || index} className="sn-border-b-light sn-pb-4 sn-last-no-border">
                                            <div className="sn-task-detail__reply">
                                                <div
                                                    className="sn-avatar sn-avatar--sm"
                                                    style={{
                                                        backgroundImage: reply.avatar ? `url(${reply.avatar})` : 'none',
                                                        backgroundColor: reply.avatar ? 'transparent' : undefined,
                                                    }}
                                                >
                                                    {!reply.avatar && getUserInitials(reply.display_name || 'Unknown')}
                                                </div>
                                                <div className="sn-flex-1">
                                                    <div className="sn-flex sn-items-center sn-justify-between sn-mb-2">
                                                        <span className="sn-text-m sn-font-medium sn-text-primary">
                                                            {reply.display_name || __('Unknown User', 'analogwp-site-notes')}
                                                        </span>
                                                        <span className="sn-text-s sn-text-secondary">
                                                            {formatDate(reply.created_at)}
                                                        </span>
                                                    </div>
                                                    <div className="sn-text-m sn-text-primary">
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

                    <div className="sn-flex-col sn-gap-6">
                        <div className="sn-card sn-card--padding-none sn-card--shadow-small sn-overflow-hidden">
                            <div className="sn-task-detail__timesheet-header">
                                <h3 className="sn-title-m sn-flex sn-items-center">
                                    <svg className="sn-icon sn-icon--md sn-mr-2 sn-text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {__('Timesheet', 'analogwp-site-notes')}
                                    {timeEntries.length > 0 && (
                                        <span className="sn-badge sn-badge--primary sn-badge--small sn-ml-2">
                                            {getTotalTime().hours}h {getTotalTime().minutes}m
                                        </span>
                                    )}
                                </h3>
                            </div>

                            <div className="sn-space-y-4">
                                <div className="sn-task-detail__timesheet-entry">
                                    <h4 className="sn-text-m sn-font-medium sn-text-primary sn-mb-3 sn-flex sn-items-center">
                                        {__('Time Entry', 'analogwp-site-notes')}
                                    </h4>

                                    <div className="sn-space-y-3">
                                        <div className="sn-flex sn-items-center sn-gap-3">
                                            <div className="sn-task-detail__time-input-group">
                                                <input
                                                    type="number"
                                                    value={newTimeEntry.hours}
                                                    onChange={(e) => setNewTimeEntry(prev => ({...prev, hours: e.target.value}))}
                                                    placeholder="0"
                                                    className="sn-task-detail__time-input"
                                                    min="0"
                                                    max="23"
                                                />
                                                <span className="sn-text-s sn-text-secondary sn-ml-1">{__('HH', 'analogwp-site-notes')}</span>
                                            </div>

                                            <span className="sn-text-m sn-text-secondary sn-font-medium">:</span>

                                            <div className="sn-task-detail__time-input-group">
                                                <input
                                                    type="number"
                                                    value={newTimeEntry.minutes}
                                                    onChange={(e) => setNewTimeEntry(prev => ({...prev, minutes: e.target.value}))}
                                                    placeholder="00"
                                                    className="sn-task-detail__time-input"
                                                    min="0"
                                                    max="59"
                                                />
                                                <span className="sn-text-s sn-text-secondary sn-ml-1">{__('MM', 'analogwp-site-notes')}</span>
                                            </div>
                                        </div>

                                        <input
                                            type="text"
                                            value={newTimeEntry.description}
                                            onChange={(e) => setNewTimeEntry(prev => ({...prev, description: e.target.value}))}
                                            placeholder={__('What did you work on? (optional)', 'analogwp-site-notes')}
                                            className="sn-input"
                                        />

                                        <div>
                                            <Button
                                                onClick={addTimeEntry}
                                                variant="primary"
                                                icon={
                                                    <svg className="sn-icon sn-icon--fill-current" fill="currentColor" viewBox="0 0 16 16">
                                                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                                    </svg>
                                                }
                                                disabled={!newTimeEntry.hours && !newTimeEntry.minutes}
                                            >
                                                {__('Add Time Entry', 'analogwp-site-notes')}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {timeEntries.length > 0 ? (
                                    <div className="sn-space-y-4">
                                        <div className="sn-flex sn-items-center sn-justify-between sn-p-4 sn-border-t-light">
                                            <h4 className="sn-text-m sn-font-medium sn-text-primary sn-flex sn-items-center">
                                                <svg className="sn-icon sn-mr-2 sn-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                {__('Time Entries', 'analogwp-site-notes')} ({timeEntries.length})
                                            </h4>
                                            <div className="sn-badge sn-badge--primary sn-badge--medium">
                                                {__('Total: ', 'analogwp-site-notes')}
                                                {getTotalTime().hours}h {getTotalTime().minutes}m
                                            </div>
                                        </div>

                                        <div className="sn-p-4 sn-space-y-3">
                                            {timeEntries.map((entry) => (
                                                <div key={entry.id} className="sn-group sn-task-detail__time-entry">
                                                    <div className="sn-flex sn-items-start sn-justify-between">
                                                        <div className="sn-flex-1 sn-space-y-2">
                                                            <div className="sn-flex sn-items-center sn-gap-3">
                                                                <div className="sn-task-detail__time-entry-duration">
                                                                    <svg className="sn-icon sn-text-accent sn-mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    <span className="sn-text-m sn-font-medium sn-text-accent">
                                                                        {entry.hours}h {entry.minutes}m
                                                                    </span>
                                                                </div>
                                                                <span className="sn-badge sn-badge--default sn-badge--small">
                                                                    {formatDate(entry.date)}
                                                                </span>
                                                            </div>

                                                            {entry.description && (
                                                                <div className="sn-text-m sn-text-primary sn-p-2">
                                                                    {entry.description}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <Button
                                                            onClick={() => removeTimeEntry(entry.id)}
                                                            variant="destructive"
                                                            size="small"
                                                            className="sn-group-hover-visible sn-ml-3"
                                                            title={__('Remove time entry', 'analogwp-site-notes')}
                                                        >
                                                            <svg className="sn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="sn-task-detail__empty-state">
                                        <svg className="sn-task-detail__empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="sn-text-m sn-text-secondary">{__('No time entries yet. Add your first entry above.', 'analogwp-site-notes')}</p>
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
