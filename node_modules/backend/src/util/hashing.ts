import bcrypt from "bcrypt";
import { saltRounds } from "./saltRounds";

export const hashing = async (
  passwordPlain: string,
  salt: number = saltRounds,
): Promise<string> => {
  return await bcrypt.hash(passwordPlain, salt);
};

export const compareHash = async (
  plainPassword: string,
  passwordHash: string,
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, passwordHash);
};
