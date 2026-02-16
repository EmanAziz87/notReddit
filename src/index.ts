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
import { UnauthorizedError } from "./lib/appErrors.js";

dotenv.config();

const PORT = 3000;
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
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
  console.log("Authenticated socket connected:", socket.data.userId);

  socket.on("ping", (message) => {
    console.log("Received ping:", message);

    socket.emit("pong", `Pong! You said: ${message}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.data.userId);
  });
});

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(sessionMiddleware);

app.use("/users", userRoutes);
app.use("/communities", communityRouter);
app.use("/posts", postRoutes);
app.use("/comments", commentRouter);

app.use(globalErrorHandler);

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

export default app;
