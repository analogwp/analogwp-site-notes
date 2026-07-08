import { CloseIcon } from '../../../shared/icons';

const Alert = ({
	children,
	variant = 'info',
	className = '',
	dismissible = false,
	onDismiss,
	...props
}) => {
	const alertClasses = [
		'sn-alert',
		`sn-alert--${variant}`,
		className,
	].filter(Boolean).join(' ');

	return (
		<div className={alertClasses} {...props}>
			<div className="sn-alert__inner">
				<div className="sn-alert__content">
					{children}
				</div>
				{dismissible && (
					<button
						type="button"
						onClick={onDismiss}
						className="sn-alert__dismiss"
						aria-label="Dismiss"
					>
						<CloseIcon size="sm" />
					</button>
				)}
			</div>
		</div>
	);
};

export default Alert;
