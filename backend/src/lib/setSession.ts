import type { Request } from "express";
import type { UserSession } from "../types";

export const setSession = (req: Request, user: UserSession): Promise<void> => {
  return new Promise((resolve, reject) => {
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      username: user.username,
      admin: user.admin,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
    };

    req.session.save((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};
