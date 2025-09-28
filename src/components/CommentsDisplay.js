/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import CommentMarker from './CommentMarker';

const CommentsDisplay = ({ comments, onAddReply, onUpdateStatus, canManageComments }) => {
    const [selectedComment, setSelectedComment] = useState(null);
    const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 });

    // Track scroll position to update marker positions
    useEffect(() => {
        const handleScroll = () => {
            setScrollOffset({
                x: window.pageXOffset,
                y: window.pageYOffset
            });
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div 
            className="cht-comments-display"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: document.body.scrollHeight + 'px',
                pointerEvents: 'none',
                zIndex: 10000
            }}
        >
            {comments.map((comment) => (
                <CommentMarker
                    key={comment.id}
                    comment={comment}
                    isSelected={selectedComment === comment.id}
                    onSelect={() => setSelectedComment(
                        selectedComment === comment.id ? null : comment.id
                    )}
                    onAddReply={onAddReply}
                    onUpdateStatus={onUpdateStatus}
                    canManageComments={canManageComments}
                />
            ))}
            
            {comments.length === 0 && (
                <div className="cht-no-comments">
                    <p>{__('No comments on this page yet.', 'analogwp-client-handoff')}</p>
                </div>
            )}
        </div>
    );
};

export default CommentsDisplay;