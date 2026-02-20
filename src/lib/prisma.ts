import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import envConfig from "../util/envConfig";

const adapter = new PrismaPg({
  connectionString: envConfig.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

export default prisma;
