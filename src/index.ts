import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes/userRoutes.js";
import dotenv from "dotenv";
import { globalErrorHandler } from "./middleware/globalErrorHandler.js";
import communityRouter from "./routes/communityRoutes/communityRoutes.js";
import postRoutes from "./routes/postRoutes/postRoutes.js";
import commentRouter from "./routes/commentRoutes/commentRoutes.js";
import { Server } from "socket.io";
import http from "http";
import sessionMiddleware from "./middleware/sessionConfigMiddleware.js";
import { NotFoundError, UnauthorizedError } from "./lib/appErrors.js";
import prisma from "./lib/prisma.js";
import conversationRouter from "./routes/conversationRoutes/conversationRoutes.js";
import messageRouter from "./routes/messageRoutes/messageRoutes.js";
import envConfig from "./util/envConfig.js";

dotenv.config();

const PORT = envConfig.PORT;
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: envConfig.FRONTEND_URL,
    credentials: true,
  },
});

io.use((socket, next) => {
  sessionMiddleware(socket.request as any, {} as any, () => {
    if (!socket.request.session || !socket.request.session.userId) {
      return next(
        new UnauthorizedError(
          "Socket connection failed because not authenticated",
        ),
      );
    }

    socket.data.userId = socket.request.session.userId;
    socket.data.user = socket.request.session.user;

    next();
  });
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join_conversation", async (conversationId) => {
    try {
      let conversation = await prisma.conversations.findUnique({
        where: {
          id: conversationId,
        },
      });

      if (!conversation) {
        conversation = await prisma.$transaction(async (tx) => {
          const createdConversation = await tx.conversations.create({});

          await tx.conversationParticipant.create({
            data: {
              userId: socket.data.userId,
              conversationId: createdConversation.id,
            },
          });

          return createdConversation;
        });
      }

      const roomName = `conversation-${conversation.id}`;
      socket.join(roomName);
      console.log(
        `Socket ${socket.data.user.username} joined room ${roomName}`,
      );
    } catch (err) {
      console.error("An error occured: ", err);

      socket.emit("error_message", { message: "Failed to join conversation" });
    }
  });

  socket.on("send_message", async (msg) => {
    try {
      if (!socket.rooms.has(`conversation-${msg.conversationId}`)) {
        throw new NotFoundError("That conversation was not found");
      }
      const newMessage = await prisma.messages.create({
        data: {
          message: msg.content,
          senderId: socket.data.userId,
          conversationId: msg.conversationId,
        },
      });

      const roomName = `conversation-${newMessage.conversationId}`;
      io.to(roomName).emit("receive_message", newMessage);
    } catch (err) {
      console.error("An error occured: ", err);

      socket.emit("error_message", { message: "Failed to send message" });
    }
  });

  socket.on("leave_conversation", async (conversationId) => {
    try {
      await prisma.conversationParticipant.delete({
        where: {
          conversationId_userId: {
            userId: socket.data.userId,
            conversationId: conversationId,
          },
        },
      });
      const roomName = `conversation-${conversationId}`;
      socket.leave(roomName);
      console.log(`Socket ${socket.id} left room ${roomName}`);
    } catch (err) {
      console.error("An error occured: ", err);

      socket.emit("error_message", { message: "Failed to leave conversation" });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.data.userId);
  });
});

// Typing indicators, read receipts, multiple device handling can you explain how to implement each of these?

app.use(express.json());

app.use(
  cors({
    origin: envConfig.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(sessionMiddleware);

app.use("/users", userRoutes);
app.use("/communities", communityRouter);
app.use("/posts", postRoutes);
app.use("/comments", commentRouter);
app.use("/conversations", conversationRouter);
app.use("/conversations/messages", messageRouter);

app.use(globalErrorHandler);

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

export default app;
