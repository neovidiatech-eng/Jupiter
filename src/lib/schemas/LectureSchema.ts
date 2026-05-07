import { z } from "zod";

type TFunc = (key: string, options?: any) => string;

export const getLectureSchema = (t: TFunc) => z.object({
  title: z.string().min(3, t("validation.min", { count: 3 })),
  content: z.string().min(1, t("validation.required")),
  videoUrl: z.string().url(t("validation.invalid_url")).or(z.literal('')),
  order: z.number().int().min(1, t("validation.required")),
  courseId: z.string().min(1, t("validation.required")),
});

export type LectureFormData = z.infer<ReturnType<typeof getLectureSchema>>;
