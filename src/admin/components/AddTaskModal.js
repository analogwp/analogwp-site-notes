/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const AddTaskModal = ({ isOpen, onClose, onSave, users, pages }) => {
    const [formData, setFormData] = useState({
        taskName: '',
        status: 'open',
        assignedUser: '',
        category: '',
        pageId: '',
        dueDate: '',
        timeHours: '',
        timeMinutes: '',
        priority: 'medium',
        description: ''
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        if (!formData.taskName.trim()) {
            alert(__('Please enter a task name', 'client-handoff-toolkit'));
            return;
        }

        const taskData = {
            action: 'cht_add_new_task', 
            nonce: window.cht_admin_ajax.nonce,
            comment_text: description,
            post_id: selectedPage,
            user_id: assignedUser,
            priority: priority,
            category: category,
            due_date: dueDate,
            time_estimation: timeEstimation,
            status: status
        };        try {
            await onSave(taskData);
            // Reset form
            setFormData({
                taskName: '',
                status: 'open',
                assignedUser: '',
                category: '',
                pageId: '',
                dueDate: '',
                timeHours: '',
                timeMinutes: '',
                priority: 'medium',
                description: ''
            });
            onClose();
        } catch (error) {
            console.error('Error saving task:', error);
            alert(__('Error saving task. Please try again.', 'client-handoff-toolkit'));
        }
    };

    const handleCancel = () => {
        // Reset form
        setFormData({
            taskName: '',
            status: 'open',
            assignedUser: '',
            category: '',
            pageId: '',
            dueDate: '',
            timeHours: '',
            timeMinutes: '',
            priority: 'medium',
            description: ''
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="cht-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="cht-modal-content">
                <div className="cht-modal-header">
                    <input
                        type="text"
                        value={formData.taskName}
                        onChange={(e) => handleInputChange('taskName', e.target.value)}
                        placeholder={__('Add task Name', 'client-handoff-toolkit')}
                        className="cht-task-name-input"
                    />
                    <div className="cht-modal-header-actions">
                        <button 
                            className="cht-modal-action-btn"
                            onClick={handleCancel}
                            title={__('Delete', 'client-handoff-toolkit')}
                        >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5zM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11z"/>
                            </svg>
                        </button>
                        <button 
                            className="cht-modal-action-btn"
                            title={__('Edit', 'client-handoff-toolkit')}
                        >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708L4.5 15.207l-4 1a.5.5 0 0 1-.606-.606l1-4L12.146.146zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175l-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="cht-modal-tabs">
                    <button className="cht-modal-tab active">
                        {__('Details', 'client-handoff-toolkit')}
                    </button>
                    <button className="cht-modal-tab">
                        {__('Timesheet', 'client-handoff-toolkit')}
                    </button>
                </div>

                <div className="cht-modal-form">
                    <div className="cht-form-row">
                        <label>{__('Status', 'client-handoff-toolkit')}</label>
                        <div className="cht-status-selector">
                            <span className={`cht-status-pill ${formData.status === 'open' ? 'active' : ''}`}>
                                {__('Todo', 'client-handoff-toolkit')}
                            </span>
                        </div>
                    </div>

                    <div className="cht-form-row">
                        <label>{__('Assign', 'client-handoff-toolkit')}</label>
                        <select
                            value={formData.assignedUser}
                            onChange={(e) => handleInputChange('assignedUser', e.target.value)}
                            className="cht-form-select"
                        >
                            <option value="">{__('Select User', 'client-handoff-toolkit')}</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="cht-form-row">
                        <label>{__('Page', 'client-handoff-toolkit')}</label>
                        <select
                            value={formData.pageId}
                            onChange={(e) => handleInputChange('pageId', e.target.value)}
                            className="cht-form-select"
                        >
                            <option value="">{__('Select Page', 'client-handoff-toolkit')}</option>
                            {pages.map(page => (
                                <option key={page.id} value={page.id}>{page.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="cht-form-row">
                        <label>{__('Priority', 'client-handoff-toolkit')}</label>
                        <select
                            value={formData.priority}
                            onChange={(e) => handleInputChange('priority', e.target.value)}
                            className="cht-form-select"
                        >
                            <option value="low">{__('Low', 'client-handoff-toolkit')}</option>
                            <option value="medium">{__('Medium', 'client-handoff-toolkit')}</option>
                            <option value="high">{__('High', 'client-handoff-toolkit')}</option>
                        </select>
                    </div>

                    <div className="cht-form-row">
                        <label>{__('Category', 'client-handoff-toolkit')}</label>
                        <select
                            value={formData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            className="cht-form-select"
                        >
                            <option value="">{__('Select Category', 'client-handoff-toolkit')}</option>
                            <option value="bug">{__('Bug', 'client-handoff-toolkit')}</option>
                            <option value="feature">{__('Feature', 'client-handoff-toolkit')}</option>
                            <option value="improvement">{__('Improvement', 'client-handoff-toolkit')}</option>
                            <option value="content">{__('Content', 'client-handoff-toolkit')}</option>
                        </select>
                    </div>

                    <div className="cht-form-row">
                        <label>{__('Due Date', 'client-handoff-toolkit')}</label>
                        <div className="cht-date-input-container">
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                                className="cht-form-date"
                                placeholder={__('Select Due Date', 'client-handoff-toolkit')}
                            />
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="cht-calendar-icon">
                                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                            </svg>
                        </div>
                    </div>

                    <div className="cht-form-row">
                        <label>{__('Add time', 'client-handoff-toolkit')}</label>
                        <div className="cht-time-input-container">
                            <input
                                type="number"
                                value={formData.timeHours}
                                onChange={(e) => handleInputChange('timeHours', e.target.value)}
                                placeholder="HH"
                                className="cht-time-input"
                                min="0"
                                max="23"
                            />
                            <span>/</span>
                            <input
                                type="number"
                                value={formData.timeMinutes}
                                onChange={(e) => handleInputChange('timeMinutes', e.target.value)}
                                placeholder="MM"
                                className="cht-time-input"
                                min="0"
                                max="59"
                            />
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="cht-clock-icon">
                                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                            </svg>
                            <button type="button" className="cht-add-time-btn">
                                {__('Add', 'client-handoff-toolkit')}
                            </button>
                        </div>
                    </div>

                    <div className="cht-form-row">
                        <label>{__('Description', 'client-handoff-toolkit')}</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder={__('Add a task description here (optional)', 'client-handoff-toolkit')}
                            className="cht-form-textarea"
                            rows="6"
                        />
                    </div>
                </div>

                <div className="cht-modal-footer">
                    <button 
                        className="cht-btn cht-btn-primary cht-btn-save"
                        onClick={handleSave}
                    >
                        {__('Save Task', 'client-handoff-toolkit')}
                    </button>
                    <button 
                        className="cht-btn cht-btn-text"
                        onClick={handleCancel}
                    >
                        {__('Cancel', 'client-handoff-toolkit')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddTaskModal;