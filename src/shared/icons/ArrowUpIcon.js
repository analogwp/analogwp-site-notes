import Icon from './Icon';

const ArrowUpIcon = (props) => (
	<Icon fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
		<path
			d="M12 19V5M5 12l7-7 7 7"
			strokeWidth={2.25}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</Icon>
);

export default ArrowUpIcon;
