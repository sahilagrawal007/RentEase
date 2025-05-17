// client/src/socket.js
import { io } from "socket.io-client";

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io("http://localhost:5000"); // Update with your backend URL/port
  }
  return socket;
};

export const getSocket = () => socket;
