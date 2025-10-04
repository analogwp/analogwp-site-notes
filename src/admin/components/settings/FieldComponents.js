/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

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
    <div className={`cht-field-group ${className}`}>
        {children}
    </div>
);

export const FieldRow = ({ children, className = '' }) => (
    <div className={`cht-field-row ${className}`}>
        {children}
    </div>
);

export const FieldLabel = ({ children, htmlFor, required = false, className = '' }) => (
    <label htmlFor={htmlFor} className={`cht-field-label ${className}`}>
        {children}
        {required && <span className="cht-required">*</span>}
    </label>
);

export const FieldDescription = ({ children, type = 'info', className = '' }) => {
    const icons = {
        info: InformationCircleIcon,
        warning: ExclamationTriangleIcon,
        success: CheckCircleIcon
    };
    
    const IconComponent = icons[type] || icons.info;
    
    return (
        <div className={`cht-field-description cht-field-description-${type} ${className}`}>
            <IconComponent className="cht-field-description-icon" />
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
        <FieldRow>
            <div className="cht-toggle-wrapper">
                <input
                    type="checkbox"
                    id={id}
                    className="cht-toggle"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={disabled}
                />
                <label htmlFor={id} className="cht-toggle-label">
                    <span className="cht-toggle-slider"></span>
                </label>
                <FieldLabel htmlFor={id} className="cht-toggle-text">
                    {label}
                </FieldLabel>
            </div>
        </FieldRow>
        {description && (
            <FieldDescription>{description}</FieldDescription>
        )}
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
        {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
        <select
            id={id}
            className="cht-select"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
        {description && (
            <FieldDescription>{description}</FieldDescription>
        )}
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
        <div className="cht-number-input-wrapper">
            <input
                type="number"
                id={id}
                className="cht-number-input"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
            />
            {unit && <span className="cht-input-unit">{unit}</span>}
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
        {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
        <input
            type={type}
            id={id}
            className="cht-text-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
        />
        {description && (
            <FieldDescription>{description}</FieldDescription>
        )}
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
        {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
        <textarea
            id={id}
            className="cht-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
        />
        {description && (
            <FieldDescription>{description}</FieldDescription>
        )}
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
        <div className="cht-color-input-wrapper">
            <input
                type="color"
                id={id}
                className="cht-color-input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
            />
            <input
                type="text"
                className="cht-color-text"
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
        {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
        <div className="cht-range-input-wrapper">
            <input
                type="range"
                id={id}
                className="cht-range-input"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
            />
            {showValue && (
                <span className="cht-range-value">
                    {formatValue ? formatValue(value) : value}
                </span>
            )}
        </div>
        {description && (
            <FieldDescription>{description}</FieldDescription>
        )}
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
    <div className={`cht-settings-section ${className}`}>
        {(title || description) && (
            <div className="cht-settings-section-header">
                {title && <h3 className="cht-settings-section-title">{title}</h3>}
                {description && <p className="cht-settings-section-description">{description}</p>}
            </div>
        )}
        <div className="cht-settings-section-content">
            {children}
        </div>
    </div>
);

export const SettingsCard = ({ title, children, className = '' }) => (
    <div className={`cht-settings-card ${className}`}>
        {title && <h4 className="cht-settings-card-title">{title}</h4>}
        <div className="cht-settings-card-content">
            {children}
        </div>
    </div>
);