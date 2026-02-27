import type {
  UserLoginInput,
  UserRegisterInput,
} from "../../routes/userRoutes/userSchemas";
import prisma from "../../lib/prisma";
import { compareHash, hashing } from "../../util/hashing";
import { ConflictError, UnauthorizedError } from "../../lib/appErrors";
import type { Users } from "../../../generated/prisma/client";

const registerService = async (
  registerInfo: UserRegisterInput,
): Promise<Users> => {
  const passwordHash = await hashing(registerInfo.password);
  const foundUser = prisma.users.findFirst({
    where: {
      OR: [{ username: registerInfo.username, email: registerInfo.email }],
    },
  });

  if (!foundUser) {
    throw new ConflictError("That Username or Email is already taken");
  }
  return prisma.users.create({
    data: {
      email: registerInfo.email,
      passwordHash: passwordHash,
      username: registerInfo.username,
      birthdate: registerInfo.birthdate,
    },
  });
};

const loginService = async (loginInfo: UserLoginInput): Promise<Users> => {
  const user = await prisma.users.findUnique({
    where: { username: loginInfo.username },
  });

  if (!user || !(await compareHash(loginInfo.password, user.passwordHash))) {
    throw new UnauthorizedError("Invalid username or password");
  }

  return user;
};

export default { registerService, loginService };
