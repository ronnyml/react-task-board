import { Droppable } from 'react-beautiful-dnd';
import Task from './Task';
import useBoard from '../hooks/useBoard';
import { ColumnProps } from '../interfaces/ColumnProps';

const Column = ({ title, droppableId }: ColumnProps) => {
  const { tasks } = useBoard();

  return (
    <Droppable droppableId={droppableId} key={droppableId}>
      {(provided) => (
        <div
          className="p-5 bg-gray-100 rounded-lg w-full"
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          <h2 className="font-bold mb-3">{title}</h2>
          {tasks[droppableId].map((task, index) => (
            <Task key={task.id} task={task} index={index} />
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default Column;
