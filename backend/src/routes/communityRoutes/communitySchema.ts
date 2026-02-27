import z from "zod";

export type CreateCommunityInput = z.infer<typeof CreateCommunity>;

export const CreateCommunity = z
  .object({
    name: z.string(),
    description: z.string(),
    public: z.boolean(),
  })
  .strict();

export type EditCommunityInput = z.infer<typeof EditCommunity>;

export const EditCommunity = CreateCommunity.omit({ name: true });

export type CommunityIdParams = z.infer<typeof CommunityId>;

export const CommunityId = z
  .object({
    id: z.coerce.number(),
  })
  .strict();
