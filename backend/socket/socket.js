import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// connected users
let connected_users = {};
// ! FRONTEND - (video:- 4:04:00) - exact point (4:07.00)

io.on("connection", (socket) => {
  console.log("user connected", socket.id);
  // get staffId from socket
  const staffId = socket.handshake.query.staffId;

  // push new user with id to users
  if (!staffId) connected_users[staffId] = socket.id;

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete connected_users[staffId];
  });
});

// get connected users
export const get_connected_users = () => connected_users;

export { app, io, server };
