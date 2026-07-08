/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Task status definitions — shared between admin and frontend.
 */
export const TASK_STATUSES = [
	{
		key: 'open',
		title: __('Open', 'analogwp-site-notes'),
		color: '#FFE7B8',
		textColor: '#4D3300',
	},
	{
		key: 'in_progress',
		title: __('In Progress', 'analogwp-site-notes'),
		color: '#8E6DD4',
		textColor: '#F7F5FC',
	},
	{
		key: 'resolved',
		title: __('Resolved', 'analogwp-site-notes'),
		color: '#6AAE75',
		textColor: '#F8FBF8',
	},
];

export const getStatusByKey = (statusKey) => {
	return TASK_STATUSES.find((status) => status.key === statusKey);
};

export const getStatusKeys = () => {
	return TASK_STATUSES.map((status) => status.key);
};
