/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const CommentOverlay = () => {
	const [isVisible, setIsVisible] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsVisible(false);
		}, 10000);

		return () => clearTimeout(timer);
	}, []);

	if (!isVisible) {
		return null;
	}

	return (
		<div className="sn-overlay" onClick={() => setIsVisible(false)}>
			<div
				className="sn-overlay-message"
				onClick={(event) => event.stopPropagation()}
				role="status"
				aria-live="polite"
			>
				<button
					type="button"
					className="sn-overlay-close"
					onClick={() => setIsVisible(false)}
					aria-label={__('Close', 'analogwp-site-notes')}
				>
					×
				</button>
				<p className="sn-overlay-eyebrow">{__('Site Notes', 'analogwp-site-notes')}</p>
				<h3>{__('Notes mode is on', 'analogwp-site-notes')}</h3>
				<p className="sn-overlay-lead">
					{__('Click anywhere on the page to add a note.', 'analogwp-site-notes')}
				</p>
				<ul className="sn-overlay-instructions">
					<li>{__('Tap an element to place a note', 'analogwp-site-notes')}</li>
					<li>{__('Screenshots are captured automatically', 'analogwp-site-notes')}</li>
					<li>{__('Track replies and progress in Page Notes', 'analogwp-site-notes')}</li>
				</ul>
				<p className="sn-overlay-hint">
					{__('This message closes in a few seconds', 'analogwp-site-notes')}
				</p>
			</div>
		</div>
	);
};

export default CommentOverlay;
