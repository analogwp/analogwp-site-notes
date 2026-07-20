import Icon from './Icon';

const PlusIcon = (props) => (
	<Icon fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
		<path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
	</Icon>
);

export default PlusIcon;
