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

let connectedUsers = [];

io.on('connection', (socket) => {
  connectedUsers.push(socket.id);
  io.emit('user-joined', connectedUsers);

  console.log('a user connected: ' + socket.id);
  socket.emit('tasks-update', tasks);

  socket.on('tasks-update', (updatedTasks) => {
    tasks = updatedTasks;
    socket.broadcast.emit('tasks-update', tasks);
  });

  socket.on('disconnect', () => {
    connectedUsers = connectedUsers.filter((id) => id !== socket.id);
    io.emit('user-left', connectedUsers);
    console.log('user disconnected: ' + socket.id);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
