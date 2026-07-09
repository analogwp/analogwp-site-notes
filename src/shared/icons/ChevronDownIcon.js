import Icon from './Icon';

const ChevronDownIcon = (props) => (
	<Icon
		fill="none"
		stroke="currentColor"
		viewBox="0 0 23 23"
		{...props}
	>
		<path
			d="M5.75 8.625L11.5 14.375L17.25 8.625"
			strokeWidth={1.45455}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</Icon>
);

export default ChevronDownIcon;
