import { __, sprintf } from '@wordpress/i18n';

/**
 * Format a timestamp as a relative phrase (e.g. "3 hours ago").
 *
 * @param {string} dateString Date string from the API.
 * @return {string} Relative time label.
 */
export const formatRelativeTime = (dateString) => {
	if (!dateString) {
		return '';
	}

	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now - date;
	const diffMinutes = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMinutes / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffMinutes < 1) {
		return __('Just now', 'analogwp-site-notes');
	}

	if (diffMinutes === 1) {
		return __('1 minute ago', 'analogwp-site-notes');
	}

	if (diffMinutes < 60) {
		return sprintf(
			/* translators: %d: number of minutes */
			__('%d minutes ago', 'analogwp-site-notes'),
			diffMinutes
		);
	}

	if (diffHours === 1) {
		return __('1 hour ago', 'analogwp-site-notes');
	}

	if (diffHours < 24) {
		return sprintf(
			/* translators: %d: number of hours */
			__('%d hours ago', 'analogwp-site-notes'),
			diffHours
		);
	}

	if (diffDays === 1) {
		return __('1 day ago', 'analogwp-site-notes');
	}

	if (diffDays < 7) {
		return sprintf(
			/* translators: %d: number of days */
			__('%d days ago', 'analogwp-site-notes'),
			diffDays
		);
	}

	return date.toLocaleDateString();
};

export default formatRelativeTime;
