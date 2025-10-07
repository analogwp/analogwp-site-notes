/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { 
    TextControl, 
    TextareaControl, 
    SelectControl, 
    RangeControl, 
    ColorPicker,
    ToggleControl
} from '@wordpress/components';

/**
 * External dependencies
 */
import { 
    InformationCircleIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

// Reusable Field Components
export const FieldGroup = ({ children, className = '' }) => (
    <div className={`space-y-4 ${className}`}>
        {children}
    </div>
);

export const FieldRow = ({ children, className = '' }) => (
    <div className={`flex gap-4 items-start ${className}`}>
        {children}
    </div>
);

export const FieldLabel = ({ children, htmlFor, required = false, className = '' }) => (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}>
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
    </label>
);

export const FieldDescription = ({ children, type = 'info', className = '' }) => {
    const icons = {
        info: InformationCircleIcon,
        warning: ExclamationTriangleIcon,
        success: CheckCircleIcon
    };
    
    const typeStyles = {
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        success: 'bg-green-50 border-green-200 text-green-800'
    };
    
    const IconComponent = icons[type] || icons.info;
    const styles = typeStyles[type] || typeStyles.info;
    
    return (
        <div className={`flex items-start gap-2 p-3 rounded-md border text-sm ${styles} ${className}`}>
            <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{children}</span>
        </div>
    );
};

export const Toggle = ({ 
    id, 
    checked, 
    onChange, 
    disabled = false, 
    label, 
    description,
    className = '' 
}) => (
    <FieldGroup className={className}>
        <ToggleControl
            label={label}
            help={description}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
        />
    </FieldGroup>
);

export const Select = ({ 
    id, 
    value, 
    onChange, 
    options, 
    disabled = false, 
    label, 
    description,
    className = '' 
}) => (
    <FieldGroup className={className}>
        <SelectControl
            label={label}
            help={description}
            value={value}
            onChange={onChange}
            options={options}
            disabled={disabled}
        />
    </FieldGroup>
);

export const NumberInput = ({ 
    id, 
    value, 
    onChange, 
    min, 
    max, 
    step = 1, 
    disabled = false, 
    label, 
    description,
    unit,
    className = '' 
}) => (
    <FieldGroup className={className}>
        {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
        <div className="relative">
            <input
                type="number"
                id={id}
                className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-12 text-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
            />
            {unit && <span className="absolute right-3 top-2 text-sm text-gray-500">{unit}</span>}
        </div>
        {description && (
            <FieldDescription>{description}</FieldDescription>
        )}
    </FieldGroup>
);

export const TextInput = ({ 
    id, 
    value, 
    onChange, 
    type = 'text', 
    placeholder, 
    disabled = false, 
    label, 
    description,
    className = '' 
}) => (
    <FieldGroup className={className}>
        <TextControl
            label={label}
            help={description}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            type={type}
        />
    </FieldGroup>
);

export const TextAreaInput = ({ 
    id, 
    value, 
    onChange, 
    placeholder, 
    rows = 4, 
    disabled = false, 
    label, 
    description,
    className = '' 
}) => (
    <FieldGroup className={className}>
        <TextareaControl
            label={label}
            help={description}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
        />
    </FieldGroup>
);

export const ColorInput = ({ 
    id, 
    value, 
    onChange, 
    disabled = false, 
    label, 
    description,
    className = '' 
}) => (
    <FieldGroup className={className}>
        {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
        <div className="flex gap-2">
            <input
                type="color"
                id={id}
                className="h-10 w-16 rounded-md border border-gray-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
            />
            <input
                type="text"
                className="flex-1 rounded-md border-gray-300 px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#000000"
                pattern="^#[0-9A-Fa-f]{6}$"
                disabled={disabled}
            />
        </div>
        {description && (
            <FieldDescription>{description}</FieldDescription>
        )}
    </FieldGroup>
);

export const RangeInput = ({ 
    id, 
    value, 
    onChange, 
    min, 
    max, 
    step = 1, 
    disabled = false, 
    label, 
    description,
    showValue = true,
    formatValue,
    className = '' 
}) => (
    <FieldGroup className={className}>
        <RangeControl
            label={label}
            help={description}
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            withInputField={showValue}
        />
    </FieldGroup>
);

export const MultiSelect = ({ 
    id, 
    value = [], 
    onChange, 
    options, 
    disabled = false, 
    label, 
    description,
    className = '' 
}) => {
    const handleChange = (optionValue) => {
        const newValue = value.includes(optionValue)
            ? value.filter(v => v !== optionValue)
            : [...value, optionValue];
        onChange(newValue);
    };

    return (
        <FieldGroup className={className}>
            {label && <FieldLabel>{label}</FieldLabel>}
            <div className="cht-multi-select">
                {options.map(option => (
                    <label key={option.value} className="cht-multi-select-option">
                        <input
                            type="checkbox"
                            checked={value.includes(option.value)}
                            onChange={() => handleChange(option.value)}
                            disabled={disabled}
                        />
                        <span className="cht-checkmark"></span>
                        {option.label}
                    </label>
                ))}
            </div>
            {description && (
                <FieldDescription>{description}</FieldDescription>
            )}
        </FieldGroup>
    );
};

export const FileUpload = ({ 
    id, 
    onChange, 
    accept, 
    disabled = false, 
    label, 
    description,
    className = '' 
}) => (
    <FieldGroup className={className}>
        {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
        <div className="cht-file-upload">
            <input
                type="file"
                id={id}
                className="cht-file-input"
                onChange={(e) => onChange(e.target.files[0])}
                accept={accept}
                disabled={disabled}
            />
            <label htmlFor={id} className="cht-file-label">
                {__('Choose file...', 'analogwp-client-handoff')}
            </label>
        </div>
        {description && (
            <FieldDescription>{description}</FieldDescription>
        )}
    </FieldGroup>
);

export const SettingsSection = ({ title, description, children, className = '' }) => (
    <div className={`mb-8 ${className}`}>
        {(title || description) && (
            <div className="mb-6">
                {title && <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>}
                {description && <p className="text-sm text-gray-600">{description}</p>}
            </div>
        )}
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

export const SettingsCard = ({ title, children, className = '' }) => (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        {title && <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-medium text-gray-900">{title}</h4>
        </div>}
        <div className="px-6 py-6 space-y-6">
            {children}
        </div>
    </div>
);