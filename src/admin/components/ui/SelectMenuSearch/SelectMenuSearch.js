import './styles.scss';
import { __ } from '@wordpress/i18n';

const SelectMenuSearch = ({
	value,
	onChange,
	inputRef,
	className = 'sn-select-menu-search',
	placeholder,
}) => (
	<div className={`${className}__wrap`}>
		<input
			ref={inputRef}
			type="search"
			className={`${className}__input`}
			value={value}
			onChange={(event) => onChange(event.target.value)}
			placeholder={placeholder || __('Search…', 'analogwp-site-notes')}
			onClick={(event) => event.stopPropagation()}
			onKeyDown={(event) => event.stopPropagation()}
		/>
	</div>
);

export default SelectMenuSearch;
