/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * External dependencies
 */
import { 
    PlusIcon, 
    TrashIcon, 
    PencilIcon,
    XMarkIcon,
    CheckIcon
} from '@heroicons/react/24/outline';

/**
 * Internal dependencies
 */
import { Button } from '../ui';
import { useSettings } from './SettingsProvider';
import { 
    SettingsSection, 
    SettingsCard, 
    TextInputField, 
    ColorInput,
    FieldDescription 
} from './FieldComponents';
import { showToast } from '../ToastProvider';
import logger from '../../../shared/utils/logger';

const LabelsAndFiltersSettings = () => {
    const { categories, setCategories, priorities, setPriorities, saveSettings } = useSettings();
    
    // Categories state
    const [newCategory, setNewCategory] = useState({ name: '' });
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editCategoryForm, setEditCategoryForm] = useState({ name: '' });

    // Priorities state
    const [newPriority, setNewPriority] = useState({ name: '', color: '#3858e9' });
    const [editingPriorityId, setEditingPriorityId] = useState(null);
    const [editPriorityForm, setEditPriorityForm] = useState({ name: '', color: '' });

    // Helper function to update categories and auto-save
    const updateCategories = async (newCategories) => {
        setCategories(newCategories);
        try {
            await saveSettings(true, newCategories, null);
        } catch (error) {
            logger.error('Error saving categories:', error);
            showToast.error(__('Failed to save categories', 'analogwp-client-handoff'));
        }
    };

    // Helper function to update priorities and auto-save
    const updatePriorities = async (newPriorities) => {
        setPriorities(newPriorities);
        try {
            await saveSettings(true, null, newPriorities);
        } catch (error) {
            logger.error('Error saving priorities:', error);
            showToast.error(__('Failed to save priorities', 'analogwp-client-handoff'));
        }
    };

    // Category functions
    const addCategory = async () => {
        if (!newCategory.name.trim()) {
            showToast.error(__('Category name is required', 'analogwp-client-handoff'));
            return;
        }

        if (categories.some(cat => cat.name.toLowerCase() === newCategory.name.toLowerCase())) {
            showToast.error(__('Category name already exists', 'analogwp-client-handoff'));
            return;
        }

        const category = {
            id: Date.now(),
            name: newCategory.name.trim()
        };

        await updateCategories([...categories, category]);
        setNewCategory({ name: '' });
        showToast.success(__('Category added successfully', 'analogwp-client-handoff'));
    };

    const startEditCategory = (category) => {
        setEditingCategoryId(category.id);
        setEditCategoryForm({ name: category.name });
    };

    const cancelEditCategory = () => {
        setEditingCategoryId(null);
        setEditCategoryForm({ name: '' });
    };

    const saveEditCategory = async () => {
        if (!editCategoryForm.name.trim()) {
            showToast.error(__('Category name is required', 'analogwp-client-handoff'));
            return;
        }

        if (categories.some(cat => cat.id !== editingCategoryId && cat.name.toLowerCase() === editCategoryForm.name.toLowerCase())) {
            showToast.error(__('Category name already exists', 'analogwp-client-handoff'));
            return;
        }

        await updateCategories(categories.map(cat => 
            cat.id === editingCategoryId 
                ? { ...cat, name: editCategoryForm.name.trim() }
                : cat
        ));
        
        setEditingCategoryId(null);
        setEditCategoryForm({ name: '' });
        showToast.success(__('Category updated successfully', 'analogwp-client-handoff'));
    };

    const deleteCategory = async (id) => {
        await updateCategories(categories.filter(cat => cat.id !== id));
        showToast.success(__('Category deleted successfully', 'analogwp-client-handoff'));
    };

    // Priority functions
    const addPriority = async () => {
        if (!newPriority.name.trim()) {
            showToast.error(__('Priority name is required', 'analogwp-client-handoff'));
            return;
        }

        if (priorities.some(pri => pri.name.toLowerCase() === newPriority.name.toLowerCase())) {
            showToast.error(__('Priority name already exists', 'analogwp-client-handoff'));
            return;
        }

        const priority = {
            id: Date.now(),
            key: newPriority.name.toLowerCase().replace(/\s+/g, '_'),
            name: newPriority.name.trim(),
            color: newPriority.color
        };

        await updatePriorities([...priorities, priority]);
        setNewPriority({ name: '', color: '#f59e0b' });
        showToast.success(__('Priority added successfully', 'analogwp-client-handoff'));
    };

    const startEditPriority = (priority) => {
        setEditingPriorityId(priority.id);
        setEditPriorityForm({ name: priority.name, color: priority.color });
    };

    const cancelEditPriority = () => {
        setEditingPriorityId(null);
        setEditPriorityForm({ name: '', color: '' });
    };

    const saveEditPriority = async () => {
        if (!editPriorityForm.name.trim()) {
            showToast.error(__('Priority name is required', 'analogwp-client-handoff'));
            return;
        }

        if (priorities.some(pri => pri.id !== editingPriorityId && pri.name.toLowerCase() === editPriorityForm.name.toLowerCase())) {
            showToast.error(__('Priority name already exists', 'analogwp-client-handoff'));
            return;
        }

        await updatePriorities(priorities.map(pri => 
            pri.id === editingPriorityId 
                ? { ...pri, name: editPriorityForm.name.trim(), color: editPriorityForm.color, key: editPriorityForm.name.toLowerCase().replace(/\s+/g, '_') }
                : pri
        ));
        
        setEditingPriorityId(null);
        setEditPriorityForm({ name: '', color: '' });
        showToast.success(__('Priority updated successfully', 'analogwp-client-handoff'));
    };

    const deletePriority = async (id) => {
        await updatePriorities(priorities.filter(pri => pri.id !== id));
        showToast.success(__('Priority deleted successfully', 'analogwp-client-handoff'));
    };

    const predefinedColors = [
        '#3858e9', '#e74c3c', '#2ecc71', '#f39c12', 
        '#9b59b6', '#1abc9c', '#34495e', '#9fa1a3'
    ];

    return (
        <div className="p-6 max-w-4xl">
            {/* Priorities Section */}
            <SettingsSection
                title={__('Priorities', 'analogwp-client-handoff')}
                description={__('Define priority levels for tasks with customizable colors.', 'analogwp-client-handoff')}
            >
                <SettingsCard title={__('Add New Priority', 'analogwp-client-handoff')}>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextInputField
                                id="new_priority_name"
                                label={__('Priority Name', 'analogwp-client-handoff')}
                                value={newPriority.name}
                                onChange={(value) => setNewPriority({ ...newPriority, name: value })}
                                placeholder={__('Enter priority name...', 'analogwp-client-handoff')}
                            />
                            
                            <ColorInput
                                id="new_priority_color"
                                label={__('Priority Color', 'analogwp-client-handoff')}
                                value={newPriority.color}
                                onChange={(value) => setNewPriority({ ...newPriority, color: value })}
                            />
                        </div>
                        
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">{__('Quick Colors:', 'analogwp-client-handoff')}</label>
                            <div className="flex flex-wrap gap-2">
                                {predefinedColors.map(color => (
                                    <button
                                        key={color}
                                        className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                                            newPriority.color === color 
                                                ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2' 
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setNewPriority({ ...newPriority, color })}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={addPriority}
                            disabled={!newPriority.name.trim()}
                            variant="primary"
                            size="default"
                            icon={<PlusIcon className="w-4 h-4" />}
                        >
                            {__('Add Priority', 'analogwp-client-handoff')}
                        </Button>
                    </div>
                </SettingsCard>

                <SettingsCard title={__('Existing Priorities', 'analogwp-client-handoff')}>
                    {priorities.length === 0 ? (
                        <FieldDescription>
                            {__('No priorities created yet. Add your first priority above.', 'analogwp-client-handoff')}
                        </FieldDescription>
                    ) : (
                        <div className="space-y-3">
                            {priorities.map(priority => (
                                <div key={priority.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    {editingPriorityId === priority.id ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <TextInputField
                                                    value={editPriorityForm.name}
                                                    onChange={(value) => setEditPriorityForm({ ...editPriorityForm, name: value })}
                                                    placeholder={__('Priority name...', 'analogwp-client-handoff')}
                                                />
                                                <ColorInput
                                                    value={editPriorityForm.color}
                                                    onChange={(value) => setEditPriorityForm({ ...editPriorityForm, color: value })}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={saveEditPriority}
                                                    variant="primary"
                                                    size="small"
                                                    icon={<CheckIcon className="w-4 h-4" />}
                                                    title={__('Save changes', 'analogwp-client-handoff')}
                                                >
                                                    {__('Save', 'analogwp-client-handoff')}
                                                </Button>
                                                <Button
                                                    onClick={cancelEditPriority}
                                                    variant="secondary"
                                                    size="small"
                                                    icon={<XMarkIcon className="w-4 h-4" />}
                                                    title={__('Cancel editing', 'analogwp-client-handoff')}
                                                >
                                                    {__('Cancel', 'analogwp-client-handoff')}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span 
                                                    className="w-4 h-4 rounded-full border border-gray-300"
                                                    style={{ backgroundColor: priority.color }}
                                                />
                                                <span className="font-medium text-gray-900">{priority.name}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => startEditPriority(priority)}
                                                    variant="tertiary"
                                                    size="small"
                                                    title={__('Edit priority', 'analogwp-client-handoff')}
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        if (confirm(__('Are you sure you want to delete this priority?', 'analogwp-client-handoff'))) {
                                                            deletePriority(priority.id);
                                                        }
                                                    }}
                                                    variant="destructive"
                                                    size="small"
                                                    title={__('Delete priority', 'analogwp-client-handoff')}
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </SettingsCard>
            </SettingsSection>

						{/* Categories Section */}
            <SettingsSection
                title={__('Categories', 'analogwp-client-handoff')}
                description={__('Organize comments and tasks into categories for better project management.', 'analogwp-client-handoff')}
            >
                <SettingsCard title={__('Add New Category', 'analogwp-client-handoff')}>
                    <div className="space-y-6">
                        <TextInputField
                            id="new_category_name"
                            label={__('Category Name', 'analogwp-client-handoff')}
                            value={newCategory.name}
                            onChange={(value) => setNewCategory({ ...newCategory, name: value })}
                            placeholder={__('Enter category name...', 'analogwp-client-handoff')}
                        />

                        <Button
                            onClick={addCategory}
                            disabled={!newCategory.name.trim()}
                            variant="primary"
                            size="default"
                            icon={<PlusIcon className="w-4 h-4" />}
                        >
                            {__('Add Category', 'analogwp-client-handoff')}
                        </Button>
                    </div>
                </SettingsCard>

                <SettingsCard title={__('Existing Categories', 'analogwp-client-handoff')}>
                    {categories.length === 0 ? (
                        <FieldDescription>
                            {__('No categories created yet. Add your first category above.', 'analogwp-client-handoff')}
                        </FieldDescription>
                    ) : (
                        <div className="space-y-3">
                            {categories.map(category => (
                                <div key={category.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    {editingCategoryId === category.id ? (
                                        <div className="space-y-4">
                                            <TextInputField
                                                value={editCategoryForm.name}
                                                onChange={(value) => setEditCategoryForm({ ...editCategoryForm, name: value })}
                                                placeholder={__('Category name...', 'analogwp-client-handoff')}
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={saveEditCategory}
                                                    variant="primary"
                                                    size="small"
                                                    icon={<CheckIcon className="w-4 h-4" />}
                                                    title={__('Save changes', 'analogwp-client-handoff')}
                                                >
                                                    {__('Save', 'analogwp-client-handoff')}
                                                </Button>
                                                <Button
                                                    onClick={cancelEditCategory}
                                                    variant="secondary"
                                                    size="small"
                                                    icon={<XMarkIcon className="w-4 h-4" />}
                                                    title={__('Cancel editing', 'analogwp-client-handoff')}
                                                >
                                                    {__('Cancel', 'analogwp-client-handoff')}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium text-gray-900">{category.name}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => startEditCategory(category)}
                                                    variant="tertiary"
                                                    size="small"
                                                    title={__('Edit category', 'analogwp-client-handoff')}
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        if (confirm(__('Are you sure you want to delete this category?', 'analogwp-client-handoff'))) {
                                                            deleteCategory(category.id);
                                                        }
                                                    }}
                                                    variant="destructive"
                                                    size="small"
                                                    title={__('Delete category', 'analogwp-client-handoff')}
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </SettingsCard>
            </SettingsSection>
        </div>
    );
};

export default LabelsAndFiltersSettings;
