import { render, screen } from '@testing-library/react';
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
      updateTask: jest.fn(),
      connectedUsers: [],
      userNames: {},
      currentUserId: null,
      editingUsers: {},
      socketConnected: false,
      userName: 'Tester',
      setUserName: jest.fn(),
      startEditingTask: jest.fn(),
      stopEditingTask: jest.fn(),
      deleteTask: jest.fn(),
      columns: [
        { id: 'todo', title: 'To Do' },
        { id: 'in-progress', title: 'In Progress' },
        { id: 'done', title: 'Done' },
      ],
      updateColumns: jest.fn(),
      selectedTaskId: null,
      selectedTaskColumnId: null,
      openTask: jest.fn(),
      closeTask: jest.fn(),
    };

    mockUseBoard.mockReturnValue(contextValue);
  });

  it('should render the search bar', () => {
    render(
      <BoardContext.Provider value={contextValue}>
        <Board />
      </BoardContext.Provider>
    );
    expect(screen.getByPlaceholderText('Search tasks…')).toBeInTheDocument();
  });

  it('should render a column for each entry in columns', () => {
    render(
      <BoardContext.Provider value={contextValue}>
        <Board />
      </BoardContext.Provider>
    );
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });
});
