/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
	CheckmarkIcon,
	CloseIcon,
	PencilIcon,
	TrashIcon,
} from '../../../shared/icons';
import { Button } from '../ui';
import { useSettings } from './SettingsProvider';
import {
	SettingsSection,
	SettingsCard,
	FieldDescription,
} from './FieldComponents';
import { showToast } from '../ToastProvider';
import logger from '../../../shared/utils/logger';

const CategoriesSettings = () => {
	const { categories, setCategories, saveSettings } = useSettings();

	const [newCategory, setNewCategory] = useState({ name: '' });
	const [editingCategoryId, setEditingCategoryId] = useState(null);
	const [editCategoryForm, setEditCategoryForm] = useState({ name: '' });

	const updateCategories = async (nextCategories) => {
		setCategories(nextCategories);
		try {
			await saveSettings(false, nextCategories, null);
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
			name: newCategory.name.trim(),
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

		if (
			categories.some(
				(category) =>
					category.id !== editingCategoryId &&
					category.name.toLowerCase() === editCategoryForm.name.toLowerCase()
			)
		) {
			showToast.error(__('Category name already exists', 'analogwp-site-notes'));
			return;
		}

		await updateCategories(
			categories.map((category) =>
				category.id === editingCategoryId
					? { ...category, name: editCategoryForm.name.trim() }
					: category
			)
		);

		setEditingCategoryId(null);
		setEditCategoryForm({ name: '' });
		showToast.success(__('Category updated successfully', 'analogwp-site-notes'));
	};

	const deleteCategory = async (id) => {
		await updateCategories(categories.filter((category) => category.id !== id));
		showToast.success(__('Category deleted successfully', 'analogwp-site-notes'));
	};

	const renderCategoryFormRow = ({ name, onNameChange, primaryAction }) => (
		<div className="sn-category-form-row">
			<input
				type="text"
				className="sn-input sn-category-form-row__name"
				value={name}
				onChange={(event) => onNameChange(event.target.value)}
				placeholder={__('Category Name', 'analogwp-site-notes')}
			/>
			{primaryAction}
		</div>
	);

	return (
		<SettingsSection
			title={__('Categories', 'analogwp-site-notes')}
			description={__(
				'Organize comments and tasks into categories for better project management.',
				'analogwp-site-notes'
			)}
		>
			<SettingsCard title={__('Task Categories', 'analogwp-site-notes')}>
				{categories.length === 0 ? (
					<FieldDescription>
						{__('No categories created yet. Add your first category below.', 'analogwp-site-notes')}
					</FieldDescription>
				) : (
					<ul className="sn-category-list">
						{categories.map((category) => (
							<li key={category.id} className="sn-category-list__item">
								{editingCategoryId === category.id ? (
									<div className="sn-category-list__row">
										{renderCategoryFormRow({
											name: editCategoryForm.name,
											onNameChange: (value) =>
												setEditCategoryForm({ ...editCategoryForm, name: value }),
										})}
										<div className="sn-category-list__actions">
											<button
												type="button"
												className="sn-category-list__action"
												onClick={saveEditCategory}
												title={__('Save changes', 'analogwp-site-notes')}
											>
												<CheckmarkIcon size="md" />
											</button>
											<button
												type="button"
												className="sn-category-list__action"
												onClick={cancelEditCategory}
												title={__('Cancel editing', 'analogwp-site-notes')}
											>
												<CloseIcon size="md" />
											</button>
										</div>
									</div>
								) : (
									<div className="sn-category-list__row">
										<div className="sn-category-list__info">
											<span className="sn-category-list__name">{category.name}</span>
										</div>
										<div className="sn-category-list__actions">
											<button
												type="button"
												className="sn-category-list__action"
												onClick={() => startEditCategory(category)}
												title={__('Edit category', 'analogwp-site-notes')}
											>
												<PencilIcon size="md" />
											</button>
											<button
												type="button"
												className="sn-category-list__action"
												onClick={() => {
													if (
														confirm(
															__(
																'Are you sure you want to delete this category?',
																'analogwp-site-notes'
															)
														)
													) {
														deleteCategory(category.id);
													}
												}}
												title={__('Delete category', 'analogwp-site-notes')}
											>
												<TrashIcon size="md" />
											</button>
										</div>
									</div>
								)}
							</li>
						))}
					</ul>
				)}
			</SettingsCard>

			<div className="sn-category-create">
				<h4 className="sn-category-create__title">
					{__('Create New Category', 'analogwp-site-notes')}
				</h4>
				{renderCategoryFormRow({
					name: newCategory.name,
					onNameChange: (value) => setNewCategory({ name: value }),
					primaryAction: (
						<Button
							onClick={addCategory}
							disabled={!newCategory.name.trim()}
							variant="primary"
						>
							{__('Add Category', 'analogwp-site-notes')}
						</Button>
					),
				})}
			</div>
		</SettingsSection>
	);
};

export default CategoriesSettings;
