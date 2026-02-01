import express from "express";
import cors from "cors";
import postRoutes from "./routes/postRoutes/posts.route.js";
import session from "express-session";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "../generated/prisma/client.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;
const app = express();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be defined in .env file");
}

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
    }),
  }),
);

app.use("/posts", postRoutes);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
