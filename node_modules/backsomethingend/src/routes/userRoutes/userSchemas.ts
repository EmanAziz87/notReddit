import z from "zod";

export type UserRegisterInput = z.infer<typeof UserRegisterSchema>;
export type UserLoginInput = z.infer<typeof UserLoginSchema>;

export const UserRegisterSchema = z
  .object({
    username: z.string().min(4),
    email: z.email(),
    password: z.string().min(8),
    birthdate: z.coerce.date(),
  })
  .strict();

export const UserLoginSchema = z
  .object({
    username: z.string(),
    password: z.string(),
  })
  .strict();
