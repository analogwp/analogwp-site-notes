import Icon from './Icon';

const XMarkIcon = (props) => (
	<Icon fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
		<path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
	</Icon>
);

export default XMarkIcon;
