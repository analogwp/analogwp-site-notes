import Icon from './Icon';

const CheckmarkIcon = (props) => (
	<Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M5 12L10 17L20 7"
		/>
	</Icon>
);

export default CheckmarkIcon;
