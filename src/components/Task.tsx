import { Draggable } from '@hello-pangea/dnd';
import { TaskProps } from '../interfaces/TaskProps';
import useBoard from '../hooks/useBoard';

const Task = ({ task, index }: TaskProps) => {
  const { editingUsers, currentUserId } = useBoard();

  const isBeingEdited = editingUsers[task.id] && editingUsers[task.id] !== currentUserId;
  const editingUser = editingUsers[task.id];

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          className={`bg-white p-3 rounded-md shadow-md ${isBeingEdited ? 'border-2 border-blue-500' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {task.title}
          {isBeingEdited && (
            <small className="block text-gray-500 mt-1">User {editingUser} is editing...</small>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default Task;
