import { Draggable } from '@hello-pangea/dnd';
import { TaskProps } from '../interfaces/TaskProps';

const Task = ({ task, index }: TaskProps) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          className="bg-white p-3 rounded-md shadow-md"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {task.title}
        </div>
      )}
    </Draggable>
  );
};

export default Task;
