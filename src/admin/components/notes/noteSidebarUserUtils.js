export const getUserInitials = (name) => {
	if (!name) {
		return '?';
	}

	return name
		.split(' ')
		.map((part) => part[0])
		.join('')
		.toUpperCase();
};

export const renderUserAvatar = (user, className = 'sn-avatar sn-avatar--md') => {
	const name = user?.name || user?.display_name || user?.label || '';
	const avatar = user?.avatar;

	return (
		<div
			className={className}
			style={{
				backgroundImage: avatar ? `url(${avatar})` : 'none',
				backgroundColor: avatar ? 'transparent' : undefined,
			}}
		>
			{!avatar && getUserInitials(name)}
		</div>
	);
};
