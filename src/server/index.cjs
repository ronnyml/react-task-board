const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

let tasks = {
  'todo': [],
  'in-progress': [],
  'done': []
};

let columns = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

let connectedUsers = [];
let editingUsers = {};

io.on('connection', (socket) => {
  const shortId = socket.id.slice(0, 5);
  connectedUsers.push({ id: shortId, name: shortId });
  io.emit('user-joined', connectedUsers);

  console.log('a user connected: ' + shortId);
  socket.emit('tasks-update', tasks);
  socket.emit('columns-update', columns);

  socket.on('set-name', (name) => {
    const user = connectedUsers.find((u) => u.id === shortId);
    if (user) {
      user.name = name;
      io.emit('user-joined', connectedUsers);
    }
  });

  socket.on('tasks-update', (updatedTasks) => {
    tasks = updatedTasks;
    socket.broadcast.emit('tasks-update', tasks);
  });

  socket.on('columns-update', (updatedColumns) => {
    columns = updatedColumns;
    socket.broadcast.emit('columns-update', columns);
  });

  socket.on('task-editing', (updatedEditingUsers) => {
    editingUsers = updatedEditingUsers;
    io.emit('task-editing', editingUsers);
  });

  socket.on('disconnect', () => {
    connectedUsers = connectedUsers.filter((u) => u.id !== shortId);
    io.emit('user-left', connectedUsers);

    for (const taskId in editingUsers) {
      if (editingUsers[taskId] === shortId) {
        delete editingUsers[taskId];
      }
    }
    io.emit('task-editing', editingUsers);
    console.log('user disconnected: ' + shortId);
  });
});

server.listen(3001, () => {
  console.log('listening on *:3001');
});
