/**
 * Searchable page target picker with custom URL support.
 */
import { useState, useRef, useEffect, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import classnames from 'classnames';
import { SidebarFieldSettingsIcon } from '../../../shared/icons';
import SelectMenuSearch from '../ui/SelectMenuSearch/SelectMenuSearch';
import logger from '../../../shared/utils/logger';
import { CUSTOM_PAGE_ID, normalizePageUrl, resolvePagePostId } from './noteSidebarUtils';

import './PageTargetSelect.scss';

const SEARCH_DEBOUNCE_MS = 300;

const formatDisplayUrl = (url) => {
	if (!url) {
		return '';
	}

	try {
		const parsed = new URL(url);
		return `${parsed.pathname}${parsed.search}` || '/';
	} catch {
		return url;
	}
};

const resolveCustomUrl = (input, homeUrl) => {
	const trimmed = (input || '').trim();
	if (!trimmed) {
		return '';
	}

	try {
		const absolute = new URL(trimmed, homeUrl);
		const home = new URL(homeUrl);
		if (absolute.host.toLowerCase() !== home.host.toLowerCase()) {
			return '';
		}
		return absolute.href;
	} catch {
		return '';
	}
};

const PageTargetSelect = ({
	value = '',
	pageUrl = '',
	specialPages = [],
	onChange,
	disabled = false,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState([]);
	const [isSearching, setIsSearching] = useState(false);
	const [showCustomForm, setShowCustomForm] = useState(false);
	const [customInput, setCustomInput] = useState('');
	const [customError, setCustomError] = useState('');
	const [selectedCache, setSelectedCache] = useState(null);
	const containerRef = useRef(null);
	const searchInputRef = useRef(null);
	const customInputRef = useRef(null);
	const searchRequestRef = useRef(0);
	const homeUrl = (typeof agwp_sn_ajax !== 'undefined' && agwp_sn_ajax.homeUrl) || '/';

	const selectedFromSpecials = specialPages.find((page) => String(page.id) === String(value));
	const selectedFromSearch = searchResults.find((page) => String(page.id) === String(value));
	const selectedFromCache = selectedCache && String(selectedCache.id) === String(value)
		? selectedCache
		: null;
	const selectedPage = selectedFromSpecials || selectedFromSearch || selectedFromCache;
	const isCustom = String(value) === CUSTOM_PAGE_ID
		|| (!selectedPage && Boolean(pageUrl) && !/^\d+$/.test(String(value || '')));
	const hasValue = Boolean(selectedPage) || Boolean(pageUrl);

	const displayLabel = selectedPage
		? selectedPage.title
		: (pageUrl ? formatDisplayUrl(pageUrl) : '');

	useEffect(() => {
		if (selectedFromSpecials) {
			setSelectedCache(selectedFromSpecials);
		}
	}, [selectedFromSpecials]);

	const visibleOptions = searchQuery.trim().length >= 2
		? searchResults
		: specialPages;

	const runSearch = useCallback(async (query) => {
		const trimmed = query.trim();
		if (trimmed.length < 2) {
			setSearchResults([]);
			setIsSearching(false);
			return;
		}

		const requestId = ++searchRequestRef.current;
		setIsSearching(true);

		try {
			const response = await fetch(agwp_sn_ajax.ajaxUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					action: 'agwp_sn_search_pages',
					nonce: agwp_sn_ajax.nonce,
					search: trimmed,
				}),
			});

			const data = await response.json();
			if (requestId !== searchRequestRef.current) {
				return;
			}

			if (data.success) {
				setSearchResults(data.data.pages || []);
			} else {
				setSearchResults([]);
			}
		} catch (error) {
			if (requestId === searchRequestRef.current) {
				logger.error('Error searching pages', error);
				setSearchResults([]);
			}
		} finally {
			if (requestId === searchRequestRef.current) {
				setIsSearching(false);
			}
		}
	}, []);

	useEffect(() => {
		if (!isOpen) {
			setSearchQuery('');
			setSearchResults([]);
			setShowCustomForm(false);
			setCustomInput('');
			setCustomError('');
			return undefined;
		}

		if (showCustomForm && customInputRef.current) {
			customInputRef.current.focus();
		} else if (searchInputRef.current) {
			searchInputRef.current.focus();
		}

		const handlePointerDown = (event) => {
			if (containerRef.current && !containerRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};

		const handleKeyDown = (event) => {
			if (event.key === 'Escape') {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handlePointerDown);
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('mousedown', handlePointerDown);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [isOpen, showCustomForm]);

	useEffect(() => {
		if (!isOpen || showCustomForm) {
			return undefined;
		}

		const timer = setTimeout(() => {
			runSearch(searchQuery);
		}, SEARCH_DEBOUNCE_MS);

		return () => clearTimeout(timer);
	}, [searchQuery, isOpen, showCustomForm, runSearch]);

	const toggleOpen = () => {
		if (!disabled) {
			setIsOpen((open) => !open);
		}
	};

	const emitChange = (pageId, url) => {
		onChange({
			pageId: String(pageId),
			pageUrl: url,
			postId: resolvePagePostId(pageId),
		});
	};

	const handleSelect = (page) => {
		setSelectedCache(page);
		emitChange(page.id, page.url);
		setIsOpen(false);
	};

	const handleCustomSubmit = (event) => {
		event.preventDefault();
		const resolved = resolveCustomUrl(customInput, homeUrl);
		if (!resolved) {
			setCustomError(__('Enter a valid URL on this site', 'analogwp-site-notes'));
			return;
		}

		setSelectedCache({
			id: CUSTOM_PAGE_ID,
			title: formatDisplayUrl(resolved),
			url: resolved,
			type: 'custom',
			group: 'special',
		});
		emitChange(CUSTOM_PAGE_ID, resolved);
		setIsOpen(false);
	};

	return (
		<div
			ref={containerRef}
			className={classnames('sn-sidebar-field', 'sn-page-target', {
				'sn-sidebar-field--open': isOpen,
				'sn-sidebar-field--disabled': disabled,
			})}
		>
			<div className="sn-sidebar-field__trigger">
				<button
					type="button"
					className="sn-sidebar-field__toggle"
					onClick={toggleOpen}
					disabled={disabled}
					aria-haspopup="listbox"
					aria-expanded={isOpen}
				>
					<span className="sn-sidebar-field__header">
						<span className="sn-sidebar-field__label">{__('Page', 'analogwp-site-notes')}</span>
						<SidebarFieldSettingsIcon size="md" className="sn-sidebar-field__icon" />
					</span>
					<span className="sn-sidebar-field__body">
						{hasValue ? (
							<span className="sn-sidebar-field__value sn-page-target__value">
								<span className="sn-page-target__value-title">{displayLabel}</span>
								{pageUrl && (
									<span className="sn-page-target__value-url">{formatDisplayUrl(pageUrl)}</span>
								)}
							</span>
						) : (
							<span className="sn-sidebar-field__empty">
								{__('No page selected', 'analogwp-site-notes')}
							</span>
						)}
					</span>
				</button>

				{isOpen && (
					<div className="sn-sidebar-field__dropdown sn-page-target__dropdown">
						{showCustomForm ? (
							<form className="sn-page-target__custom" onSubmit={handleCustomSubmit}>
								<label className="sn-page-target__custom-label" htmlFor="sn-page-target-custom-url">
									{__('Custom URL', 'analogwp-site-notes')}
								</label>
								<input
									id="sn-page-target-custom-url"
									ref={customInputRef}
									type="text"
									className="sn-page-target__custom-input"
									value={customInput}
									onChange={(event) => {
										setCustomInput(event.target.value);
										setCustomError('');
									}}
									placeholder={__('/path or full URL', 'analogwp-site-notes')}
								/>
								{customError && (
									<p className="sn-page-target__custom-error">{customError}</p>
								)}
								<div className="sn-page-target__custom-actions">
									<button
										type="button"
										className="sn-page-target__custom-cancel"
										onClick={() => {
											setShowCustomForm(false);
											setCustomError('');
										}}
									>
										{__('Back', 'analogwp-site-notes')}
									</button>
									<button type="submit" className="sn-page-target__custom-apply">
										{__('Use URL', 'analogwp-site-notes')}
									</button>
								</div>
							</form>
						) : (
							<>
								<SelectMenuSearch
									value={searchQuery}
									onChange={setSearchQuery}
									inputRef={searchInputRef}
									className="sn-sidebar-field__search"
									placeholder={__('Search pages, posts, taxonomies…', 'analogwp-site-notes')}
								/>
								<ul className="sn-sidebar-field__menu" role="listbox">
									{isSearching && (
										<li className="sn-sidebar-field__empty-item">
											{__('Searching…', 'analogwp-site-notes')}
										</li>
									)}
									{!isSearching && visibleOptions.map((page) => {
										const isSelected = String(page.id) === String(value)
											|| (
												Boolean(pageUrl)
												&& normalizePageUrl(page.url) === normalizePageUrl(pageUrl)
											);

										return (
											<li key={String(page.id)} className="sn-sidebar-field__menu-item">
												<button
													type="button"
													role="option"
													aria-selected={isSelected}
													className={classnames('sn-sidebar-field__option sn-page-target__option', {
														'sn-sidebar-field__option--selected': isSelected,
													})}
													onClick={() => handleSelect(page)}
												>
													<span className="sn-page-target__option-text">
														<span className="sn-sidebar-field__option-label">{page.title}</span>
														<span className="sn-page-target__option-url">
															{formatDisplayUrl(page.url)}
														</span>
													</span>
												</button>
											</li>
										);
									})}
									{!isSearching && visibleOptions.length === 0 && (
										<li className="sn-sidebar-field__empty-item">
											{searchQuery.trim().length >= 2
												? __('No results found', 'analogwp-site-notes')
												: __('No destinations available', 'analogwp-site-notes')}
										</li>
									)}
								</ul>
								<div className="sn-page-target__footer">
									<button
										type="button"
										className="sn-page-target__custom-toggle"
										onClick={() => {
											setShowCustomForm(true);
											setCustomInput(isCustom && pageUrl ? formatDisplayUrl(pageUrl) : '');
										}}
									>
										{__('Use custom URL', 'analogwp-site-notes')}
									</button>
								</div>
							</>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default PageTargetSelect;
