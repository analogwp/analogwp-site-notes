/**
 * WordPress dependencies
 */
import { useState, useEffect, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import html2canvas from 'html2canvas';
import Draggable from 'react-draggable';

/**
 * Internal dependencies
 */
import { ArrowUpIcon, ChevronDownIcon } from '../../shared/icons';
import logger from '../../shared/utils/logger';
import ScreenshotSelectionFrame, { CAPTURE_SIZE } from './ScreenshotSelectionFrame';

const DEFAULT_PRIORITIES = [
	{ id: 1, key: 'high', name: __('High', 'analogwp-site-notes'), color: '#ef4444' },
	{ id: 2, key: 'medium', name: __('Medium', 'analogwp-site-notes'), color: '#f59e0b' },
	{ id: 3, key: 'low', name: __('Low', 'analogwp-site-notes'), color: '#10b981' },
];

/**
 * Normalize saved priorities for the popup selector.
 *
 * @return {{ key: string, label: string, color: string }[]}
 */
const getPriorityOptions = () => {
	const saved = window.agwp_sn_ajax?.priorities;
	const source = Array.isArray(saved) && saved.length > 0 ? saved : DEFAULT_PRIORITIES;

	return source
		.map((priority) => ({
			key: priority.key || '',
			label: priority.name || priority.label || priority.key || '',
			color: priority.color || '#6b7280',
		}))
		.filter((priority) => priority.key);
};

/**
 * Pick the default priority key (prefer medium when available).
 *
 * @param {{ key: string }[]} options
 * @return {string}
 */
const getDefaultPriorityKey = (options) => {
	if (!options.length) {
		return 'medium';
	}

	const medium = options.find((option) => option.key === 'medium');
	return medium ? medium.key : options[0].key;
};

const PrioritySelect = ({ value, onChange, disabled, options }) => {
	const [open, setOpen] = useState(false);
	const ref = useRef(null);
	const selected = options.find((option) => option.key === value) || options[0];

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (ref.current && !ref.current.contains(event.target)) {
				setOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	if (!selected) {
		return null;
	}

	return (
		<div className="sn-priority-select" ref={ref}>
			<button
				type="button"
				className="sn-priority-select__trigger"
				onClick={() => setOpen((isOpen) => !isOpen)}
				disabled={disabled}
				aria-expanded={open}
				aria-haspopup="listbox"
			>
				<span
					className="sn-priority-select__dot"
					style={{ backgroundColor: selected.color }}
					aria-hidden="true"
				/>
				<span className="sn-priority-select__label">
					{__('Priority:', 'analogwp-site-notes')} {selected.label}
				</span>
				<ChevronDownIcon className="sn-icon" size="sm" />
			</button>

			{open && (
				<ul className="sn-priority-select__menu" role="listbox">
					{options.map((option) => (
						<li key={option.key} role="option" aria-selected={option.key === value}>
							<button
								type="button"
								className={
									option.key === value
										? 'sn-priority-select__option sn-priority-select__option--selected'
										: 'sn-priority-select__option'
								}
								onClick={() => {
									onChange(option.key);
									setOpen(false);
								}}
							>
								<span
									className="sn-priority-select__dot"
									style={{ backgroundColor: option.color }}
									aria-hidden="true"
								/>
								{option.label}
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

const CommentPopup = ({ position, onSave, onCancel }) => {
	const priorityOptions = getPriorityOptions();
	const [title, setTitle] = useState('');
	const [comment, setComment] = useState('');
	const [priority, setPriority] = useState(() => getDefaultPriorityKey(priorityOptions));
	const [isLoading, setIsLoading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [website, setWebsite] = useState('');

	const settings = window.agwp_sn_ajax?.settings || {};
	const autoScreenshot =
		(settings.general?.auto_screenshot ?? true) && !!window.agwp_sn_ajax?.canUploadScreenshots;
	const canSubmit = Boolean(title.trim() || comment.trim());

	useEffect(() => {
		const handleKeyDown = (event) => {
			if (event.key === 'Escape' && !isLoading) {
				onCancel();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isLoading, onCancel]);

	const getPopupStyle = () => {
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const popupWidth = 340;
		const popupHeight = 220;
		const margin = 20;

		let left = position.x - window.pageXOffset;
		let top = position.y - window.pageYOffset;

		if (left + popupWidth > viewportWidth - margin) {
			left = viewportWidth - popupWidth - margin;
		}
		if (left < margin) {
			left = margin;
		}
		if (top + popupHeight > viewportHeight - margin) {
			top = viewportHeight - popupHeight - margin;
		}
		if (top < margin) {
			top = margin;
		}

		return {
			position: 'fixed',
			left: `${left}px`,
			top: `${top}px`,
			zIndex: 100001,
		};
	};

	const captureScreenshot = async () => {
		const originalScrollTop = window.pageYOffset;
		const originalScrollLeft = window.pageXOffset;

		try {
			logger.debug('Starting centered screenshot capture at position:', position);

			const fullWidth = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
			const fullHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);

			const centerX = position.x;
			const centerY = position.y;

			const startX = Math.max(0, centerX - CAPTURE_SIZE / 2);
			const startY = Math.max(0, centerY - CAPTURE_SIZE / 2);
			const endX = Math.min(fullWidth, startX + CAPTURE_SIZE);
			const endY = Math.min(fullHeight, startY + CAPTURE_SIZE);

			const actualWidth = endX - startX;
			const actualHeight = endY - startY;

			window.scrollTo(
				Math.max(0, centerX - window.innerWidth / 2),
				Math.max(0, centerY - window.innerHeight / 2)
			);

			await new Promise((resolve) => setTimeout(resolve, 100));

			const ignoreSnUi = (element) => {
				if (!element) {
					return false;
				}

				if (element.id === 'sn-debug-overlay') {
					return true;
				}

				const ignoredClasses = [
					'sn-comment-popup-overlay',
					'sn-comment-popup',
					'sn-comment-sidebar',
					'sn-sidebar-close',
					'sn-toggle-button',
					'sn-overlay',
					'sn-admin-bar-item',
					'sn-screenshot-frame',
				];

				if (element.classList && ignoredClasses.some((cls) => element.classList.contains(cls))) {
					return true;
				}

				if (element.hasAttribute && element.hasAttribute('data-sn-ignore')) {
					return true;
				}

				if (element.style && element.style.position === 'fixed' && parseInt(element.style.zIndex) > 99000) {
					return true;
				}

				try {
					const computedStyle = window.getComputedStyle(element);
					if (
						computedStyle.position === 'fixed' &&
						parseInt(computedStyle.zIndex) > 1000 &&
						(computedStyle.backgroundColor.includes('rgba(0, 0, 0') ||
							computedStyle.background.includes('rgba(0, 0, 0'))
					) {
						return true;
					}
				} catch (e) {
					// Ignore computed style errors.
				}

				return false;
			};

			const canvas = await html2canvas(document.body, {
				useCORS: true,
				allowTaint: true,
				backgroundColor: '#ffffff',
				scale: 1,
				logging: false,
				width: fullWidth,
				height: fullHeight,
				x: 0,
				y: 0,
				foreignObjectRendering: false,
				imageTimeout: 10000,
				removeContainer: true,
				scrollX: 0,
				scrollY: 0,
				windowWidth: window.innerWidth,
				windowHeight: window.innerHeight,
				onclone: (clonedDoc) => {
					try {
						const allElements = clonedDoc.querySelectorAll('*');
						allElements.forEach((el) => {
							try {
								if (el.style && el.style.cssText) {
									let cssText = el.style.cssText;
									cssText = cssText.replace(/color\([^)]+\)/gi, '#000000');
									cssText = cssText.replace(/lab\([^)]+\)/gi, '#000000');
									cssText = cssText.replace(/lch\([^)]+\)/gi, '#000000');
									cssText = cssText.replace(/oklab\([^)]+\)/gi, '#000000');
									cssText = cssText.replace(/oklch\([^)]+\)/gi, '#000000');
									cssText = cssText.replace(/hwb\([^)]+\)/gi, '#000000');
									if (cssText !== el.style.cssText) {
										el.style.cssText = cssText;
									}
								}
							} catch (e) {
								// Skip problematic elements.
							}
						});
					} catch (e) {
						logger.warn('Style cleanup failed:', e);
					}
				},
				ignoreElements: ignoreSnUi,
			});

			window.scrollTo(originalScrollLeft, originalScrollTop);

			const croppedCanvas = document.createElement('canvas');
			croppedCanvas.width = CAPTURE_SIZE;
			croppedCanvas.height = CAPTURE_SIZE;
			const croppedCtx = croppedCanvas.getContext('2d');

			croppedCtx.drawImage(
				canvas,
				startX,
				startY,
				actualWidth,
				actualHeight,
				(CAPTURE_SIZE - actualWidth) / 2,
				(CAPTURE_SIZE - actualHeight) / 2,
				actualWidth,
				actualHeight
			);

			const screenshotQuality = settings.general?.screenshot_quality ?? 0.8;
			const dataURL = croppedCanvas.toDataURL('image/png', screenshotQuality);
			logger.debug('Screenshot captured successfully, size:', dataURL.length);

			return dataURL;
		} catch (error) {
			logger.error('Screenshot capture failed:', error);
			window.scrollTo(originalScrollLeft, originalScrollTop);
			return '';
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!canSubmit) {
			return;
		}

		setIsLoading(true);

		try {
			const screenshotUrl = autoScreenshot ? await captureScreenshot() : '';
			await onSave(comment.trim(), screenshotUrl, priority, title.trim(), website.trim());
		} catch (error) {
			logger.error('Error saving comment:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleOverlayClick = (e) => {
		if (isLoading) {
			return;
		}
		if (e.target.classList.contains('sn-comment-popup-overlay')) {
			onCancel();
		}
	};

	return (
		<div className="sn-comment-popup-overlay" onClick={handleOverlayClick}>
			{autoScreenshot && <ScreenshotSelectionFrame position={position} />}

			<Draggable
				handle=".sn-comment-popup__drag"
				bounds="parent"
				onStart={() => setIsDragging(true)}
				onStop={() => setTimeout(() => setIsDragging(false), 100)}
			>
				<div
					className="sn-comment-popup"
					style={getPopupStyle()}
					data-sn-ignore="true"
					data-dragging={isDragging}
				>
					<form onSubmit={handleSubmit}>
						<div className="sn-comment-popup__drag sn-popup-body">
							<input
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder={__('Add title', 'analogwp-site-notes')}
								className="sn-comment-title"
								disabled={isLoading}
								autoFocus
							/>

							<textarea
								value={comment}
								onChange={(e) => setComment(e.target.value)}
								placeholder={__('Details...', 'analogwp-site-notes')}
								className="sn-comment-textarea"
								rows="3"
								disabled={isLoading}
							/>

							<input
								type="text"
								name="website"
								value={website}
								onChange={(e) => setWebsite(e.target.value)}
								tabIndex="-1"
								autoComplete="off"
								className="sn-comment-popup__honeypot"
								aria-hidden="true"
							/>
						</div>

						<div className="sn-popup-footer">
							<PrioritySelect
								value={priority}
								onChange={setPriority}
								disabled={isLoading}
								options={priorityOptions}
							/>

							<button
								type="submit"
								className="sn-popup-send"
								disabled={isLoading || !canSubmit}
								aria-label={
									isLoading
										? __('Saving...', 'analogwp-site-notes')
										: __('Save comment', 'analogwp-site-notes')
								}
							>
								{isLoading ? (
									<span className="sn-spinner" />
								) : (
									<ArrowUpIcon className="sn-icon" size="md" />
								)}
							</button>
						</div>
					</form>
				</div>
			</Draggable>
		</div>
	);
};

export default CommentPopup;
