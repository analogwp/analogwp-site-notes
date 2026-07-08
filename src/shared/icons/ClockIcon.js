import Icon from './Icon';

const ClockIcon = ({ strokeWidth = 2, ...props }) => (
	<Icon fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
	</Icon>
);

export default ClockIcon;
