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

const DEFAULT_PRIORITY_COLOR = '#3858e9';

const LabelsAndFiltersSettings = () => {
	const { priorities, setPriorities, saveSettings } = useSettings();

	const [newPriority, setNewPriority] = useState({
		name: '',
		color: DEFAULT_PRIORITY_COLOR,
	});
	const [editingPriorityId, setEditingPriorityId] = useState(null);
	const [editPriorityForm, setEditPriorityForm] = useState({ name: '', color: '' });

	const updatePriorities = async (nextPriorities) => {
		setPriorities(nextPriorities);
		try {
			await saveSettings(false, null, nextPriorities);
		} catch (error) {
			logger.error('Error saving priorities:', error);
			showToast.error(__('Failed to save priorities', 'analogwp-site-notes'));
		}
	};

	const addPriority = async () => {
		if (!newPriority.name.trim()) {
			showToast.error(__('Priority name is required', 'analogwp-site-notes'));
			return;
		}

		if (priorities.some((pri) => pri.name.toLowerCase() === newPriority.name.toLowerCase())) {
			showToast.error(__('Priority name already exists', 'analogwp-site-notes'));
			return;
		}

		const priority = {
			id: Date.now(),
			key: newPriority.name.toLowerCase().replace(/\s+/g, '_'),
			name: newPriority.name.trim(),
			color: newPriority.color,
		};

		await updatePriorities([...priorities, priority]);
		setNewPriority({ name: '', color: DEFAULT_PRIORITY_COLOR });
		showToast.success(__('Priority added successfully', 'analogwp-site-notes'));
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
			showToast.error(__('Priority name is required', 'analogwp-site-notes'));
			return;
		}

		if (
			priorities.some(
				(pri) =>
					pri.id !== editingPriorityId &&
					pri.name.toLowerCase() === editPriorityForm.name.toLowerCase()
			)
		) {
			showToast.error(__('Priority name already exists', 'analogwp-site-notes'));
			return;
		}

		await updatePriorities(
			priorities.map((pri) =>
				pri.id === editingPriorityId
					? {
							...pri,
							name: editPriorityForm.name.trim(),
							color: editPriorityForm.color,
							key: editPriorityForm.name.toLowerCase().replace(/\s+/g, '_'),
						}
					: pri
			)
		);

		setEditingPriorityId(null);
		setEditPriorityForm({ name: '', color: '' });
		showToast.success(__('Priority updated successfully', 'analogwp-site-notes'));
	};

	const deletePriority = async (id) => {
		await updatePriorities(priorities.filter((pri) => pri.id !== id));
		showToast.success(__('Priority deleted successfully', 'analogwp-site-notes'));
	};

	const renderPriorityFormRow = ({
		name,
		color,
		onNameChange,
		onColorChange,
		primaryAction,
	}) => (
		<div className="sn-priority-form-row">
			<input
				type="text"
				className="sn-input sn-priority-form-row__name"
				value={name}
				onChange={(event) => onNameChange(event.target.value)}
				placeholder={__('Priority Name', 'analogwp-site-notes')}
			/>
			<input
				type="color"
				className="sn-priority-form-row__swatch"
				value={color}
				onChange={(event) => onColorChange(event.target.value)}
				aria-label={__('Priority color', 'analogwp-site-notes')}
			/>
			<input
				type="text"
				className="sn-input sn-priority-form-row__hex sn-font-mono"
				value={color}
				onChange={(event) => onColorChange(event.target.value)}
				placeholder="#000000"
				pattern="^#[0-9A-Fa-f]{6}$"
				aria-label={__('Priority color hex', 'analogwp-site-notes')}
			/>
			{primaryAction}
		</div>
	);

	return (
		<SettingsSection
			title={__('Priorities', 'analogwp-site-notes')}
			description={__('Define priority levels for notes with customizable colors.', 'analogwp-site-notes')}
		>
			<SettingsCard title={__('Priorities', 'analogwp-site-notes')}>
				{priorities.length === 0 ? (
					<FieldDescription>
						{__('No priorities created yet. Add your first priority below.', 'analogwp-site-notes')}
					</FieldDescription>
				) : (
					<ul className="sn-priority-list">
						{priorities.map((priority) => (
							<li key={priority.id} className="sn-priority-list__item">
								{editingPriorityId === priority.id ? (
									<div className="sn-priority-list__row">
										{renderPriorityFormRow({
											name: editPriorityForm.name,
											color: editPriorityForm.color,
											onNameChange: (value) =>
												setEditPriorityForm({ ...editPriorityForm, name: value }),
											onColorChange: (value) =>
												setEditPriorityForm({ ...editPriorityForm, color: value }),
										})}
										<div className="sn-priority-list__actions">
											<button
												type="button"
												className="sn-priority-list__action"
												onClick={saveEditPriority}
												title={__('Save changes', 'analogwp-site-notes')}
											>
												<CheckmarkIcon size="md" />
											</button>
											<button
												type="button"
												className="sn-priority-list__action"
												onClick={cancelEditPriority}
												title={__('Cancel editing', 'analogwp-site-notes')}
											>
												<CloseIcon size="md" />
											</button>
										</div>
									</div>
								) : (
									<div className="sn-priority-list__row">
										<div className="sn-priority-list__info">
											<span
												className="sn-priority-list__dot"
												style={{ backgroundColor: priority.color }}
												aria-hidden="true"
											/>
											<span className="sn-priority-list__name">{priority.name}</span>
										</div>
										<div className="sn-priority-list__actions">
											<button
												type="button"
												className="sn-priority-list__action"
												onClick={() => startEditPriority(priority)}
												title={__('Edit priority', 'analogwp-site-notes')}
											>
												<PencilIcon size="md" />
											</button>
											<button
												type="button"
												className="sn-priority-list__action"
												onClick={() => {
													if (
														confirm(
															__(
																'Are you sure you want to delete this priority?',
																'analogwp-site-notes'
															)
														)
													) {
														deletePriority(priority.id);
													}
												}}
												title={__('Delete priority', 'analogwp-site-notes')}
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

			<div className="sn-priority-create">
				<h4 className="sn-priority-create__title">
					{__('Create New Priority', 'analogwp-site-notes')}
				</h4>
				{renderPriorityFormRow({
					name: newPriority.name,
					color: newPriority.color,
					onNameChange: (value) => setNewPriority({ ...newPriority, name: value }),
					onColorChange: (value) => setNewPriority({ ...newPriority, color: value }),
					primaryAction: (
						<Button
							onClick={addPriority}
							disabled={!newPriority.name.trim()}
							variant="primary"
						>
							{__('Add Priority', 'analogwp-site-notes')}
						</Button>
					),
				})}
			</div>
		</SettingsSection>
	);
};

export default LabelsAndFiltersSettings;
