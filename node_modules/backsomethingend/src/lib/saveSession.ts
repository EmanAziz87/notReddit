import type { Request } from "express";

export const saveSession = async (req: Request) => {
  await new Promise<void>((resolve, reject) => {
    req.session.save((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};
