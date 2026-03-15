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
    FieldDescription
} from './FieldComponents';
import { showToast } from '../ToastProvider';
import logger from '../../../shared/utils/logger';

const CategoriesSettings = () => {
    const { categories, setCategories, saveSettings } = useSettings();

    const [newCategory, setNewCategory] = useState({ name: '' });
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editCategoryForm, setEditCategoryForm] = useState({ name: '' });

    const updateCategories = async (newCategories) => {
        setCategories(newCategories);
        try {
            await saveSettings(true, newCategories, null);
        } catch (error) {
            logger.error('Error saving categories:', error);
            showToast.error(__('Failed to save categories', 'analogwp-site-notes'));
        }
    };

    const addCategory = async () => {
        if (!newCategory.name.trim()) {
            showToast.error(__('Category name is required', 'analogwp-site-notes'));
            return;
        }

        if (categories.some((category) => category.name.toLowerCase() === newCategory.name.toLowerCase())) {
            showToast.error(__('Category name already exists', 'analogwp-site-notes'));
            return;
        }

        const category = {
            id: Date.now(),
            name: newCategory.name.trim()
        };

        await updateCategories([...categories, category]);
        setNewCategory({ name: '' });
        showToast.success(__('Category added successfully', 'analogwp-site-notes'));
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
            showToast.error(__('Category name is required', 'analogwp-site-notes'));
            return;
        }

        if (categories.some((category) => category.id !== editingCategoryId && category.name.toLowerCase() === editCategoryForm.name.toLowerCase())) {
            showToast.error(__('Category name already exists', 'analogwp-site-notes'));
            return;
        }

        await updateCategories(categories.map((category) => (
            category.id === editingCategoryId
                ? { ...category, name: editCategoryForm.name.trim() }
                : category
        )));

        setEditingCategoryId(null);
        setEditCategoryForm({ name: '' });
        showToast.success(__('Category updated successfully', 'analogwp-site-notes'));
    };

    const deleteCategory = async (id) => {
        await updateCategories(categories.filter((category) => category.id !== id));
        showToast.success(__('Category deleted successfully', 'analogwp-site-notes'));
    };

    return (
        <div className="p-6 max-w-4xl">
            <SettingsSection
                title={__('Categories', 'analogwp-site-notes')}
                description={__('Organize comments and tasks into categories for better project management.', 'analogwp-site-notes')}
            >
                <SettingsCard title={__('Add New Category', 'analogwp-site-notes')}>
                    <div className="space-y-6">
                        <TextInputField
                            id="new_category_name"
                            label={__('Category Name', 'analogwp-site-notes')}
                            value={newCategory.name}
                            onChange={(value) => setNewCategory({ ...newCategory, name: value })}
                            placeholder={__('Enter category name...', 'analogwp-site-notes')}
                        />

                        <Button
                            onClick={addCategory}
                            disabled={!newCategory.name.trim()}
                            variant="primary"
                            size="default"
                            icon={<PlusIcon className="w-4 h-4" />}
                        >
                            {__('Add Category', 'analogwp-site-notes')}
                        </Button>
                    </div>
                </SettingsCard>

                <SettingsCard title={__('Existing Categories', 'analogwp-site-notes')}>
                    {categories.length === 0 ? (
                        <FieldDescription>
                            {__('No categories created yet. Add your first category above.', 'analogwp-site-notes')}
                        </FieldDescription>
                    ) : (
                        <div className="space-y-3">
                            {categories.map((category) => (
                                <div key={category.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    {editingCategoryId === category.id ? (
                                        <div className="space-y-4">
                                            <TextInputField
                                                value={editCategoryForm.name}
                                                onChange={(value) => setEditCategoryForm({ ...editCategoryForm, name: value })}
                                                placeholder={__('Category name...', 'analogwp-site-notes')}
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={saveEditCategory}
                                                    variant="primary"
                                                    size="small"
                                                    icon={<CheckIcon className="w-4 h-4" />}
                                                    title={__('Save changes', 'analogwp-site-notes')}
                                                >
                                                    {__('Save', 'analogwp-site-notes')}
                                                </Button>
                                                <Button
                                                    onClick={cancelEditCategory}
                                                    variant="secondary"
                                                    size="small"
                                                    icon={<XMarkIcon className="w-4 h-4" />}
                                                    title={__('Cancel editing', 'analogwp-site-notes')}
                                                >
                                                    {__('Cancel', 'analogwp-site-notes')}
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
                                                    title={__('Edit category', 'analogwp-site-notes')}
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        if (confirm(__('Are you sure you want to delete this category?', 'analogwp-site-notes'))) {
                                                            deleteCategory(category.id);
                                                        }
                                                    }}
                                                    variant="destructive"
                                                    size="small"
                                                    title={__('Delete category', 'analogwp-site-notes')}
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

export default CategoriesSettings;