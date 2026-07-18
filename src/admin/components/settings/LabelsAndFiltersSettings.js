/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
    CheckIcon,
    PencilIcon,
    PlusIcon,
    TrashIcon,
    XMarkIcon,
} from '../../../shared/icons';
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
    const { priorities, setPriorities, saveSettings } = useSettings();

    const [newPriority, setNewPriority] = useState({ name: '', color: '#3858e9' });
    const [editingPriorityId, setEditingPriorityId] = useState(null);
    const [editPriorityForm, setEditPriorityForm] = useState({ name: '', color: '' });

    const updatePriorities = async (newPriorities) => {
        setPriorities(newPriorities);
        try {
            await saveSettings(true, null, newPriorities);
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

        if (priorities.some(pri => pri.name.toLowerCase() === newPriority.name.toLowerCase())) {
            showToast.error(__('Priority name already exists', 'analogwp-site-notes'));
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

        if (priorities.some(pri => pri.id !== editingPriorityId && pri.name.toLowerCase() === editPriorityForm.name.toLowerCase())) {
            showToast.error(__('Priority name already exists', 'analogwp-site-notes'));
            return;
        }

        await updatePriorities(priorities.map(pri =>
            pri.id === editingPriorityId
                ? { ...pri, name: editPriorityForm.name.trim(), color: editPriorityForm.color, key: editPriorityForm.name.toLowerCase().replace(/\s+/g, '_') }
                : pri
        ));

        setEditingPriorityId(null);
        setEditPriorityForm({ name: '', color: '' });
        showToast.success(__('Priority updated successfully', 'analogwp-site-notes'));
    };

    const deletePriority = async (id) => {
        await updatePriorities(priorities.filter(pri => pri.id !== id));
        showToast.success(__('Priority deleted successfully', 'analogwp-site-notes'));
    };

    const predefinedColors = [
        '#3858e9', '#e74c3c', '#2ecc71', '#f39c12',
        '#9b59b6', '#1abc9c', '#34495e', '#9fa1a3'
    ];

    return (
        <SettingsSection
            title={__('Note Priorities', 'analogwp-site-notes')}
            description={__('Define priority levels for notes with customizable colors.', 'analogwp-site-notes')}
        >
            <SettingsCard title={__('Add New Priority', 'analogwp-site-notes')}>
                <div className="sn-settings-grid-2">
                            <TextInputField
                                id="new_priority_name"
                                label={__('Priority Name', 'analogwp-site-notes')}
                                value={newPriority.name}
                                onChange={(value) => setNewPriority({ ...newPriority, name: value })}
                                placeholder={__('Enter priority name...', 'analogwp-site-notes')}
                            />

                            <ColorInput
                                id="new_priority_color"
                                label={__('Priority Color', 'analogwp-site-notes')}
                                value={newPriority.color}
                                onChange={(value) => setNewPriority({ ...newPriority, color: value })}
                            />
                </div>

                <div className="sn-settings-fields">
                    <label className="sn-label">{__('Quick Colors:', 'analogwp-site-notes')}</label>
                    <div className="sn-color-picker-row">
                                {predefinedColors.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={`sn-color-swatch${newPriority.color === color ? ' sn-color-swatch--selected' : ''}`}
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
                            icon={<PlusIcon className="sn-icon" />}
                        >
                            {__('Add Priority', 'analogwp-site-notes')}
                </Button>
            </SettingsCard>

            <SettingsCard title={__('Existing Priorities', 'analogwp-site-notes')}>
                {priorities.length === 0 ? (
                    <FieldDescription>
                        {__('No priorities created yet. Add your first priority above.', 'analogwp-site-notes')}
                    </FieldDescription>
                ) : (
                    <div className="sn-settings-item-stack">
                        {priorities.map(priority => (
                            <div key={priority.id} className="sn-settings-item-list">
                                {editingPriorityId === priority.id ? (
                                    <div className="sn-settings-fields">
                                        <div className="sn-settings-grid-2">
                                                <TextInputField
                                                    value={editPriorityForm.name}
                                                    onChange={(value) => setEditPriorityForm({ ...editPriorityForm, name: value })}
                                                    placeholder={__('Priority name...', 'analogwp-site-notes')}
                                                />
                                                <ColorInput
                                                    value={editPriorityForm.color}
                                                    onChange={(value) => setEditPriorityForm({ ...editPriorityForm, color: value })}
                                                />
                                            </div>
                                            <div className="sn-flex sn-gap-2">
                                                <Button
                                                    onClick={saveEditPriority}
                                                    variant="primary"
                                                    size="small"
                                                    icon={<CheckIcon className="sn-icon" />}
                                                    title={__('Save changes', 'analogwp-site-notes')}
                                                >
                                                    {__('Save', 'analogwp-site-notes')}
                                                </Button>
                                                <Button
                                                    onClick={cancelEditPriority}
                                                    variant="secondary"
                                                    size="small"
                                                    icon={<XMarkIcon className="sn-icon" />}
                                                    title={__('Cancel editing', 'analogwp-site-notes')}
                                                >
                                                    {__('Cancel', 'analogwp-site-notes')}
                                                </Button>
                                        </div>
                                    </div>
                                ) : (
                                        <div className="sn-settings-item-row">
                                            <div className="sn-settings-item-info">
                                                <span
                                                    className="sn-priority-dot"
                                                    style={{ backgroundColor: priority.color }}
                                                />
                                                <span className="sn-settings-item-name">{priority.name}</span>
                                            </div>
                                            <div className="sn-flex sn-gap-2">
                                                <Button
                                                    onClick={() => startEditPriority(priority)}
                                                    variant="tertiary"
                                                    size="small"
                                                    title={__('Edit priority', 'analogwp-site-notes')}
                                                >
                                                    <PencilIcon className="sn-icon" />
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        if (confirm(__('Are you sure you want to delete this priority?', 'analogwp-site-notes'))) {
                                                            deletePriority(priority.id);
                                                        }
                                                    }}
                                                    variant="destructive"
                                                    size="small"
                                                    title={__('Delete priority', 'analogwp-site-notes')}
                                                >
                                                    <TrashIcon className="sn-icon" />
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
    );
};

export default LabelsAndFiltersSettings;
