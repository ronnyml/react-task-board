import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import Column from './Column';
import { useState } from 'react';
import useBoard from '../hooks/useBoard';

const Board = () => {
  const { tasks, updateTasks } = useBoard();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const newTasks = { ...tasks };
    const [movedTask] = newTasks[source.droppableId].splice(source.index, 1);
    newTasks[destination.droppableId].splice(destination.index, 0, movedTask);

    updateTasks(newTasks);
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim() !== '') {
      const newTask = { id: `task-${Date.now()}`, title: newTaskTitle };
      const updatedTasks = { ...tasks };
      updatedTasks['todo'] = [newTask, ...updatedTasks['todo']];
      updateTasks(updatedTasks);
      setNewTaskTitle('');
    }
  };

  return (
    <div>
      <div className="flex justify-start mb-4">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Enter new task"
          className="border p-2 rounded mr-5 h-11"
        />
        <button
          onClick={handleAddTask}
          className="px-5 bg-slate-800 text-white rounded h-10"
        >
          Add Task
        </button>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex space-x-4">
          <Column key="todo" title="To Do" droppableId="todo" />
          <Column key="in-progress" title="In Progress" droppableId="in-progress" />
          <Column key="done" title="Done" droppableId="done" />
        </div>
      </DragDropContext>
    </div>
  );
};

export default Board;
