import { render, screen, fireEvent } from '@testing-library/react';
import Column from './Column';
import useBoard from '../hooks/useBoard';
import { ColumnProps } from '../interfaces/ColumnProps';

jest.mock('../hooks/useBoard');

const mockUseBoard = useBoard as jest.MockedFunction<typeof useBoard>;

describe('Column Component', () => {
  const mockStartEditingTask = jest.fn();
  const mockStopEditingTask = jest.fn();
  const mockOnDeleteTask = jest.fn();
  const mockUpdateTasks = jest.fn();

  let props: ColumnProps;

  beforeEach(() => {
    props = {
      title: 'To Do',
      columnId: 'todo',
      searchQuery: '',
      onDeleteTask: mockOnDeleteTask,
    };

    mockUseBoard.mockReturnValue({
      tasks: {
        'todo': [
          { id: 'task-1', title: 'Task 1' },
          { id: 'task-2', title: 'Task 2' }
        ]
      },
      updateTasks: mockUpdateTasks,
      startEditingTask: mockStartEditingTask,
      stopEditingTask: mockStopEditingTask,
      editingUsers: {},
      currentUserId: null,
      updateTask: jest.fn(),
      connectedUsers: [],
      userNames: {},
      editingTask: null,
      socketConnected: false,
      userName: 'Tester',
      setUserName: jest.fn(),
      deleteTask: jest.fn(),
      columns: [{ id: 'todo', title: 'To Do' }],
      updateColumns: jest.fn(),
      selectedTaskId: null,
      selectedTaskColumnId: null,
      openTask: jest.fn(),
      closeTask: jest.fn(),
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

  it('should filter tasks by search query', () => {
    render(<Column {...props} searchQuery="Task 1" />);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
  });

  it('should show the add task input in every column', () => {
    render(<Column {...props} />);
    expect(screen.getByPlaceholderText('+ Add a task…')).toBeInTheDocument();
  });
});
