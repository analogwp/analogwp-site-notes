import Icon from './Icon';

const CloseIcon = (props) => (
	<Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M18 6L6 18M6 6L18 18"
		/>
	</Icon>
);

export default CloseIcon;
