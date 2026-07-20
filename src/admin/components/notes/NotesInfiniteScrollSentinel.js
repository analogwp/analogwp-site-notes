/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import useInfiniteScrollTrigger from './useInfiniteScrollTrigger';
import { Spinner } from '../ui';

/**
 * Invisible sentinel that triggers onLoadMore when scrolled into view.
 */
const NotesInfiniteScrollSentinel = ({
	enabled = false,
	loading = false,
	onLoadMore,
	className = '',
}) => {
	const sentinelRef = useInfiniteScrollTrigger({
		enabled,
		loading,
		onLoadMore,
	});

	if (!enabled && !loading) {
		return null;
	}

	return (
		<div
			ref={sentinelRef}
			className={`sn-infinite-scroll-sentinel${className ? ` ${className}` : ''}`}
			aria-hidden={!loading}
		>
			{loading && (
				<div className="sn-infinite-scroll-sentinel__status" role="status">
					<Spinner size="small" />
					<span className="sn-text-s sn-text-secondary">
						{__('Loading more notes…', 'analogwp-site-notes')}
					</span>
				</div>
			)}
		</div>
	);
};

export default NotesInfiniteScrollSentinel;
