import z from "zod";

export const rankSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    color: z.string().min(1, 'Color is required'),
    ageRange: z.object({
        minAge: z.number().min(1, 'Min age is required'),
        maxAge: z.number().min(1, 'Max age is required'),
    }),
});
export type RankSchema = z.infer<typeof rankSchema>;