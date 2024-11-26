import { Draggable } from '@hello-pangea/dnd';
import { TaskProps } from '../interfaces/TaskProps';
import useBoard from '../hooks/useBoard';

const Task = ({ task, index }: TaskProps) => {
  const { editingUsers, currentUserId, deleteTask } = useBoard();

  const isBeingEdited = editingUsers[task.id] && editingUsers[task.id] !== currentUserId;
  const editingUser = editingUsers[task.id];

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
    }
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          className={`bg-white p-3 rounded-md shadow-md flex justify-between items-center ${isBeingEdited ? 'border-2 border-blue-500' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div>
            {task.title}
            {isBeingEdited && (
              <small className="block text-gray-500 mt-1">User {editingUser} is editing...</small>
            )}
          </div>
          <button
            onClick={handleDelete}
            className="text-red-500 ml-2 font-bold text-lg"
            aria-label="Delete task"
          >
            X
          </button>
        </div>
      )}
    </Draggable>
  );
};

export default Task;
