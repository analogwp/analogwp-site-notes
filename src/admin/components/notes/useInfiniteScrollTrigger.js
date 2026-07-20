/**
 * WordPress dependencies
 */
import { useEffect, useRef } from '@wordpress/element';

/**
 * Observe a sentinel element and call onLoadMore when it enters the viewport.
 *
 * @param {Object}   options
 * @param {boolean}  options.enabled   Whether more items can be loaded.
 * @param {boolean}  options.loading   Whether a load is already in flight.
 * @param {Function} options.onLoadMore Callback to fetch the next page.
 * @param {string}   [options.rootMargin='240px'] IntersectionObserver rootMargin.
 * @return {import('@wordpress/element').RefObject} Ref to attach to the sentinel element.
 */
const useInfiniteScrollTrigger = ({
	enabled,
	loading,
	onLoadMore,
	rootMargin = '240px',
}) => {
	const sentinelRef = useRef(null);
	const loadingRef = useRef(loading);
	const onLoadMoreRef = useRef(onLoadMore);

	loadingRef.current = loading;
	onLoadMoreRef.current = onLoadMore;

	useEffect(() => {
		const node = sentinelRef.current;

		if (!enabled || !node || typeof IntersectionObserver === 'undefined') {
			return undefined;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const [entry] = entries;
				if (entry?.isIntersecting && !loadingRef.current) {
					onLoadMoreRef.current?.();
				}
			},
			{
				root: null,
				rootMargin,
				threshold: 0,
			}
		);

		observer.observe(node);

		return () => {
			observer.disconnect();
		};
	}, [enabled, loading, rootMargin]);

	return sentinelRef;
};

export default useInfiniteScrollTrigger;
