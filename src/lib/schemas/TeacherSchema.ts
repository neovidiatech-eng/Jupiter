import { z } from 'zod';

type TFunc = (key: string, options?: any) => string;

const passwordSchema = (t: TFunc) => z.string()
  .min(8, t("validation.passwordComplexity"))
  .regex(/[A-Z]/, t("validation.passwordComplexity"))
  .regex(/[a-z]/, t("validation.passwordComplexity"))
  .regex(/[0-9]/, t("validation.passwordComplexity"))
  .regex(/[^A-Za-z0-9]/, t("validation.passwordComplexity"));

const baseTeacherSchema = (t: TFunc) => ({
  name: z.string().min(3, t("validation.min", { count: 3 })).max(32, t("validation.max", { count: 32 })),
  email: z.string().email(t("validation.email")),
  phone: z.string().min(8, t("validation.min", { count: 8 })),
  hourlyRate: z.coerce.number().min(10, t("validation.required")),
  currency: z.string().min(1, t("validation.required")),
  gender: z.enum(['male', 'female']),
  status: z.enum(['active', 'inactive']),
  age: z.coerce.number().min(5, t("validation.required")).transform((val,ctx) => {
    if(val < 5){
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "TOO_SHORT",
        path: ['age'],
      });
    }
    return val;
  }),
  code_country: z.string().default('+20'),
});

export const getCreateTeacherSchema = (t: TFunc) => z.object({
  ...baseTeacherSchema(t),
  password: passwordSchema(t),
});

export const getUpdateTeacherSchema = (t: TFunc) => z.object({
  ...baseTeacherSchema(t),
  password: passwordSchema(t).optional().or(z.literal('')),
});

// For backward compatibility
export const getTeacherSchema = getCreateTeacherSchema;

export type TeacherFormData = z.infer<ReturnType<typeof getCreateTeacherSchema>>;
export type UpdateTeacherFormData = z.infer<ReturnType<typeof getUpdateTeacherSchema>>;