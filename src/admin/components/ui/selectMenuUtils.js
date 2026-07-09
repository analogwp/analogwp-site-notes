export const SELECT_SEARCH_THRESHOLD = 10;

export const shouldShowSelectSearch = (
	options,
	threshold = SELECT_SEARCH_THRESHOLD
) => options.length > threshold;

export const filterSelectOptions = (options, searchQuery) => {
	const query = searchQuery.trim().toLowerCase();

	if (!query) {
		return options;
	}

	return options.filter((option) =>
		String(option.label || '')
			.toLowerCase()
			.includes(query)
	);
};
