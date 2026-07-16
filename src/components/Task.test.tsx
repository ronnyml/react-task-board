import { render, screen, fireEvent } from '@testing-library/react';
import Task from './Task';
import useBoard from '../hooks/useBoard';
import { TaskProps } from '../interfaces/TaskProps';

jest.mock('../hooks/useBoard');

const mockUseBoard = useBoard as jest.MockedFunction<typeof useBoard>;

describe('Task Component', () => {
  const mockDeleteTask = jest.fn();
  const mockOnDelete = jest.fn();
  const mockStartEditingTask = jest.fn();
  const mockStopEditingTask = jest.fn();
  const mockOpenTask = jest.fn();
  let props: TaskProps;
  let mockUseBoardReturnValue: ReturnType<typeof useBoard>;

  beforeEach(() => {
    props = {
      task: { id: 'task-1', title: 'Task 1' },
      index: 0,
      columnId: 'todo',
      onDelete: mockOnDelete,
    };

    mockUseBoardReturnValue = {
      editingUsers: {},
      currentUserId: 'user-1',
      deleteTask: mockDeleteTask,
      tasks: {},
      updateTasks: jest.fn(),
      updateTask: jest.fn(),
      connectedUsers: [],
      userNames: {},
      startEditingTask: mockStartEditingTask,
      stopEditingTask: mockStopEditingTask,
      socketConnected: false,
      userName: 'Tester',
      setUserName: jest.fn(),
      columns: [{ id: 'todo', title: 'To Do' }],
      updateColumns: jest.fn(),
      selectedTaskId: null,
      selectedTaskColumnId: null,
      openTask: mockOpenTask,
      closeTask: jest.fn(),
    };

    mockUseBoard.mockReturnValue(mockUseBoardReturnValue);
    jest.clearAllMocks();
  });

  it('should call onDelete when the delete button is clicked', () => {
    render(<Task {...props} />);

    const deleteButton = screen.getByLabelText('Delete task');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalled();
  });

  it('should render the task with the title', () => {
    render(<Task {...props} />);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  it('should open task modal when card is clicked', () => {
    render(<Task {...props} />);
    const card = screen.getByText('Task 1').closest('[class*="rounded-r-xl"]') as HTMLElement;
    fireEvent.click(card);
    expect(mockOpenTask).toHaveBeenCalledWith('task-1', 'todo');
  });

  it('should show editing indicator with resolved name when another user is editing', () => {
    mockUseBoardReturnValue.editingUsers = { 'task-1': 'user-2' };
    mockUseBoardReturnValue.userNames = { 'user-2': 'Alice' };
    mockUseBoard.mockReturnValue(mockUseBoardReturnValue);

    render(<Task {...props} />);
    expect(screen.getByText('Alice is viewing…')).toBeInTheDocument();
  });

  it('should fall back to id when no name is found for the editing user', () => {
    mockUseBoardReturnValue.editingUsers = { 'task-1': 'user-2' };
    mockUseBoardReturnValue.userNames = {};
    mockUseBoard.mockReturnValue(mockUseBoardReturnValue);

    render(<Task {...props} />);
    expect(screen.getByText('user-2 is viewing…')).toBeInTheDocument();
  });

  it('should not show editing indicator when the current user is editing the task', () => {
    mockUseBoardReturnValue.editingUsers = { 'task-1': 'user-1' };
    mockUseBoard.mockReturnValue(mockUseBoardReturnValue);

    render(<Task {...props} />);
    expect(screen.queryByText('user-1 is viewing…')).not.toBeInTheDocument();
  });

  it('should show description when task has one', () => {
    props.task = { ...props.task, description: 'Some description text' };
    render(<Task {...props} />);
    expect(screen.getByText('Some description text')).toBeInTheDocument();
  });
});
