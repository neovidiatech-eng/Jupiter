import { z } from 'zod';

type TFunc = (key: string, options?: any) => string;

export const getTeacherSchema = (t: TFunc) => z.object({
  name: z.string().min(3, t("validation.min", { count: 3 })).max(32, t("validation.max", { count: 32 })),
  email: z.string().email(t("validation.email")),
  phone: z.string().min(8, t("validation.min", { count: 8 })),

  password: z.string().min(6, t("validation.min", { count: 6 })).optional().or(z.literal('')),

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

export type TeacherFormData = z.infer<ReturnType<typeof getTeacherSchema>>;