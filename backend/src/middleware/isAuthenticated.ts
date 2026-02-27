import { UnauthorizedError } from "../lib/appErrors";
import type { Request, Response, NextFunction } from "express";

export const isAuthenticated = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.session || !req.session.userId) {
    return next(new UnauthorizedError());
  }

  next();
};
