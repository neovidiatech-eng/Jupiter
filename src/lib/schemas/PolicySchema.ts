import { z } from "zod";

type TFunc = (key: string) => string;

export const getPolicySchema = (t: TFunc) => z.object({
  title: z.string().min(3, t("validation.required")),
  description: z.string().optional(),
  content: z.string().optional(),
  icon: z.string().min(1, t("validation.required")),
  color: z.string().default('#4f46e5'),
  active: z.boolean().default(true),
});

export type PolicyFormData = z.infer<ReturnType<typeof getPolicySchema>>;
