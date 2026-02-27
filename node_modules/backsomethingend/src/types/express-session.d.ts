import "express-session";
import type { Prisma } from "../../generated/prisma/client";

type UserNoSensitiveInfo = Prisma.UsersGetPayload<{
  omit: { passwordHash: true };
}>;

declare module "express-session" {
  interface SessionData {
    userId: string;
    user: UserNoSensitiveInfo;
  }
}
