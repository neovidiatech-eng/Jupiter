import { z } from 'zod';
import { DayOfWeek } from '../../types/scheduales';

type TFunc = (key: string, options?: any) => string;

const getBaseSession = (t: TFunc) => z.object({
  studentId: z.string().min(1, t("validation.required")),
  teacherId: z.string().min(1, t("validation.required")),
  courseId: z.string().min(1, t("validation.required")),
  title: z.string().min(3, t("validation.min", { count: 3 })),
  description: z.string().min(1, t("validation.required")).or(z.literal('')),
  type: z.enum(['full', 'half']),
  notification_Time: z.string().optional(),
  link: z.string().url(t("validation.email")).or(z.literal('')),
  notes: z.string().min(1, t("validation.required")).or(z.literal('')),
  platform: z.enum(['zoom', 'google']),
  language: z.string().min(1, 'Language is required'),
  videoUrl: z.string().url('Invalid URL').or(z.literal('')),
  slidesUrl: z.string().url('Invalid URL').or(z.literal('')),
});

export const getSessionSchema = (t: TFunc) => getBaseSession(t).extend({
  sessionDate: z.string().min(1, t("validation.required")),
  duration: z.string().min(1, t("validation.required")),
  startTime: z.string().min(1, t("validation.required")),
  endTime: z.string().min(1, t("validation.required")),
}).refine((data) => data.endTime > data.startTime, {
  message: t("validation.required"), // Ideally 'end time must be after start time'
  path: ["endTime"],
});

export const getMultipleSessionsSchema = (t: TFunc) => getBaseSession(t).extend({
  batchStartDate: z.string().min(1, t("validation.required")),
  batchEndDate: z.string().min(1, t("validation.required")),
  startTime: z.string().min(1, t("validation.required")),
  selectedDays: z.array(z.string()).min(1, t("validation.required")),
  duration: z.string().min(1, t("validation.required")),
});

export type SessionFormData = z.infer<ReturnType<typeof getSessionSchema>>;
export type MultipleSessionsFormData = z.infer<ReturnType<typeof getMultipleSessionsSchema>>;

export interface MultipleSessionsPayload {
  formData: MultipleSessionsFormData;
  sessions: Array<{
    date: string;
    day: string;
    time: string;
  }>;
  selectedDays: DayOfWeek[];
}