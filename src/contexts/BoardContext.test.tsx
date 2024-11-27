import React from 'react';
import { render, act } from '@testing-library/react';
import io from 'socket.io-client';
import { BoardProvider, BoardContext } from './BoardContext';
import { BoardContextProps } from '../interfaces/BoardContextProps';

jest.mock('socket.io-client');

describe('BoardContext - Tasks', () => {
  let mockSocket: {
    on: jest.Mock;
    emit: jest.Mock;
    id: string;
    disconnect: jest.Mock;
  };

  beforeEach(() => {
    mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      id: 'mock-socket-id',
      disconnect: jest.fn()
    };

    (io as jest.Mock).mockReturnValue(mockSocket);
    jest.clearAllMocks();
  });

  it('should start editing a task and emit task-editing event', () => {
    let contextValue: BoardContextProps | undefined;
    const TestComponent = () => {
      const context = React.useContext(BoardContext);
      contextValue = context;
      return null;
    };

    render(
      <BoardProvider>
        <TestComponent />
      </BoardProvider>
    );

    act(() => {
      const connectHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];

      if (connectHandler) {
        connectHandler();
      }

      if (mockSocket.id) {
        mockSocket.on.mock.calls.find((call) => call[0] === 'connect')?.[1]();
      }
    });

    act(() => {
      expect(contextValue?.currentUserId).toBe('mock-');

      if (contextValue && contextValue.startEditingTask) {
        contextValue.startEditingTask('test-task-id');
      }
    });

    expect(contextValue?.editingTask).toBe('test-task-id');
    expect(mockSocket.emit).toHaveBeenCalledWith('task-editing', {
      'test-task-id': 'mock-'
    });
    expect(contextValue?.editingUsers).toEqual({
      'test-task-id': 'mock-'
    });
  });

  it('should not emit task-editing if no socket or currentUserId', () => {
    let contextValue: BoardContextProps | undefined;

    const TestComponent = () => {
      const context = React.useContext(BoardContext);
      contextValue = context;
      return null;
    };

    render(
      <BoardProvider>
        <TestComponent />
      </BoardProvider>
    );

    act(() => {
      if (contextValue && contextValue.startEditingTask) {
        contextValue.startEditingTask('test-task-id');
      }
    });

    expect(mockSocket.emit).not.toHaveBeenCalled();
  });

  it('should update tasks and emit tasks-update event', () => {
    let contextValue: BoardContextProps | undefined;

    const TestComponent = () => {
      contextValue = React.useContext(BoardContext);
      return null;
    };

    const { rerender } = render(
      <BoardProvider>
        <TestComponent />
      </BoardProvider>
    );

    act(() => {
      const connectHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];

      if (connectHandler) {
        connectHandler();
      }
    });

    const initialTasks = {
      'todo': [],
      'in-progress': [],
      'done': []
    };

    const newTasks = {
      'todo': [{ id: '1', title: 'New Task' }],
      'in-progress': [],
      'done': []
    };

    act(() => {
      contextValue?.updateTasks?.(initialTasks);

      rerender(
        <BoardProvider>
          <TestComponent />
        </BoardProvider>
      );
    });

    act(() => {
      contextValue?.updateTasks?.(newTasks);

      rerender(
        <BoardProvider>
          <TestComponent />
        </BoardProvider>
      );
    });

    expect(contextValue?.tasks).toEqual(newTasks);
    expect(mockSocket.emit).toHaveBeenCalledWith('tasks-update', newTasks);
  });

  it('should remove task from its column and update tasks', () => {
    let contextValue: BoardContextProps | undefined;

    const TestComponent = () => {
      contextValue = React.useContext(BoardContext);
      return null;
    };

    const { rerender } = render(
      <BoardProvider>
        <TestComponent />
      </BoardProvider>
    );

    act(() => {
      const connectHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];

      if (connectHandler) {
        connectHandler();
      }
    });

    const initialTasks = {
      'todo': [
        { id: '1', title: 'Task 1' },
        { id: '2', title: 'Task 2' }
      ],
      'in-progress': [],
      'done': []
    };

    act(() => {
      if (contextValue?.updateTasks) {
        contextValue.updateTasks(initialTasks);
      }

      rerender(
        <BoardProvider>
          <TestComponent />
        </BoardProvider>
      );
    });

    act(() => {
      if (contextValue?.deleteTask) {
        contextValue.deleteTask('1');
      }

      rerender(
        <BoardProvider>
          <TestComponent />
        </BoardProvider>
      );
    });

    const expectedTasks = {
      'todo': [{ id: '2', title: 'Task 2' }],
      'in-progress': [],
      'done': []
    };

    expect(contextValue?.tasks).toEqual(expectedTasks);
    expect(mockSocket.emit).toHaveBeenCalledWith('tasks-update', expectedTasks);
  });

  it('should update connected users when user-joined event is received', () => {
    let contextValue: BoardContextProps | undefined;

    const TestComponent = () => {
      contextValue = React.useContext(BoardContext);
      return null;
    };

    const { rerender } = render(
      <BoardProvider>
        <TestComponent />
      </BoardProvider>
    );

    act(() => {
      const connectHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];

      if (connectHandler) {
        connectHandler();
      }
    });

    const userJoinedHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'user-joined'
    )?.[1];

    act(() => {
      if (userJoinedHandler) {
        userJoinedHandler(['user1', 'user2']);
      }
      rerender(
        <BoardProvider>
          <TestComponent />
        </BoardProvider>
      );
    });

    expect(contextValue?.connectedUsers).toEqual(['user1', 'user2']);
  });

  it('should update connected users when user-left event is received', () => {
    let contextValue: BoardContextProps | undefined;

    const TestComponent = () => {
      contextValue = React.useContext(BoardContext);
      return null;
    };

    const { rerender } = render(
      <BoardProvider>
        <TestComponent />
      </BoardProvider>
    );

    act(() => {
      const connectHandler = mockSocket.on.mock.calls.find(
        (call) => call[0] === 'connect'
      )?.[1];

      if (connectHandler) {
        connectHandler();
      }
    });

    const userJoinedHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'user-joined'
    )?.[1];

    act(() => {
      if (userJoinedHandler) {
        userJoinedHandler(['user1', 'user2']);
      }
      rerender(
        <BoardProvider>
          <TestComponent />
        </BoardProvider>
      );
    });

    expect(contextValue?.connectedUsers).toEqual(['user1', 'user2']);

    const userLeftHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'user-left'
    )?.[1];

    act(() => {
      if (userLeftHandler) {
        userLeftHandler(['user1']);
      }
      rerender(
        <BoardProvider>
          <TestComponent />
        </BoardProvider>
      );
    });

    expect(contextValue?.connectedUsers).toEqual(['user1']);
  });
});
