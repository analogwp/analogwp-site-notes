/**
 * dnd-kit dependencies
 */
import { useDroppable } from '@dnd-kit/core';
import classnames from 'classnames';

const DroppableColumn = ({ id, children, status }) => {
	const { isOver, setNodeRef } = useDroppable({
		id: id,
		data: {
			status: status,
		},
	});

	return (
		<div
			ref={setNodeRef}
			className={classnames('sn-kanban-column', {
				'sn-kanban-column--over': isOver,
			})}
		>
			{children}
		</div>
	);
};

export default DroppableColumn;
