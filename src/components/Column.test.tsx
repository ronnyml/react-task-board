import { render, screen, fireEvent } from '@testing-library/react';
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
      columnId: 'todo'
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

  it('should call startEditingTask when a task is hovered over', () => {
    render(<Column {...props} />);
    const taskElement = screen.getByText('Task 1');
    fireEvent.mouseEnter(taskElement);
    expect(mockStartEditingTask).toHaveBeenCalledWith('task-1');
  });

  it('should call stopEditingTask when a task hover ends', () => {
    render(<Column {...props} />);
    const taskElement = screen.getByText('Task 1');
    fireEvent.mouseLeave(taskElement);
    expect(mockStopEditingTask).toHaveBeenCalledWith('task-1');
  });

  it('should call stopEditingTask when a mouse button is released over a task', () => {
    render(<Column {...props} />);
    const taskElement = screen.getByText('Task 1');
    fireEvent.mouseUp(taskElement);
    expect(mockStopEditingTask).toHaveBeenCalledWith('task-1');
  });
});
