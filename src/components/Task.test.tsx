import { render, screen, fireEvent } from '@testing-library/react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import Task from './Task';
import useBoard from '../hooks/useBoard';
import { TaskProps } from '../interfaces/TaskProps';

jest.mock('../hooks/useBoard');

const mockUseBoard = useBoard as jest.MockedFunction<typeof useBoard>;

describe('Task Component', () => {
  const mockDeleteTask = jest.fn();
  const mockStartEditingTask = jest.fn();
  const mockStopEditingTask = jest.fn();
  let props: TaskProps;
  let mockUseBoardReturnValue: ReturnType<typeof useBoard>;

  beforeEach(() => {
    props = {
      task: { id: 'task-1', title: 'Task 1' },
      index: 0
    };

    mockUseBoardReturnValue = {
      editingUsers: {},
      currentUserId: 'user-1',
      deleteTask: mockDeleteTask,
      tasks: {},
      updateTasks: jest.fn(),
      connectedUsers: [],
      startEditingTask: mockStartEditingTask,
      stopEditingTask: mockStopEditingTask,
      editingTask: null
    };

    mockUseBoard.mockReturnValue(mockUseBoardReturnValue);
    jest.clearAllMocks();
  });

  const renderWithFullContext = (ui: React.ReactElement) => {
    return render(
      <DragDropContext onDragEnd={jest.fn()}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {ui}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  };

  it('should call deleteTask when the delete button is clicked and user confirms', () => {
    window.confirm = jest.fn(() => true);
    renderWithFullContext(<Task {...props} />);

    const deleteButton = screen.getByLabelText('Delete task');
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this task?');
    expect(mockDeleteTask).toHaveBeenCalledWith('task-1');
  });

  it('should not call deleteTask when the delete button is clicked and user cancels', () => {
    window.confirm = jest.fn(() => false);
    renderWithFullContext(<Task {...props} />);

    const deleteButton = screen.getByLabelText('Delete task');
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this task?');
    expect(mockDeleteTask).not.toHaveBeenCalled();
  });

  it('should render the task with the title', () => {
    renderWithFullContext(<Task {...props} />);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  it('should show editing indicator when another user is editing the task', () => {
    mockUseBoardReturnValue.editingUsers = { 'task-1': 'user-2' };
    mockUseBoard.mockReturnValue(mockUseBoardReturnValue);

    renderWithFullContext(<Task {...props} />);
    expect(screen.getByText('User user-2 is editing...')).toBeInTheDocument();
  });

  it('should not show editing indicator when the current user is editing the task', () => {
    mockUseBoardReturnValue.editingUsers = { 'task-1': 'user-1' };
    mockUseBoard.mockReturnValue(mockUseBoardReturnValue);

    renderWithFullContext(<Task {...props} />);
    expect(screen.queryByText('User user-1 is editing...')).not.toBeInTheDocument();
  });
});
