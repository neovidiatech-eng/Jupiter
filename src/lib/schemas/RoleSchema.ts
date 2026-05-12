import { z } from 'zod';

type TFunc = (key: string, options?: any) => string;

export const getRoleSchema = (t: TFunc) => z.object({
  name: z.string().min(3, t("validation.min", { count: 3 })),
  permissionIds: z.array(z.string()).min(1, t("validation.required")),
});

export type RoleFormData = z.infer<ReturnType<typeof getRoleSchema>>;
