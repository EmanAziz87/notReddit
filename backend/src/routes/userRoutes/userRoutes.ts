import express from "express";
import { UserRegisterSchema, UserLoginSchema } from "./userSchemas";
import prisma from "../../lib/prisma";
import type { UserLoginInput, UserRegisterInput } from "./userSchemas";
import { setSession } from "../../lib/setSession";
import { UnauthorizedError } from "../../lib/appErrors";
import { SESSION_COOKIE_NAME } from "../../util/sessionName";
import userServices from "../../services/userServices/userServices";

const userRoute = express.Router();

userRoute.post("/register", async (req, res, next) => {
  try {
    const validatedData: UserRegisterInput = UserRegisterSchema.parse(req.body);
    const user = await userServices.registerService(validatedData);

    await setSession(req, user);
    res
      .status(201)
      .json({ status: "SUCCESS", message: "Registered and Logged in" });
  } catch (err) {
    next(err);
  }
});

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

userRoute.get("/test-grab-me", async (req, res, next) => {
  try {
    if (!req.session.userId) {
      throw new UnauthorizedError();
    }

    const user = await prisma.users.findUnique({
      where: { id: req.session.userId },
      select: { username: true, email: true },
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default userRoute;
