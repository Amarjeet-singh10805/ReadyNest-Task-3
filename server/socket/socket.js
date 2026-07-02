import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";

export const onlineUsers = new Map(); // userId -> socketId

let io;

export const initSocket = (server, allowedOrigin) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigin,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;
      if (!rawCookie) return next(new Error("Authentication error"));

      const parsed = cookie.parse(rawCookie);
      const token = parsed.jwt;
      if (!token) return next(new Error("Authentication error"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    if (socket.userId) {
      onlineUsers.set(socket.userId, socket.id);
    }

    // DM conversation rooms
    socket.on("joinConvo", (convoId) => {
      socket.join(`convo:${convoId}`);
    });

    socket.on("leaveConvo", (convoId) => {
      socket.leave(`convo:${convoId}`);
    });

    socket.on("disconnect", () => {
      if (socket.userId) onlineUsers.delete(socket.userId);
    });
  });

  return io;
};

export const getIO = () => io;
