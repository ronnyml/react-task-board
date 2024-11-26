import { Droppable } from '@hello-pangea/dnd';
import Task from './Task';
import useBoard from '../hooks/useBoard';
import { ColumnProps } from '../interfaces/ColumnProps';

const Column = ({ title, droppableId }: ColumnProps) => {
  const { tasks, startEditingTask, stopEditingTask } = useBoard();

  return (
    <Droppable droppableId={droppableId}>
      {(provided) => (
        <div
          className="p-5 bg-slate-200 rounded-xl w-full"
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          <h2 className="font-bold mb-3">{title}</h2>
          {tasks[droppableId] && tasks[droppableId].map((task, index) => (
            <div
              key={task.id}
              onMouseEnter={() => startEditingTask(task.id)}
              onMouseLeave={() => stopEditingTask(task.id)}
              onMouseUp={() => stopEditingTask(task.id)}
              className="mb-2"
            >
              <Task task={task} index={index} />
            </div>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default Column;
