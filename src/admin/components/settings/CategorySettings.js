/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

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
import { useSettings } from './SettingsProvider';
import { 
    SettingsSection, 
    SettingsCard, 
    TextInput, 
    ColorInput,
    FieldDescription 
} from './FieldComponents';
import { showToast } from '../ToastProvider';

const CategorySettings = () => {
    const { categories, setCategories, saveSettings } = useSettings();
    const [newCategory, setNewCategory] = useState({ name: '', color: '#3498db' });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', color: '' });

    // Helper function to update categories and auto-save
    const updateCategories = async (newCategories) => {
        setCategories(newCategories);
        // Auto-save categories immediately with the new categories
        try {
            await saveSettings(true, newCategories); // Pass new categories directly
        } catch (error) {
            console.error('Error saving categories:', error);
            showToast.error(__('Failed to save categories', 'analogwp-client-handoff'));
        }
    };

    const addCategory = async () => {
        if (!newCategory.name.trim()) {
            showToast.error(__('Category name is required', 'analogwp-client-handoff'));
            return;
        }

        // Check for duplicate names
        if (categories.some(cat => cat.name.toLowerCase() === newCategory.name.toLowerCase())) {
            showToast.error(__('Category name already exists', 'analogwp-client-handoff'));
            return;
        }

        const category = {
            id: Date.now(),
            name: newCategory.name.trim(),
            color: newCategory.color
        };

        await updateCategories([...categories, category]);
        setNewCategory({ name: '', color: '#3498db' });
        showToast.success(__('Category added successfully', 'analogwp-client-handoff'));
    };

    const startEdit = (category) => {
        setEditingId(category.id);
        setEditForm({ name: category.name, color: category.color });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ name: '', color: '' });
    };

    const saveEdit = async () => {
        if (!editForm.name.trim()) {
            showToast.error(__('Category name is required', 'analogwp-client-handoff'));
            return;
        }

        // Check for duplicate names (excluding current category)
        if (categories.some(cat => cat.id !== editingId && cat.name.toLowerCase() === editForm.name.toLowerCase())) {
            showToast.error(__('Category name already exists', 'analogwp-client-handoff'));
            return;
        }

        await updateCategories(categories.map(cat => 
            cat.id === editingId 
                ? { ...cat, name: editForm.name.trim(), color: editForm.color }
                : cat
        ));
        
        setEditingId(null);
        setEditForm({ name: '', color: '' });
        showToast.success(__('Category updated successfully', 'analogwp-client-handoff'));
    };

    const deleteCategory = async (id) => {
        await updateCategories(categories.filter(cat => cat.id !== id));
        showToast.success(__('Category deleted successfully', 'analogwp-client-handoff'));
    };

    const predefinedColors = [
        '#3498db', '#e74c3c', '#2ecc71', '#f39c12', 
        '#9b59b6', '#1abc9c', '#34495e', '#95a5a6'
    ];

    return (
        <div className="p-6 max-w-4xl">
            <SettingsSection
                title={__('Comment Categories', 'analogwp-client-handoff')}
                description={__('Organize comments and tasks into categories for better project management.', 'analogwp-client-handoff')}
            >
                <SettingsCard title={__('Add New Category', 'analogwp-client-handoff')}>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextInput
                                id="new_category_name"
                                label={__('Category Name', 'analogwp-client-handoff')}
                                value={newCategory.name}
                                onChange={(value) => setNewCategory({ ...newCategory, name: value })}
                                placeholder={__('Enter category name...', 'analogwp-client-handoff')}
                            />
                            
                            <ColorInput
                                id="new_category_color"
                                label={__('Category Color', 'analogwp-client-handoff')}
                                value={newCategory.color}
                                onChange={(value) => setNewCategory({ ...newCategory, color: value })}
                            />
                        </div>
                        
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">{__('Quick Colors:', 'analogwp-client-handoff')}</label>
                            <div className="flex flex-wrap gap-2">
                                {predefinedColors.map(color => (
                                    <button
                                        key={color}
                                        className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                                            newCategory.color === color 
                                                ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2' 
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setNewCategory({ ...newCategory, color })}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={addCategory}
                            disabled={!newCategory.name.trim()}
                            isPrimary
                            size="medium"
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
                                    {editingId === category.id ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <TextInput
                                                    value={editForm.name}
                                                    onChange={(value) => setEditForm({ ...editForm, name: value })}
                                                    placeholder={__('Category name...', 'analogwp-client-handoff')}
                                                />
                                                <ColorInput
                                                    value={editForm.color}
                                                    onChange={(value) => setEditForm({ ...editForm, color: value })}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={saveEdit}
                                                    isPrimary
                                                    isSmall
                                                    icon={<CheckIcon className="w-4 h-4" />}
                                                    title={__('Save changes', 'analogwp-client-handoff')}
                                                >
                                                    {__('Save', 'analogwp-client-handoff')}
                                                </Button>
                                                <Button
                                                    onClick={cancelEdit}
                                                    isSecondary
                                                    isSmall
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
                                                    style={{ backgroundColor: category.color }}
                                                />
                                                <span className="font-medium text-gray-900">{category.name}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => startEdit(category)}
                                                    variant="tertiary"
                                                    isSmall
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
                                                    isDestructive
                                                    isSmall
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

            <SettingsSection
                title={__('Category Usage', 'analogwp-client-handoff')}
                description={__('Tips for effective category management.', 'analogwp-client-handoff')}
            >
                <SettingsCard>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="border-l-4 border-blue-500 pl-4">
                                <h5 className="font-medium text-gray-900 mb-1">{__('Project Phases:', 'analogwp-client-handoff')}</h5>
                                <p className="text-sm text-gray-600">{__('Create categories for different project phases like "Design", "Development", "Testing".', 'analogwp-client-handoff')}</p>
                            </div>
                            <div className="border-l-4 border-green-500 pl-4">
                                <h5 className="font-medium text-gray-900 mb-1">{__('Priority Levels:', 'analogwp-client-handoff')}</h5>
                                <p className="text-sm text-gray-600">{__('Use colors to indicate priority: red for urgent, yellow for medium, green for low priority.', 'analogwp-client-handoff')}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="border-l-4 border-purple-500 pl-4">
                                <h5 className="font-medium text-gray-900 mb-1">{__('Content Types:', 'analogwp-client-handoff')}</h5>
                                <p className="text-sm text-gray-600">{__('Organize by content type: "Text Changes", "Image Issues", "Layout Problems", "SEO".', 'analogwp-client-handoff')}</p>
                            </div>
                            <div className="border-l-4 border-orange-500 pl-4">
                                <h5 className="font-medium text-gray-900 mb-1">{__('Team Departments:', 'analogwp-client-handoff')}</h5>
                                <p className="text-sm text-gray-600">{__('Assign categories by team responsibility: "Frontend", "Backend", "Content", "QA".', 'analogwp-client-handoff')}</p>
                            </div>
                        </div>
                    </div>
                </SettingsCard>
            </SettingsSection>
        </div>
    );
};

export default CategorySettings;