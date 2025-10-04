/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { showToast } from './ToastProvider';

const AddTaskModal = ({ isOpen, onClose, onSave, users, pages, editTask = null, statuses = [], isSidebar = false }) => {
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

    // Populate form data when editing a task
    useEffect(() => {
        if (editTask && isOpen) {
            // Handle time estimation parsing more safely
            let timeHours = '';
            let timeMinutes = '';
            if (editTask.time_estimation) {
                const timeParts = editTask.time_estimation.split(':');
                timeHours = timeParts[0] || '';
                timeMinutes = timeParts[1] || '';
            }

            // Handle different possible field names for assignee
            let assignedUserId = '';
            if (editTask.assigned_to) {
                assignedUserId = editTask.assigned_to;
            } else if (editTask.assignee?.id) {
                assignedUserId = editTask.assignee.id;
            } else if (editTask.user_id) {
                assignedUserId = editTask.user_id;
            }

            // Handle page ID - could be string or number, or derive from page_url
            let pageId = '';
            if (editTask.post_id && editTask.post_id !== '0' && editTask.post_id !== 0) {
                pageId = String(editTask.post_id);
            } else if (editTask.page_url && pages.length > 0) {
                // Try to find page by URL if post_id is 0
                const matchingPage = pages.find(page => page.url === editTask.page_url);
                if (matchingPage) {
                    pageId = String(matchingPage.id);
                }
            }

            setFormData({
                taskName: editTask.comment_text || '',
                status: editTask.status || 'open',
                assignedUser: assignedUserId,
                category: editTask.category || '',
                pageId: pageId,
                dueDate: editTask.due_date || '',
                timeHours: timeHours,
                timeMinutes: timeMinutes,
                priority: editTask.priority || 'medium',
                description: editTask.comment_text || ''
            });
        } else {
            // Reset form for new task
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
        }
    }, [editTask, isOpen, pages]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        // Validation
        if (!formData.taskName.trim()) {
            showToast.error(__('Please enter a task name', 'analogwp-client-handoff'));
            return;
        }

        // Only require page selection for new tasks, not when editing
        if (!editTask && (!formData.pageId || formData.pageId === '')) {
            showToast.error(__('Please select a page for this task', 'analogwp-client-handoff'));
            return;
        }

        // Find selected page to get URL
        const selectedPage = pages.find(page => String(page.id) === String(formData.pageId));
        const pageUrl = selectedPage ? selectedPage.url : '';

        // Handle page ID conversion - some pages have string IDs (like 'blog'), others have numeric IDs
        let postId = 0;
        if (formData.pageId && formData.pageId !== '') {
            const numericId = parseInt(formData.pageId, 10);
            if (!isNaN(numericId)) {
                postId = numericId;
            }
            // For string IDs like 'blog', we keep post_id as 0 and rely on page_url
        }

        const taskData = {
            comment_text: formData.description || formData.taskName,
            post_id: postId,
            page_url: pageUrl,
            assigned_to: formData.assignedUser || 0,
            priority: formData.priority,
            status: formData.status,
            category: formData.category,
            due_date: formData.dueDate,
            time_estimation: formData.timeHours && formData.timeMinutes ? 
                `${formData.timeHours}:${String(formData.timeMinutes).padStart(2, '0')}` : ''
        };

        console.log('Task data being saved:', taskData);
        console.log('Is editing task?', !!editTask);

        try {
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
        } catch (err) {
            console.error('Error saving task:', err);
            showToast.error(__('Error saving task. Please try again.', 'analogwp-client-handoff'));
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

    const renderFormContent = (isSidebarMode = false) => {
        const spacing = isSidebarMode ? 'space-y-4' : 'space-y-6';
        const padding = isSidebarMode ? '' : 'p-6';
        
        return (
            <div className={`${padding} ${spacing}`}>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">{__('Status', 'analogwp-client-handoff')}</label>
                    <div className="flex">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${formData.status === 'open' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>
                            {__('Todo', 'analogwp-client-handoff')}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">{__('Assign', 'analogwp-client-handoff')}</label>
                    <select
                        value={formData.assignedUser}
                        onChange={(e) => handleInputChange('assignedUser', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                    >
                        <option value="">{__('Select User', 'analogwp-client-handoff')}</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">{__('Page', 'analogwp-client-handoff')}</label>
                    <select
                        value={formData.pageId}
                        onChange={(e) => handleInputChange('pageId', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                    >
                        <option value="">{__('Select Page', 'analogwp-client-handoff')}</option>
                        {pages.map(page => (
                            <option key={page.id} value={page.id}>{page.title}</option>
                        ))}
                    </select>
                    {formData.pageId && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <small className="text-sm text-gray-600">
                                {__('URL:', 'analogwp-client-handoff')} 
                                <a 
                                    href={pages.find(p => String(p.id) === String(formData.pageId))?.url || '#'} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="ml-1 text-indigo-600 hover:text-indigo-500 underline"
                                >
                                    {pages.find(p => String(p.id) === String(formData.pageId))?.url || ''}
                                </a>
                            </small>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">{__('Priority', 'analogwp-client-handoff')}</label>
                    <select
                        value={formData.priority}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                    >
                        <option value="low">{__('Low', 'analogwp-client-handoff')}</option>
                        <option value="medium">{__('Medium', 'analogwp-client-handoff')}</option>
                        <option value="high">{__('High', 'analogwp-client-handoff')}</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">{__('Category', 'analogwp-client-handoff')}</label>
                    <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                    >
                        <option value="">{__('Select Category', 'analogwp-client-handoff')}</option>
                        <option value="bug">{__('Bug', 'analogwp-client-handoff')}</option>
                        <option value="feature">{__('Feature', 'analogwp-client-handoff')}</option>
                        <option value="improvement">{__('Improvement', 'analogwp-client-handoff')}</option>
                        <option value="content">{__('Content', 'analogwp-client-handoff')}</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">{__('Due Date', 'analogwp-client-handoff')}</label>
                    <div className="relative">
                        <input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => handleInputChange('dueDate', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                            placeholder={__('Select Due Date', 'analogwp-client-handoff')}
                        />
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                        </svg>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">{__('Add time', 'analogwp-client-handoff')}</label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            value={formData.timeHours}
                            onChange={(e) => handleInputChange('timeHours', e.target.value)}
                            placeholder="HH"
                            className="w-16 border border-gray-300 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                            min="0"
                            max="23"
                        />
                        <span className="text-gray-500">/</span>
                        <input
                            type="number"
                            value={formData.timeMinutes}
                            onChange={(e) => handleInputChange('timeMinutes', e.target.value)}
                            placeholder="MM"
                            className="w-16 border border-gray-300 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                            min="0"
                            max="59"
                        />
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="text-gray-400 ml-2">
                            <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                        </svg>
                        <button type="button" className="ml-3 px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
                            {__('Add', 'analogwp-client-handoff')}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">{__('Description', 'analogwp-client-handoff')}</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder={__('Add a task description here (optional)', 'analogwp-client-handoff')}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white resize-vertical text-sm"
                        rows={isSidebarMode ? "4" : "6"}
                    />
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    // If used as sidebar, return just the content without modal wrapper
    if (isSidebar) {
        return (
            <div className="h-full flex flex-col bg-white">
                {/* Header */}
                <div className="flex-none border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <input
                            type="text"
                            value={formData.taskName}
                            onChange={(e) => handleInputChange('taskName', e.target.value)}
                            placeholder={editTask ? 
                                __('Edit task name', 'analogwp-client-handoff') : 
                                __('Add task Name', 'analogwp-client-handoff')
                            }
                            className="flex-1 text-lg font-semibold border-none outline-none bg-transparent placeholder-gray-400 text-gray-900"
                        />
                        <button 
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors duration-200"
                            onClick={handleCancel}
                            title={__('Close', 'analogwp-client-handoff')}
                        >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Simple form content for sidebar */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">{__('Status', 'analogwp-client-handoff')}</label>
                        <select
                            value={formData.status}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                        >
                            {statuses.map(status => (
                                <option key={status.key} value={status.key}>
                                    {status.icon} {status.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">{__('Assign', 'analogwp-client-handoff')}</label>
                        <select
                            value={formData.assignedUser}
                            onChange={(e) => handleInputChange('assignedUser', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                        >
                            <option value="">{__('Select User', 'analogwp-client-handoff')}</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">{__('Page', 'analogwp-client-handoff')}</label>
                        <select
                            value={formData.pageId}
                            onChange={(e) => handleInputChange('pageId', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                        >
                            <option value="">{__('Select Page', 'analogwp-client-handoff')}</option>
                            {pages.map(page => (
                                <option key={page.id} value={page.id}>{page.title}</option>
                            ))}
                        </select>
                        {formData.pageId && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                                <small className="text-xs text-gray-600">
                                    {__('URL:', 'analogwp-client-handoff')} 
                                    <a 
                                        href={pages.find(p => String(p.id) === String(formData.pageId))?.url || '#'} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="ml-1 text-indigo-600 hover:text-indigo-500 underline break-all"
                                    >
                                        {pages.find(p => String(p.id) === String(formData.pageId))?.url || ''}
                                    </a>
                                </small>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">{__('Priority', 'analogwp-client-handoff')}</label>
                        <select
                            value={formData.priority}
                            onChange={(e) => handleInputChange('priority', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                        >
                            <option value="low">{__('Low', 'analogwp-client-handoff')}</option>
                            <option value="medium">{__('Medium', 'analogwp-client-handoff')}</option>
                            <option value="high">{__('High', 'analogwp-client-handoff')}</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">{__('Category', 'analogwp-client-handoff')}</label>
                        <select
                            value={formData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                        >
                            <option value="">{__('Select Category', 'analogwp-client-handoff')}</option>
                            <option value="bug">{__('Bug', 'analogwp-client-handoff')}</option>
                            <option value="feature">{__('Feature', 'analogwp-client-handoff')}</option>
                            <option value="improvement">{__('Improvement', 'analogwp-client-handoff')}</option>
                            <option value="content">{__('Content', 'analogwp-client-handoff')}</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">{__('Due Date', 'analogwp-client-handoff')}</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                                placeholder={__('Select Due Date', 'analogwp-client-handoff')}
                            />
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                            </svg>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">{__('Add time', 'analogwp-client-handoff')}</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                value={formData.timeHours}
                                onChange={(e) => handleInputChange('timeHours', e.target.value)}
                                placeholder="HH"
                                className="w-12 border border-gray-300 rounded-lg px-2 py-2 text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                                min="0"
                                max="23"
                            />
                            <span className="text-gray-500 text-sm">/</span>
                            <input
                                type="number"
                                value={formData.timeMinutes}
                                onChange={(e) => handleInputChange('timeMinutes', e.target.value)}
                                placeholder="MM"
                                className="w-12 border border-gray-300 rounded-lg px-2 py-2 text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm"
                                min="0"
                                max="59"
                            />
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="text-gray-400 ml-1">
                                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                            </svg>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">{__('Description', 'analogwp-client-handoff')}</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder={__('Add a task description here (optional)', 'analogwp-client-handoff')}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white resize-vertical text-sm"
                            rows="3"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-none border-t border-gray-200 p-4">
                    <div className="flex space-x-3">
                        <button 
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-200"
                            onClick={handleSave}
                        >
                            {editTask ? __('Update Task', 'analogwp-client-handoff') : __('Create Task', 'analogwp-client-handoff')}
                        </button>
                        <button 
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                            onClick={handleCancel}
                        >
                            {__('Cancel', 'analogwp-client-handoff')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg">
                    <input
                        type="text"
                        value={formData.taskName}
                        onChange={(e) => handleInputChange('taskName', e.target.value)}
                        placeholder={editTask ? 
                            __('Edit task name', 'analogwp-client-handoff') : 
                            __('Add task Name', 'analogwp-client-handoff')
                        }
                        className="w-full text-xl font-semibold border-none outline-none bg-transparent placeholder-gray-400 text-gray-900"
                    />
                    <div className="absolute top-4 right-4">
                        <button 
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors duration-200"
                            onClick={handleCancel}
                            title={__('Close', 'analogwp-client-handoff')}
                        >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="border-b border-gray-200">
                    <nav className="flex">
                        <button className="px-6 py-3 text-sm font-medium text-indigo-600 border-b-2 border-indigo-500">
                            {__('Details', 'analogwp-client-handoff')}
                        </button>
                        <button className="px-6 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
                            {__('Timesheet', 'analogwp-client-handoff')}
                        </button>
                    </nav>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">{__('Status', 'analogwp-client-handoff')}</label>
                        <select
                            value={formData.status}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                            {statuses.map(status => (
                                <option key={status.key} value={status.key}>
                                    {status.icon} {status.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">{__('Assign', 'analogwp-client-handoff')}</label>
                        <select
                            value={formData.assignedUser}
                            onChange={(e) => handleInputChange('assignedUser', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                            <option value="">{__('Select User', 'analogwp-client-handoff')}</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">{__('Page', 'analogwp-client-handoff')}</label>
                        <select
                            value={formData.pageId}
                            onChange={(e) => handleInputChange('pageId', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                            <option value="">{__('Select Page', 'analogwp-client-handoff')}</option>
                            {pages.map(page => (
                                <option key={page.id} value={page.id}>{page.title}</option>
                            ))}
                        </select>
                        {formData.pageId && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                <small className="text-sm text-gray-600">
                                    {__('URL:', 'analogwp-client-handoff')} 
                                    <a 
                                        href={pages.find(p => String(p.id) === String(formData.pageId))?.url || '#'} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="ml-1 text-indigo-600 hover:text-indigo-500 underline"
                                    >
                                        {pages.find(p => String(p.id) === String(formData.pageId))?.url || ''}
                                    </a>
                                </small>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">{__('Priority', 'analogwp-client-handoff')}</label>
                        <select
                            value={formData.priority}
                            onChange={(e) => handleInputChange('priority', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                            <option value="low">{__('Low', 'analogwp-client-handoff')}</option>
                            <option value="medium">{__('Medium', 'analogwp-client-handoff')}</option>
                            <option value="high">{__('High', 'analogwp-client-handoff')}</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">{__('Category', 'analogwp-client-handoff')}</label>
                        <select
                            value={formData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                            <option value="">{__('Select Category', 'analogwp-client-handoff')}</option>
                            <option value="bug">{__('Bug', 'analogwp-client-handoff')}</option>
                            <option value="feature">{__('Feature', 'analogwp-client-handoff')}</option>
                            <option value="improvement">{__('Improvement', 'analogwp-client-handoff')}</option>
                            <option value="content">{__('Content', 'analogwp-client-handoff')}</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">{__('Due Date', 'analogwp-client-handoff')}</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                placeholder={__('Select Due Date', 'analogwp-client-handoff')}
                            />
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                            </svg>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">{__('Add time', 'analogwp-client-handoff')}</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                value={formData.timeHours}
                                onChange={(e) => handleInputChange('timeHours', e.target.value)}
                                placeholder="HH"
                                className="w-16 border border-gray-300 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                min="0"
                                max="23"
                            />
                            <span className="text-gray-500">/</span>
                            <input
                                type="number"
                                value={formData.timeMinutes}
                                onChange={(e) => handleInputChange('timeMinutes', e.target.value)}
                                placeholder="MM"
                                className="w-16 border border-gray-300 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                min="0"
                                max="59"
                            />
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="text-gray-400 ml-2">
                                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                            </svg>
                            <button type="button" className="ml-3 px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
                                {__('Add', 'analogwp-client-handoff')}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">{__('Description', 'analogwp-client-handoff')}</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder={__('Add a task description here (optional)', 'analogwp-client-handoff')}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white resize-vertical"
                            rows="6"
                        />
                    </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-lg flex justify-end space-x-3">
                    <button 
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
                        onClick={handleCancel}
                    >
                        {__('Cancel', 'analogwp-client-handoff')}
                    </button>
                    <button 
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-200"
                        onClick={handleSave}
                    >
                        {editTask ? __('Update Task', 'analogwp-client-handoff') : __('Save Task', 'analogwp-client-handoff')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddTaskModal;