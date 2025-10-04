/**
 * WordPress dependencies
 */
import { createContext, useContext, useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { showToast } from '../ToastProvider';

// Settings Context
const SettingsContext = createContext();

// Settings hook
export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

// Default settings structure
const defaultSettings = {
    general: {
        allowed_roles: ['administrator', 'editor'],
        auto_screenshot: true,
        screenshot_quality: 0.8,
        comments_per_page: 20,
        enable_frontend_comments: true,
        require_approval: false,
        auto_save_drafts: true,
        theme_mode: 'auto' // light, dark, auto
    },
    notifications: {
        email_notifications: true,
        notification_frequency: 'immediate', // immediate, daily, weekly
        notify_admins: true,
        notify_assigned_users: true,
        email_template: 'default',
        custom_email_from: '',
        webhook_url: ''
    },
    users: {
        user_assignment: true,
        guest_comments: false,
        require_login: false,
        default_user_role: 'subscriber',
        user_permissions: {
            can_edit_own: true,
            can_delete_own: false,
            can_assign_tasks: false,
            can_change_status: true
        }
    },
    security: {
        enable_nonce_verification: true,
        enable_rate_limiting: true,
        rate_limit_per_minute: 10,
        allowed_file_types: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        max_file_size: 5, // MB
        enable_sanitization: true,
        block_spam: true
    },
    appearance: {
        theme_style: 'modern', // modern, classic, minimal
        primary_color: '#3498db',
        secondary_color: '#2ecc71',
        accent_color: '#e74c3c',
        border_radius: 8,
        font_size: 'medium', // small, medium, large
        show_avatars: true,
        compact_mode: false
    },
    advanced: {
        enable_debug_mode: false,
        log_level: 'error', // error, warning, info, debug
        cache_comments: true,
        cache_duration: 3600, // seconds
        enable_rest_api: true,
        api_rate_limit: 100,
        custom_css: '',
        custom_js: ''
    }
};

// Settings validation schema
const settingsSchema = {
    general: {
        allowed_roles: { type: 'array', required: true },
        auto_screenshot: { type: 'boolean', required: true },
        screenshot_quality: { type: 'number', min: 0.1, max: 1, required: true },
        comments_per_page: { type: 'number', min: 5, max: 100, required: true },
        enable_frontend_comments: { type: 'boolean', required: true },
        require_approval: { type: 'boolean', required: true },
        auto_save_drafts: { type: 'boolean', required: true },
        theme_mode: { type: 'string', enum: ['light', 'dark', 'auto'], required: true }
    },
    notifications: {
        email_notifications: { type: 'boolean', required: true },
        notification_frequency: { type: 'string', enum: ['immediate', 'daily', 'weekly'], required: true },
        notify_admins: { type: 'boolean', required: true },
        notify_assigned_users: { type: 'boolean', required: true },
        email_template: { type: 'string', required: true },
        custom_email_from: { type: 'email', required: false },
        webhook_url: { type: 'url', required: false }
    },
    users: {
        user_assignment: { type: 'boolean', required: true },
        guest_comments: { type: 'boolean', required: true },
        require_login: { type: 'boolean', required: true },
        default_user_role: { type: 'string', required: true }
    },
    security: {
        enable_nonce_verification: { type: 'boolean', required: true },
        enable_rate_limiting: { type: 'boolean', required: true },
        rate_limit_per_minute: { type: 'number', min: 1, max: 100, required: true },
        allowed_file_types: { type: 'array', required: true },
        max_file_size: { type: 'number', min: 1, max: 50, required: true }
    },
    appearance: {
        theme_style: { type: 'string', enum: ['modern', 'classic', 'minimal'], required: true },
        primary_color: { type: 'color', required: true },
        secondary_color: { type: 'color', required: true },
        accent_color: { type: 'color', required: true },
        border_radius: { type: 'number', min: 0, max: 20, required: true },
        font_size: { type: 'string', enum: ['small', 'medium', 'large'], required: true }
    }
};

// Validation helper
const validateSettings = (settings) => {
    const errors = [];
    
    const validateSection = (section, schema, path = '') => {
        Object.keys(schema).forEach(key => {
            const fullPath = path ? `${path}.${key}` : key;
            const rule = schema[key];
            const value = section?.[key];
            
            // Check required fields
            if (rule.required && (value === undefined || value === null)) {
                errors.push(`${fullPath} is required`);
                return;
            }
            
            if (value === undefined || value === null) return;
            
            // Type validation
            switch (rule.type) {
                case 'boolean':
                    if (typeof value !== 'boolean') {
                        errors.push(`${fullPath} must be a boolean`);
                    }
                    break;
                case 'number':
                    if (typeof value !== 'number' || isNaN(value)) {
                        errors.push(`${fullPath} must be a number`);
                    } else if (rule.min !== undefined && value < rule.min) {
                        errors.push(`${fullPath} must be at least ${rule.min}`);
                    } else if (rule.max !== undefined && value > rule.max) {
                        errors.push(`${fullPath} must be at most ${rule.max}`);
                    }
                    break;
                case 'string':
                    if (typeof value !== 'string') {
                        errors.push(`${fullPath} must be a string`);
                    } else if (rule.enum && !rule.enum.includes(value)) {
                        errors.push(`${fullPath} must be one of: ${rule.enum.join(', ')}`);
                    }
                    break;
                case 'array':
                    if (!Array.isArray(value)) {
                        errors.push(`${fullPath} must be an array`);
                    }
                    break;
                case 'email':
                    if (value && typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        errors.push(`${fullPath} must be a valid email address`);
                    }
                    break;
                case 'url':
                    if (value && typeof value === 'string') {
                        try {
                            new URL(value);
                        } catch {
                            errors.push(`${fullPath} must be a valid URL`);
                        }
                    }
                    break;
                case 'color':
                    if (value && typeof value === 'string' && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
                        errors.push(`${fullPath} must be a valid hex color`);
                    }
                    break;
            }
        });
    };
    
    Object.keys(settingsSchema).forEach(sectionKey => {
        if (settings[sectionKey]) {
            validateSection(settings[sectionKey], settingsSchema[sectionKey], sectionKey);
        }
    });
    
    return errors;
};

// Settings Provider Component
export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(defaultSettings);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    // Auto-save functionality (if enabled)
    useEffect(() => {
        if (hasUnsavedChanges && settings.general?.auto_save_drafts) {
            const autoSaveTimer = setTimeout(() => {
                saveSettings(true); // silent save
            }, 5000);
            
            return () => clearTimeout(autoSaveTimer);
        }
    }, [hasUnsavedChanges, settings.general?.auto_save_drafts]);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch(agwpChtAjax.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'agwp_cht_get_settings',
                    nonce: agwpChtAjax.nonce
                })
            });

            const data = await response.json();
            if (data.success) {
                const loadedSettings = { ...defaultSettings, ...data.data.settings };
                setSettings(loadedSettings);
                setCategories(data.data.categories || []);
                setLastSaved(new Date());
            } else {
                showToast.error(__('Failed to load settings', 'analogwp-client-handoff'));
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            showToast.error(__('Error loading settings', 'analogwp-client-handoff'));
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async (silent = false) => {
        // Validate settings before saving
        const validationErrors = validateSettings(settings);
        if (validationErrors.length > 0) {
            if (!silent) {
                showToast.error(`${__('Validation failed', 'analogwp-client-handoff')}: ${validationErrors[0]}`);
            }
            return false;
        }

        try {
            setSaving(true);
            const response = await fetch(agwpChtAjax.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'agwp_cht_save_settings',
                    nonce: agwpChtAjax.nonce,
                    settings: JSON.stringify(settings),
                    categories: JSON.stringify(categories)
                })
            });

            const data = await response.json();
            if (data.success) {
                setHasUnsavedChanges(false);
                setLastSaved(new Date());
                if (!silent) {
                    showToast.success(__('Settings saved successfully!', 'analogwp-client-handoff'));
                }
                return true;
            } else {
                if (!silent) {
                    showToast.error(data.data?.message || __('Error saving settings', 'analogwp-client-handoff'));
                }
                return false;
            }
        } catch (err) {
            console.error('Error saving settings:', err);
            if (!silent) {
                showToast.error(__('Error saving settings. Please try again.', 'analogwp-client-handoff'));
            }
            return false;
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (path, value) => {
        const keys = path.split('.');
        const newSettings = { ...settings };
        
        let current = newSettings;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        setSettings(newSettings);
        setHasUnsavedChanges(true);
    };

    const resetSettings = () => {
        setSettings(defaultSettings);
        setHasUnsavedChanges(true);
    };

    const resetSection = (section) => {
        setSettings({
            ...settings,
            [section]: defaultSettings[section]
        });
        setHasUnsavedChanges(true);
    };

    const exportSettings = () => {
        const exportData = {
            settings,
            categories,
            version: '1.1.0',
            exported_at: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `client-handoff-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const importSettings = async (file) => {
        try {
            const text = await file.text();
            const importedData = JSON.parse(text);
            
            if (importedData.settings) {
                const validationErrors = validateSettings(importedData.settings);
                if (validationErrors.length > 0) {
                    showToast.error(`${__('Import validation failed', 'analogwp-client-handoff')}: ${validationErrors[0]}`);
                    return false;
                }
                
                setSettings({ ...defaultSettings, ...importedData.settings });
                if (importedData.categories) {
                    setCategories(importedData.categories);
                }
                setHasUnsavedChanges(true);
                showToast.success(__('Settings imported successfully!', 'analogwp-client-handoff'));
                return true;
            } else {
                showToast.error(__('Invalid settings file format', 'analogwp-client-handoff'));
                return false;
            }
        } catch (error) {
            console.error('Error importing settings:', error);
            showToast.error(__('Error importing settings file', 'analogwp-client-handoff'));
            return false;
        }
    };

    const value = {
        settings,
        categories,
        loading,
        saving,
        hasUnsavedChanges,
        lastSaved,
        updateSetting,
        saveSettings,
        loadSettings,
        resetSettings,
        resetSection,
        setCategories,
        exportSettings,
        importSettings,
        validateSettings: (settingsToValidate) => validateSettings(settingsToValidate || settings)
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export default SettingsProvider;