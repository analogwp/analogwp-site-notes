/**
 * WordPress dependencies
 */
import { createContext, useContext, useState, useEffect, useRef, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { showToast } from '../ToastProvider';
import logger from '../../../shared/utils/logger';

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

// Default settings structure - only includes settings available in UI
const defaultSettings = {
	general: {
		allowed_roles: ['administrator', 'editor'],
		auto_screenshot: true,
		screenshot_quality: 0.8,
		notes_per_load: 10,
		enable_frontend_comments: false,
		allow_anonymous_frontend_comments: false
	},
	advanced: {
		enable_debug_mode: false,
		log_level: 'error' // error, warning, info, debug
	}
};

// Settings validation schema - only for available settings
const settingsSchema = {
	general: {
		allowed_roles: { type: 'array', required: true },
		auto_screenshot: { type: 'boolean', required: true },
		screenshot_quality: { type: 'number', min: 0.1, max: 1, required: true },
		notes_per_load: { type: 'number', min: 5, max: 100, required: true },
		enable_frontend_comments: { type: 'boolean', required: true },
		allow_anonymous_frontend_comments: { type: 'boolean', required: true }
	},
	advanced: {
		enable_debug_mode: { type: 'boolean', required: true },
		log_level: { type: 'string', enum: ['error', 'warning', 'info', 'debug'], required: true }
	}
};

const cloneSettings = (value) => JSON.parse(JSON.stringify(value));

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
	const [priorities, setPriorities] = useState([
		{ id: 1, key: 'high', name: 'High', color: '#ef4444' },
		{ id: 2, key: 'medium', name: 'Medium', color: '#f59e0b' },
		{ id: 3, key: 'low', name: 'Low', color: '#10b981' }
	]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [lastSaved, setLastSaved] = useState(null);
	const settingsRef = useRef(settings);
	const categoriesRef = useRef(categories);
	const prioritiesRef = useRef(priorities);
	const autoSaveTimerRef = useRef(null);

	settingsRef.current = settings;
	categoriesRef.current = categories;
	prioritiesRef.current = priorities;

	const loadSettings = async () => {
		try {
			setLoading(true);
			const response = await fetch(agwp_sn_ajax.ajaxUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					action: 'agwp_sn_get_settings',
					nonce: agwp_sn_ajax.nonce
				})
			});

			const data = await response.json();
			if (data.success) {
				const incoming = data.data.settings || {};
				const general = {
					...defaultSettings.general,
					...(incoming.general || {}),
				};
				if (general.notes_per_load == null) {
					general.notes_per_load = defaultSettings.general.notes_per_load;
				}
				delete general.comments_per_page;

				const loadedSettings = {
					...defaultSettings,
					...incoming,
					general,
				};
				setSettings(loadedSettings);
				settingsRef.current = loadedSettings;
				setCategories(data.data.categories || []);
				setPriorities(data.data.priorities || [
					{ id: 1, key: 'high', name: 'High', color: '#ef4444' },
					{ id: 2, key: 'medium', name: 'Medium', color: '#f59e0b' },
					{ id: 3, key: 'low', name: 'Low', color: '#10b981' }
				]);
				setHasUnsavedChanges(false);
				setLastSaved(new Date());
			} else {
				showToast.error(__('Failed to load settings', 'analogwp-site-notes'));
			}
		} catch (error) {
			logger.error('Error loading settings:', error);
			showToast.error(__('Error loading settings', 'analogwp-site-notes'));
		} finally {
			setLoading(false);
		}
	};

	const saveSettings = useCallback(async (
		silent = false,
		categoriesToSave = null,
		prioritiesToSave = null,
		settingsToSave = null
	) => {
		const settingsPayload = settingsToSave || settingsRef.current;
		const categoriesPayload = categoriesToSave !== null ? categoriesToSave : categoriesRef.current;
		const prioritiesPayload = prioritiesToSave !== null ? prioritiesToSave : prioritiesRef.current;

		const validationErrors = validateSettings(settingsPayload);
		if (validationErrors.length > 0) {
			if (!silent) {
				showToast.error(`${__('Validation failed', 'analogwp-site-notes')}: ${validationErrors[0]}`);
			}
			return false;
		}

		try {
			setSaving(true);

			const response = await fetch(agwp_sn_ajax.ajaxUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					action: 'agwp_sn_save_settings',
					nonce: agwp_sn_ajax.nonce,
					settings: JSON.stringify(settingsPayload),
					categories: JSON.stringify(categoriesPayload),
					priorities: JSON.stringify(prioritiesPayload)
				})
			});

			const data = await response.json();
			if (data.success) {
				setHasUnsavedChanges(false);
				setLastSaved(new Date());
				if (!silent) {
					showToast.success(__('Settings saved', 'analogwp-site-notes'));
				}
				return true;
			}

			if (!silent) {
				showToast.error(data.data?.message || __('Error saving settings', 'analogwp-site-notes'));
			}
			return false;
		} catch (err) {
			logger.error('Error saving settings:', err);
			if (!silent) {
				showToast.error(__('Error saving settings. Please try again.', 'analogwp-site-notes'));
			}
			return false;
		} finally {
			setSaving(false);
		}
	}, []);

	const scheduleAutoSave = useCallback((nextSettings = null, nextCategories = null, nextPriorities = null) => {
		if (autoSaveTimerRef.current) {
			clearTimeout(autoSaveTimerRef.current);
		}

		autoSaveTimerRef.current = setTimeout(() => {
			saveSettings(false, nextCategories, nextPriorities, nextSettings);
		}, 450);
	}, [saveSettings]);

	useEffect(() => {
		loadSettings();

		return () => {
			if (autoSaveTimerRef.current) {
				clearTimeout(autoSaveTimerRef.current);
			}
		};
	}, []);

	const updateSetting = (path, value) => {
		const keys = path.split('.');
		const newSettings = cloneSettings(settingsRef.current);

		let current = newSettings;
		for (let i = 0; i < keys.length - 1; i++) {
			if (!current[keys[i]]) current[keys[i]] = {};
			current = current[keys[i]];
		}

		current[keys[keys.length - 1]] = value;
		settingsRef.current = newSettings;
		setSettings(newSettings);
		setHasUnsavedChanges(true);
		scheduleAutoSave(newSettings);
	};

	const resetSettings = () => {
		const nextSettings = cloneSettings(defaultSettings);
		settingsRef.current = nextSettings;
		setSettings(nextSettings);
		setHasUnsavedChanges(true);
		scheduleAutoSave(nextSettings);
	};

	const resetSection = (section) => {
		const nextSettings = {
			...cloneSettings(settingsRef.current),
			[section]: cloneSettings(defaultSettings[section])
		};
		settingsRef.current = nextSettings;
		setSettings(nextSettings);
		setHasUnsavedChanges(true);
		scheduleAutoSave(nextSettings);
	};

	const exportSettings = () => {
		const filteredSettings = {
			general: {
				allowed_roles: settings.general?.allowed_roles || defaultSettings.general.allowed_roles,
				enable_frontend_comments: settings.general?.enable_frontend_comments ?? defaultSettings.general.enable_frontend_comments,
				allow_anonymous_frontend_comments: settings.general?.allow_anonymous_frontend_comments ?? defaultSettings.general.allow_anonymous_frontend_comments,
				auto_screenshot: settings.general?.auto_screenshot ?? defaultSettings.general.auto_screenshot,
				screenshot_quality: settings.general?.screenshot_quality ?? defaultSettings.general.screenshot_quality,
				notes_per_load: settings.general?.notes_per_load ?? defaultSettings.general.notes_per_load,
				theme_mode: settings.general?.theme_mode ?? defaultSettings.general.theme_mode
			},
			advanced: {
				enable_debug_mode: settings.advanced?.enable_debug_mode ?? defaultSettings.advanced.enable_debug_mode,
				log_level: settings.advanced?.log_level ?? defaultSettings.advanced.log_level
			}
		};

		const exportData = {
			settings: filteredSettings,
			categories,
			priorities,
			version: '1.1.0',
			exported_at: new Date().toISOString()
		};

		const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `site-notes-settings-${new Date().toISOString().split('T')[0]}.json`;
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
					showToast.error(`${__('Import validation failed', 'analogwp-site-notes')}: ${validationErrors[0]}`);
					return false;
				}

				const nextSettings = { ...defaultSettings, ...importedData.settings };
				const nextCategories = importedData.categories || categories;
				const nextPriorities = importedData.priorities || priorities;

				settingsRef.current = nextSettings;
				categoriesRef.current = nextCategories;
				prioritiesRef.current = nextPriorities;
				setSettings(nextSettings);
				if (importedData.categories) {
					setCategories(importedData.categories);
				}
				if (importedData.priorities) {
					setPriorities(importedData.priorities);
				}
				setHasUnsavedChanges(true);
				await saveSettings(false, nextCategories, nextPriorities, nextSettings);
				return true;
			}

			showToast.error(__('Invalid settings file format', 'analogwp-site-notes'));
			return false;
		} catch (error) {
			logger.error('Error importing settings:', error);
			showToast.error(__('Error importing settings file', 'analogwp-site-notes'));
			return false;
		}
	};

	const value = {
		settings,
		categories,
		priorities,
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
		setPriorities,
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
