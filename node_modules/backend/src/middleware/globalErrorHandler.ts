import type { Request, Response, NextFunction } from "express";
import { AppError, ConflictError } from "../lib/appErrors";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client";
import multer from "multer";

export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    console.log("Prisma Error Code: -- ", err);
    if (err.code === "P2002") {
      err = new ConflictError();
    }
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: "VALIDATION_ERROR",
      message: err.issues,
    });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      status: "IMAGE UPLOAD ERROR",
      message: err.message,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "FAILED",
      message: err.message,
    });
  }

  console.error("UNKNOWN ERROR: ", err);
  return res.status(500).json({ message: "Internal Server Error" });
};
