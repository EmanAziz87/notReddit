import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes/userRoutes.js";
import dotenv from "dotenv";
import { globalErrorHandler } from "./middleware/globalErrorHandler.js";
import communityRouter from "./routes/communityRoutes/communityRoutes.js";
import postRoutes from "./routes/postRoutes/postRoutes.js";
import commentRouter from "./routes/commentRoutes/commentRoutes.js";

import http from "http";
import sessionMiddleware from "./middleware/sessionConfigMiddleware.js";

import conversationRouter from "./routes/conversationRoutes/conversationRoutes.js";
import messageRouter from "./routes/messageRoutes/messageRoutes.js";
import envConfig from "./util/envConfig.js";

dotenv.config();

const PORT = envConfig.PORT;
const app = express();

export const server = http.createServer(app);

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
