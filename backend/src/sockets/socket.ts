import { Server } from "socket.io";
import envConfig from "../util/envConfig.js";
import { server } from "../index.js";
import { socketAuthMiddleware } from "./middleware/socketAuth.js";
import {
  handleJoinConversation,
  handleLeaveConversation,
} from "./handlers/conversationHandler.js";
import {
  handleBroadcastMessage,
  handleTyping,
} from "./handlers/messageHandler.js";

const io = new Server(server, {
  cors: {
    origin: envConfig.FRONTEND_URL,
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.data.user.username} (${socket.id})`);

  socket.on("join_conversation", (conversationId: string) =>
    handleJoinConversation(socket, conversationId),
  );

  socket.on("leave_conversation", (conversationId: string) =>
    handleLeaveConversation(socket, conversationId),
  );

  socket.on("broadcast_message", (payload) =>
    handleBroadcastMessage(socket, io, payload),
  );

  socket.on("typing", (payload) => handleTyping(socket, payload));

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.data.user.username}`);
  });
});

export { io };
