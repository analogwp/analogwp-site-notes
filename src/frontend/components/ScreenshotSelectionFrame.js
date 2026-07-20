/**
 * WordPress dependencies
 */
import { useState, useEffect, createPortal } from '@wordpress/element';

export const CAPTURE_SIZE = 512;

/**
 * Get viewport-fixed box for the screenshot selection frame.
 *
 * @param {{ x: number, y: number }} position Document-relative click position.
 * @return {{ left: number, top: number, width: number, height: number }}
 */
export const getCaptureFrameRect = (position) => {
	const fullWidth = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
	const fullHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
	const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
	const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

	const centerX = Number(position?.x) || 0;
	const centerY = Number(position?.y) || 0;

	const startX = Math.max(0, centerX - CAPTURE_SIZE / 2);
	const startY = Math.max(0, centerY - CAPTURE_SIZE / 2);
	const endX = Math.min(fullWidth, startX + CAPTURE_SIZE);
	const endY = Math.min(fullHeight, startY + CAPTURE_SIZE);

	return {
		left: startX - scrollLeft,
		top: startY - scrollTop,
		width: endX - startX,
		height: endY - startY,
	};
};

/**
 * White L-bracket frame around the screenshot capture region.
 *
 * @param {{
 *   position: { x: number, y: number },
 *   className?: string,
 *   withOverlay?: boolean,
 *   portal?: boolean,
 *   onDismiss?: () => void,
 * }} props
 */
export const ScreenshotSelectionFrame = ({
	position,
	className = '',
	withOverlay = false,
	portal = false,
	onDismiss,
}) => {
	const [rect, setRect] = useState(() => getCaptureFrameRect(position));

	useEffect(() => {
		const update = () => setRect(getCaptureFrameRect(position));
		update();
		window.addEventListener('scroll', update, true);
		window.addEventListener('resize', update);
		return () => {
			window.removeEventListener('scroll', update, true);
			window.removeEventListener('resize', update);
		};
	}, [position?.x, position?.y]);

	useEffect(() => {
		if (!withOverlay || !onDismiss) {
			return;
		}

		const handleKeyDown = (event) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				event.stopPropagation();
				onDismiss();
			}
		};

		document.addEventListener('keydown', handleKeyDown, true);
		return () => document.removeEventListener('keydown', handleKeyDown, true);
	}, [withOverlay, onDismiss]);

	if (!position) {
		return null;
	}

	const handleDismissClick = (event) => {
		event.preventDefault();
		event.stopPropagation();
		if (typeof event.stopImmediatePropagation === 'function') {
			event.stopImmediatePropagation();
		}
		onDismiss?.();
	};

	const frame = (
		<div className="sn-screenshot-highlight" data-sn-ignore="true">
			{withOverlay && (
				<div
					className="sn-screenshot-highlight__hitbox"
					data-sn-ignore="true"
					onClick={handleDismissClick}
					onMouseDown={handleDismissClick}
				/>
			)}
			<div
				className={`sn-screenshot-frame${className ? ` ${className}` : ''}${
					withOverlay ? ' sn-screenshot-frame--with-overlay' : ''
				}`}
				data-sn-ignore="true"
				style={{
					left: `${rect.left}px`,
					top: `${rect.top}px`,
					width: `${rect.width}px`,
					height: `${rect.height}px`,
				}}
				aria-hidden="true"
			>
				<span className="sn-screenshot-frame__corner sn-screenshot-frame__corner--tl" />
				<span className="sn-screenshot-frame__corner sn-screenshot-frame__corner--tr" />
				<span className="sn-screenshot-frame__corner sn-screenshot-frame__corner--bl" />
				<span className="sn-screenshot-frame__corner sn-screenshot-frame__corner--br" />
			</div>
		</div>
	);

	if (portal && typeof document !== 'undefined') {
		return createPortal(frame, document.body);
	}

	return frame;
};

export default ScreenshotSelectionFrame;
