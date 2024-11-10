export default function runSocket(io) {
  let onlineUsers = [];

  io.on("connection", (socket) => {
    socket.on("newUser", (userId) => {
      const userExits = onlineUsers.find((user) => user.userId === userId);
      if (!userExits) {
        onlineUsers.push({ userId, socketId: socket.id });
      }
    });

    socket.on("sendMessage", ({ receiverId, data }) => {
      const receiver = onlineUsers.find((user) => user.userId === receiverId);
      io.to(receiver.socketId).emit("getMessage", data);
    });

    socket.on("disconnect", () => {
      onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
    });
  });
}
