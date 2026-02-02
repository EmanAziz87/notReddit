import type { UserRegisterInput } from "../routes/userRoutes/userSchemas";
import prisma from "../lib/prisma";
import { hashing } from "../util/hashing";

const registerService = async (registerInfo: UserRegisterInput) => {
  const passwordHash = await hashing(registerInfo.password);

  return prisma.users.create({
    data: {
      email: registerInfo.email,
      passwordHash: passwordHash,
      username: registerInfo.username,
      birthdate: registerInfo.birthdate,
    },
  });
};

export default { registerService };
