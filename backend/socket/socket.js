import { Server } from "socket.io";

let io;
let onlineUsers = [];

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"]
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on("connection", (socket) => {
    console.log("🟢 New client connected:", socket.id);

    socket.on("newUser", (userId) => {
      try {
        const userExists = onlineUsers.find((user) => user.userId === userId);
        if (!userExists) {
          onlineUsers.push({ userId, socketId: socket.id });
          console.log(`User added: ${userId}`);
        }
      } catch (err) {
        console.error("Error in newUser event:", err);
      }
    });

    socket.on("sendMessage", ({ receiverId, data, chatId }) => {
      try {
        const receiver = onlineUsers.find((user) => user.userId === receiverId);
        if (receiver) {
          io.to(receiver.socketId).emit("getMessage", { ...data, chatId });
          console.log(`Message sent to user ${receiverId}`);
        } else {
          console.log(`User ${receiverId} not found online`);
        }
      } catch (err) {
        console.error("Error in sendMessage event:", err);
      }
    });

    socket.on("disconnect", () => {
      try {
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
        console.log("🔴 Client disconnected:", socket.id);
      } catch (err) {
        console.error("Error in disconnect event:", err);
      }
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  io.on("error", (error) => {
    console.error("Socket.IO server error:", error);
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized!");
  }
  return io;
};