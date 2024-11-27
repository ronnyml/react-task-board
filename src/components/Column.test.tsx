import { render, screen, fireEvent } from '@testing-library/react';
import { DragDropContext } from '@hello-pangea/dnd';
import Column from './Column';
import useBoard from '../hooks/useBoard';
import { ColumnProps } from '../interfaces/ColumnProps';

jest.mock('../hooks/useBoard');

const mockUseBoard = useBoard as jest.MockedFunction<typeof useBoard>;

describe('Column Component', () => {
  const mockStartEditingTask = jest.fn();
  const mockStopEditingTask = jest.fn();

  let props: ColumnProps;

  beforeEach(() => {
    props = {
      title: 'To Do',
      droppableId: 'todo'
    };

    mockUseBoard.mockReturnValue({
      tasks: {
        'todo': [
          { id: 'task-1', title: 'Task 1' },
          { id: 'task-2', title: 'Task 2' }
        ]
      },
      startEditingTask: mockStartEditingTask,
      stopEditingTask: mockStopEditingTask,
      editingUsers: {},
      currentUserId: null,
      updateTasks: jest.fn(),
      connectedUsers: [],
      editingTask: null,
      deleteTask: jest.fn()
    });

    jest.clearAllMocks();
  });

  const renderWithDragDropContext = (ui: React.ReactElement) => {
    return render(
      <DragDropContext onDragEnd={jest.fn()}>
        {ui}
      </DragDropContext>
    );
  };

  it('should call startEditingTask when a task is hovered over', () => {
    renderWithDragDropContext(<Column {...props} />);
    const taskElement = screen.getByText('Task 1');
    fireEvent.mouseEnter(taskElement);
    expect(mockStartEditingTask).toHaveBeenCalledWith('task-1');
  });

  it('should call stopEditingTask when a task hover ends', () => {
    renderWithDragDropContext(<Column {...props} />);
    const taskElement = screen.getByText('Task 1');
    fireEvent.mouseLeave(taskElement);
    expect(mockStopEditingTask).toHaveBeenCalledWith('task-1');
  });

  it('should call stopEditingTask when a mouse button is released over a task', () => {
    renderWithDragDropContext(<Column {...props} />);
    const taskElement = screen.getByText('Task 1');
    fireEvent.mouseUp(taskElement);
    expect(mockStopEditingTask).toHaveBeenCalledWith('task-1');
  });
});
