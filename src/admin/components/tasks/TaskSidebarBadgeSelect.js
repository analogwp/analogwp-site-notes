/**
 * Styled badge select for status and priority fields in the task sidebar.
 */
import { ChevronDownIcon } from '../../../shared/icons';

const TaskSidebarBadgeSelect = ({
	value,
	onChange,
	options,
	getOptionStyle,
	className = '',
}) => {
	const selectedStyle = getOptionStyle(value);

	return (
		<div className={`sn-badge-select ${className}`.trim()}>
			<select
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="sn-badge-select__input"
				style={selectedStyle}
			>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			<ChevronDownIcon size="sm" className="sn-badge-select__chevron" />
		</div>
	);
};

export default TaskSidebarBadgeSelect;
