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
  const shortId = socket.id.slice(0, 5);
  connectedUsers.push(shortId);
  io.emit('user-joined', connectedUsers);

  console.log('a user connected: ' + shortId);
  socket.emit('tasks-update', tasks);

  socket.on('tasks-update', (updatedTasks) => {
    tasks = updatedTasks;
    socket.broadcast.emit('tasks-update', tasks);
  });

  socket.on('disconnect', () => {
    connectedUsers = connectedUsers.filter((id) => id !== shortId);
    io.emit('user-left', connectedUsers);
    console.log('user disconnected: ' + shortId);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
