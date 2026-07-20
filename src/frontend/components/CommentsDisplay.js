/**
 * WordPress dependencies
 */
import { useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import CommentMarker from './CommentMarker';

const CommentsDisplay = ({
	comments,
	onAddReply,
	onDelete,
	onDeleteReply,
	canManageComments,
	adminDashboardUrl,
	pageUrl,
}) => {
	const [selectedCommentId, setSelectedCommentId] = useState(null);
	const [documentHeight, setDocumentHeight] = useState(
		() => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
	);

	useEffect(() => {
		const updateHeight = () => {
			setDocumentHeight(
				Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
			);
		};

		updateHeight();
		window.addEventListener('resize', updateHeight);
		window.addEventListener('scroll', updateHeight, true);
		return () => {
			window.removeEventListener('resize', updateHeight);
			window.removeEventListener('scroll', updateHeight, true);
		};
	}, [comments.length]);

	const positionedComments = (comments || []).filter((comment) => {
		const x = Number(comment?.x_position);
		const y = Number(comment?.y_position);
		if (!Number.isFinite(x) || !Number.isFinite(y)) {
			return false;
		}

		if (!pageUrl || !comment.page_url) {
			return true;
		}

		const normalize = (url) =>
			String(url)
				.replace(/#.*$/, '')
				.replace(/\?.*$/, '')
				.replace(/\/$/, '');

		return normalize(comment.page_url) === normalize(pageUrl);
	});

	if (!positionedComments.length) {
		return null;
	}

	return (
		<div
			className="sn-comments-display"
			style={{ height: `${documentHeight}px` }}
			data-sn-ignore="true"
		>
			{positionedComments.map((comment) => (
				<CommentMarker
					key={comment.id}
					comment={comment}
					isSelected={selectedCommentId === comment.id}
					onSelect={setSelectedCommentId}
					onAddReply={onAddReply}
					onDelete={onDelete}
					onDeleteReply={onDeleteReply}
					canManageComments={canManageComments}
					adminDashboardUrl={adminDashboardUrl}
				/>
			))}
		</div>
	);
};

export default CommentsDisplay;
