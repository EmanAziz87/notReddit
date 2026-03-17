import express from "express";
import { UserRegisterSchema, UserLoginSchema } from "./userSchemas";
import prisma from "../../lib/prisma";
import type { UserLoginInput, UserRegisterInput } from "./userSchemas";
import { setSession } from "../../lib/setSession";
import { NotFoundError, UnauthorizedError } from "../../lib/appErrors";
import { SESSION_COOKIE_NAME } from "../../util/sessionName";
import userServices from "../../services/userServices/userServices";
import type { UserSession } from "../../types";
import uploads from "../../middleware/s3storage";
import type { MulterS3File } from "../postRoutes/postSchema";
import { cleanUpOrphanedImages } from "../../lib/s3cleanup";

const userRoute = express.Router();

userRoute.post(
  "/register",
  uploads.single("profileImage"),
  async (req, res, next) => {
    const profileImage = req.file as MulterS3File;

    try {
      const validatedData: UserRegisterInput = UserRegisterSchema.parse(
        req.body,
      );
      const user = await userServices.registerService(
        validatedData,
        profileImage.location,
      );

      await setSession(req, user);
      res
        .status(201)
        .json({ status: "SUCCESS", message: "Registered and Logged in" });
    } catch (err) {
      await cleanUpOrphanedImages([profileImage.key]);
      next(err);
    }
  },
);

userRoute.post("/login", async (req, res, next) => {
  try {
    const validatedData: UserLoginInput = UserLoginSchema.parse(req.body);
    const user = await userServices.loginService(validatedData);
    await setSession(req, user);
    res
      .status(200)
      .json({ status: "SUCCESS", message: "Successfully Logged In" });
  } catch (err) {
    next(err);
  }
});

userRoute.delete("/logout", async (req, res, next) => {
  if (!req.session || !req.session.userId) {
    res.clearCookie(SESSION_COOKIE_NAME);
    return res
      .status(200)
      .json({ status: "SUCCESS", message: "Successfully Logged Out" });
  }
  return req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    res.clearCookie(SESSION_COOKIE_NAME);
    res
      .status(200)
      .json({ status: "SUCCESS", message: "Successfully Logged Out" });
  });
});

userRoute.get("/me", async (req, res, next) => {
  try {
    if (!req.session.userId) {
      throw new UnauthorizedError();
    }

    const user: UserSession | null = await prisma.users.findUnique({
      where: { id: req.session.userId },
      select: { id: true, username: true, email: true, admin: true },
    });

    if (!user) {
      throw new NotFoundError("The user was not found");
    }

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

export default userRoute;
