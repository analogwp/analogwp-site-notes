/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import {
	TextInput,
	Textarea,
	Select,
	Range,
	Toggle
} from '../ui';
import {
	CheckCircleIcon,
	ExclamationTriangleIcon,
	InformationCircleIcon,
} from '../../../shared/icons';

export const FieldGroup = ({ children, className = '' }) => (
	<div className={classnames('sn-settings-fields', className)}>
		{children}
	</div>
);

export const FieldRow = ({ children, className = '' }) => (
	<div className={classnames('sn-field-row', className)}>
		{children}
	</div>
);

export const FieldLabel = ({ children, htmlFor, required = false, className = '' }) => (
	<label htmlFor={htmlFor} className={classnames('sn-label', className)}>
		{children}
		{required && <span className="sn-field-required">*</span>}
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
		<div className={classnames('sn-field-status', `sn-field-status--${type}`, className)}>
			<IconComponent className="sn-icon sn-icon--md" />
			<span>{children}</span>
		</div>
	);
};

export const ToggleField = ({
	checked,
	onChange,
	disabled = false,
	label,
	description,
	className = ''
}) => (
	<FieldGroup className={className}>
		<Toggle
			label={label}
			help={description}
			checked={checked}
			onChange={onChange}
			disabled={disabled}
		/>
	</FieldGroup>
);

export const SelectField = ({
	value,
	onChange,
	options,
	disabled = false,
	label,
	description,
	className = ''
}) => (
	<FieldGroup className={className}>
		<Select
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
	className = 'sn-field-row',
	variant = 'default'
}) => {
	const inputClasses = classnames(
		'sn-number-input sn-input',
		{
			'sn-number-input--compact': variant === 'default',
		}
	);

	return (
		<FieldGroup className={className}>
			{label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
			<div className="sn-relative sn-flex-col">
				<input
					type="number"
					id={id}
					className={inputClasses}
					value={value}
					onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
					min={min}
					max={max}
					step={step}
					disabled={disabled}
				/>
				{unit && <span className="sn-field-hint">{unit}</span>}
				{description && (
					<FieldDescription>{description}</FieldDescription>
				)}
			</div>
		</FieldGroup>
	);
};

export const TextInputField = ({
	value,
	onChange,
	placeholder,
	disabled = false,
	label,
	description,
	type = 'text',
	className = ''
}) => (
	<FieldGroup className={className}>
		<TextInput
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

export const TextAreaField = ({
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
		<Textarea
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
		<div className="sn-flex sn-gap-2">
			<input
				type="color"
				id={id}
				className="sn-color-input-swatch"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				disabled={disabled}
			/>
			<input
				type="text"
				className="sn-input sn-flex-1 sn-font-mono"
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
	value,
	onChange,
	min,
	max,
	step = 1,
	disabled = false,
	label,
	description,
	showValue = true,
	className = ''
}) => (
	<FieldGroup className={className}>
		<Range
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
			<div className="sn-multi-select">
				{options.map(option => (
					<label key={option.value} className="sn-multi-select-option">
						<input
							type="checkbox"
							checked={value.includes(option.value)}
							onChange={() => handleChange(option.value)}
							disabled={disabled}
						/>
						<span className="sn-checkmark" />
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
		<input
			type="file"
			id={id}
			className="sn-file-input"
			onChange={(e) => onChange(e.target.files[0])}
			accept={accept}
			disabled={disabled}
		/>
		{description && (
			<FieldDescription>{description}</FieldDescription>
		)}
	</FieldGroup>
);

export const SettingsSection = ({ title, description, children, className = '' }) => (
	<section className={classnames('sn-settings-section', className)}>
		{(title || description) && (
			<header className="sn-settings-section__header">
				{title && <h3 className="sn-settings-section__title">{title}</h3>}
				{description && <p className="sn-settings-section__desc">{description}</p>}
			</header>
		)}
		<div className="sn-settings-section__body">
			{children}
		</div>
	</section>
);

export const SettingsCard = ({ title, children, className = '' }) => (
	<div className={classnames('sn-settings-card', className)}>
		{title && <h4 className="sn-settings-card__title">{title}</h4>}
		<div className="sn-settings-card__body">
			{children}
		</div>
	</div>
);
