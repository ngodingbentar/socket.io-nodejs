import { Server } from "socket.io";
import express from "express";
import cors from 'cors'
// const express = require('express');
// const cors = require('cors');

const app = express();
app.use(cors());

const io = new Server({
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  },
});

let onlineUsers = [];

const addNewUser = (username, socketId) => {
  console.log('addNewUser', username, socketId)
  console.log('onlineUsers', onlineUsers)
  !onlineUsers.some((user) => user.username === username) &&
    onlineUsers.push({ username, socketId });
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (username) => {
  return onlineUsers.find((user) => user.username === username);
};

io.on("connection", (socket) => {
  socket.on("newUser", (username) => {
    addNewUser(username, socket.id);
  });

  socket.on("sendNotification", ({ senderName, receiverName, type }) => {
    const receiver = getUser(receiverName);
    io.to(receiver.socketId).emit("getNotification", {
      senderName,
      type,
    });
  });

  socket.on("sendText", ({ senderName, receiverName, text }) => {
    const receiver = getUser(receiverName);
    io.to(receiver.socketId).emit("getText", {
      senderName,
      text,
    });
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

io.listen(5000);
