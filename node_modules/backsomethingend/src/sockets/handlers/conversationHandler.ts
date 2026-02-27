import { Socket } from "socket.io";

export const handleJoinConversation = (
  socket: Socket,
  conversationId: string,
) => {
  const roomName = `conversation-${conversationId}`;
  socket.join(roomName);

  console.log(
    `User ${socket.data.user.username} joined conversation ${conversationId}`,
  );

  socket.emit("joined_conversation", { conversationId });
};

export const handleLeaveConversation = (
  socket: Socket,
  conversationId: string,
) => {
  const roomName = `conversation-${conversationId}`;
  socket.leave(roomName);

  console.log(
    `User ${socket.data.user.username} left conversation ${conversationId}`,
  );

  socket.emit("left_conversation", { conversationId });
};
