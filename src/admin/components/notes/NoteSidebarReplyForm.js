/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const NoteSidebarReplyForm = ({ onSubmit, disabled = false }) => {
	const [replyText, setReplyText] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (event) => {
		event.preventDefault();

		const trimmedReply = replyText.trim();
		if (!trimmedReply || isSubmitting) {
			return;
		}

		setIsSubmitting(true);

		try {
			const success = await onSubmit(trimmedReply);
			if (success) {
				setReplyText('');
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form className="sn-note-sidebar__reply-form" onSubmit={handleSubmit}>
			<textarea
				value={replyText}
				onChange={(event) => setReplyText(event.target.value)}
				placeholder={__('Write a reply…', 'analogwp-site-notes')}
				className="sn-input sn-note-sidebar__reply-input"
				rows="3"
				disabled={disabled || isSubmitting}
			/>
			<button
				type="submit"
				className="sn-btn-primary-solid"
				disabled={disabled || isSubmitting || !replyText.trim()}
			>
				{__('Send reply', 'analogwp-site-notes')}
			</button>
		</form>
	);
};

export default NoteSidebarReplyForm;
