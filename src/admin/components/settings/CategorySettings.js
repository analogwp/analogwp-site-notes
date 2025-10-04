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
        // Auto-save categories immediately
        setTimeout(() => {
            saveSettings(true); // true = silent save without toast
        }, 100);
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
        <div className="cht-settings-tab-content">
            <SettingsSection
                title={__('Comment Categories', 'analogwp-client-handoff')}
                description={__('Organize comments and tasks into categories for better project management.', 'analogwp-client-handoff')}
            >
                <SettingsCard title={__('Add New Category', 'analogwp-client-handoff')}>
                    <div className="cht-add-category-form">
                        <div className="cht-form-row">
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
                        
                        <div className="cht-predefined-colors">
                            <label className="cht-field-label">{__('Quick Colors:', 'analogwp-client-handoff')}</label>
                            <div className="cht-color-palette">
                                {predefinedColors.map(color => (
                                    <button
                                        key={color}
                                        className={`cht-color-swatch ${newCategory.color === color ? 'active' : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setNewCategory({ ...newCategory, color })}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            className="cht-btn cht-btn-primary"
                            onClick={addCategory}
                            disabled={!newCategory.name.trim()}
                        >
                            <PlusIcon className="cht-icon" />
                            {__('Add Category', 'analogwp-client-handoff')}
                        </button>
                    </div>
                </SettingsCard>

                <SettingsCard title={__('Existing Categories', 'analogwp-client-handoff')}>
                    {categories.length === 0 ? (
                        <FieldDescription>
                            {__('No categories created yet. Add your first category above.', 'analogwp-client-handoff')}
                        </FieldDescription>
                    ) : (
                        <div className="cht-categories-list">
                            {categories.map(category => (
                                <div key={category.id} className="cht-category-item">
                                    {editingId === category.id ? (
                                        <div className="cht-category-edit-form">
                                            <TextInput
                                                value={editForm.name}
                                                onChange={(value) => setEditForm({ ...editForm, name: value })}
                                                placeholder={__('Category name...', 'analogwp-client-handoff')}
                                            />
                                            <ColorInput
                                                value={editForm.color}
                                                onChange={(value) => setEditForm({ ...editForm, color: value })}
                                            />
                                            <div className="cht-category-edit-actions">
                                                <button
                                                    className="cht-btn cht-btn-sm cht-btn-primary"
                                                    onClick={saveEdit}
                                                    title={__('Save changes', 'analogwp-client-handoff')}
                                                >
                                                    <CheckIcon className="cht-icon" />
                                                </button>
                                                <button
                                                    className="cht-btn cht-btn-sm cht-btn-secondary"
                                                    onClick={cancelEdit}
                                                    title={__('Cancel editing', 'analogwp-client-handoff')}
                                                >
                                                    <XMarkIcon className="cht-icon" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="cht-category-display">
                                            <div className="cht-category-info">
                                                <span 
                                                    className="cht-category-color"
                                                    style={{ backgroundColor: category.color }}
                                                />
                                                <span className="cht-category-name">{category.name}</span>
                                            </div>
                                            <div className="cht-category-actions">
                                                <button
                                                    className="cht-btn cht-btn-sm cht-btn-outline"
                                                    onClick={() => startEdit(category)}
                                                    title={__('Edit category', 'analogwp-client-handoff')}
                                                >
                                                    <PencilIcon className="cht-icon" />
                                                </button>
                                                <button
                                                    className="cht-btn cht-btn-sm cht-btn-danger"
                                                    onClick={() => {
                                                        if (confirm(__('Are you sure you want to delete this category?', 'analogwp-client-handoff'))) {
                                                            deleteCategory(category.id);
                                                        }
                                                    }}
                                                    title={__('Delete category', 'analogwp-client-handoff')}
                                                >
                                                    <TrashIcon className="cht-icon" />
                                                </button>
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
                    <div className="cht-category-tips">
                        <div className="cht-tip">
                            <strong>{__('Project Phases:', 'analogwp-client-handoff')}</strong>
                            <span>{__('Create categories for different project phases like "Design", "Development", "Testing".', 'analogwp-client-handoff')}</span>
                        </div>
                        <div className="cht-tip">
                            <strong>{__('Priority Levels:', 'analogwp-client-handoff')}</strong>
                            <span>{__('Use colors to indicate priority: red for urgent, yellow for medium, green for low priority.', 'analogwp-client-handoff')}</span>
                        </div>
                        <div className="cht-tip">
                            <strong>{__('Content Types:', 'analogwp-client-handoff')}</strong>
                            <span>{__('Organize by content type: "Text Changes", "Image Issues", "Layout Problems", "SEO".', 'analogwp-client-handoff')}</span>
                        </div>
                        <div className="cht-tip">
                            <strong>{__('Team Departments:', 'analogwp-client-handoff')}</strong>
                            <span>{__('Assign categories by team responsibility: "Frontend", "Backend", "Content", "QA".', 'analogwp-client-handoff')}</span>
                        </div>
                    </div>
                </SettingsCard>
            </SettingsSection>
        </div>
    );
};

export default CategorySettings;