import type { Request } from "express";
import type { Users } from "../../generated/prisma/client";

export const setSession = (req: Request, user: Users): Promise<void> => {
  return new Promise((resolve, reject) => {
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      username: user.username,
      admin: user.admin,
      email: user.email,
      birthdate: user.birthdate,
      followingCount: user.followingCount,
    };

    req.session.save((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};
