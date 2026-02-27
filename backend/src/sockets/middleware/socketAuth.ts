import type { Socket } from "socket.io";
import { UnauthorizedError } from "../../lib/appErrors";
import sessionMiddleware from "../../middleware/sessionConfigMiddleware";

export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: Error) => void,
) => {
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
};
