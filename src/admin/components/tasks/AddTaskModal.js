/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { showToast } from '../ToastProvider';
import { useSettings } from '../settings/SettingsProvider';
import logger from '../../../shared/utils/logger';
import {
    CalendarIcon,
    ClockCircleIcon,
    CloseIcon,
    CloseSmallIcon,
} from '../../../shared/icons';

const AddTaskModal = ({ isOpen, onClose, onSave, users, pages, editTask = null, statuses = [], isSidebar = false }) => {
    const { categories, priorities } = useSettings();
    const [formData, setFormData] = useState({
        taskTitle: '',
        status: 'open',
        assignedUser: '',
        categories: [],
        pageId: '',
        dueDate: '',
        timeHours: '',
        timeMinutes: '',
        priority: 'medium',
        description: ''
    });

    useEffect(() => {
        if (editTask && isOpen) {
            let assignedUserId = '';
            if (editTask.assigned_to) {
                assignedUserId = editTask.assigned_to;
            } else if (editTask.assignee?.id) {
                assignedUserId = editTask.assignee.id;
            } else if (editTask.user_id) {
                assignedUserId = editTask.user_id;
            }

            let pageId = '';

            if (editTask.page_url && pages.length > 0) {
                const normalizeUrl = (url) => {
                    if (!url) return '';
                    let normalized = url.replace(/^https?:\/\/(www\.)?/, '');
                    normalized = normalized.replace(/\/$/, '');
                    return normalized.toLowerCase();
                };

                const normalizedTaskUrl = normalizeUrl(editTask.page_url);

                const matchingPage = pages.find(page => {
                    const normalizedPageUrl = normalizeUrl(page.url);
                    return normalizedPageUrl === normalizedTaskUrl;
                });

                if (matchingPage) {
                    pageId = String(matchingPage.id);
                }
            }

            if (!pageId && editTask.post_id && editTask.post_id !== '0' && editTask.post_id !== 0) {
                pageId = String(editTask.post_id);
            }

            setFormData({
                taskTitle: editTask.comment_title || '',
                status: editTask.status || 'open',
                assignedUser: assignedUserId,
                categories: editTask.categories || [],
                pageId: pageId,
                dueDate: editTask.due_date || '',
                timeHours: '',
                timeMinutes: '',
                priority: editTask.priority || 'medium',
                description: editTask.comment_text || ''
            });
        } else {
            setFormData({
                taskTitle: '',
                status: 'open',
                assignedUser: '',
                categories: [],
                pageId: '',
                dueDate: '',
                timeHours: '',
                timeMinutes: '',
                priority: 'medium',
                description: ''
            });
        }
    }, [editTask, isOpen, pages]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCategoryToggle = (categoryName) => {
        setFormData(prev => {
            const currentCategories = prev.categories || [];
            const isSelected = currentCategories.includes(categoryName);

            return {
                ...prev,
                categories: isSelected
                    ? currentCategories.filter(cat => cat !== categoryName)
                    : [...currentCategories, categoryName]
            };
        });
    };

    const handleSave = async () => {
        if (!formData.taskTitle.trim() && !formData.description.trim()) {
            showToast.error(__('Please enter a task title or description', 'analogwp-site-notes'));
            return;
        }

        if (!editTask && (!formData.pageId || formData.pageId === '')) {
            showToast.error(__('Please select a page for this task', 'analogwp-site-notes'));
            return;
        }

        const selectedPage = pages.find(page => String(page.id) === String(formData.pageId));
        const pageUrl = selectedPage ? selectedPage.url : '';

        let postId = 0;
        if (formData.pageId && formData.pageId !== '') {
            const numericId = parseInt(formData.pageId, 10);
            if (!isNaN(numericId)) {
                postId = numericId;
            }
        }

        let timesheetData = null;
        if ((formData.timeHours && parseInt(formData.timeHours) > 0) ||
            (formData.timeMinutes && parseInt(formData.timeMinutes) > 0)) {

            const hours = parseInt(formData.timeHours) || 0;
            const minutes = parseInt(formData.timeMinutes) || 0;

            if (hours >= 0 && minutes >= 0 && minutes < 60) {
                const timeEntry = {
                    id: Date.now(),
                    hours,
                    minutes,
                    description: editTask ?
                        __('Time entry from task update', 'analogwp-site-notes') :
                        __('Initial time entry', 'analogwp-site-notes'),
                    date: new Date().toISOString().split('T')[0]
                };

                if (editTask && editTask.timesheet) {
                    try {
                        const existingEntries = JSON.parse(editTask.timesheet);
                        timesheetData = JSON.stringify([...existingEntries, timeEntry]);
                    } catch {
                        timesheetData = JSON.stringify([timeEntry]);
                    }
                } else {
                    timesheetData = JSON.stringify([timeEntry]);
                }
            }
        }

        const taskData = {
            comment_title: formData.taskTitle || formData.description,
            comment_text: formData.description,
            post_id: postId,
            page_url: pageUrl,
            assigned_to: formData.assignedUser || 0,
            priority: formData.priority,
            status: formData.status,
            categories: formData.categories,
            due_date: formData.dueDate,
            time_estimation: formData.timeHours && formData.timeMinutes ?
                `${formData.timeHours}:${String(formData.timeMinutes).padStart(2, '0')}` : ''
        };

        if (timesheetData) {
            taskData.timesheet = timesheetData;
        }

        logger.debug('Task data being saved:', taskData);
        logger.debug('Is editing task?', !!editTask);

        try {
            await onSave(taskData);

            setFormData({
                taskTitle: '',
                status: 'open',
                assignedUser: '',
                categories: [],
                pageId: '',
                dueDate: '',
                timeHours: '',
                timeMinutes: '',
                priority: 'medium',
                description: ''
            });
            onClose();

            if (timesheetData) {
                showToast.success(editTask ?
                    __('Task updated and time entry added to timesheet', 'analogwp-site-notes') :
                    __('Task created and time entry added to timesheet', 'analogwp-site-notes')
                );
            } else {
                showToast.success(editTask ?
                    __('Task updated successfully', 'analogwp-site-notes') :
                    __('Task created successfully', 'analogwp-site-notes')
                );
            }
        } catch (err) {
            logger.error('Error saving task:', err);
            showToast.error(__('Error saving task. Please try again.', 'analogwp-site-notes'));
        }
    };

    const handleCancel = () => {
        setFormData({
            taskTitle: '',
            status: 'open',
            assignedUser: '',
            categories: [],
            pageId: '',
            dueDate: '',
            timeHours: '',
            timeMinutes: '',
            priority: 'medium',
            description: ''
        });
        onClose();
    };

    const renderCategoriesField = () => (
        <div className="sn-task-sidebar__field">
            <label className="sn-label">{__('Categories', 'analogwp-site-notes')}</label>
            {categories && categories.length > 0 ? (
                <div className="sn-task-sidebar__categories">
                    <div className="sn-space-y-2">
                        {categories.map(category => (
                            <label key={category.id} className="sn-task-sidebar__category-item">
                                <input
                                    type="checkbox"
                                    checked={formData.categories.includes(category.name)}
                                    onChange={() => handleCategoryToggle(category.name)}
                                    className="sn-checkbox"
                                />
                                <span className="sn-text-m sn-text-primary sn-ml-2">{category.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="sn-text-m sn-text-secondary sn-task-sidebar__categories">
                    {__('No categories available. Create categories in Settings.', 'analogwp-site-notes')}
                </p>
            )}
            {formData.categories.length > 0 && (
                <div className="sn-flex sn-flex-wrap sn-gap-1 sn-mt-2">
                    {formData.categories.map((categoryName, index) => (
                        <span key={index} className="sn-tag-removable">
                            {categoryName}
                            <button
                                type="button"
                                onClick={() => handleCategoryToggle(categoryName)}
                                className="sn-tag-remove-btn"
                            >
                                <CloseSmallIcon size="sm" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );

    if (!isOpen) return null;

    if (isSidebar) {
        return (
            <div className="sn-task-sidebar">
                <div className="sn-task-sidebar__header">
                    <div className="sn-task-sidebar__header-row">
                        <input
                            type="text"
                            value={formData.taskTitle}
                            onChange={(e) => handleInputChange('taskTitle', e.target.value)}
                            placeholder={editTask ?
                                __('Edit task title', 'analogwp-site-notes') :
                                __('Add task title', 'analogwp-site-notes')
                            }
                            className="sn-input-inline sn-flex-1"
                        />
                        <button
                            type="button"
                            className="sn-task-sidebar__close"
                            onClick={handleCancel}
                            title={__('Close', 'analogwp-site-notes')}
                        >
                            <CloseIcon />
                        </button>
                    </div>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder={__('Add a task description here (optional)', 'analogwp-site-notes')}
                        className="sn-input sn-textarea"
                        rows="3"
                    />
                </div>

                <div className="sn-task-sidebar__body sn-space-y-4">
                    <div className="sn-task-sidebar__field">
                        <label className="sn-label">{__('Status', 'analogwp-site-notes')}</label>
                        <select
                            value={formData.status}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                            className="sn-input"
                        >
                            {statuses.map(status => (
                                <option key={status.key} value={status.key}>
                                    {status.icon} {status.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sn-task-sidebar__field">
                        <label className="sn-label">{__('Assign', 'analogwp-site-notes')}</label>
                        <select
                            value={formData.assignedUser}
                            onChange={(e) => handleInputChange('assignedUser', e.target.value)}
                            className="sn-input"
                        >
                            <option value="">{__('Select User', 'analogwp-site-notes')}</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="sn-task-sidebar__field">
                        <label className="sn-label">{__('Page', 'analogwp-site-notes')}</label>
                        <select
                            value={formData.pageId}
                            onChange={(e) => handleInputChange('pageId', e.target.value)}
                            className="sn-input"
                        >
                            <option value="">{__('Select Page', 'analogwp-site-notes')}</option>
                            {pages.map(page => (
                                <option key={page.id} value={page.id}>{page.title}</option>
                            ))}
                        </select>
                        {formData.pageId && (
                            <div className="sn-task-sidebar__url-preview">
                                <small>
                                    {__('URL:', 'analogwp-site-notes')}
                                    <a
                                        href={pages.find(p => String(p.id) === String(formData.pageId))?.url || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="sn-task-sidebar__url-link"
                                    >
                                        {pages.find(p => String(p.id) === String(formData.pageId))?.url || ''}
                                    </a>
                                </small>
                            </div>
                        )}
                    </div>

                    <div className="sn-task-sidebar__field">
                        <label className="sn-label">{__('Priority', 'analogwp-site-notes')}</label>
                        <select
                            value={formData.priority}
                            onChange={(e) => handleInputChange('priority', e.target.value)}
                            className="sn-input"
                        >
                            {priorities && priorities.length > 0 ? (
                                priorities.map(priority => (
                                    <option key={priority.id} value={priority.key}>
                                        {priority.name}
                                    </option>
                                ))
                            ) : (
                                <>
                                    <option value="low">{__('Low', 'analogwp-site-notes')}</option>
                                    <option value="medium">{__('Medium', 'analogwp-site-notes')}</option>
                                    <option value="high">{__('High', 'analogwp-site-notes')}</option>
                                </>
                            )}
                        </select>
                    </div>

                    {renderCategoriesField()}

                    <div className="sn-task-sidebar__field">
                        <label className="sn-label">{__('Due Date', 'analogwp-site-notes')}</label>
                        <div className="sn-task-sidebar__date-wrap">
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                                className="sn-input"
                                placeholder={__('Select Due Date', 'analogwp-site-notes')}
                            />
                            <CalendarIcon size="sm" className="sn-task-sidebar__date-icon" />
                        </div>
                    </div>

                    <div className="sn-task-sidebar__field">
                        <label className="sn-label">{__('Add time to timesheet', 'analogwp-site-notes')}</label>
                        <p className="sn-text-s sn-text-secondary sn-mb-2">{__('Time will be added as an entry to the task timesheet', 'analogwp-site-notes')}</p>
                        <div className="sn-task-sidebar__time-row">
                            <span className="sn-flex sn-items-center sn-gap-2">
                                <ClockCircleIcon size="sm" className="sn-text-secondary" />
                                <input
                                    type="number"
                                    value={formData.timeHours}
                                    onChange={(e) => handleInputChange('timeHours', e.target.value)}
                                    placeholder="HH"
                                    className="sn-input sn-number-input--compact"
                                    min="0"
                                    max="23"
                                />
                            </span>
                            <span className="sn-text-m sn-text-secondary">/</span>
                            <input
                                type="number"
                                value={formData.timeMinutes}
                                onChange={(e) => handleInputChange('timeMinutes', e.target.value)}
                                placeholder="MM"
                                className="sn-input sn-number-input--compact"
                                min="0"
                                max="59"
                            />
                        </div>
                    </div>
                </div>

                <div className="sn-task-sidebar__footer">
                    <div className="sn-task-sidebar__footer-actions">
                        <button
                            type="button"
                            className="sn-btn-primary-solid"
                            onClick={handleSave}
                        >
                            {editTask ? __('Update Task', 'analogwp-site-notes') : __('Create Task', 'analogwp-site-notes')}
                        </button>
                        <button
                            type="button"
                            className="sn-btn-secondary-solid"
                            onClick={handleCancel}
                        >
                            {__('Cancel', 'analogwp-site-notes')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="sn-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="sn-modal">
                <div className="sn-modal__header">
                    <input
                        type="text"
                        value={formData.taskTitle}
                        onChange={(e) => handleInputChange('taskTitle', e.target.value)}
                        placeholder={editTask ?
                            __('Edit task title', 'analogwp-site-notes') :
                            __('Add task title', 'analogwp-site-notes')
                        }
                        className="sn-input-inline sn-mb-3"
                    />
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder={__('Add a task description here (optional)', 'analogwp-site-notes')}
                        className="sn-input sn-textarea"
                        rows="3"
                    />
                    <div className="sn-modal__close">
                        <button
                            type="button"
                            className="sn-task-sidebar__close"
                            onClick={handleCancel}
                            title={__('Close', 'analogwp-site-notes')}
                        >
                            <CloseIcon />
                        </button>
                    </div>
                </div>

                <div className="sn-modal__tabs">
                    <button type="button" className="sn-modal__tab sn-modal__tab--active">
                        {__('Details', 'analogwp-site-notes')}
                    </button>
                    <button type="button" className="sn-modal__tab sn-modal__tab--inactive">
                        {__('Timesheet', 'analogwp-site-notes')}
                    </button>
                </div>

                <div className="sn-modal__body sn-space-y-6">
                    <div className="sn-space-y-2">
                        <label className="sn-label">{__('Status', 'analogwp-site-notes')}</label>
                        <select
                            value={formData.status}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                            className="sn-input"
                        >
                            {statuses.map(status => (
                                <option key={status.key} value={status.key}>
                                    {status.icon} {status.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sn-space-y-2">
                        <label className="sn-label">{__('Assign', 'analogwp-site-notes')}</label>
                        <select
                            value={formData.assignedUser}
                            onChange={(e) => handleInputChange('assignedUser', e.target.value)}
                            className="sn-input"
                        >
                            <option value="">{__('Select User', 'analogwp-site-notes')}</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="sn-space-y-2">
                        <label className="sn-label">{__('Page', 'analogwp-site-notes')}</label>
                        <select
                            value={formData.pageId}
                            onChange={(e) => handleInputChange('pageId', e.target.value)}
                            className="sn-input"
                        >
                            <option value="">{__('Select Page', 'analogwp-site-notes')}</option>
                            {pages.map(page => (
                                <option key={page.id} value={page.id}>{page.title}</option>
                            ))}
                        </select>
                        {formData.pageId && (
                            <div className="sn-task-sidebar__url-preview sn-mt-2">
                                <small className="sn-text-m sn-text-secondary">
                                    {__('URL:', 'analogwp-site-notes')}
                                    <a
                                        href={pages.find(p => String(p.id) === String(formData.pageId))?.url || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="sn-task-sidebar__url-link"
                                    >
                                        {pages.find(p => String(p.id) === String(formData.pageId))?.url || ''}
                                    </a>
                                </small>
                            </div>
                        )}
                    </div>

                    <div className="sn-space-y-2">
                        <label className="sn-label">{__('Priority', 'analogwp-site-notes')}</label>
                        <select
                            value={formData.priority}
                            onChange={(e) => handleInputChange('priority', e.target.value)}
                            className="sn-input"
                        >
                            {priorities && priorities.length > 0 ? (
                                priorities.map(priority => (
                                    <option key={priority.id} value={priority.key}>
                                        {priority.name}
                                    </option>
                                ))
                            ) : (
                                <>
                                    <option value="low">{__('Low', 'analogwp-site-notes')}</option>
                                    <option value="medium">{__('Medium', 'analogwp-site-notes')}</option>
                                    <option value="high">{__('High', 'analogwp-site-notes')}</option>
                                </>
                            )}
                        </select>
                    </div>

                    {renderCategoriesField()}

                    <div className="sn-space-y-2">
                        <label className="sn-label">{__('Due Date', 'analogwp-site-notes')}</label>
                        <div className="sn-task-sidebar__date-wrap">
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                                className="sn-input"
                                placeholder={__('Select Due Date', 'analogwp-site-notes')}
                            />
                            <CalendarIcon className="sn-task-sidebar__date-icon" />
                        </div>
                    </div>

                    <div className="sn-space-y-2">
                        <label className="sn-label">{__('Add time to timesheet', 'analogwp-site-notes')}</label>
                        <p className="sn-text-m sn-text-secondary sn-mb-2">{__('Time will be added as an entry to the task timesheet', 'analogwp-site-notes')}</p>
                        <div className="sn-task-sidebar__time-row">
                            <input
                                type="number"
                                value={formData.timeHours}
                                onChange={(e) => handleInputChange('timeHours', e.target.value)}
                                placeholder="HH"
                                className="sn-input sn-number-input--compact"
                                min="0"
                                max="23"
                            />
                            <span className="sn-text-m sn-text-secondary">/</span>
                            <input
                                type="number"
                                value={formData.timeMinutes}
                                onChange={(e) => handleInputChange('timeMinutes', e.target.value)}
                                placeholder="MM"
                                className="sn-input sn-number-input--compact"
                                min="0"
                                max="59"
                            />
                            <ClockCircleIcon className="sn-text-secondary sn-ml-2" />
                            <button type="button" className="sn-btn-ghost sn-ml-3">
                                {__('Add', 'analogwp-site-notes')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="sn-modal__footer">
                    <button
                        type="button"
                        className="sn-btn-ghost"
                        onClick={handleCancel}
                    >
                        {__('Cancel', 'analogwp-site-notes')}
                    </button>
                    <button
                        type="button"
                        className="sn-btn-primary-solid"
                        onClick={handleSave}
                    >
                        {editTask ? __('Update Task', 'analogwp-site-notes') : __('Save Task', 'analogwp-site-notes')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddTaskModal;
