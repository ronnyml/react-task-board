import { render, screen, fireEvent } from '@testing-library/react';
import Board from './Board';
import useBoard from '../hooks/useBoard';
import { BoardContext } from '../contexts/BoardContext';
import { BoardContextProps } from '../interfaces/BoardContextProps';

jest.mock('../hooks/useBoard');

const mockUseBoard = useBoard as jest.MockedFunction<typeof useBoard>;

describe('Board Component', () => {
  let contextValue: BoardContextProps;

  beforeEach(() => {
    contextValue = {
      tasks: {
        'todo': [{ id: '1', title: 'Task 1' }, { id: '2', title: 'Task 2' }],
        'in-progress': [{ id: '3', title: 'Task 3' }],
        'done': []
      },
      updateTasks: jest.fn(),
      connectedUsers: [],
      currentUserId: null,
      editingUsers: {},
      editingTask: null,
      startEditingTask: jest.fn(),
      stopEditingTask: jest.fn(),
      deleteTask: jest.fn()
    };

    mockUseBoard.mockReturnValue(contextValue);
  });

  it('should handle adding a new task correctly', () => {
    render(
      <BoardContext.Provider value={contextValue}>
        <Board />
      </BoardContext.Provider>
    );

    const input = screen.getByPlaceholderText('Enter new task');
    const addButton = screen.getByText('Add Task');

    fireEvent.change(input, { target: { value: 'New Task Title' } });
    fireEvent.click(addButton);

    expect(contextValue.updateTasks).toHaveBeenCalledWith({
      'todo': [
        { id: expect.stringMatching(/^task-\d+$/), title: 'New Task Title' },
        ...contextValue.tasks['todo']
      ],
      'in-progress': contextValue.tasks['in-progress'],
      'done': contextValue.tasks['done']
    });

    expect(input).toHaveValue('');
  });
});
