import { z } from "zod";

type TFunc = (key: string, options?: any) => string;

export const getPlanSchema = (t: TFunc) => z.object({
  name: z.string().min(1, t("validation.required")),
  description: z.string().min(10, t("validation.min", { count: 10 })).max(1000, t("validation.max", { count: 1000 })),
  price: z.coerce.number().positive(t("validation.required")),
  currencyId: z.string().min(1, t("validation.required")),
  duration: z.coerce.number().positive(t("validation.min", { count: 1 })),
  sessionsCount: z.coerce.number().positive(),
  sessionTime: z.coerce.number().positive(),
  type: z.enum(['full', 'half']),
  features: z.array(z.string().min(1)),
  status: z.enum(['active', 'inactive']),
});

export type PlanFormData = z.infer<ReturnType<typeof getPlanSchema>>;