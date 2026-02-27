import { Server, Socket } from "socket.io";

export const handleBroadcastMessage = (
  _socket: Socket,
  io: Server,
  message: any,
) => {
  const roomName = `conversation-${message.conversationId}`;

  io.to(roomName).emit("receive_message", message);
};

export const handleTyping = (
  socket: Socket,
  payload: { conversationId: string; isTyping: boolean },
) => {
  const { conversationId, isTyping } = payload;
  const roomName = `conversation-${conversationId}`;

  socket.to(roomName).emit("user_typing", {
    userId: socket.data.userId,
    username: socket.data.user.username,
    isTyping,
  });
};
