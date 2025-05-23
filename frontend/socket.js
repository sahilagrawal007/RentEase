// client/src/socket.js
import { io } from "socket.io-client";

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io("http://localhost:8800", {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
  }
  return socket;
};

export const getSocket = () => socket;
