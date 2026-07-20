import classnames from 'classnames';

/**
 * Colored status indicator dot for task board columns and labels.
 */
const StatusDot = ({
	statusKey,
	size = 'md',
	className = '',
}) => (
	<span
		className={classnames(
			'sn-status-dot',
			statusKey && `sn-status-dot--${statusKey}`,
			size && `sn-status-dot--${size}`,
			className
		)}
		aria-hidden="true"
	/>
);

export default StatusDot;
